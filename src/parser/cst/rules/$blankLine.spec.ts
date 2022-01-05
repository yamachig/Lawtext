import { assert } from "chai";
import { LineType } from "../../../node/cst/line";
import { initialEnv } from "../env";
import $blankLine from "./$blankLine";

const env = initialEnv({});

describe("Test $blankLine", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\

`;
        const expectedResult = {
            ok: true,
            nextOffset: 1,
        } as const;
        const expectedText = `\

`;
        const expectedValue = {
            type: LineType.BNK,
        } as const;
        const result = $blankLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
        }
    });


    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
　
`;
        const expectedResult = {
            ok: true,
            nextOffset: 2,
        } as const;
        const expectedText = `\
　
`;
        const expectedValue = {
            type: LineType.BNK,
        } as const;
        const result = $blankLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
        }
    });

    it("Fail case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。
`;
        const expectedResult = {
            ok: false,
            offset: 0,
            expected: "blankLine",
        } as const;
        const result = $blankLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });
});
