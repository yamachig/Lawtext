import { assert } from "chai";
import loadEL from "../../../node/el/loadEL";
import { initialEnv } from "../env";
import $nameListHead from "./$nameListHead";
import type * as std from "../../../law/std";
import type { SentenceChildEL } from "../../../node/cst/inline";
import detectPointers from "../../detectPointers";
import getSentenceEnvs from "../../getSentenceEnvs";

const env = initialEnv({ target: "" });

describe("Test $nameListHead", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["この法律において、次の各号に掲げる用語の意義は、それぞれ当該各号に定めるところによる。"],
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
                                        targetType: "Law",
                                        name: "この法律"
                                    },
                                    children: ["この法律"]
                                }
                            ]
                        }
                    ]
                }
            ]
        } ;

        const result = $nameListHead.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["この法律及びこの法律に基づく命令の規定の解釈に関しては、次の定義に従うものとする。"],
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
                                        targetType: "Law",
                                        name: "この法律"
                                    },
                                    children: ["この法律"]
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
                                        relPos: "HERE",
                                        targetType: "Law",
                                        name: "この法律"
                                    },
                                    children: ["この法律"]
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "INFERIOR",
                                        name: "に基づく命令"
                                    },
                                    children: ["に基づく命令"]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        const result = $nameListHead.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["この法律又はこの法律に基づく命令において、次の各号に掲げる用語は、当該各号に掲げる定義に従うものとする。"],
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
                                        targetType: "Law",
                                        name: "この法律"
                                    },
                                    children: ["この法律"]
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["又は"]
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
                                        name: "この法律"
                                    },
                                    children: ["この法律"]
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "INFERIOR",
                                        name: "に基づく命令"
                                    },
                                    children: ["に基づく命令"]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
          ;

        const result = $nameListHead.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });


    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["この条（第一項及び次項から第七項までを除く。）において、次の各号に掲げる用語の意義は、それぞれ当該各号に定めるところによる。"],
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
                                        targetType: "Article",
                                        name: "この条"
                                    },
                                    children: ["この条"]
                                }
                            ]
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
                                                                        targetType: "Paragraph",
                                                                        name: "第一項"
                                                                    },
                                                                    children: ["第一項"]
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
                                                                        relPos: "NEXT",
                                                                        targetType: "Paragraph",
                                                                        name: "次項"
                                                                    },
                                                                    children: ["次項"]
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            tag: "__Text",
                                                            attr: {},
                                                            children: ["から"]
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
                                                                        name: "第七項"
                                                                    },
                                                                    children: ["第七項"]
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            tag: "__Text",
                                                            attr: {},
                                                            children: ["まで"]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            tag: "__Text",
                                            attr: {},
                                            children: ["を除く。"]
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
                }
            ]
        };

        const result = $nameListHead.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["この省令において使用する用語は、鉱山保安法（以下「法」という。）及び鉱山保安法施行規則（平成十六年経済産業省令第九十六号）において使用する用語の例によるほか、次の各号に定めるところによる。"],
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
                                        targetType: "Law",
                                        name: "この省令"
                                    },
                                    children: ["この省令"]
                                }
                            ]
                        }
                    ]
                }
            ]
        } ;

        const result = $nameListHead.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["この規則（第二条の三十五を除く。）において使用する用語は、鉱山保安法（以下「法」という。）及び鉱山保安法施行規則（平成十六年経済産業省令第九十六号）において使用する用語の例によるほか、次の各号に掲げる用語の意義は、それぞれ当該各号に定めるところによる。"],
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
                                        targetType: "Law",
                                        name: "この規則"
                                    },
                                    children: ["この規則"]
                                }
                            ]
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
                                                                        name: "第二条の三十五"
                                                                    },
                                                                    children: ["第二条の三十五"]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            tag: "__Text",
                                            attr: {},
                                            children: ["を除く。"]
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
                }
            ]
        };

        const result = $nameListHead.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["この規則（第二条の三十五を除く。）において使用する用語は、法において使用する用語の例によるほか、次の各号に掲げる用語の意義は、それぞれ当該各号に定めるところによる。"],
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
                                        targetType: "Law",
                                        name: "この規則"
                                    },
                                    children: ["この規則"]
                                }
                            ]
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
                                                                        name: "第二条の三十五"
                                                                    },
                                                                    children: ["第二条の三十五"]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            tag: "__Text",
                                            attr: {},
                                            children: ["を除く。"]
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
                }
            ]
        };

        const result = $nameListHead.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });
});
