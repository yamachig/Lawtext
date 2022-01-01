import { assert } from "chai";
import { LineType } from "../../../node/line";
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
        const expectedValue = {
            type: LineType.TOC,
            text: `\
目次
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: "目次",
            lineEndText: `
`,
        } as const;
        const expectedContent = {
            tag: "TOC",
            attr: {},
            children: [
                {
                    tag: "TOCLabel",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["目次"],
                        },
                    ],
                },
            ],
        };
        const result = $tocHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
        目　次　
`;
        const expectedResult = {
            ok: true,
            nextOffset: 13,
        } as const;
        const expectedValue = {
            type: LineType.TOC,
            text: `\
        目　次　
`,
            indentDepth: 4,
            indentTexts: ["  ", "  ", "  ", "  "] as string[],
            contentText: "目　次",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "TOC",
            attr: {},
            children: [
                {
                    tag: "TOCLabel",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["目　次"],
                        },
                    ],
                },
            ],
        };
        const result = $tocHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
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
        assert.deepInclude(result, expectedResult);
    });
});
