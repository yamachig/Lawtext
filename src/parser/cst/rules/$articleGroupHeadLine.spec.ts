import { assert } from "chai";
import { matchResultToJson } from "generic-parser/lib/core";
import { LineType } from "../../../node/cst/line";
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
        const expectedText = `\
      第一章　総則
`;
        const expectedValue = {
            type: LineType.ARG,
            indentTexts: ["  ", "  ", "  "] as string[],
            mainTag: "Chapter",
            lineEndText: `
`,
        } as const;
        const expectedInline = [
            {
                tag: "__Text",
                attr: {},
                children: ["第一章　総則"],
            },
        ];
        const result = $articleGroupHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedInline);
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
        const expectedText = `\
  第四章の二　処分等の求め（第三十六条の三）　
`;
        const expectedValue = {
            type: LineType.ARG,
            indentTexts: ["  "] as string[],
            lineEndText: `　
`,
        } as const;
        const expectedInline = [
            {
                tag: "__Text",
                attr: {},
                children: ["第四章の二　処分等の求め"]
            },
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "____PointerRanges",
                                attr: {},
                                children: [
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Article",
                                                            name: "第三十六条の三",
                                                            num: "36_3"
                                                        },
                                                        children: ["第三十六条の三"]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ]
          ;
        const result = $articleGroupHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            // console.log(JSON.stringify(result.value.value.title.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedInline);
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
        assert.deepInclude(matchResultToJson(result), expectedResult);
    });
});
