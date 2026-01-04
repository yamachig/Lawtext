import { assert } from "chai";
import loadEL from "../../../node/el/loadEL";
import { initialEnv } from "../env";
import $nameInline from "./$nameInline";
import type * as std from "../../../law/std";
import type { SentenceChildEL } from "../../../node/cst/inline";
import detectPointers from "../../detectPointers";
import getSentenceEnvs from "../../getSentenceEnvs";

const env = initialEnv({ target: "" });

describe("Test $nameInline", () => {

    it("Success case", () => {
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["次条第二項において単に「命令」という。）又は規則"],
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
                                        relPos: "NEXT",
                                        targetType: "Article",
                                        name: "次条"
                                    },
                                    children: ["次条"],
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "Paragraph",
                                        name: "第二項"
                                    },
                                    children: ["第二項"],
                                }
                            ],
                        }
                    ],
                }
            ]
        };
        const expectedNameSquareParentheses = {
            tag: "__Parentheses",
            attr: {
                type: "square",
                depth: "1"
            },
            children: [
                {
                    tag: "__PStart",
                    attr: {
                        type: "square"
                    },
                    children: ["「"]
                },
                {
                    tag: "__PContent",
                    attr: {
                        type: "square"
                    },
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["命令"]
                        }
                    ]
                },
                {
                    tag: "__PEnd",
                    attr: {
                        type: "square"
                    },
                    children: ["」"]
                }
            ]
        }
          ;

        const result = $nameInline.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.value.following, false);
            // console.log(JSON.stringify(result.value.value.nameSquareParentheses.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.nameSquareParentheses.json(true), expectedNameSquareParentheses);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });
});
