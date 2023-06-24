import { testLawtextToStd } from "../testHelper";
import $article, { articleToLines } from "./$article";
import $paragraphItem, { $noControlAnonymParagraph, paragraphItemToLines } from "./$paragraphItem";

describe("Test $paragraphItem and paragraphItemToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
  （定義）

２　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。
  四　不利益処分　行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。ただし、次のいずれかに該当するものを除く。
    イ　事実上の行為及び事実上の行為をするに当たりその範囲、時期等を明らかにするために法令上必要とされている手続としての処分
    ロ　申請により求められた許認可等を拒否する処分その他申請に基づき当該申請をした者を名あて人としてされる処分

  五　行政機関　次に掲げる機関をいう。
    ロ　地方公共団体の機関（議会を除く。）
  八　命令等　内閣又は行政機関が定める次に掲げるものをいう。

    イ　法律に基づく命令（処分の要件を定める告示を含む。次条第二項において単に「命令」という。）又は規則

  （適用除外）
３　次に掲げる処分及び行政指導については、次章から第四章の二までの規定は、適用しない。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
  （定義）
２　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。
  四　不利益処分　行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。ただし、次のいずれかに該当するものを除く。
    イ　事実上の行為及び事実上の行為をするに当たりその範囲、時期等を明らかにするために法令上必要とされている手続としての処分
    ロ　申請により求められた許認可等を拒否する処分その他申請に基づき当該申請をした者を名あて人としてされる処分
  五　行政機関　次に掲げる機関をいう。
    ロ　地方公共団体の機関（議会を除く。）
  八　命令等　内閣又は行政機関が定める次に掲げるものをいう。
    イ　法律に基づく命令（処分の要件を定める告示を含む。次条第二項において単に「命令」という。）又は規則
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Paragraph",
            attr: {},
            children: [
                {
                    tag: "ParagraphCaption",
                    attr: {},
                    children: ["（定義）"]
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
                            children: ["この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。"]
                        }
                    ]
                },
                {
                    tag: "Item",
                    attr: {},
                    children: [
                        {
                            tag: "ItemTitle",
                            attr: {},
                            children: ["一"]
                        },
                        {
                            tag: "ItemSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Column",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["法令"]
                                        }
                                    ]
                                },
                                {
                                    tag: "Column",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。"]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: "Item",
                    attr: {},
                    children: [
                        {
                            tag: "ItemTitle",
                            attr: {},
                            children: ["四"]
                        },
                        {
                            tag: "ItemSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Column",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["不利益処分"]
                                        }
                                    ]
                                },
                                {
                                    tag: "Column",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {
                                                Num: "1",
                                                Function: "main"
                                            },
                                            children: ["行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。"]
                                        },
                                        {
                                            tag: "Sentence",
                                            attr: {
                                                Num: "2",
                                                Function: "proviso"
                                            },
                                            children: ["ただし、次のいずれかに該当するものを除く。"]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            tag: "Subitem1",
                            attr: {},
                            children: [
                                {
                                    tag: "Subitem1Title",
                                    attr: {},
                                    children: ["イ"]
                                },
                                {
                                    tag: "Subitem1Sentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["事実上の行為及び事実上の行為をするに当たりその範囲、時期等を明らかにするために法令上必要とされている手続としての処分"]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            tag: "Subitem1",
                            attr: {},
                            children: [
                                {
                                    tag: "Subitem1Title",
                                    attr: {},
                                    children: ["ロ"]
                                },
                                {
                                    tag: "Subitem1Sentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["申請により求められた許認可等を拒否する処分その他申請に基づき当該申請をした者を名あて人としてされる処分"]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: "Item",
                    attr: {},
                    children: [
                        {
                            tag: "ItemTitle",
                            attr: {},
                            children: ["五"]
                        },
                        {
                            tag: "ItemSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Column",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["行政機関"]
                                        }
                                    ]
                                },
                                {
                                    tag: "Column",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["次に掲げる機関をいう。"]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            tag: "Subitem1",
                            attr: {},
                            children: [
                                {
                                    tag: "Subitem1Title",
                                    attr: {},
                                    children: ["ロ"]
                                },
                                {
                                    tag: "Subitem1Sentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["地方公共団体の機関（議会を除く。）"]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: "Item",
                    attr: {},
                    children: [
                        {
                            tag: "ItemTitle",
                            attr: {},
                            children: ["八"]
                        },
                        {
                            tag: "ItemSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Column",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["命令等"]
                                        }
                                    ]
                                },
                                {
                                    tag: "Column",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["内閣又は行政機関が定める次に掲げるものをいう。"]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            tag: "Subitem1",
                            attr: {},
                            children: [
                                {
                                    tag: "Subitem1Title",
                                    attr: {},
                                    children: ["イ"]
                                },
                                {
                                    tag: "Subitem1Sentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["法律に基づく命令（処分の要件を定める告示を含む。次条第二項において単に「命令」という。）又は規則"]
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
            (vlines, env) => $paragraphItem("Paragraph").match(0, vlines, env),
            el => paragraphItemToLines(el, [], { defaultTag: "Paragraph" }),
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
第一条の三　地方公共団体は、普通地方公共団体及び特別地方公共団体とする。
②　普通地方公共団体は、都道府県及び市町村とする。
③　特別地方公共団体は、特別区、地方公共団体の組合及び財産区とする。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
第一条の三　地方公共団体は、普通地方公共団体及び特別地方公共団体とする。
②　普通地方公共団体は、都道府県及び市町村とする。
③　特別地方公共団体は、特別区、地方公共団体の組合及び財産区とする。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Article",
            attr: {},
            children: [
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第一条の三"]
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
                                    children: ["地方公共団体は、普通地方公共団体及び特別地方公共団体とする。"]
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: "Paragraph",
                    attr: {
                        OldNum: "true",
                        Num: "2"
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
                                    children: ["普通地方公共団体は、都道府県及び市町村とする。"]
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: "Paragraph",
                    attr: {
                        OldNum: "true",
                        Num: "3"
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
                                    children: ["特別地方公共団体は、特別区、地方公共団体の組合及び財産区とする。"]
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
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = articleToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
第一条の三　地方公共団体は、普通地方公共団体及び特別地方公共団体とする。
:anonym-paragraph:[OldNum="true"]普通地方公共団体は、都道府県及び市町村とする。
:anonym-paragraph:[OldNum="true"]特別地方公共団体は、特別区、地方公共団体の組合及び財産区とする。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
第一条の三　地方公共団体は、普通地方公共団体及び特別地方公共団体とする。
②　普通地方公共団体は、都道府県及び市町村とする。
③　特別地方公共団体は、特別区、地方公共団体の組合及び財産区とする。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Article",
            attr: {},
            children: [
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第一条の三"]
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
                                    children: ["地方公共団体は、普通地方公共団体及び特別地方公共団体とする。"]
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: "Paragraph",
                    attr: {
                        OldNum: "true",
                        Num: "2"
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
                                    children: ["普通地方公共団体は、都道府県及び市町村とする。"]
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: "Paragraph",
                    attr: {
                        OldNum: "true",
                        Num: "3"
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
                                    children: ["特別地方公共団体は、特別区、地方公共団体の組合及び財産区とする。"]
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
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = articleToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
  （定義）

２　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。

    !（適用除外）
  第二条　次に掲げる処分及び行政指導については、次章から第四章の二までの規定は、適用しない。
!`;
        const expectedErrorMessages = ["$paragraphItemNotAmendChildrenBlock: この部分をパースできませんでした。"];
        const expectedRendered = `\
  （定義）
２　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Paragraph",
            attr: {},
            children: [
                {
                    tag: "ParagraphCaption",
                    attr: {},
                    children: ["（定義）"]
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
                            children: ["この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。"]
                        }
                    ]
                },
                {
                    tag: "Item",
                    attr: {},
                    children: [
                        {
                            tag: "ItemTitle",
                            attr: {},
                            children: ["一"]
                        },
                        {
                            tag: "ItemSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Column",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["法令"]
                                        }
                                    ]
                                },
                                {
                                    tag: "Column",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。"]
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
            (vlines, env) => $paragraphItem("Paragraph").match(0, vlines, env),
            el => paragraphItemToLines(el, [], { defaultTag: "Paragraph" }),
        );
    });


    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。

  （適用除外）
３　次に掲げる処分及び行政指導については、次章から第四章の二までの規定は、適用しない。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
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
                            children: ["この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。"]
                        }
                    ]
                },
                {
                    tag: "Item",
                    attr: {},
                    children: [
                        {
                            tag: "ItemTitle",
                            attr: {},
                            children: ["一"]
                        },
                        {
                            tag: "ItemSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Column",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["法令"]
                                        }
                                    ]
                                },
                                {
                                    tag: "Column",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。"]
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
            (vlines, env) => $noControlAnonymParagraph.match(0, vlines, env),
            el => paragraphItemToLines(el, [], { noControl: true }),
        );
    });


    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:anonym-paragraph:この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。

  （適用除外）
３　次に掲げる処分及び行政指導については、次章から第四章の二までの規定は、適用しない。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:anonym-paragraph:この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
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
                            children: ["この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。"]
                        }
                    ]
                },
                {
                    tag: "Item",
                    attr: {},
                    children: [
                        {
                            tag: "ItemTitle",
                            attr: {},
                            children: ["一"]
                        },
                        {
                            tag: "ItemSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Column",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["法令"]
                                        }
                                    ]
                                },
                                {
                                    tag: "Column",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。"]
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
            (vlines, env) => $paragraphItem("Paragraph").match(0, vlines, env),
            el => paragraphItemToLines(el, [], { defaultTag: "Paragraph" }),
        );
    });

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
  （定義）

２　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。

  * - 項
    - 種名

  <Fig src="./pict/S27F03901000056-005.jpg"/>

  :style-struct:
    <Fig src="./pict/S39SE188-002.jpg"/>

  （適用除外）
第二条　次に掲げる処分及び行政指導については、次章から第四章の二までの規定は、適用しない。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
  （定義）
２　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。

  * - 項
    - 種名

  <Fig src="./pict/S27F03901000056-005.jpg"/>

  :style-struct:
    <Fig src="./pict/S39SE188-002.jpg"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Paragraph",
            attr: {},
            children: [
                {
                    tag: "ParagraphCaption",
                    attr: {},
                    children: ["（定義）"]
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
                            children: ["この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。"]
                        }
                    ]
                },
                {
                    tag: "Item",
                    attr: {},
                    children: [
                        {
                            tag: "ItemTitle",
                            attr: {},
                            children: ["一"]
                        },
                        {
                            tag: "ItemSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Column",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["法令"]
                                        }
                                    ]
                                },
                                {
                                    tag: "Column",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。"]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: "TableStruct",
                    attr: {},
                    children: [
                        {
                            tag: "Table",
                            attr: {},
                            children: [
                                {
                                    tag: "TableRow",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "TableColumn",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["項"]
                                                }
                                            ]
                                        },
                                        {
                                            tag: "TableColumn",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["種名"]
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
                    tag: "FigStruct",
                    attr: {},
                    children: [
                        {
                            tag: "Fig",
                            attr: {
                                src: "./pict/S27F03901000056-005.jpg"
                            },
                            children: []
                        }
                    ]
                },
                {
                    tag: "StyleStruct",
                    attr: {},
                    children: [
                        {
                            tag: "Style",
                            attr: {},
                            children: [
                                {
                                    tag: "Fig",
                                    attr: {
                                        src: "./pict/S39SE188-002.jpg"
                                    },
                                    children: []
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
                const result = $paragraphItem("Paragraph").match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = paragraphItemToLines(el, [], { defaultTag: "Paragraph" });
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
２
  一　内閣又は行政機関が定める次に掲げるものをいう。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
２
  一　内閣又は行政機関が定める次に掲げるものをいう。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Paragraph",
            attr: {},
            children: [
                {
                    tag: "ParagraphNum",
                    attr: {},
                    children: ["２"]
                },
                {
                    tag: "ParagraphSentence",
                    attr: {},
                    children: []
                },
                {
                    tag: "Item",
                    attr: {},
                    children: [
                        {
                            tag: "ItemTitle",
                            attr: {},
                            children: ["一"]
                        },
                        {
                            tag: "ItemSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["内閣又は行政機関が定める次に掲げるものをいう。"]
                                }
                            ]
                        },
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
                const result = $paragraphItem("Paragraph").match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = paragraphItemToLines(el, [], { defaultTag: "Paragraph" });
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
第十三条　法の一部を次のように改正する。
  第十七条第一項第七号に次の一号を加える。
    イ　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
第十三条　法の一部を次のように改正する。
  第十七条第一項第七号に次の一号を加える。
    :paragraph:イ　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Article",
            attr: {},
            children: [
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第十三条"]
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
                                    children: ["法の一部を次のように改正する。"]
                                }
                            ]
                        },
                        {
                            tag: "AmendProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "AmendProvisionSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["第十七条第一項第七号に次の一号を加える。"]
                                        }
                                    ]
                                },
                                {
                                    tag: "NewProvision",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Paragraph",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "ParagraphNum",
                                                    attr: {},
                                                    children: ["イ"]
                                                },
                                                {
                                                    tag: "ParagraphSentence",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "Column",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["命令等"]
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            tag: "Column",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["内閣又は行政機関が定める次に掲げるものをいう。"]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
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
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = articleToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
第十三条　法の一部を次のように改正する。
  第十七条第一項第七号に次の一号を加える。
    # イ　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
第十三条　法の一部を次のように改正する。
  第十七条第一項第七号に次の一号を加える。
    # イ　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Article",
            attr: {},
            children: [
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第十三条"]
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
                                    children: ["法の一部を次のように改正する。"]
                                }
                            ]
                        },
                        {
                            tag: "AmendProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "AmendProvisionSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["第十七条第一項第七号に次の一号を加える。"]
                                        }
                                    ]
                                },
                                {
                                    tag: "NewProvision",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Subitem1",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Subitem1Title",
                                                    attr: {},
                                                    children: ["イ"]
                                                },
                                                {
                                                    tag: "Subitem1Sentence",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "Column",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["命令等"]
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            tag: "Column",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["内閣又は行政機関が定める次に掲げるものをいう。"]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
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
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = articleToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
第十三条　法の一部を次のように改正する。
  第十七条第一項第七号に次の一号を加える。
    :subitem1:イ　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
第十三条　法の一部を次のように改正する。
  第十七条第一項第七号に次の一号を加える。
    # イ　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Article",
            attr: {},
            children: [
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第十三条"]
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
                                    children: ["法の一部を次のように改正する。"]
                                }
                            ]
                        },
                        {
                            tag: "AmendProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "AmendProvisionSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["第十七条第一項第七号に次の一号を加える。"]
                                        }
                                    ]
                                },
                                {
                                    tag: "NewProvision",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Subitem1",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Subitem1Title",
                                                    attr: {},
                                                    children: ["イ"]
                                                },
                                                {
                                                    tag: "Subitem1Sentence",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "Column",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["命令等"]
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            tag: "Column",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["内閣又は行政機関が定める次に掲げるものをいう。"]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
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
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = articleToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
第十三条　法の一部を次のように改正する。
  第十七条第一項第七号に次の一号を加える。
    :item:八　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
第十三条　法の一部を次のように改正する。
  第十七条第一項第七号に次の一号を加える。
    # 八　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Article",
            attr: {},
            children: [
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第十三条"]
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
                                    children: ["法の一部を次のように改正する。"]
                                }
                            ]
                        },
                        {
                            tag: "AmendProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "AmendProvisionSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["第十七条第一項第七号に次の一号を加える。"]
                                        }
                                    ]
                                },
                                {
                                    tag: "NewProvision",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Item",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "ItemTitle",
                                                    attr: {},
                                                    children: ["八"]
                                                },
                                                {
                                                    tag: "ItemSentence",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "Column",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["命令等"]
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            tag: "Column",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["内閣又は行政機関が定める次に掲げるものをいう。"]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
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
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = articleToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
第十三条　法の一部を次のように改正する。
  第十七条第一項第七号に次の一号を加える。
    八　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
第十三条　法の一部を次のように改正する。
  第十七条第一項第七号に次の一号を加える。
    :paragraph:八　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Article",
            attr: {},
            children: [
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第十三条"]
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
                                    children: ["法の一部を次のように改正する。"]
                                }
                            ]
                        },
                        {
                            tag: "AmendProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "AmendProvisionSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["第十七条第一項第七号に次の一号を加える。"]
                                        }
                                    ]
                                },
                                {
                                    tag: "NewProvision",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Paragraph",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "ParagraphNum",
                                                    attr: {},
                                                    children: ["八"]
                                                },
                                                {
                                                    tag: "ParagraphSentence",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "Column",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["命令等"]
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            tag: "Column",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["内閣又は行政機関が定める次に掲げるものをいう。"]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
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
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = articleToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
第十三条　法の一部を次のように改正する。
  第十七条第一項第七号に次の一号を加える。
    # 八　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
第十三条　法の一部を次のように改正する。
  第十七条第一項第七号に次の一号を加える。
    # 八　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Article",
            attr: {},
            children: [
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第十三条"]
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
                                    children: ["法の一部を次のように改正する。"]
                                }
                            ]
                        },
                        {
                            tag: "AmendProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "AmendProvisionSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["第十七条第一項第七号に次の一号を加える。"]
                                        }
                                    ]
                                },
                                {
                                    tag: "NewProvision",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Item",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "ItemTitle",
                                                    attr: {},
                                                    children: ["八"]
                                                },
                                                {
                                                    tag: "ItemSentence",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "Column",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["命令等"]
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            tag: "Column",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["内閣又は行政機関が定める次に掲げるものをいう。"]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
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
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = articleToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
第十三条　法の一部を次のように改正する。
  第十七条第一項第七号に次の一号を加える。
    :subitem5:八　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
第十三条　法の一部を次のように改正する。
  第十七条第一項第七号に次の一号を加える。
    :subitem5:八　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Article",
            attr: {},
            children: [
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第十三条"]
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
                                    children: ["法の一部を次のように改正する。"]
                                }
                            ]
                        },
                        {
                            tag: "AmendProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "AmendProvisionSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["第十七条第一項第七号に次の一号を加える。"]
                                        }
                                    ]
                                },
                                {
                                    tag: "NewProvision",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Subitem5",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Subitem5Title",
                                                    attr: {},
                                                    children: ["八"]
                                                },
                                                {
                                                    tag: "Subitem5Sentence",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "Column",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["命令等"]
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            tag: "Column",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["内閣又は行政機関が定める次に掲げるものをいう。"]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
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
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = articleToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
第十三条　法の一部を次のように改正する。
  第十七条に次の一項を加える。
    # ⑤　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
第十三条　法の一部を次のように改正する。
  第十七条に次の一項を加える。
    # ⑤　命令等　内閣又は行政機関が定める次に掲げるものをいう。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Article",
            attr: {},
            children: [
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第十三条"]
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
                                    children: ["法の一部を次のように改正する。"]
                                }
                            ]
                        },
                        {
                            tag: "AmendProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "AmendProvisionSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["第十七条に次の一項を加える。"]
                                        }
                                    ]
                                },
                                {
                                    tag: "NewProvision",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Paragraph",
                                            attr: {
                                                OldNum: "true",
                                                Num: "5",
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
                                                            tag: "Column",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["命令等"]
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            tag: "Column",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["内閣又は行政機関が定める次に掲げるものをいう。"]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
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
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = articleToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});
