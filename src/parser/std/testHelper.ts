import { assert } from "chai";
import { MatchResult } from "generic-parser/lib/core";
import { Line } from "../../node/cst/line";
import { EL, JsonEL, loadEl } from "../../node/el";
import { ErrorMessage } from "../cst/error";
import parse from "../cst/parse";
import { enumAllELs } from "../cst/util";
import { Env, initialEnv } from "./env";
import { toVirtualLines, VirtualLine } from "./virtualLine";


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
    const env = initialEnv(lawtext, {});
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
            location: [
                env.stringOffsetToPos(lawtext, range[0]),
                env.stringOffsetToPos(lawtext, range[1]),
            ],
        };
    });

    const lines = parse(lawtext);
    const vls = toVirtualLines(lines.value);

    const result = parseLines(vls, env);
    assert.isTrue(result.ok);
    if (result.ok) {
        // console.log(JSON.stringify(result.value.value.json(), undefined, 2));
        const value = Array.isArray(result.value.value) ? result.value.value.map(v => v.json()) : result.value.value.json();
        const errors = [...lines.errors, ...result.value.errors];
        assert.deepStrictEqual({ value, errors }, { value: expectedValue, errors: expectedErrors });

        const topELs: EL[] = (result.value.value instanceof EL) ? [result.value.value] : result.value.value;
        for (const el of topELs.map(enumAllELs).flat()) {
            assert.isNotNull(el.range, `${el.tag} has no range`);
        }
    }

    let renderedLines: Line[];
    if (Array.isArray(expectedValue)) {
        renderedLines = toLines((expectedValue as unknown as JsonEL[]).map(v => loadEl(v)) as TEL);
    } else {
        renderedLines = toLines(loadEl(expectedValue as unknown as JsonEL) as TEL);
    }
    const renderedText = renderedLines.map(l => l.text()).join("").replace(/\r\n/g, "\n").replace(/\n/g, "\r\n").replace(/(\r?\n\r?\n)(?:\r?\n)+/g, "$1").replace(/(?<!\n)$/, "\r\n").replace(/(?:\r?\n)+$/, "\r\n");
    assert.strictEqual(renderedText, expectedRendered);
};
