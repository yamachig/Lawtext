import { testLawtextToStd } from "../testHelper";
import $article, { articleToLines } from "./$article";
import $mainProvision, { mainProvisionToLines } from "./$mainProvision";

describe("Test $list and listOrSublistToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
  （設置）
第二十四条　本省に、次の地方支分部局を置く。

    管区行政評価局
    総合通信局

２　前項に定めるもののほか、当分の間、本省に、次の地方支分部局を置く。
    沖縄行政評価事務所

    沖縄総合通信事務所

  （管区行政評価局等）
第二十五条　管区行政評価局及び沖縄行政評価事務所は、総務省の所掌事務のうち第四条第一項第九号から第十五号までに掲げる事務並びに内閣法第二十六条の規定により管区行政評価局及び沖縄行政評価事務所に属させられた事務を分掌する。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
  （設置）
第二十四条　本省に、次の地方支分部局を置く。
    管区行政評価局
    総合通信局
２　前項に定めるもののほか、当分の間、本省に、次の地方支分部局を置く。
    沖縄行政評価事務所
    沖縄総合通信事務所
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Article",
            attr: {
                Delete: "false",
                Hide: "false"
            },
            children: [
                {
                    tag: "ArticleCaption",
                    attr: {},
                    children: ["（設置）"]
                },
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第二十四条"]
                },
                {
                    tag: "Paragraph",
                    attr: {
                        OldStyle: "false"
                    },
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
                                    children: ["本省に、次の地方支分部局を置く。"]
                                }
                            ]
                        },
                        {
                            tag: "List",
                            attr: {},
                            children: [
                                {
                                    tag: "ListSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["管区行政評価局"]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            tag: "List",
                            attr: {},
                            children: [
                                {
                                    tag: "ListSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["総合通信局"]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: "Paragraph",
                    attr: {
                        OldStyle: "false"
                    },
                    children: [
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
                                    children: ["前項に定めるもののほか、当分の間、本省に、次の地方支分部局を置く。"]
                                }
                            ]
                        },
                        {
                            tag: "List",
                            attr: {},
                            children: [
                                {
                                    tag: "ListSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["沖縄行政評価事務所"]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            tag: "List",
                            attr: {},
                            children: [
                                {
                                    tag: "ListSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["沖縄総合通信事務所"]
                                        }
                                    ]
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
                const result = $article.match(0, vlines, env);
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => articleToLines(el, []),
        );
    });

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
  （設置）
第二十四条　本省に、次の地方支分部局を置く。

    管区行政評価局
    総合通信局

  !第二条　前項に定めるもののほか、当分の間、本省に、次の地方支分部局を置く。
!    !  沖縄行政評価事務所

      沖縄総合通信事務所

  !（管区行政評価局等）
第二十五条　管区行政評価局及び沖縄行政評価事務所は、総務省の所掌事務のうち第四条第一項第九号から第十五号までに掲げる事務並びに内閣法第二十六条の規定により管区行政評価局及び沖縄行政評価事務所に属させられた事務を分掌する。
`;
        const expectedErrorMessages: string[] = [
            "$paragraphItemNotAmendChildrenBlock: この部分をパースできませんでした。",
            "$listsOuter: この部分をパースできませんでした。",
        ];
        const expectedRendered = `\
  （設置）
第二十四条　本省に、次の地方支分部局を置く。
    管区行政評価局
    総合通信局

  （管区行政評価局等）
第二十五条　管区行政評価局及び沖縄行政評価事務所は、総務省の所掌事務のうち第四条第一項第九号から第十五号までに掲げる事務並びに内閣法第二十六条の規定により管区行政評価局及び沖縄行政評価事務所に属させられた事務を分掌する。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "MainProvision",
            attr: {},
            children: [
                {
                    tag: "Article",
                    attr: {
                        Delete: "false",
                        Hide: "false"
                    },
                    children: [
                        {
                            tag: "ArticleCaption",
                            attr: {},
                            children: ["（設置）"]
                        },
                        {
                            tag: "ArticleTitle",
                            attr: {},
                            children: ["第二十四条"]
                        },
                        {
                            tag: "Paragraph",
                            attr: {
                                OldStyle: "false"
                            },
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
                                            children: ["本省に、次の地方支分部局を置く。"]
                                        }
                                    ]
                                },
                                {
                                    tag: "List",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "ListSentence",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["管区行政評価局"]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    tag: "List",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "ListSentence",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["総合通信局"]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: "Article",
                    attr: {
                        Delete: "false",
                        Hide: "false"
                    },
                    children: [
                        {
                            tag: "ArticleCaption",
                            attr: {},
                            children: ["（管区行政評価局等）"]
                        },
                        {
                            tag: "ArticleTitle",
                            attr: {},
                            children: ["第二十五条"]
                        },
                        {
                            tag: "Paragraph",
                            attr: {
                                OldStyle: "false"
                            },
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
                                            children: ["管区行政評価局及び沖縄行政評価事務所は、総務省の所掌事務のうち第四条第一項第九号から第十五号までに掲げる事務並びに内閣法第二十六条の規定により管区行政評価局及び沖縄行政評価事務所に属させられた事務を分掌する。"]
                                        }
                                    ]
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
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => mainProvisionToLines(el, []),
        );
    });
});
