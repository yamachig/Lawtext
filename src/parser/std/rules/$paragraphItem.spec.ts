import { assert } from "chai";
import * as std from "../../../law/std";
import { loadEl } from "../../../node/el";
import { ErrorMessage } from "../../cst/error";
import parse from "../../cst/parse";
import { initialEnv } from "../env";
import { toVirtualLines } from "../virtualLine";
import $paragraphItem, { paragraphItemToLines } from "./$paragraphItem";

describe("Test $paragraphItem and paragraphItemToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const env = initialEnv({});
        const lawtext = `\
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
        const expectedErrors: ErrorMessage[] = [];

        const lines = parse(lawtext);
        const vls = toVirtualLines(lines.value);

        const result = $paragraphItem.match(0, vls, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.json(), undefined, 2));
            assert.deepStrictEqual(result.value.value.json(), expectedValue);
            assert.deepStrictEqual([...lines.errors, ...result.value.errors], expectedErrors);
        }

        const renderedLines = paragraphItemToLines(loadEl(expectedValue) as std.Paragraph | std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10, []);
        const renderedText = renderedLines.map(l => l.text()).join("");
        assert.strictEqual(renderedText, expectedRendered);
    });

    it("Success  with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const env = initialEnv({});
        const lawtextWithMarker = `\
  （定義）

２　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。

  !  !（適用除外）
  ３　次に掲げる処分及び行政指導については、次章から第四章の二までの規定は、適用しない。
`;
        const lawtext = lawtextWithMarker.replace(/[!]/g, "");
        const markerPositions: number[] = [];
        for (let i = 0; i < lawtextWithMarker.length; i++) {
            const index = lawtextWithMarker.indexOf("!", i);
            if (index !== -1) {
                markerPositions.push(index - markerPositions.length);
                i = index;
            } else break;
        }
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
        const expectedErrors = [
            {
                message: "$paragraphItem: この前にある項または号の終了時にインデント解除が必要です。",
                range: markerPositions.slice(0, 2),
            },
        ];

        const lines = parse(lawtext);
        const vls = toVirtualLines(lines.value);

        const result = $paragraphItem.match(0, vls, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.json(), undefined, 2));
            assert.deepStrictEqual(result.value.value.json(), expectedValue);
            assert.deepStrictEqual([...lines.errors, ...result.value.errors], expectedErrors);
        }

        const renderedLines = paragraphItemToLines(loadEl(expectedValue) as std.Paragraph | std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10, []);
        const renderedText = renderedLines.map(l => l.text()).join("");
        assert.strictEqual(renderedText, expectedRendered);
    });
});
