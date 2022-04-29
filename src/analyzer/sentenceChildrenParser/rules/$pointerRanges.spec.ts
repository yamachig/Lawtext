import { assert } from "chai";
import loadEL from "../../../node/el/loadEL";
import { initialEnv } from "../env";
import * as std from "../../../law/std";
import addSentenceChildrenControls from "../../../parser/addSentenceChildrenControls";
import { SentenceChildEL } from "../../../node/cst/inline";
import detectTokens from "../../detectTokens";
import getSentenceEnvs from "../../getSentenceEnvs";
import $pointerRanges from "./$pointerRanges";

const env = initialEnv({ target: "" });

describe("Test $pointer", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["第四十六条において同じ。"],
        }) as std.Sentence;
        addSentenceChildrenControls(origEL);
        const sentenceEnvsStruct = getSentenceEnvs(origEL);
        detectTokens(sentenceEnvsStruct);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];

        const expectedPointerRanges = {
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
                                        name: "第四十六条",
                                        num: "46",
                                    },
                                    children: ["第四十六条"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const result = $pointerRanges.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["第三十八条の二十九、第三十八条の三十一第四項及び第六項並びに第三十八条の三十八において準用する場合を含む。"],
        }) as std.Sentence;
        addSentenceChildrenControls(origEL);
        const sentenceEnvsStruct = getSentenceEnvs(origEL);
        detectTokens(sentenceEnvsStruct);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];

        const expectedPointerRanges = {
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
                                        name: "第三十八条の二十九",
                                        num: "38_29",
                                    },
                                    children: ["第三十八条の二十九"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第三十八条の三十一",
                                        num: "38_31",
                                    },
                                    children: ["第三十八条の三十一"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第四項",
                                        num: "4",
                                    },
                                    children: ["第四項"],
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
                                        name: "第六項",
                                        num: "6",
                                    },
                                    children: ["第六項"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["並びに"],
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
                                        name: "第三十八条の三十八",
                                        num: "38_38",
                                    },
                                    children: ["第三十八条の三十八"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const result = $pointerRanges.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["次項第三号、第十条第一項、第十二条、第十七条、第十八条、第二十四条の二第四項、第二十七条の十三第二項第九号、第三十八条の二第一項、第七十条の五の二第一項、第七十一条の五、第七十三条第一項ただし書、第三項及び第六項並びに第百二条の十八第一項において同じ。"],
        }) as std.Sentence;
        addSentenceChildrenControls(origEL);
        const sentenceEnvsStruct = getSentenceEnvs(origEL);
        detectTokens(sentenceEnvsStruct);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];

        const expectedPointerRanges = {
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
                                        targetType: "Paragraph",
                                        name: "次項",
                                    },
                                    children: ["次項"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Item",
                                        name: "第三号",
                                        num: "3",
                                    },
                                    children: ["第三号"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第十条",
                                        num: "10",
                                    },
                                    children: ["第十条"],
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
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第十二条",
                                        num: "12",
                                    },
                                    children: ["第十二条"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第十七条",
                                        num: "17",
                                    },
                                    children: ["第十七条"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第十八条",
                                        num: "18",
                                    },
                                    children: ["第十八条"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第二十四条の二",
                                        num: "24_2",
                                    },
                                    children: ["第二十四条の二"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第四項",
                                        num: "4",
                                    },
                                    children: ["第四項"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第二十七条の十三",
                                        num: "27_13",
                                    },
                                    children: ["第二十七条の十三"],
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
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Item",
                                        name: "第九号",
                                        num: "9",
                                    },
                                    children: ["第九号"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第三十八条の二",
                                        num: "38_2",
                                    },
                                    children: ["第三十八条の二"],
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
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第七十条の五の二",
                                        num: "70_5_2",
                                    },
                                    children: ["第七十条の五の二"],
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
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第七十一条の五",
                                        num: "71_5",
                                    },
                                    children: ["第七十一条の五"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第七十三条",
                                        num: "73",
                                    },
                                    children: ["第七十三条"],
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
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "PROVISO",
                                        name: "ただし書",
                                    },
                                    children: ["ただし書"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第三項",
                                        num: "3",
                                    },
                                    children: ["第三項"],
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
                                        name: "第六項",
                                        num: "6",
                                    },
                                    children: ["第六項"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["並びに"],
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
                                        name: "第百二条の十八",
                                        num: "102_18",
                                    },
                                    children: ["第百二条の十八"],
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
        };

        const result = $pointerRanges.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["この号、第三十八条の三第一項第二号及び第三十八条の八第二項において"],
        }) as std.Sentence;
        addSentenceChildrenControls(origEL);
        const sentenceEnvsStruct = getSentenceEnvs(origEL);
        detectTokens(sentenceEnvsStruct);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];

        const expectedPointerRanges = {
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
                                        relPos: "HERE",
                                        targetType: "Item",
                                        name: "この号",
                                    },
                                    children: ["この号"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第三十八条の三",
                                        num: "38_3",
                                    },
                                    children: ["第三十八条の三"],
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
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Item",
                                        name: "第二号",
                                        num: "2",
                                    },
                                    children: ["第二号"],
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
                                        name: "第三十八条の八",
                                        num: "38_8",
                                    },
                                    children: ["第三十八条の八"],
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
        };

        const result = $pointerRanges.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["第七十一条の三の二第四項第四号イにおいて同じ。"],
        }) as std.Sentence;
        addSentenceChildrenControls(origEL);
        const sentenceEnvsStruct = getSentenceEnvs(origEL);
        detectTokens(sentenceEnvsStruct);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];

        const expectedPointerRanges = {
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
                                        name: "第七十一条の三の二",
                                        num: "71_3_2",
                                    },
                                    children: ["第七十一条の三の二"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第四項",
                                        num: "4",
                                    },
                                    children: ["第四項"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Item",
                                        name: "第四号",
                                        num: "4",
                                    },
                                    children: ["第四号"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "SUBITEM",
                                        name: "イ",
                                        num: "1",
                                    },
                                    children: ["イ"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const result = $pointerRanges.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["前項、第三十八条の二の二第一項から第三項まで及び第三十八条の三第一項"],
        }) as std.Sentence;
        addSentenceChildrenControls(origEL);
        const sentenceEnvsStruct = getSentenceEnvs(origEL);
        detectTokens(sentenceEnvsStruct);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];

        const expectedPointerRanges = {
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
                                        relPos: "PREV",
                                        targetType: "Paragraph",
                                        name: "前項",
                                    },
                                    children: ["前項"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["、"],
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
                                        name: "第三十八条の二の二",
                                        num: "38_2_2",
                                    },
                                    children: ["第三十八条の二の二"],
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
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["から"],
                        },
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
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["まで"],
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
                                        name: "第三十八条の三",
                                        num: "38_3",
                                    },
                                    children: ["第三十八条の三"],
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
        };

        const result = $pointerRanges.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });
});
