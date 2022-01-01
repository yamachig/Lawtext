import { assert } from "chai";
import { LineType } from "../../../node/line";
import { initialEnv } from "../env";
import $appdxItemHeadLine from "./$appdxItemHeadLine";

const env = initialEnv({});

describe("Test $appdxItemHeadLine", () => {

    it("Success case $appdxHeadLine", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
付録第一（第二十六条、第四十五条、第四十六条の五関係）　

  .. figure:: ./pict/001.jpg
`;
        const expectedResult = {
            ok: true,
            nextOffset: 29,
        } as const;
        const expectedValue = {
            type: LineType.APP,
            text: `\
付録第一（第二十六条、第四十五条、第四十六条の五関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: "付録第一（第二十六条、第四十五条、第四十六条の五関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "Appdx",
            attr: {},
            children: [
                {
                    tag: "ArithFormulaNum",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["付録第一"],
                        },
                    ],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: [
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
                                            children: ["第二十六条、第四十五条、第四十六条の五関係"],
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
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });
});
