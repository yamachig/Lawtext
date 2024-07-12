import { assert } from "chai";
import type { MatchResult } from "generic-parser/lib/core";
import { isLawNum, isLawTitle } from "../../law/std";
import { __Text } from "../../node/el/controls";
import type { Line } from "../../node/cst/line";
import { EL, rangeOfELs } from "../../node/el";
import type { ErrorMessage } from "../cst/error";
import parse from "../cst/parse";
import type { Env } from "./env";
import { initialEnv } from "./env";
import type { VirtualLine } from "./virtualLine";
import { toVirtualLines } from "./virtualLine";
import loadEL from "../../node/el/loadEL";
import type { JsonEL } from "../../node/el/jsonEL";


export const testLawtextToStd = <
    TEL extends EL | EL[],
    TJsonEL = TEL extends EL ? JsonEL : JsonEL[],
>(
        lawtextWithMarker: string,
        expectedRendered: string,
        expectedValue: TJsonEL,
        expectedErrorMessages: string[],
        parseLines: (vlines: VirtualLine[], env: Env) => MatchResult<{value: TEL, errors: ErrorMessage[]}, Env>,
        toLines: (el: TEL) => Line[],
    ): void => {
    const lawtext = lawtextWithMarker.replace(/!(?:\\\[\d+\])?/g, "");
    const env = initialEnv({ target: lawtext });
    const markerPositions: number[] = [];
    const markerMemo = new Map<string, number>();
    let accMarkerLength = 0;
    for (const m of lawtextWithMarker.matchAll(/!(?:\\\[(\d+)\])?/g)) {
        const name = m[1];
        if (name) {
            if (markerMemo.has(name)) {
                markerPositions.splice(
                    2 * Math.floor(markerPositions.length / 2),
                    0,
                    markerMemo.get(name) ?? 0,
                    (m.index ?? 0) - accMarkerLength,
                );
                markerMemo.delete(name);
            } {
                markerMemo.set(name, (m.index ?? 0) - accMarkerLength);
            }
        } else {
            markerPositions.push((m.index ?? 0) - accMarkerLength);
        }
        accMarkerLength += m[0].length;
    }
    const expectedErrors = expectedErrorMessages.map((message, i) => {
        const range = markerPositions.slice(i * 2, i * 2 + 2);
        return {
            message,
            range,
        };
    });

    const lines = parse(lawtext);
    for (const [iLine, line] of lines.value.entries()) {
        const lineRange = line.range;
        assert.isNotNull(lineRange, `Line ${iLine}: ${line} has no range`);
        const prevLineRange = iLine > 0 ? lines.value[iLine - 1].range : null;
        if (lineRange && prevLineRange) {
            assert.strictEqual(
                prevLineRange[1],
                lineRange[0],
                `LineType.${line.type} has invalid range: ${JSON.stringify(lineRange)}, prev: LineType.${lines.value[iLine - 1].type} ${JSON.stringify(prevLineRange)}`,
            );
        }
        const rawRangeTexts = line.rangeTexts();
        for (const [range, , description] of rawRangeTexts) {
            assert.isNotNull(
                range,
                `An element of LineType.${line.type} has null range: ${description}, lineRange: ${JSON.stringify(lineRange)}`,
            );
        }
        const rangeTexts = rawRangeTexts as [[number, number], string, string][];
        for (const [iText, [textRange, text, description]] of rangeTexts.entries()) {
            assert.strictEqual(
                text,
                lawtext.slice(textRange[0], textRange[1]),
                `LineType.${line.type} has mismatch text: range: ${JSON.stringify(textRange)} ${description}`,
            );
            if (iText === 0) continue;
            const [prevTextRange, , prevDescription] = rangeTexts[iText - 1];
            assert.strictEqual(
                prevTextRange[1],
                textRange[0],
                `An element of LineType.${line.type} has invalid range: ${description} ${JSON.stringify(textRange)}, prev: ${prevDescription} ${JSON.stringify(prevTextRange)}, lineRange: ${JSON.stringify(lineRange)}`,
            );
        }
    }

    const vls = toVirtualLines(lines.value);

    const result = parseLines(vls, env);
    assert.isTrue(result.ok);
    if (result.ok) {
        // console.log(JSON.stringify(result.value.value.json(), undefined, 2));
        const value = Array.isArray(result.value.value) ? result.value.value : result.value.value;
        const valueWithoutControl = Array.isArray(value) ? value.map(v => v.json()) : value.json();
        const errors = [...lines.errors, ...result.value.errors];
        assert.deepStrictEqual({ value: valueWithoutControl, errors }, { value: expectedValue, errors: expectedErrors });

        const topELs: EL[] = (result.value.value instanceof EL) ? [result.value.value] : result.value.value;
        topELs.map(el => assertELVaridity(el, lawtext, errors.length === 0));

        let renderedLines: Line[];
        if (Array.isArray(valueWithoutControl)) {
            renderedLines = toLines((valueWithoutControl as unknown as JsonEL[]).map(v => loadEL(v)) as TEL);
        } else {
            renderedLines = toLines(loadEL(valueWithoutControl as unknown as JsonEL) as TEL);
        }
        const renderedText = renderedLines.map(l => l.text()).join("").replace(/\r\n/g, "\n").replace(/\n/g, "\r\n").replace(/(\r?\n\r?\n)(?:\r?\n)+/g, "$1").replace(/(?:\r?\n)?$/, "\r\n").replace(/(?:\r?\n)+$/, "\r\n");
        assert.strictEqual(renderedText, expectedRendered);
    }

};

export const assertELVaridity = (el: EL | string, lawtext?: string, testGap?: boolean): void => {
    if (typeof el === "string") return;

    assert.isNotNull(el.range, `${el.tag} has no range`);

    if (lawtext !== undefined) {
        if (el instanceof __Text && el.range) {
            assert.strictEqual(
                el.text(),
                lawtext.slice(el.range[0], el.range[1]).replace(/&#(\d+|x[\da-fA-F]+);/g, (...m) => {
                    const intStr = m[1].toLowerCase();
                    const isHex = intStr.startsWith("x");
                    const int = parseInt(intStr.slice(isHex ? 1 : 0), isHex ? 16 : 10);
                    return String.fromCharCode(int);
                }),
                `${el.tag} has mismatch text: range: ${JSON.stringify(el.range)}`,
            );
        }

        for (const [i, child] of el.children.entries()) {
            assertELVaridity(child, lawtext, testGap);
            if (typeof child === "string") continue;
            if (i > 0 && typeof el.children[i - 1] !== "string") {
                const prevChild = el.children[i - 1] as EL;
                if (prevChild.range && child.range && !isLawNum(prevChild)) {
                    assert.isTrue(
                        (prevChild.range[1] <= child.range[0]),
                        `${child.tag} has invalid range: ${JSON.stringify(child.range)}, prev: ${prevChild.tag} ${JSON.stringify(prevChild.range)}, parent: ${el.tag}`,
                    );
                    if (testGap && !isLawTitle(prevChild)) {
                        if (prevChild.range[1] <= child.range[0]) {
                            const gapText = lawtext.slice(prevChild.range[1], child.range[0]);
                            const gatTextWOControl = gapText
                                .replace(/:(?:\w|-)+:/g, "")
                                .replace(/\[\w+="\w+"\]/g, "")
                                .replace(/^\s+#/mg, "")
                                .replace(/^\s+(?:\*\s+[*-]|[*-])(?:\s*\|)?/mg, "")
                                .trim();
                            assert.isTrue(gatTextWOControl.length === 0, `Invalid gap text between ${prevChild.tag} and ${child.tag}: ${gapText}, without control: ${gatTextWOControl}, gap range: ${JSON.stringify([prevChild.range[1], child.range[0]])}, parent: ${el.tag}`);
                        }
                    }
                }
            }
        }
    }

    const childrenRange = rangeOfELs(el.children);
    if (el.range && childrenRange) {
        assert.isTrue(
            (el.range[0] <= childrenRange[0] && childrenRange[1] <= el.range[1]),
            `Children of ${el.tag} has invalid range: children range: ${JSON.stringify(childrenRange)}, parent range: ${JSON.stringify(el.range)}`,
        );
    }
};


