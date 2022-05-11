import { testLawtextToStd } from "../testHelper";
import $mainProvision, { mainProvisionToLines } from "./$mainProvision";

describe("Test $mainProvision and mainProvisionToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
  （施行期日）
第一条　この法律は、公布の日から起算して一年六月を超えない範囲内において政令で定める日から施行する。

  （経過措置）
第二条　この法律の施行前にした行為に対する罰則の適用については、なお従前の例による。

      附　則　（平成一一年七月一六日法律第一〇二号）　抄
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
  （施行期日）
第一条　この法律は、公布の日から起算して一年六月を超えない範囲内において政令で定める日から施行する。

  （経過措置）
第二条　この法律の施行前にした行為に対する罰則の適用については、なお従前の例による。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "MainProvision",
            attr: {},
            children: [
                {
                    tag: "Article",
                    attr: {                    },
                    children: [
                        {
                            tag: "ArticleCaption",
                            attr: {},
                            children: ["（施行期日）"]
                        },
                        {
                            tag: "ArticleTitle",
                            attr: {},
                            children: ["第一条"]
                        },
                        {
                            tag: "Paragraph",
                            attr: {},
                            children: [
                                {
                                    tag: "ParagraphNum",
                                    attr: {},
                                    children: []
                                },
                                {
                                    tag: "ParagraphSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["この法律は、公布の日から起算して一年六月を超えない範囲内において政令で定める日から施行する。"]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: "Article",
                    attr: {                    },
                    children: [
                        {
                            tag: "ArticleCaption",
                            attr: {},
                            children: ["（経過措置）"]
                        },
                        {
                            tag: "ArticleTitle",
                            attr: {},
                            children: ["第二条"]
                        },
                        {
                            tag: "Paragraph",
                            attr: {},
                            children: [
                                {
                                    tag: "ParagraphNum",
                                    attr: {},
                                    children: []
                                },
                                {
                                    tag: "ParagraphSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["この法律の施行前にした行為に対する罰則の適用については、なお従前の例による。"]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
            ]
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $mainProvision.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = mainProvisionToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
  （施行期日）
第一条　この法律は、行政手続法（平成五年法律第八十八号）の施行の日から施行する。

附　則　（平成一一年七月一六日法律第一〇二号）　抄
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
  （施行期日）
第一条　この法律は、行政手続法（平成五年法律第八十八号）の施行の日から施行する。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "MainProvision",
            attr: {},
            children: [
                {
                    tag: "Article",
                    attr: {                    },
                    children: [
                        {
                            tag: "ArticleCaption",
                            attr: {},
                            children: ["（施行期日）"]
                        },
                        {
                            tag: "ArticleTitle",
                            attr: {},
                            children: ["第一条"]
                        },
                        {
                            tag: "Paragraph",
                            attr: {},
                            children: [
                                {
                                    tag: "ParagraphNum",
                                    attr: {},
                                    children: []
                                },
                                {
                                    tag: "ParagraphSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["この法律は、行政手続法（平成五年法律第八十八号）の施行の日から施行する。"]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
            ]
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $mainProvision.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = mainProvisionToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
この法律は、昭和五十九年九月一日から施行する。ただし、第百三条の改正規定は、公布の日から施行する。

附　則　（平成一一年七月一六日法律第一〇二号）　抄
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
この法律は、昭和五十九年九月一日から施行する。ただし、第百三条の改正規定は、公布の日から施行する。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "MainProvision",
            attr: {},
            children: [
                {
                    tag: "Paragraph",
                    attr: {},
                    children: [
                        {
                            tag: "ParagraphNum",
                            attr: {},
                            children: []
                        },
                        {
                            tag: "ParagraphSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {
                                        Num: "1",
                                        Function: "main"
                                    },
                                    children: ["この法律は、昭和五十九年九月一日から施行する。"]
                                },
                                {
                                    tag: "Sentence",
                                    attr: {
                                        Num: "2",
                                        Function: "proviso"
                                    },
                                    children: ["ただし、第百三条の改正規定は、公布の日から施行する。"]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $mainProvision.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = mainProvisionToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:anonym-paragraph:この法律は、昭和五十九年九月一日から施行する。ただし、第百三条の改正規定は、公布の日から施行する。

附　則　（平成一一年七月一六日法律第一〇二号）　抄
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
この法律は、昭和五十九年九月一日から施行する。ただし、第百三条の改正規定は、公布の日から施行する。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "MainProvision",
            attr: {},
            children: [
                {
                    tag: "Paragraph",
                    attr: {},
                    children: [
                        {
                            tag: "ParagraphNum",
                            attr: {},
                            children: []
                        },
                        {
                            tag: "ParagraphSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {
                                        Num: "1",
                                        Function: "main"
                                    },
                                    children: ["この法律は、昭和五十九年九月一日から施行する。"]
                                },
                                {
                                    tag: "Sentence",
                                    attr: {
                                        Num: "2",
                                        Function: "proviso"
                                    },
                                    children: ["ただし、第百三条の改正規定は、公布の日から施行する。"]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $mainProvision.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = mainProvisionToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
  （施行期日）
１　この法律は、サービスの貿易に関する一般協定の第四議定書が日本国について効力を生ずる日から施行する。

  （罰則に関する経過措置）
２　この法律の施行前にした行為に対する罰則の適用については、なお従前の例による。

附　則　（平成一一年七月一六日法律第一〇二号）　抄
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
  （施行期日）
１　この法律は、サービスの貿易に関する一般協定の第四議定書が日本国について効力を生ずる日から施行する。

  （罰則に関する経過措置）
２　この法律の施行前にした行為に対する罰則の適用については、なお従前の例による。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "MainProvision",
            attr: {},
            children: [
                {
                    tag: "Paragraph",
                    attr: {},
                    children: [
                        {
                            tag: "ParagraphCaption",
                            attr: {},
                            children: ["（施行期日）"]
                        },
                        {
                            tag: "ParagraphNum",
                            attr: {},
                            children: ["１"]
                        },
                        {
                            tag: "ParagraphSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["この法律は、サービスの貿易に関する一般協定の第四議定書が日本国について効力を生ずる日から施行する。"]
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: "Paragraph",
                    attr: {},
                    children: [
                        {
                            tag: "ParagraphCaption",
                            attr: {},
                            children: ["（罰則に関する経過措置）"]
                        },
                        {
                            tag: "ParagraphNum",
                            attr: {},
                            children: ["２"]
                        },
                        {
                            tag: "ParagraphSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["この法律の施行前にした行為に対する罰則の適用については、なお従前の例による。"]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $mainProvision.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = mainProvisionToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});
