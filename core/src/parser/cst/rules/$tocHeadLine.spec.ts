import { assert } from "chai";
import { matchResultToJson } from "generic-parser/lib/core";
import { LineType } from "../../../node/cst/line";
import { initialEnv } from "../env";
import $tocHeadLine from "./$tocHeadLine";

const env = initialEnv({});

describe("Test $tocHeadLine", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
目次
`;
        const expectedResult = {
            ok: true,
            nextOffset: 3,
        } as const;
        const expectedText = `\
目次
`;
        const expectedValue = {
            type: LineType.TOC,
            indentTexts: [] as string[],
            title: "目次",
            lineEndText: `
`,
        } as const;
        const result = $tocHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:toc:目次
`;
        const expectedResult = {
            ok: true,
            nextOffset: 8,
        } as const;
        const expectedText = `\
:toc:目次
`;
        const expectedValue = {
            type: LineType.TOC,
            indentTexts: [] as string[],
            title: "目次",
            lineEndText: `
`,
        } as const;
        const result = $tocHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:toc: 目次
`;
        const expectedResult = {
            ok: true,
            nextOffset: 9,
        } as const;
        const expectedText = `\
:toc: 目次
`;
        const expectedValue = {
            type: LineType.TOC,
            indentTexts: [] as string[],
            title: "目次",
            lineEndText: `
`,
        } as const;
        const result = $tocHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
        :toc:目　次　
`;
        const expectedResult = {
            ok: true,
            nextOffset: 18,
        } as const;
        const expectedText = `\
        :toc:目　次　
`;
        const expectedValue = {
            type: LineType.TOC,
            indentTexts: ["  ", "  ", "  ", "  "] as string[],
            title: "目　次",
            lineEndText: `　
`,
        } as const;
        const result = $tocHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
        }
    });

    it("Fail case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
        目　次　
`;
        const expectedResult = {
            ok: false,
            offset: 0,
            expected: "tocHeadLine",
        } as const;
        const result = $tocHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
    });

    it("Fail case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。
`;
        const expectedResult = {
            ok: false,
            offset: 0,
            expected: "tocHeadLine",
        } as const;
        const result = $tocHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
    });
});
