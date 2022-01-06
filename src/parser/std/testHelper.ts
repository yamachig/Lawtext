import { assert } from "chai";
import { MatchResult } from "generic-parser/lib/core";
import { Line } from "../../node/cst/line";
import { EL, JsonEL, loadEl } from "../../node/el";
import { ErrorMessage } from "../cst/error";
import parse from "../cst/parse";
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
    const env = initialEnv({});
    const lawtext = lawtextWithMarker.replace(/[!]/g, "");
    const markerPositions: number[] = [];
    for (let i = 0; i < lawtextWithMarker.length; i++) {
        const index = lawtextWithMarker.indexOf("!", i);
        if (index !== -1) {
            markerPositions.push(index - markerPositions.length);
            i = index;
        } else break;
    }
    const expectedErrors = expectedErrorMessages.map((message, i) => ({
        message,
        range: markerPositions.slice(i * 2, i * 2 + 2),
    }));

    const lines = parse(lawtext);
    const vls = toVirtualLines(lines.value);

    const result = parseLines(vls, env);
    assert.isTrue(result.ok);
    if (result.ok) {
        // console.log(JSON.stringify(result.value.value.json(), undefined, 2));
        if (Array.isArray(result.value.value)) {
            assert.deepStrictEqual(result.value.value.map(v => v.json()), expectedValue as unknown as JsonEL[]);
        } else {
            assert.deepStrictEqual(result.value.value.json(), expectedValue as unknown as JsonEL);
        }
        assert.deepStrictEqual([...lines.errors, ...result.value.errors], expectedErrors);
    }

    let renderedLines: Line[];
    if (Array.isArray(expectedValue)) {
        renderedLines = toLines((expectedValue as unknown as JsonEL[]).map(v => loadEl(v)) as TEL);
    } else {
        renderedLines = toLines(loadEl(expectedValue as unknown as JsonEL) as TEL);
    }
    const renderedText = renderedLines.map(l => l.text()).join("");
    assert.strictEqual(renderedText, expectedRendered);
};
