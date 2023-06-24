import { testLawtextToStd } from "../testHelper";
import $preamble, { preambleToLines } from "./$preamble";

describe("Test $preamble and preambleToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:preamble:

  私権は、公共の福祉に適合しなければならない。権利の行使及び義務の履行は、信義に従い誠実に行わなければならない。権利の濫用は、これを許さない。
  この法律は、個人の尊厳と両性の本質的平等を旨として、解釈しなければならない。
  私権の享有は、出生に始まる。外国人は、法令又は条約の規定により禁止される場合を除き、私権を享有する。

  法律行為の当事者が意思表示をした時に意思能力を有しなかったときは、その法律行為は、無効とする。

  （成年）
第四条　年齢二十歳をもって、成年とする。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:preamble:
  私権は、公共の福祉に適合しなければならない。権利の行使及び義務の履行は、信義に従い誠実に行わなければならない。権利の濫用は、これを許さない。
  この法律は、個人の尊厳と両性の本質的平等を旨として、解釈しなければならない。
  私権の享有は、出生に始まる。外国人は、法令又は条約の規定により禁止される場合を除き、私権を享有する。
  法律行為の当事者が意思表示をした時に意思能力を有しなかったときは、その法律行為は、無効とする。
`.replace(/\r?\n/g, "\r\n");
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

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => $preamble.match(0, vlines, env),
            el => preambleToLines(el, []),
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:preamble:

  （成年）
第四条　年齢二十歳をもって、成年とする。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:preamble:
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Preamble",
            attr: {},
            children: [],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => $preamble.match(0, vlines, env),
            el => preambleToLines(el, []),
        );
    });

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:preamble:

  私権は、公共の福祉に適合しなければならない。権利の行使及び義務の履行は、信義に従い誠実に行わなければならない。権利の濫用は、これを許さない。
  この法律は、個人の尊厳と両性の本質的平等を旨として、解釈しなければならない。

  !第三条　私権の享有は、出生に始まる。
    一  外国人は、法令又は条約の規定により禁止される場合を除き、私権を享有する。

  !法律行為の当事者が意思表示をした時に意思能力を有しなかったときは、その法律行為は、無効とする。
`;
        const expectedErrorMessages = ["$preambleChildrenBlock: この部分をパースできませんでした。"];
        const expectedRendered = `\
:preamble:
  私権は、公共の福祉に適合しなければならない。権利の行使及び義務の履行は、信義に従い誠実に行わなければならない。権利の濫用は、これを許さない。
  この法律は、個人の尊厳と両性の本質的平等を旨として、解釈しなければならない。
  法律行為の当事者が意思表示をした時に意思能力を有しなかったときは、その法律行為は、無効とする。
`.replace(/\r?\n/g, "\r\n");
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
                                    attr: {},
                                    children: ["法律行為の当事者が意思表示をした時に意思能力を有しなかったときは、その法律行為は、無効とする。"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => $preamble.match(0, vlines, env),
            el => preambleToLines(el, []),
        );
    });
});
