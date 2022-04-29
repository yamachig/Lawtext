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
                    targetContainerIDRanges: "[\"container-9-tag_Law-type_ROOT\"]",
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
                                            targetContainerIDs: "[\"container-9-tag_Law-type_ROOT\"]",
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
                    targetContainerIDRanges: "[\"container-9-tag_Law-type_ROOT\"]",
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
                                            targetContainerIDs: "[\"container-9-tag_Law-type_ROOT\"]",
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
                                            targetContainerIDs: "[\"container-9-tag_Law-type_ROOT\"]",
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
                    targetContainerIDRanges: "[\"container-9-tag_Law-type_ROOT\"]",
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
                                            targetContainerIDs: "[\"container-9-tag_Law-type_ROOT\"]",
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

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
第五条　第七十六条第二項及び第四項（第一号を除く。）の規定により第四項の無線局の免許の取消しを受け、その取消しの日から二年を経過しない者。
４　電気通信業務を行うことを目的として開設する無線局
  一　法人又は団体

第七十六条　総務大臣は、三月以内の期間を定めて無線局の運用の停止を命じ、又は期間を定めて運用許容時間、周波数若しくは空中線電力を制限することができる。
２　規定による期限の延長があつたときは、その期限。
４　総務大臣は、免許人（包括免許人を除く。）が次の各号のいずれかに該当するときは、その免許を取り消すことができる。
  一　正当な理由がないのに、無線局の運用を引き続き六月以上休止したとき。
  二　第一号の規定による命令又は制限に従わないとき。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);

        const expectedSentencesContainers = {
            "container-23-tag_Article-type_SENTENCES": "第七十六条第二項及び第四項（第一号を除く。）の規定により第四項の無線局の免許の取消しを受け、その取消しの日から二年を経過しない者。　電気通信業務を行うことを目的として開設する無線局　法人又は団体",
            "container-24-tag_Paragraph-type_SENTENCES": "第七十六条第二項及び第四項（第一号を除く。）の規定により第四項の無線局の免許の取消しを受け、その取消しの日から二年を経過しない者。",
            "container-25-tag_Paragraph-type_SENTENCES": "電気通信業務を行うことを目的として開設する無線局　法人又は団体",
            "container-26-tag_Item-type_SENTENCES": "法人又は団体",
            "container-27-tag_Article-type_SENTENCES": "総務大臣は、三月以内の期間を定めて無線局の運用の停止を命じ、又は期間を定めて運用許容時間、周波数若しくは空中線電力を制限することができる。　規定による期限の延長があつたときは、その期限。　総務大臣は、免許人（包括免許人を除く。）が次の各号のいずれかに該当するときは、その免許を取り消すことができる。　正当な理由がないのに、無線局の運用を引き続き六月以上休止したとき。　第一号の規定による命令又は制限に従わないとき。",
            "container-28-tag_Paragraph-type_SENTENCES": "総務大臣は、三月以内の期間を定めて無線局の運用の停止を命じ、又は期間を定めて運用許容時間、周波数若しくは空中線電力を制限することができる。",
            "container-29-tag_Paragraph-type_SENTENCES": "規定による期限の延長があつたときは、その期限。",
            "container-30-tag_Paragraph-type_SENTENCES": "総務大臣は、免許人（包括免許人を除く。）が次の各号のいずれかに該当するときは、その免許を取り消すことができる。　正当な理由がないのに、無線局の運用を引き続き六月以上休止したとき。　第一号の規定による命令又は制限に従わないとき。",
            "container-31-tag_Item-type_SENTENCES": "正当な理由がないのに、無線局の運用を引き続き六月以上休止したとき。",
            "container-32-tag_Item-type_SENTENCES": "第一号の規定による命令又は制限に従わないとき。",
        };

        const expectedPointerRangesList: JsonEL[] = [
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[\"container-29-tag_Paragraph-type_SENTENCES\",\"container-30-tag_Paragraph-type_SENTENCES\"]",
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
                                            relPos: "NAMED",
                                            targetType: "Article",
                                            name: "第七十六条",
                                            num: "76",
                                            targetContainerIDs: "[\"container-27-tag_Article-type_SENTENCES\"]",
                                        },
                                        children: ["第七十六条"],
                                    },
                                    {
                                        tag: "____PF",
                                        attr: {
                                            relPos: "NAMED",
                                            targetType: "Paragraph",
                                            name: "第二項",
                                            num: "2",
                                            targetContainerIDs: "[\"container-29-tag_Paragraph-type_SENTENCES\"]",
                                        },
                                        children: ["第二項"],
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
                                            relPos: "NAMED",
                                            targetType: "Paragraph",
                                            name: "第四項",
                                            num: "4",
                                            targetContainerIDs: "[\"container-30-tag_Paragraph-type_SENTENCES\"]",
                                        },
                                        children: ["第四項"],
                                    },
                                ],
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
                                                tag: "____PointerRanges",
                                                attr: {
                                                    targetContainerIDRanges: "[\"container-31-tag_Item-type_SENTENCES\"]",
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
                                                                            relPos: "NAMED",
                                                                            targetType: "Item",
                                                                            name: "第一号",
                                                                            num: "1",
                                                                            targetContainerIDs: "[\"container-31-tag_Item-type_SENTENCES\"]",
                                                                        },
                                                                        children: ["第一号"],
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
                                                children: ["を除く。"],
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
                        ],
                    },
                ],
            },
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[\"container-25-tag_Paragraph-type_SENTENCES\"]",
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
                                            relPos: "NAMED",
                                            targetType: "Paragraph",
                                            name: "第四項",
                                            num: "4",
                                            targetContainerIDs: "[\"container-25-tag_Paragraph-type_SENTENCES\"]",
                                        },
                                        children: ["第四項"],
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
                    targetContainerIDRanges: "[\"container-31-tag_Item-type_SENTENCES\"]",
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
                                            relPos: "NAMED",
                                            targetType: "Item",
                                            name: "第一号",
                                            num: "1",
                                            targetContainerIDs: "[\"container-31-tag_Item-type_SENTENCES\"]",
                                        },
                                        children: ["第一号"],
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

        const sentenceContainers = Object.fromEntries((
            [...sentenceEnvsStruct.containers.values()]
                .filter(c => c.type === "SENTENCES")
                .map(c => [
                    c.containerID,
                    (
                        sentenceEnvsStruct.sentenceEnvs
                            .slice(...c.sentenceRange)
                            .map(s => s.text).join("　")
                    ),
                ])
        ));
        // console.log(JSON.stringify(sentenceContainers, null, 2));
        assert.deepStrictEqual(sentenceContainers, expectedSentencesContainers);

        // console.log(JSON.stringify(detectTokensResult.value.pointerRangesList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            detectTokensResult.value.pointerRangesList.map(r => r.json(true)),
            expectedPointerRangesList,
        );

        assert.deepStrictEqual(detectTokensResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （免許の申請）
第六条　無線局の免許を受けようとする者は、申請書に、次に掲げる事項を記載した書類を添えて、総務大臣に提出しなければならない。
  四　無線設備の設置場所（移動する無線局のうち、次のイ又はロに掲げるものについては、それぞれイ又はロに定める事項。第十八条第一項を除き、以下同じ。）
    イ　人工衛星の無線局（以下「人工衛星局」という。）　その人工衛星の軌道又は位置
    ロ　人工衛星局、船舶の無線局（人工衛星局の中継によつてのみ無線通信を行うものを除く。第三項において同じ。）、船舶地球局（船舶に開設する無線局であつて、人工衛星局の中継によつてのみ無線通信を行うもの（実験等無線局及びアマチュア無線局を除く。）をいう。以下同じ。）、航空機の無線局（人工衛星局の中継によつてのみ無線通信を行うものを除く。第五項において同じ。）及び航空機地球局（航空機に開設する無線局であつて、人工衛星局の中継によつてのみ無線通信を行うもの（実験等無線局及びアマチュア無線局を除く。）をいう。以下同じ。）以外の無線局　移動範囲
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);

        const expectedSentencesContainers = {
            "container-36-tag_Article-type_SENTENCES": "無線局の免許を受けようとする者は、申請書に、次に掲げる事項を記載した書類を添えて、総務大臣に提出しなければならない。　無線設備の設置場所（移動する無線局のうち、次のイ又はロに掲げるものについては、それぞれイ又はロに定める事項。第十八条第一項を除き、以下同じ。）　人工衛星の無線局（以下「人工衛星局」という。）　その人工衛星の軌道又は位置　人工衛星局、船舶の無線局（人工衛星局の中継によつてのみ無線通信を行うものを除く。第三項において同じ。）、船舶地球局（船舶に開設する無線局であつて、人工衛星局の中継によつてのみ無線通信を行うもの（実験等無線局及びアマチュア無線局を除く。）をいう。以下同じ。）、航空機の無線局（人工衛星局の中継によつてのみ無線通信を行うものを除く。第五項において同じ。）及び航空機地球局（航空機に開設する無線局であつて、人工衛星局の中継によつてのみ無線通信を行うもの（実験等無線局及びアマチュア無線局を除く。）をいう。以下同じ。）以外の無線局　移動範囲",
            "container-37-tag_Paragraph-type_SENTENCES": "無線局の免許を受けようとする者は、申請書に、次に掲げる事項を記載した書類を添えて、総務大臣に提出しなければならない。　無線設備の設置場所（移動する無線局のうち、次のイ又はロに掲げるものについては、それぞれイ又はロに定める事項。第十八条第一項を除き、以下同じ。）　人工衛星の無線局（以下「人工衛星局」という。）　その人工衛星の軌道又は位置　人工衛星局、船舶の無線局（人工衛星局の中継によつてのみ無線通信を行うものを除く。第三項において同じ。）、船舶地球局（船舶に開設する無線局であつて、人工衛星局の中継によつてのみ無線通信を行うもの（実験等無線局及びアマチュア無線局を除く。）をいう。以下同じ。）、航空機の無線局（人工衛星局の中継によつてのみ無線通信を行うものを除く。第五項において同じ。）及び航空機地球局（航空機に開設する無線局であつて、人工衛星局の中継によつてのみ無線通信を行うもの（実験等無線局及びアマチュア無線局を除く。）をいう。以下同じ。）以外の無線局　移動範囲",
            "container-38-tag_Item-type_SENTENCES": "無線設備の設置場所（移動する無線局のうち、次のイ又はロに掲げるものについては、それぞれイ又はロに定める事項。第十八条第一項を除き、以下同じ。）　人工衛星の無線局（以下「人工衛星局」という。）　その人工衛星の軌道又は位置　人工衛星局、船舶の無線局（人工衛星局の中継によつてのみ無線通信を行うものを除く。第三項において同じ。）、船舶地球局（船舶に開設する無線局であつて、人工衛星局の中継によつてのみ無線通信を行うもの（実験等無線局及びアマチュア無線局を除く。）をいう。以下同じ。）、航空機の無線局（人工衛星局の中継によつてのみ無線通信を行うものを除く。第五項において同じ。）及び航空機地球局（航空機に開設する無線局であつて、人工衛星局の中継によつてのみ無線通信を行うもの（実験等無線局及びアマチュア無線局を除く。）をいう。以下同じ。）以外の無線局　移動範囲",
            "container-39-tag_Subitem1-type_SENTENCES": "人工衛星の無線局（以下「人工衛星局」という。）　その人工衛星の軌道又は位置",
            "container-40-tag_Subitem1-type_SENTENCES": "人工衛星局、船舶の無線局（人工衛星局の中継によつてのみ無線通信を行うものを除く。第三項において同じ。）、船舶地球局（船舶に開設する無線局であつて、人工衛星局の中継によつてのみ無線通信を行うもの（実験等無線局及びアマチュア無線局を除く。）をいう。以下同じ。）、航空機の無線局（人工衛星局の中継によつてのみ無線通信を行うものを除く。第五項において同じ。）及び航空機地球局（航空機に開設する無線局であつて、人工衛星局の中継によつてのみ無線通信を行うもの（実験等無線局及びアマチュア無線局を除く。）をいう。以下同じ。）以外の無線局　移動範囲",
        };

        const expectedPointerRangesList: JsonEL[] = [
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[\"container-39-tag_Subitem1-type_SENTENCES\",\"container-40-tag_Subitem1-type_SENTENCES\"]",
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
                                            relPos: "NAMED",
                                            targetType: "SUBITEM",
                                            name: "イ",
                                            num: "1",
                                            targetContainerIDs: "[\"container-39-tag_Subitem1-type_SENTENCES\"]",
                                        },
                                        children: ["イ"],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["又は"],
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
                                            relPos: "NAMED",
                                            targetType: "SUBITEM",
                                            name: "ロ",
                                            num: "2",
                                            targetContainerIDs: "[\"container-40-tag_Subitem1-type_SENTENCES\"]",
                                        },
                                        children: ["ロ"],
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
                    targetContainerIDRanges: "[\"container-39-tag_Subitem1-type_SENTENCES\",\"container-40-tag_Subitem1-type_SENTENCES\"]",
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
                                            relPos: "NAMED",
                                            targetType: "SUBITEM",
                                            name: "イ",
                                            num: "1",
                                            targetContainerIDs: "[\"container-39-tag_Subitem1-type_SENTENCES\"]",
                                        },
                                        children: ["イ"],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["又は"],
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
                                            relPos: "NAMED",
                                            targetType: "SUBITEM",
                                            name: "ロ",
                                            num: "2",
                                            targetContainerIDs: "[\"container-40-tag_Subitem1-type_SENTENCES\"]",
                                        },
                                        children: ["ロ"],
                                    },
                                ],
                            },
                        ],
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
                                            name: "第十八条",
                                            num: "18",
                                        },
                                        children: ["第十八条"],
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
                                            targetType: "Paragraph",
                                            name: "第三項",
                                            num: "3",
                                        },
                                        children: ["第三項"],
                                    },
                                ],
                            },
                        ],
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
                                            targetType: "Paragraph",
                                            name: "第五項",
                                            num: "5",
                                        },
                                        children: ["第五項"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];
        const expectedErrorMessages: string[] = [];

        const detectTokensResult = detectTokens(sentenceEnvsStruct);

        const sentenceContainers = Object.fromEntries((
            [...sentenceEnvsStruct.containers.values()]
                .filter(c => c.type === "SENTENCES")
                .map(c => [
                    c.containerID,
                    (
                        sentenceEnvsStruct.sentenceEnvs
                            .slice(...c.sentenceRange)
                            .map(s => s.text).join("　")
                    ),
                ])
        ));
        // console.log(JSON.stringify(sentenceContainers, null, 2));
        assert.deepStrictEqual(sentenceContainers, expectedSentencesContainers);

        // console.log(JSON.stringify(detectTokensResult.value.pointerRangesList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            detectTokensResult.value.pointerRangesList.map(r => r.json(true)),
            expectedPointerRangesList,
        );

        assert.deepStrictEqual(detectTokensResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （免許の承継等）
第二十条　免許人について相続があつたときは、その相続人は、免許人の地位を承継する。
２　免許人（第七項及び第八項に規定する無線局の免許人を除く。以下この項及び次項において同じ。）たる法人が合併又は分割（無線局をその用に供する事業の全部を承継させるものに限る。）をしたときは、合併後存続する法人若しくは合併により設立された法人又は分割により当該事業の全部を承継した法人は、総務大臣の許可を受けて免許人の地位を承継することができる。
３　免許人が無線局をその用に供する事業の全部の譲渡しをしたときは、譲受人は、総務大臣の許可を受けて免許人の地位を承継することができる。
４　特定地上基幹放送局の免許人たる法人が分割をした場合において、分割により当該基幹放送局を承継し、これを分割により地上基幹放送の業務を承継した他の法人の業務の用に供する業務を行おうとする法人が総務大臣の許可を受けたときは、当該法人が当該特定地上基幹放送局の免許人から当該業務に係る基幹放送局の免許人の地位を承継したものとみなす。特定地上基幹放送局の免許人が当該基幹放送局を譲渡し、譲受人が当該基幹放送局を譲渡人の地上基幹放送の業務の用に供する業務を行おうとする場合において、当該譲受人が総務大臣の許可を受けたとき、又は特定地上基幹放送局の免許人が地上基幹放送の業務を譲渡し、その譲渡人が当該基幹放送局を譲受人の地上基幹放送の業務の用に供する業務を行おうとする場合において、当該譲渡人が総務大臣の許可を受けたときも、同様とする。
５　他の地上基幹放送の業務の用に供する基幹放送局の免許人が当該地上基幹放送の業務を行う認定基幹放送事業者と合併をし、又は当該地上基幹放送の業務を行う事業を譲り受けた場合において、合併後存続する法人若しくは合併により設立された法人又は譲受人が総務大臣の許可を受けたときは、当該法人又は譲受人が当該基幹放送局の免許人から特定地上基幹放送局の免許人の地位を承継したものとみなす。地上基幹放送の業務を行う認定基幹放送事業者が当該地上基幹放送の業務の用に供する基幹放送局を譲り受けた場合において、総務大臣の許可を受けたときも、同様とする。
６　第五条及び第七条の規定は、第二項から前項までの許可について準用する。
７　船舶局若しくは船舶地球局（電気通信業務を行うことを目的とするものを除く。）のある船舶又は無線設備が遭難自動通報設備若しくはレーダーのみの無線局のある船舶について、船舶の所有権の移転その他の理由により船舶を運行する者に変更があつたときは、変更後船舶を運行する者は、免許人の地位を承継する。
８　前項の規定は、航空機局若しくは航空機地球局（電気通信業務を行うことを目的とするものを除く。）のある航空機又は無線設備がレーダーのみの無線局のある航空機について準用する。
９　第一項及び前二項の規定により免許人の地位を承継した者は、遅滞なく、その事実を証する書面を添えてその旨を総務大臣に届け出なければならない。
１０　前各項の規定は、第八条の予備免許を受けた者について準用する。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);

        const expectedSentencesContainers = {
            "container-44-tag_Article-type_SENTENCES": "免許人について相続があつたときは、その相続人は、免許人の地位を承継する。　免許人（第七項及び第八項に規定する無線局の免許人を除く。以下この項及び次項において同じ。）たる法人が合併又は分割（無線局をその用に供する事業の全部を承継させるものに限る。）をしたときは、合併後存続する法人若しくは合併により設立された法人又は分割により当該事業の全部を承継した法人は、総務大臣の許可を受けて免許人の地位を承継することができる。　免許人が無線局をその用に供する事業の全部の譲渡しをしたときは、譲受人は、総務大臣の許可を受けて免許人の地位を承継することができる。　特定地上基幹放送局の免許人たる法人が分割をした場合において、分割により当該基幹放送局を承継し、これを分割により地上基幹放送の業務を承継した他の法人の業務の用に供する業務を行おうとする法人が総務大臣の許可を受けたときは、当該法人が当該特定地上基幹放送局の免許人から当該業務に係る基幹放送局の免許人の地位を承継したものとみなす。　特定地上基幹放送局の免許人が当該基幹放送局を譲渡し、譲受人が当該基幹放送局を譲渡人の地上基幹放送の業務の用に供する業務を行おうとする場合において、当該譲受人が総務大臣の許可を受けたとき、又は特定地上基幹放送局の免許人が地上基幹放送の業務を譲渡し、その譲渡人が当該基幹放送局を譲受人の地上基幹放送の業務の用に供する業務を行おうとする場合において、当該譲渡人が総務大臣の許可を受けたときも、同様とする。　他の地上基幹放送の業務の用に供する基幹放送局の免許人が当該地上基幹放送の業務を行う認定基幹放送事業者と合併をし、又は当該地上基幹放送の業務を行う事業を譲り受けた場合において、合併後存続する法人若しくは合併により設立された法人又は譲受人が総務大臣の許可を受けたときは、当該法人又は譲受人が当該基幹放送局の免許人から特定地上基幹放送局の免許人の地位を承継したものとみなす。　地上基幹放送の業務を行う認定基幹放送事業者が当該地上基幹放送の業務の用に供する基幹放送局を譲り受けた場合において、総務大臣の許可を受けたときも、同様とする。　第五条及び第七条の規定は、第二項から前項までの許可について準用する。　船舶局若しくは船舶地球局（電気通信業務を行うことを目的とするものを除く。）のある船舶又は無線設備が遭難自動通報設備若しくはレーダーのみの無線局のある船舶について、船舶の所有権の移転その他の理由により船舶を運行する者に変更があつたときは、変更後船舶を運行する者は、免許人の地位を承継する。　前項の規定は、航空機局若しくは航空機地球局（電気通信業務を行うことを目的とするものを除く。）のある航空機又は無線設備がレーダーのみの無線局のある航空機について準用する。　第一項及び前二項の規定により免許人の地位を承継した者は、遅滞なく、その事実を証する書面を添えてその旨を総務大臣に届け出なければならない。　前各項の規定は、第八条の予備免許を受けた者について準用する。",
            "container-45-tag_Paragraph-type_SENTENCES": "免許人について相続があつたときは、その相続人は、免許人の地位を承継する。",
            "container-46-tag_Paragraph-type_SENTENCES": "免許人（第七項及び第八項に規定する無線局の免許人を除く。以下この項及び次項において同じ。）たる法人が合併又は分割（無線局をその用に供する事業の全部を承継させるものに限る。）をしたときは、合併後存続する法人若しくは合併により設立された法人又は分割により当該事業の全部を承継した法人は、総務大臣の許可を受けて免許人の地位を承継することができる。",
            "container-47-tag_Paragraph-type_SENTENCES": "免許人が無線局をその用に供する事業の全部の譲渡しをしたときは、譲受人は、総務大臣の許可を受けて免許人の地位を承継することができる。",
            "container-48-tag_Paragraph-type_SENTENCES": "特定地上基幹放送局の免許人たる法人が分割をした場合において、分割により当該基幹放送局を承継し、これを分割により地上基幹放送の業務を承継した他の法人の業務の用に供する業務を行おうとする法人が総務大臣の許可を受けたときは、当該法人が当該特定地上基幹放送局の免許人から当該業務に係る基幹放送局の免許人の地位を承継したものとみなす。　特定地上基幹放送局の免許人が当該基幹放送局を譲渡し、譲受人が当該基幹放送局を譲渡人の地上基幹放送の業務の用に供する業務を行おうとする場合において、当該譲受人が総務大臣の許可を受けたとき、又は特定地上基幹放送局の免許人が地上基幹放送の業務を譲渡し、その譲渡人が当該基幹放送局を譲受人の地上基幹放送の業務の用に供する業務を行おうとする場合において、当該譲渡人が総務大臣の許可を受けたときも、同様とする。",
            "container-49-tag_Paragraph-type_SENTENCES": "他の地上基幹放送の業務の用に供する基幹放送局の免許人が当該地上基幹放送の業務を行う認定基幹放送事業者と合併をし、又は当該地上基幹放送の業務を行う事業を譲り受けた場合において、合併後存続する法人若しくは合併により設立された法人又は譲受人が総務大臣の許可を受けたときは、当該法人又は譲受人が当該基幹放送局の免許人から特定地上基幹放送局の免許人の地位を承継したものとみなす。　地上基幹放送の業務を行う認定基幹放送事業者が当該地上基幹放送の業務の用に供する基幹放送局を譲り受けた場合において、総務大臣の許可を受けたときも、同様とする。",
            "container-50-tag_Paragraph-type_SENTENCES": "第五条及び第七条の規定は、第二項から前項までの許可について準用する。",
            "container-51-tag_Paragraph-type_SENTENCES": "船舶局若しくは船舶地球局（電気通信業務を行うことを目的とするものを除く。）のある船舶又は無線設備が遭難自動通報設備若しくはレーダーのみの無線局のある船舶について、船舶の所有権の移転その他の理由により船舶を運行する者に変更があつたときは、変更後船舶を運行する者は、免許人の地位を承継する。",
            "container-52-tag_Paragraph-type_SENTENCES": "前項の規定は、航空機局若しくは航空機地球局（電気通信業務を行うことを目的とするものを除く。）のある航空機又は無線設備がレーダーのみの無線局のある航空機について準用する。",
            "container-53-tag_Paragraph-type_SENTENCES": "第一項及び前二項の規定により免許人の地位を承継した者は、遅滞なく、その事実を証する書面を添えてその旨を総務大臣に届け出なければならない。",
            "container-54-tag_Paragraph-type_SENTENCES": "前各項の規定は、第八条の予備免許を受けた者について準用する。",
        };

        const expectedPointerRangesList: JsonEL[] = [
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[\"container-51-tag_Paragraph-type_SENTENCES\",\"container-52-tag_Paragraph-type_SENTENCES\"]",
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
                                            relPos: "NAMED",
                                            targetType: "Paragraph",
                                            name: "第七項",
                                            num: "7",
                                            targetContainerIDs: "[\"container-51-tag_Paragraph-type_SENTENCES\"]",
                                        },
                                        children: ["第七項"],
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
                                            relPos: "NAMED",
                                            targetType: "Paragraph",
                                            name: "第八項",
                                            num: "8",
                                            targetContainerIDs: "[\"container-52-tag_Paragraph-type_SENTENCES\"]",
                                        },
                                        children: ["第八項"],
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
                    targetContainerIDRanges: "[\"container-46-tag_Paragraph-type_SENTENCES\",\"container-47-tag_Paragraph-type_SENTENCES\"]",
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
                                            targetType: "Paragraph",
                                            name: "この項",
                                            targetContainerIDs: "[\"container-46-tag_Paragraph-type_SENTENCES\"]",
                                        },
                                        children: ["この項"],
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
                                            relPos: "NEXT",
                                            targetType: "Paragraph",
                                            name: "次項",
                                            targetContainerIDs: "[\"container-47-tag_Paragraph-type_SENTENCES\"]",
                                        },
                                        children: ["次項"],
                                    },
                                ],
                            },
                        ],
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
                                            name: "第五条",
                                            num: "5",
                                        },
                                        children: ["第五条"],
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
                                            relPos: "NAMED",
                                            targetType: "Article",
                                            name: "第七条",
                                            num: "7",
                                        },
                                        children: ["第七条"],
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
                    targetContainerIDRanges: "[\"container-46-tag_Paragraph-type_SENTENCES\"]",
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
                                            relPos: "NAMED",
                                            targetType: "Paragraph",
                                            name: "第二項",
                                            num: "2",
                                            targetContainerIDs: "[\"container-46-tag_Paragraph-type_SENTENCES\"]",
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
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[\"container-49-tag_Paragraph-type_SENTENCES\"]",
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
                                            relPos: "PREV",
                                            targetType: "Paragraph",
                                            name: "前項",
                                            targetContainerIDs: "[\"container-49-tag_Paragraph-type_SENTENCES\"]",
                                        },
                                        children: ["前項"],
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
                    targetContainerIDRanges: "[\"container-51-tag_Paragraph-type_SENTENCES\"]",
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
                                            relPos: "PREV",
                                            targetType: "Paragraph",
                                            name: "前項",
                                            targetContainerIDs: "[\"container-51-tag_Paragraph-type_SENTENCES\"]",
                                        },
                                        children: ["前項"],
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
                    targetContainerIDRanges: "[\"container-45-tag_Paragraph-type_SENTENCES\",\"container-51-tag_Paragraph-type_SENTENCES\",\"container-52-tag_Paragraph-type_SENTENCES\"]",
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
                                            relPos: "NAMED",
                                            targetType: "Paragraph",
                                            name: "第一項",
                                            num: "1",
                                            targetContainerIDs: "[\"container-45-tag_Paragraph-type_SENTENCES\"]",
                                        },
                                        children: ["第一項"],
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
                                            relPos: "PREV",
                                            targetType: "Paragraph",
                                            name: "前二項",
                                            count: "2",
                                            targetContainerIDs: "[\"container-51-tag_Paragraph-type_SENTENCES\",\"container-52-tag_Paragraph-type_SENTENCES\"]",
                                        },
                                        children: ["前二項"],
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
                    targetContainerIDRanges: "[\"container-45-tag_Paragraph-type_SENTENCES\",\"container-46-tag_Paragraph-type_SENTENCES\",\"container-47-tag_Paragraph-type_SENTENCES\",\"container-48-tag_Paragraph-type_SENTENCES\",\"container-49-tag_Paragraph-type_SENTENCES\",\"container-50-tag_Paragraph-type_SENTENCES\",\"container-51-tag_Paragraph-type_SENTENCES\",\"container-52-tag_Paragraph-type_SENTENCES\",\"container-53-tag_Paragraph-type_SENTENCES\"]",
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
                                            relPos: "PREV",
                                            targetType: "Paragraph",
                                            name: "前各項",
                                            count: "all",
                                            targetContainerIDs: "[\"container-45-tag_Paragraph-type_SENTENCES\",\"container-46-tag_Paragraph-type_SENTENCES\",\"container-47-tag_Paragraph-type_SENTENCES\",\"container-48-tag_Paragraph-type_SENTENCES\",\"container-49-tag_Paragraph-type_SENTENCES\",\"container-50-tag_Paragraph-type_SENTENCES\",\"container-51-tag_Paragraph-type_SENTENCES\",\"container-52-tag_Paragraph-type_SENTENCES\",\"container-53-tag_Paragraph-type_SENTENCES\"]",
                                        },
                                        children: ["前各項"],
                                    },
                                ],
                            },
                        ],
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
                                            name: "第八条",
                                            num: "8",
                                        },
                                        children: ["第八条"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];
        const expectedErrorMessages: string[] = [];

        const detectTokensResult = detectTokens(sentenceEnvsStruct);

        const sentenceContainers = Object.fromEntries((
            [...sentenceEnvsStruct.containers.values()]
                .filter(c => c.type === "SENTENCES")
                .map(c => [
                    c.containerID,
                    (
                        sentenceEnvsStruct.sentenceEnvs
                            .slice(...c.sentenceRange)
                            .map(s => s.text).join("　")
                    ),
                ])
        ));
        // console.log(JSON.stringify(sentenceContainers, null, 2));
        assert.deepStrictEqual(sentenceContainers, expectedSentencesContainers);

        // console.log(JSON.stringify(detectTokensResult.value.pointerRangesList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            detectTokensResult.value.pointerRangesList.map(r => r.json(true)),
            expectedPointerRangesList,
        );

        assert.deepStrictEqual(detectTokensResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });
});
