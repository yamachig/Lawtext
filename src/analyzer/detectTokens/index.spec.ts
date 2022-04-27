import { assert } from "chai";
import * as std from "../../law/std";
import { JsonEL } from "../../node/el/jsonEL";
import loadEL from "../../node/el/loadEL";
import addSentenceChildrenControls from "../../parser/addSentenceChildrenControls";
import detectTokens from ".";
import getSentenceEnvs from "../getSentenceEnvs";
import { parse } from "../../parser/lawtext";
import { assertELVaridity } from "../../parser/std/testHelper";

describe("Test detectTokens", () => {

    it("Success case: pointerRanges", () => {
        /* eslint-disable no-irregular-whitespace */
        const inputElToBeModified = loadEL({
            tag: "Subitem1",
            attr: {},
            children: [
                {
                    tag: "Subitem1Title",
                    attr: {},
                    children: ["イ"],
                },
                {
                    tag: "Subitem1Sentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["法律に基づく命令（処分の要件を定める告示を含む。次条第二項において単に「命令」という。）又は規則"],
                        },
                    ],
                },
            ],
        }) as std.Subitem1;
        addSentenceChildrenControls(inputElToBeModified);
        const expected: JsonEL[] = [
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
                                            relPos: "NEXT",
                                            targetType: "Article",
                                            name: "次条",
                                        },
                                        children: ["次条"],
                                    },
                                    {
                                        tag: "____PF",
                                        attr: {
                                            relPos: "NAMED",
                                            targetType: "Paragraph",
                                            name: "第二項",
                                            num: "2",
                                        },
                                        children: ["第二項"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];
        const expectedErrorMessages: string[] = [];
        const expectedModifiedInput = {
            tag: "Subitem1",
            attr: {},
            children: [
                {
                    tag: "Subitem1Title",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["イ"],
                        },
                    ],
                },
                {
                    tag: "Subitem1Sentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: [
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["法律に基づく命令"],
                                },
                                {
                                    tag: "__Parentheses",
                                    attr: {
                                        type: "round",
                                        depth: "1",
                                    },
                                    children: [
                                        {
                                            tag: "__PStart",
                                            attr: {
                                                type: "round",
                                            },
                                            children: ["（"],
                                        },
                                        {
                                            tag: "__PContent",
                                            attr: {
                                                type: "round",
                                            },
                                            children: [
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["処分の要件を定める告示を含む。"],
                                                },
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
                                                                                relPos: "NEXT",
                                                                                targetType: "Article",
                                                                                name: "次条",
                                                                            },
                                                                            children: ["次条"],
                                                                        },
                                                                        {
                                                                            tag: "____PF",
                                                                            attr: {
                                                                                relPos: "NAMED",
                                                                                targetType: "Paragraph",
                                                                                name: "第二項",
                                                                                num: "2",
                                                                            },
                                                                            children: ["第二項"],
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["において単に"],
                                                },
                                                {
                                                    tag: "__Parentheses",
                                                    attr: {
                                                        type: "square",
                                                        depth: "2",
                                                    },
                                                    children: [
                                                        {
                                                            tag: "__PStart",
                                                            attr: {
                                                                type: "square",
                                                            },
                                                            children: ["「"],
                                                        },
                                                        {
                                                            tag: "__PContent",
                                                            attr: {
                                                                type: "square",
                                                            },
                                                            children: [
                                                                {
                                                                    tag: "__Text",
                                                                    attr: {},
                                                                    children: ["命令"],
                                                                },
                                                            ],
                                                        },
                                                        {
                                                            tag: "__PEnd",
                                                            attr: {
                                                                type: "square",
                                                            },
                                                            children: ["」"],
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["という。"],
                                                },
                                            ],
                                        },
                                        {
                                            tag: "__PEnd",
                                            attr: {
                                                type: "round",
                                            },
                                            children: ["）"],
                                        },
                                    ],
                                },
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["又は規則"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const result = detectTokens(sentenceEnvsStruct);

        // console.log(JSON.stringify(result.value.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.pointerRangesList.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        // console.log(JSON.stringify(inputElToBeModified.json(true), null, 2));
        assert.deepStrictEqual(
            inputElToBeModified.json(true),
            expectedModifiedInput,
        );
    });

    it("Success case: pointerRanges", () => {
        /* eslint-disable no-irregular-whitespace */
        const inputElToBeModified = loadEL({
            tag: "Subitem1",
            attr: {},
            children: [
                {
                    tag: "Subitem1Title",
                    attr: {},
                    children: ["イ"],
                },
                {
                    tag: "Subitem1Sentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["次条第二項において単に「命令」という。）又は規則"],
                        },
                    ],
                },
            ],
        }) as std.Subitem1;
        addSentenceChildrenControls(inputElToBeModified);
        const expected: JsonEL[] = [
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
                                            relPos: "NEXT",
                                            targetType: "Article",
                                            name: "次条",
                                        },
                                        children: ["次条"],
                                    },
                                    {
                                        tag: "____PF",
                                        attr: {
                                            relPos: "NAMED",
                                            targetType: "Paragraph",
                                            name: "第二項",
                                            num: "2",
                                        },
                                        children: ["第二項"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];
        const expectedErrorMessages: string[] = [];
        const expectedModifiedInput = {
            tag: "Subitem1",
            attr: {},
            children: [
                {
                    tag: "Subitem1Title",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["イ"],
                        },
                    ],
                },
                {
                    tag: "Subitem1Sentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
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
                                                                relPos: "NEXT",
                                                                targetType: "Article",
                                                                name: "次条",
                                                            },
                                                            children: ["次条"],
                                                        },
                                                        {
                                                            tag: "____PF",
                                                            attr: {
                                                                relPos: "NAMED",
                                                                targetType: "Paragraph",
                                                                name: "第二項",
                                                                num: "2",
                                                            },
                                                            children: ["第二項"],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["において単に"],
                                },
                                {
                                    tag: "__Parentheses",
                                    attr: {
                                        type: "square",
                                        depth: "1",
                                    },
                                    children: [
                                        {
                                            tag: "__PStart",
                                            attr: {
                                                type: "square",
                                            },
                                            children: ["「"],
                                        },
                                        {
                                            tag: "__PContent",
                                            attr: {
                                                type: "square",
                                            },
                                            children: [
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["命令"],
                                                },
                                            ],
                                        },
                                        {
                                            tag: "__PEnd",
                                            attr: {
                                                type: "square",
                                            },
                                            children: ["」"],
                                        },
                                    ],
                                },
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["という。"],
                                },
                                {
                                    tag: "__MismatchEndParenthesis",
                                    attr: {},
                                    children: ["）"],
                                },
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["又は規則"],
                                },
                            ],
                        },
                    ],
                },
            ],
        }
          ;

        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const result = detectTokens(sentenceEnvsStruct);

        // console.log(JSON.stringify(result.value.pointerRangesList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.pointerRangesList.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        // console.log(JSON.stringify(inputElToBeModified.json(true), null, 2));
        assert.deepStrictEqual(
            inputElToBeModified.json(true),
            expectedModifiedInput,
        );
    });

    it("Success case: pointerRanges", () => {
        /* eslint-disable no-irregular-whitespace */
        const inputElToBeModified = loadEL({
            tag: "Subitem1",
            attr: {},
            children: [
                {
                    tag: "Subitem1Title",
                    attr: {},
                    children: ["イ"],
                },
                {
                    tag: "Subitem1Sentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["次条第二項において単に「命令」という。）又は規則"],
                        },
                    ],
                },
            ],
        }) as std.Subitem1;
        addSentenceChildrenControls(inputElToBeModified);
        const expected: JsonEL[] = [
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
                                            relPos: "NEXT",
                                            targetType: "Article",
                                            name: "次条",
                                        },
                                        children: ["次条"],
                                    },
                                    {
                                        tag: "____PF",
                                        attr: {
                                            relPos: "NAMED",
                                            targetType: "Paragraph",
                                            name: "第二項",
                                            num: "2",
                                        },
                                        children: ["第二項"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];
        const expectedErrorMessages: string[] = [];
        const expectedModifiedInput = {
            tag: "Subitem1",
            attr: {},
            children: [
                {
                    tag: "Subitem1Title",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["イ"],
                        },
                    ],
                },
                {
                    tag: "Subitem1Sentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
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
                                                                relPos: "NEXT",
                                                                targetType: "Article",
                                                                name: "次条",
                                                            },
                                                            children: ["次条"],
                                                        },
                                                        {
                                                            tag: "____PF",
                                                            attr: {
                                                                relPos: "NAMED",
                                                                targetType: "Paragraph",
                                                                name: "第二項",
                                                                num: "2",
                                                            },
                                                            children: ["第二項"],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["において単に"],
                                },
                                {
                                    tag: "__Parentheses",
                                    attr: {
                                        type: "square",
                                        depth: "1",
                                    },
                                    children: [
                                        {
                                            tag: "__PStart",
                                            attr: {
                                                type: "square",
                                            },
                                            children: ["「"],
                                        },
                                        {
                                            tag: "__PContent",
                                            attr: {
                                                type: "square",
                                            },
                                            children: [
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["命令"],
                                                },
                                            ],
                                        },
                                        {
                                            tag: "__PEnd",
                                            attr: {
                                                type: "square",
                                            },
                                            children: ["」"],
                                        },
                                    ],
                                },
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["という。"],
                                },
                                {
                                    tag: "__MismatchEndParenthesis",
                                    attr: {},
                                    children: ["）"],
                                },
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["又は規則"],
                                },
                            ],
                        },
                    ],
                },
            ],
        }
        ;

        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const result = detectTokens(sentenceEnvsStruct);

        // console.log(JSON.stringify(result.value.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.pointerRangesList.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        // console.log(JSON.stringify(inputElToBeModified.json(true), null, 2));
        assert.deepStrictEqual(
            inputElToBeModified.json(true),
            expectedModifiedInput,
        );
    });

    it("Success case: lawNum", () => {
        /* eslint-disable no-irregular-whitespace */
        const inputElToBeModified = loadEL({
            tag: "Item",
            attr: {},
            children: [
                {
                    tag: "ItemTitle",
                    attr: {},
                    children: ["九"],
                },
                {
                    tag: "ItemSentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["公務員（国家公務員法（昭和二十二年法律第百二十号）第二条第一項に規定する国家公務員及び地方公務員法（昭和二十五年法律第二百六十一号）第三条第一項に規定する地方公務員をいう。以下同じ。）又は公務員であった者に対してその職務又は身分に関してされる処分及び行政指導"],
                        },
                    ],
                },
            ],
        }) as std.Item;
        addSentenceChildrenControls(inputElToBeModified);
        const expected: JsonEL[] = [
            {
                tag: "____LawNum",
                attr: {},
                children: ["昭和二十二年法律第百二十号"],
            },
            {
                tag: "____LawNum",
                attr: {},
                children: ["昭和二十五年法律第二百六十一号"],
            },
        ];
        const expectedErrorMessages: string[] = [];
        const expectedModifiedInput = {
            tag: "Item",
            attr: {},
            children: [
                {
                    tag: "ItemTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["九"],
                        },
                    ],
                },
                {
                    tag: "ItemSentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: [
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["公務員"],
                                },
                                {
                                    tag: "__Parentheses",
                                    attr: {
                                        type: "round",
                                        depth: "1",
                                    },
                                    children: [
                                        {
                                            tag: "__PStart",
                                            attr: {
                                                type: "round",
                                            },
                                            children: ["（"],
                                        },
                                        {
                                            tag: "__PContent",
                                            attr: {
                                                type: "round",
                                            },
                                            children: [
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["国家公務員法"],
                                                },
                                                {
                                                    tag: "__Parentheses",
                                                    attr: {
                                                        type: "round",
                                                        depth: "2",
                                                    },
                                                    children: [
                                                        {
                                                            tag: "__PStart",
                                                            attr: {
                                                                type: "round",
                                                            },
                                                            children: ["（"],
                                                        },
                                                        {
                                                            tag: "__PContent",
                                                            attr: {
                                                                type: "round",
                                                            },
                                                            children: [
                                                                {
                                                                    tag: "____LawNum",
                                                                    attr: {},
                                                                    children: ["昭和二十二年法律第百二十号"],
                                                                },
                                                            ],
                                                        },
                                                        {
                                                            tag: "__PEnd",
                                                            attr: {
                                                                type: "round",
                                                            },
                                                            children: ["）"],
                                                        },
                                                    ],
                                                },
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
                                                                                name: "第二条",
                                                                                num: "2",
                                                                            },
                                                                            children: ["第二条"],
                                                                        },
                                                                        {
                                                                            tag: "____PF",
                                                                            attr: {
                                                                                relPos: "NAMED",
                                                                                targetType: "Paragraph",
                                                                                name: "第一項",
                                                                                num: "1",
                                                                            },
                                                                            children: ["第一項"],
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["に規定する国家公務員及び地方公務員法"],
                                                },
                                                {
                                                    tag: "__Parentheses",
                                                    attr: {
                                                        type: "round",
                                                        depth: "2",
                                                    },
                                                    children: [
                                                        {
                                                            tag: "__PStart",
                                                            attr: {
                                                                type: "round",
                                                            },
                                                            children: ["（"],
                                                        },
                                                        {
                                                            tag: "__PContent",
                                                            attr: {
                                                                type: "round",
                                                            },
                                                            children: [
                                                                {
                                                                    tag: "____LawNum",
                                                                    attr: {},
                                                                    children: ["昭和二十五年法律第二百六十一号"],
                                                                },
                                                            ],
                                                        },
                                                        {
                                                            tag: "__PEnd",
                                                            attr: {
                                                                type: "round",
                                                            },
                                                            children: ["）"],
                                                        },
                                                    ],
                                                },
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
                                                                                name: "第三条",
                                                                                num: "3",
                                                                            },
                                                                            children: ["第三条"],
                                                                        },
                                                                        {
                                                                            tag: "____PF",
                                                                            attr: {
                                                                                relPos: "NAMED",
                                                                                targetType: "Paragraph",
                                                                                name: "第一項",
                                                                                num: "1",
                                                                            },
                                                                            children: ["第一項"],
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["に規定する地方公務員をいう。以下同じ。"],
                                                },
                                            ],
                                        },
                                        {
                                            tag: "__PEnd",
                                            attr: {
                                                type: "round",
                                            },
                                            children: ["）"],
                                        },
                                    ],
                                },
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["又は公務員であった者に対してその職務又は身分に関してされる処分及び行政指導"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const result = detectTokens(sentenceEnvsStruct);

        // console.log(JSON.stringify(result.value.lawNums.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.lawNums.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        // console.log(JSON.stringify(inputElToBeModified.json(true), null, 2));
        assert.deepStrictEqual(
            inputElToBeModified.json(true),
            expectedModifiedInput,
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
電波法
（昭和二十五年法律第百三十一号）

      第一章　総則

  （目的）
第一条　この法律は、電波の公平且つ能率的な利用を確保することによつて、公共の福祉を増進することを目的とする。

  （定義）
第二条　この法律及びこの法律に基づく命令の規定の解釈に関しては、次の定義に従うものとする。
  一　「電波」とは、三百万メガヘルツ以下の周波数の電磁波をいう。

      附　則　抄

  （施行期日）
１　この法律は、公布の日から起算して三十日を経過した日から施行する。

      附　則　（昭和二七年七月三一日法律第二四九号）　抄

１　この法律は、公布の日から施行する。但し、第三十三条第三項、第三十三条の二から第三十六条まで、第三十七条（船舶安全法第二条の規定に基く命令により船舶に備えなければならない救命艇用携帯無線電信に係る部分に限る。）、第六十三条、第六十五条及び第九十九条の十一第一号の改正規定は、昭和二十七年十一月十九日から施行する。

# 別表第一（第二十四条の二関係）

  # 一　第一級総合無線通信士、第二級総合無線通信士、第三級総合無線通信士、第一級海上無線通信士、第二級海上無線通信士、第四級海上無線通信士、航空無線通信士、第一級陸上無線技術士、第二級陸上無線技術士、陸上特殊無線技士又は第一級アマチュア無線技士の資格を有すること。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);

        const expectedSentenceTexts = [
            "この法律は、電波の公平且つ能率的な利用を確保することによつて、公共の福祉を増進することを目的とする。",
            "この法律及びこの法律に基づく命令の規定の解釈に関しては、次の定義に従うものとする。",
            "「電波」とは、三百万メガヘルツ以下の周波数の電磁波をいう。",
            "この法律は、公布の日から起算して三十日を経過した日から施行する。",
            "第一級総合無線通信士、第二級総合無線通信士、第三級総合無線通信士、第一級海上無線通信士、第二級海上無線通信士、第四級海上無線通信士、航空無線通信士、第一級陸上無線技術士、第二級陸上無線技術士、陸上特殊無線技士又は第一級アマチュア無線技士の資格を有すること。",
        ];

        const expectedPointerRangesList: JsonEL[] = [
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[\"container-50-tag_AppdxTable-type_TOPLEVEL\",\"container-49-tag_Paragraph-type_SENTENCES\",\"container-42-tag_MainProvision-type_TOPLEVEL\"]",
                },
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
                                            relPos: "HERE",
                                            targetType: "Law",
                                            name: "この法律",
                                            targetContainerIDs: "[\"container-50-tag_AppdxTable-type_TOPLEVEL\",\"container-49-tag_Paragraph-type_SENTENCES\",\"container-42-tag_MainProvision-type_TOPLEVEL\"]",
                                        },
                                        children: ["この法律"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[\"container-41-tag_Law-type_ROOT\"]",
                },
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
                                            relPos: "HERE",
                                            targetType: "Law",
                                            name: "この法律",
                                            targetContainerIDs: "[\"container-41-tag_Law-type_ROOT\"]",
                                        },
                                        children: ["この法律"],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["及び"],
                    },
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
                                            relPos: "HERE",
                                            targetType: "Law",
                                            name: "この法律",
                                            targetContainerIDs: "[\"container-41-tag_Law-type_ROOT\"]",
                                        },
                                        children: ["この法律"],
                                    },
                                    {
                                        tag: "____PF",
                                        attr: {
                                            relPos: "NAMED",
                                            targetType: "INFERIOR",
                                            name: "に基づく命令",
                                        },
                                        children: ["に基づく命令"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[\"container-50-tag_AppdxTable-type_TOPLEVEL\",\"container-49-tag_Paragraph-type_SENTENCES\",\"container-42-tag_MainProvision-type_TOPLEVEL\"]",
                },
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
                                            relPos: "HERE",
                                            targetType: "Law",
                                            name: "この法律",
                                            targetContainerIDs: "[\"container-50-tag_AppdxTable-type_TOPLEVEL\",\"container-49-tag_Paragraph-type_SENTENCES\",\"container-42-tag_MainProvision-type_TOPLEVEL\"]",
                                        },
                                        children: ["この法律"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ]
          ;
        const expectedErrorMessages: string[] = [];

        const detectTokensResult = detectTokens(sentenceEnvsStruct);

        // console.log(JSON.stringify(sentenceEnvsStruct.sentenceEnvs.map(s => s.text), null, 2));
        assert.deepStrictEqual(
            sentenceEnvsStruct.sentenceEnvs.map(s => s.text),
            expectedSentenceTexts,
        );

        // console.log(JSON.stringify(detectTokensResult.value.pointerRangesList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            detectTokensResult.value.pointerRangesList.map(r => r.json(true)),
            expectedPointerRangesList,
        );

        assert.deepStrictEqual(detectTokensResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });
});
