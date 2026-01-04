import { assert } from "chai";
import loadEL from "../../../node/el/loadEL";
import { initialEnv } from "../env";
import type * as std from "../../../law/std";
import type { SentenceChildEL } from "../../../node/cst/inline";
import $ambiguousNameParenthesesContent from "./$ambiguousNameParenthesesContent";
import detectPointers from "../../detectPointers";
import getSentenceEnvs from "../../getSentenceEnvs";

const env = initialEnv({ target: "" });

describe("Test $ambiguousNameParenthesesContent", () => {

    it("Success case", () => {
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。"],
        }) as std.Sentence;
        getSentenceEnvs(origEL);
        detectPointers(origEL);
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
                                        name: "第四十六条"
                                    },
                                    children: ["第四十六条"],
                                },
                            ],
                        }
                    ],
                }
            ]
        };

        const result = $ambiguousNameParenthesesContent.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.value.following, false);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["命令等で定めようとする内容を示すものをいう。以下同じ。"],
        }) as std.Sentence;
        getSentenceEnvs(origEL);
        detectPointers(origEL);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];

        const result = $ambiguousNameParenthesesContent.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.isNull(result.value.value.pointerRanges);
            assert.deepStrictEqual(result.value.value.following, true);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["前項の期間の範囲内で主務大臣が定める期間をいう。第三十八条の十一第一項第二号及び第三号において同じ。"],
        }) as std.Sentence;
        getSentenceEnvs(origEL);
        detectPointers(origEL);
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
                                        name: "第三十八条の十一"
                                    },
                                    children: ["第三十八条の十一"]
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第一項"
                                    },
                                    children: ["第一項"]
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Item",
                                        name: "第二号"
                                    },
                                    children: ["第二号"]
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["及び"]
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
                                        targetType: "Item",
                                        name: "第三号"
                                    },
                                    children: ["第三号"]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        const result = $ambiguousNameParenthesesContent.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.value.following, false);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["国の行政庁が、申請等が行われた場合において、相当の期間内に何らかの国の関与のうち許可その他の処分その他公権力の行使に当たるものをすべきにかかわらず、これをしないことをいう。以下本節において同じ。"],
        }) as std.Sentence;
        getSentenceEnvs(origEL);
        detectPointers(origEL);
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
                                        targetType: "Section",
                                        name: "本節"
                                    },
                                    children: ["本節"]
                                }
                            ]
                        }
                    ]
                }
            ]
        };


        const result = $ambiguousNameParenthesesContent.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.value.following, true);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });
});
