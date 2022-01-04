import { assert } from "chai";
import parse from "../../cst/parse";
import { initialEnv } from "../env";
import { toVirtualLines } from "../virtualLine";
import $preamble from "./$preamble";

describe("Test $preamble", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const env = initialEnv({});
        const lawtext = `\
:前文:

  私権は、公共の福祉に適合しなければならない。権利の行使及び義務の履行は、信義に従い誠実に行わなければならない。権利の濫用は、これを許さない。
  この法律は、個人の尊厳と両性の本質的平等を旨として、解釈しなければならない。
  私権の享有は、出生に始まる。外国人は、法令又は条約の規定により禁止される場合を除き、私権を享有する。

  法律行為の当事者が意思表示をした時に意思能力を有しなかったときは、その法律行為は、無効とする。

  （成年）
第四条　年齢二十歳をもって、成年とする。
`;
        const expectedResult = {
            ok: true,
            nextOffset: 10,
        } as const;
        const expectedValue = {
            tag: "Preamble",
            attr: {},
            children: [
                {
                    tag: "Paragraph",
                    attr: { Num: "1" },
                    children: [
                        {
                            tag: "ParagraphNum",
                            attr: {},
                            children: [],
                        },
                        {
                            tag: "ParagraphSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: { Num: "1" },
                                    children: ["私権は、公共の福祉に適合しなければならない。"],
                                },
                                {
                                    tag: "Sentence",
                                    attr: { Num: "2" },
                                    children: ["権利の行使及び義務の履行は、信義に従い誠実に行わなければならない。"],
                                },
                                {
                                    tag: "Sentence",
                                    attr: { Num: "3" },
                                    children: ["権利の濫用は、これを許さない。"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "Paragraph",
                    attr: { Num: "2" },
                    children: [
                        {
                            tag: "ParagraphNum",
                            attr: {},
                            children: [],
                        },
                        {
                            tag: "ParagraphSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["この法律は、個人の尊厳と両性の本質的平等を旨として、解釈しなければならない。"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "Paragraph",
                    attr: { Num: "3" },
                    children: [
                        {
                            tag: "ParagraphNum",
                            attr: {},
                            children: [],
                        },
                        {
                            tag: "ParagraphSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: { Num: "1" },
                                    children: ["私権の享有は、出生に始まる。"],
                                },
                                {
                                    tag: "Sentence",
                                    attr: { Num: "2" },
                                    children: ["外国人は、法令又は条約の規定により禁止される場合を除き、私権を享有する。"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "Paragraph",
                    attr: { Num: "4" },
                    children: [
                        {
                            tag: "ParagraphNum",
                            attr: {},
                            children: [],
                        },
                        {
                            tag: "ParagraphSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["法律行為の当事者が意思表示をした時に意思能力を有しなかったときは、その法律行為は、無効とする。"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        const lines = parse(lawtext);
        const vls = toVirtualLines(lines);

        const result = $preamble.match(0, vls, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepStrictEqual(result.value.json(), expectedValue);
        }
    });

    it("Fail case", () => {
        /* eslint-disable no-irregular-whitespace */
        const env = initialEnv({});
        const lawtext = `\
:前文:

  私権は、公共の福祉に適合しなければならない。権利の行使及び義務の履行は、信義に従い誠実に行わなければならない。権利の濫用は、これを許さない。
  この法律は、個人の尊厳と両性の本質的平等を旨として、解釈しなければならない。
  私権の享有は、出生に始まる。外国人は、法令又は条約の規定により禁止される場合を除き、私権を享有する。

  法律行為の当事者が意思表示をした時に意思能力を有しなかったときは、その法律行為は、無効とする。

    （成年）
  第四条　年齢二十歳をもって、成年とする。
`;
        const expectedResult = {
            ok: true,
            nextOffset: 8,
        } as const;
        const expectedValue = {
            tag: "Preamble",
            attr: {},
            children: [
                {
                    tag: "Paragraph",
                    attr: { Num: "1" },
                    children: [
                        {
                            tag: "ParagraphNum",
                            attr: {},
                            children: [],
                        },
                        {
                            tag: "ParagraphSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: { Num: "1" },
                                    children: ["私権は、公共の福祉に適合しなければならない。"],
                                },
                                {
                                    tag: "Sentence",
                                    attr: { Num: "2" },
                                    children: ["権利の行使及び義務の履行は、信義に従い誠実に行わなければならない。"],
                                },
                                {
                                    tag: "Sentence",
                                    attr: { Num: "3" },
                                    children: ["権利の濫用は、これを許さない。"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "Paragraph",
                    attr: { Num: "2" },
                    children: [
                        {
                            tag: "ParagraphNum",
                            attr: {},
                            children: [],
                        },
                        {
                            tag: "ParagraphSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["この法律は、個人の尊厳と両性の本質的平等を旨として、解釈しなければならない。"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "Paragraph",
                    attr: { Num: "3" },
                    children: [
                        {
                            tag: "ParagraphNum",
                            attr: {},
                            children: [],
                        },
                        {
                            tag: "ParagraphSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: { Num: "1" },
                                    children: ["私権の享有は、出生に始まる。"],
                                },
                                {
                                    tag: "Sentence",
                                    attr: { Num: "2" },
                                    children: ["外国人は、法令又は条約の規定により禁止される場合を除き、私権を享有する。"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "Paragraph",
                    attr: { Num: "4" },
                    children: [
                        {
                            tag: "ParagraphNum",
                            attr: {},
                            children: [],
                        },
                        {
                            tag: "ParagraphSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["法律行為の当事者が意思表示をした時に意思能力を有しなかったときは、その法律行為は、無効とする。"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        const expectedErrors = [
            {
                message: "$preamble: この前にある前文の終了時にインデント解除が必要です。",
                range: [229, 234],
            },
        ];
        const lines = parse(lawtext);
        const vls = toVirtualLines(lines);

        const result = $preamble.match(0, vls, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepStrictEqual(result.value.json(), expectedValue);
        }
        assert.deepStrictEqual(env.errors, expectedErrors);
    });
});
