import { testLawtextToStd } from "../testHelper";
import $article, { articleToLines } from "./$article";

describe("Test $article and articleToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
  （定義）

第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。
  四　不利益処分　行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。ただし、次のいずれかに該当するものを除く。
    イ　事実上の行為及び事実上の行為をするに当たりその範囲、時期等を明らかにするために法令上必要とされている手続としての処分
    ロ　申請により求められた許認可等を拒否する処分その他申請に基づき当該申請をした者を名あて人としてされる処分

２　次に掲げる処分及び行政指導については、次章から第四章の二までの規定は、適用しない。

  （国の機関等に対する処分等の適用除外）
第四条　国の機関又は地方公共団体若しくはその機関に対する処分
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
  （定義）
第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。
  四　不利益処分　行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。ただし、次のいずれかに該当するものを除く。
    イ　事実上の行為及び事実上の行為をするに当たりその範囲、時期等を明らかにするために法令上必要とされている手続としての処分
    ロ　申請により求められた許認可等を拒否する処分その他申請に基づき当該申請をした者を名あて人としてされる処分
２　次に掲げる処分及び行政指導については、次章から第四章の二までの規定は、適用しない。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Article",
            attr: {
                Delete: "false",
                Hide: "false",
            },
            children: [
                {
                    tag: "ArticleCaption",
                    attr: {},
                    children: ["（定義）"]
                },
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第二条"]
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
                                    children: ["この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。"]
                                }
                            ]
                        },
                        {
                            tag: "Item",
                            attr: {
                                Delete: "false"
                            },
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
                            attr: {
                                Delete: "false"
                            },
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
                                    attr: {
                                        Delete: "false"
                                    },
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
                                    attr: {
                                        Delete: "false"
                                    },
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
                                    children: ["次に掲げる処分及び行政指導については、次章から第四章の二までの規定は、適用しない。"]
                                }
                            ]
                        },
                    ]
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => $article.match(0, vlines, env),
            el => articleToLines(el, []),
        );
    });

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
  （定義）

第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。

  !  !（国の機関等に対する処分等の適用除外）
  第四条　国の機関又は地方公共団体若しくはその機関に対する処分
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
  （定義）
第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Article",
            attr: {
                Delete: "false",
                Hide: "false",
            },
            children: [
                {
                    tag: "ArticleCaption",
                    attr: {},
                    children: ["（定義）"]
                },
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第二条"]
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
                                    children: ["この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。"]
                                }
                            ]
                        },
                    ]
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => $article.match(0, vlines, env),
            el => articleToLines(el, []),
        );
    });

});
