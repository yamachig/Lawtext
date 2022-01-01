import { assert } from "chai";
import { LineType } from "../../../node/line";
import { initialEnv } from "../env";
import $articleGroupHeadLine from "./$articleGroupHeadLine";

const env = initialEnv({});

describe("Test $articleGroupHeadLine", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
      第一章　総則

  （目的等）
第一条　この法律は、
`;
        const expectedResult = {
            ok: true,
            nextOffset: 13,
        } as const;
        const expectedValue = {
            type: LineType.ARG,
            text: `\
      第一章　総則
`,
            indentDepth: 3,
            indentTexts: ["  ", "  ", "  "] as string[],
            contentText: "第一章　総則",
            lineEndText: `
`,
        } as const;
        const expectedContent = {
            tag: "Chapter",
            attr: { Num: "1" },
            children: [
                {
                    tag: "ChapterTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["第一章　総則"],
                        },
                    ],
                },
            ],
        };
        const result = $articleGroupHeadLine.abstract().match(offset, target, env);
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
  第四章の二　処分等の求め（第三十六条の三）　
  第五章　届出（第三十七条）
`;
        const expectedResult = {
            ok: true,
            nextOffset: 25,
        } as const;
        const expectedValue = {
            type: LineType.ARG,
            text: `\
  第四章の二　処分等の求め（第三十六条の三）　
`,
            indentDepth: 1,
            indentTexts: ["  "] as string[],
            contentText: "第四章の二　処分等の求め（第三十六条の三）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "Chapter",
            attr: { Num: "4_2" },
            children: [
                {
                    tag: "ChapterTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["第四章の二　処分等の求め"],
                        },
                        {
                            tag: "__Parentheses",
                            attr: {
                                depth: "1",
                                type: "round",
                            },
                            children: [
                                {
                                    tag: "__PStart",
                                    attr: { type: "round" },
                                    children: ["（"],
                                },
                                {
                                    tag: "__PContent",
                                    attr: { type: "round" },
                                    children: [
                                        {
                                            tag: "__Text",
                                            attr: {},
                                            children: ["第三十六条の三"],
                                        },
                                    ],
                                },
                                {
                                    tag: "__PEnd",
                                    attr: { "type": "round" },
                                    children: ["）"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        const result = $articleGroupHeadLine.abstract().match(offset, target, env);
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
            expected: "articleGroupHeadLine",
        } as const;
        const result = $articleGroupHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });
});
