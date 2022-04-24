import { assert } from "chai";
import * as std from "../../law/std";
import { JsonEL } from "../../node/el/jsonEL";
import loadEL from "../../node/el/loadEL";
import addSentenceChildrenControls from "../../parser/addSentenceChildrenControls";
import detectTokens from ".";

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

        const result = detectTokens(inputElToBeModified);

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

        const result = detectTokens(inputElToBeModified);

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

        const result = detectTokens(inputElToBeModified);

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

        const result = detectTokens(inputElToBeModified);

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
});
