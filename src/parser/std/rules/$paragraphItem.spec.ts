import { testLawtextToStd } from "../testHelper";
import $paragraphItem, { $noNumParagraph, paragraphItemToLines } from "./$paragraphItem";

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
            attr: {
                OldStyle: "false"
            },
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
                {
                    tag: "Item",
                    attr: {
                        Delete: "false"
                    },
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
                    attr: {
                        Delete: "false"
                    },
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
            (vlines, env) => $paragraphItem.match(0, vlines, env),
            el => paragraphItemToLines(el, []),
        );
    });

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
  （定義）

２　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。

    !（適用除外）
!  第二条　次に掲げる処分及び行政指導については、次章から第四章の二までの規定は、適用しない。
`;
        const expectedErrorMessages = ["$paragraphItem: この前にある項または号の終了時にインデント解除が必要です。" ];
        const expectedRendered = `\
  （定義）
２　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Paragraph",
            attr: {
                OldStyle: "false"
            },
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
            ]
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => $paragraphItem.match(0, vlines, env),
            el => paragraphItemToLines(el, []),
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
            ]
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => $noNumParagraph.match(0, vlines, env),
            el => paragraphItemToLines(el, []),
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
            attr: {
                OldStyle: "false"
            },
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
                                    tag: "FigStruct",
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
                }
            ]
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $paragraphItem.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = paragraphItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});
