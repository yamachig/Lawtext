import { assert } from "chai";
import loadEL from "../../../node/el/loadEL";
import { initialEnv } from "../env";
import $nameInline from "./$nameInline";
import * as std from "../../../law/std";
import addSentenceChildrenControls from "../../../parser/addSentenceChildrenControls";
import { SentenceChildEL } from "../../../node/cst/inline";
import detectPointerRanges from "../../detectPointerRanges";

const env = initialEnv({ target: "" });

describe("Test $nameInline", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["次条第二項において単に「命令」という。）又は規則"],
        }) as std.Sentence;
        addSentenceChildrenControls(origEL);
        detectPointerRanges(origEL);
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
                                        name: "第二項",
                                        num: "2"
                                    },
                                    children: ["第二項"],
                                }
                            ],
                        }
                    ],
                }
            ]
        };

        const result = $nameInline.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.deepStrictEqual(result.value.value.following, false);
            assert.deepStrictEqual(result.value.value.nameSquareParenthesesOffset, 2);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });
});
