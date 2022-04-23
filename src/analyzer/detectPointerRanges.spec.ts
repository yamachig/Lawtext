import { assert } from "chai";
import * as std from "../law/std";
import { JsonEL } from "../node/el/jsonEL";
import loadEL from "../node/el/loadEL";
import detectPointerRanges from "./detectPointerRanges";

describe("Test detectPointerRanges", () => {

    it("Success case", () => {
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
                            children: [
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["法律に基づく命令（処分の要件を定める告示を含む。次条第二項において単に「命令」という。）又は規則"],
                                },
                            ],
                        },
                    ],
                },
            ],
        }) as std.Item;
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
                    children: ["イ"],
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
                                    children: ["法律に基づく命令（処分の要件を定める告示を含む。"],
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
                                    children: ["において単に「命令」という。）又は規則"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const result = detectPointerRanges(inputElToBeModified);

        // console.log(JSON.stringify(result.value.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.map(r => r.json(true)),
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
