import { testLawtextToStd } from "../testHelper";
import $tableStruct, { tableStructToLines } from "./$tableStruct";

describe("Test $tableStruct and tableStructToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:table-struct:表一

  * * 項

    * 種名
  * - [colspan="2"]（１）　かも科

  * - １
    - シジュウカラガン

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:table-struct:表一

  * * 項
    * 種名
  * - [colspan="2"]（１）　かも科
  * - １
    - シジュウカラガン
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "TableStruct",
            attr: {},
            children: [
                {
                    tag: "TableStructTitle",
                    attr: {},
                    children: ["表一"]
                },
                {
                    tag: "Table",
                    attr: {},
                    children: [
                        {
                            tag: "TableHeaderRow",
                            attr: {},
                            children: [
                                {
                                    tag: "TableHeaderColumn",
                                    attr: {},
                                    children: ["項"]
                                },
                                {
                                    tag: "TableHeaderColumn",
                                    attr: {},
                                    children: ["種名"]
                                }
                            ]
                        },
                        {
                            tag: "TableRow",
                            attr: {},
                            children: [
                                {
                                    tag: "TableColumn",
                                    attr: {
                                        colspan: "2"
                                    },
                                    children: [
                                        {
                                            tag: "Column",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["（１）"]
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
                                                    children: ["かも科"]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
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
                                            children: ["１"]
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
                                            children: ["シジュウカラガン"]
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
                const result = $tableStruct.match(0, vlines, env);
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => tableStructToLines(el, []),
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:table-struct:一　次の表に掲げる

  * * 項

    * 種名
  * - [colspan="2"]（１）　かも科

  * - １
    - シジュウカラガン

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:table-struct:一　次の表に掲げる

  * * 項
    * 種名
  * - [colspan="2"]（１）　かも科
  * - １
    - シジュウカラガン
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "TableStruct",
            attr: {},
            children: [
                {
                    tag: "TableStructTitle",
                    attr: {},
                    children: ["一　次の表に掲げる"]
                },
                {
                    tag: "Table",
                    attr: {},
                    children: [
                        {
                            tag: "TableHeaderRow",
                            attr: {},
                            children: [
                                {
                                    tag: "TableHeaderColumn",
                                    attr: {},
                                    children: ["項"]
                                },
                                {
                                    tag: "TableHeaderColumn",
                                    attr: {},
                                    children: ["種名"]
                                }
                            ]
                        },
                        {
                            tag: "TableRow",
                            attr: {},
                            children: [
                                {
                                    tag: "TableColumn",
                                    attr: {
                                        colspan: "2"
                                    },
                                    children: [
                                        {
                                            tag: "Column",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["（１）"]
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
                                                    children: ["かも科"]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
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
                                            children: ["１"]
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
                                            children: ["シジュウカラガン"]
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
                const result = $tableStruct.match(0, vlines, env);
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => tableStructToLines(el, []),
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:table-struct:

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:table-struct:
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "TableStruct",
            attr: {},
            children: []
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $tableStruct.match(0, vlines, env);
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => tableStructToLines(el, []),
        );
    });

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
* - [Valign="top"] |
    :item:３　機構は、前二項
    :item:４　機構は、前二項

  - [Valign="top"] |

    !４　機構は、前三項!

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = ["$requireControlParagraphItem: 制御記号（\":paragraph:\" や \"#\" など）が必要です。"];
        const expectedRendered = `\
* - [Valign="top"] |
    :item:３　機構は、前二項

    :item:４　機構は、前二項

  - [Valign="top"] |
    # ４　機構は、前三項
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
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
                                    attr: {
                                        Valign: "top"
                                    },
                                    children: [
                                        {
                                            tag: "Item",
                                            attr: {
                                                Num: "3",
                                            },
                                            children: [
                                                {
                                                    tag: "ItemTitle",
                                                    attr: {},
                                                    children: ["３"]
                                                },
                                                {
                                                    tag: "ItemSentence",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "Sentence",
                                                            attr: {},
                                                            children: ["機構は、前二項"]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            tag: "Item",
                                            attr: {
                                                Num: "4",
                                            },
                                            children: [
                                                {
                                                    tag: "ItemTitle",
                                                    attr: {},
                                                    children: ["４"]
                                                },
                                                {
                                                    tag: "ItemSentence",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "Sentence",
                                                            attr: {},
                                                            children: ["機構は、前二項"]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    tag: "TableColumn",
                                    attr: {
                                        Valign: "top"
                                    },
                                    children: [
                                        {
                                            tag: "Paragraph",
                                            attr: {
                                                Num: "4",
                                            },
                                            children: [
                                                {
                                                    tag: "ParagraphNum",
                                                    attr: {},
                                                    children: ["４"]
                                                },
                                                {
                                                    tag: "ParagraphSentence",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "Sentence",
                                                            attr: {},
                                                            children: ["機構は、前三項"]
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
                const result = $tableStruct.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => tableStructToLines(el, []),
        );
    });

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
* - |
    - 次に掲げる額の合計額
    - イ　吸収合併消滅株式会社若しくは株式交換完全子会社の株主、吸収合併消滅持分会社の社員又は吸収分割会社（以下この号において「消滅会社等の株主等」という。）に対して交付する存続株式会社等の株式の数に一株当たり純資産額を乗じて得た額
    - ロ　消滅会社等の株主等に対して交付する存続株式会社等の社債、新株予約権又は新株予約権付社債の帳簿価額の合計額

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
* - |
    - 次に掲げる額の合計額
    - イ　吸収合併消滅株式会社若しくは株式交換完全子会社の株主、吸収合併消滅持分会社の社員又は吸収分割会社（以下この号において「消滅会社等の株主等」という。）に対して交付する存続株式会社等の株式の数に一株当たり純資産額を乗じて得た額
    - ロ　消滅会社等の株主等に対して交付する存続株式会社等の社債、新株予約権又は新株予約権付社債の帳簿価額の合計額
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
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
                                            attr: {
                                                Num: "1"
                                            },
                                            children: ["次に掲げる額の合計額"]
                                        },
                                        {
                                            tag: "Sentence",
                                            attr: {
                                                Num: "2"
                                            },
                                            children: ["イ　吸収合併消滅株式会社若しくは株式交換完全子会社の株主、吸収合併消滅持分会社の社員又は吸収分割会社（以下この号において「消滅会社等の株主等」という。）に対して交付する存続株式会社等の株式の数に一株当たり純資産額を乗じて得た額"]
                                        },
                                        {
                                            tag: "Sentence",
                                            attr: {
                                                Num: "3"
                                            },
                                            children: ["ロ　消滅会社等の株主等に対して交付する存続株式会社等の社債、新株予約権又は新株予約権付社債の帳簿価額の合計額"]
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
                const result = $tableStruct.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => tableStructToLines(el, []),
        );
    });


    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
* - 第七百九十六条第二項第一号
  - |
    - 次に掲げる額の合計額
    - イ　吸収合併消滅株式会社若しくは株式交換完全子会社の株主、吸収合併消滅持分会社の社員又は吸収分割会社（以下この号において「消滅会社等の株主等」という。）に対して交付する存続株式会社等の株式の数に一株当たり純資産額を乗じて得た額
    - ロ　消滅会社等の株主等に対して交付する存続株式会社等の社債、新株予約権又は新株予約権付社債の帳簿価額の合計額

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
* - 第七百九十六条第二項第一号
  - |
    - 次に掲げる額の合計額
    - イ　吸収合併消滅株式会社若しくは株式交換完全子会社の株主、吸収合併消滅持分会社の社員又は吸収分割会社（以下この号において「消滅会社等の株主等」という。）に対して交付する存続株式会社等の株式の数に一株当たり純資産額を乗じて得た額
    - ロ　消滅会社等の株主等に対して交付する存続株式会社等の社債、新株予約権又は新株予約権付社債の帳簿価額の合計額
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
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
                                            children: ["第七百九十六条第二項第一号"]
                                        },
                                    ],
                                },
                                {
                                    tag: "TableColumn",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {
                                                Num: "1"
                                            },
                                            children: ["次に掲げる額の合計額"]
                                        },
                                        {
                                            tag: "Sentence",
                                            attr: {
                                                Num: "2"
                                            },
                                            children: ["イ　吸収合併消滅株式会社若しくは株式交換完全子会社の株主、吸収合併消滅持分会社の社員又は吸収分割会社（以下この号において「消滅会社等の株主等」という。）に対して交付する存続株式会社等の株式の数に一株当たり純資産額を乗じて得た額"]
                                        },
                                        {
                                            tag: "Sentence",
                                            attr: {
                                                Num: "3"
                                            },
                                            children: ["ロ　消滅会社等の株主等に対して交付する存続株式会社等の社債、新株予約権又は新株予約権付社債の帳簿価額の合計額"]
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
                const result = $tableStruct.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => tableStructToLines(el, []),
        );
    });

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
* - [Valign="top"] |
    - [WritingMode="horizontal"] イ　吸収合併消滅株式会社
    - ロ　消滅会社

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
* - [Valign="top"] |
    - [WritingMode="horizontal"] イ　吸収合併消滅株式会社
    - ロ　消滅会社
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
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
                                    attr: {
                                        Valign: "top"
                                    },
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {
                                                WritingMode: "horizontal",
                                                Num: "1"
                                            },
                                            children: ["イ　吸収合併消滅株式会社"]
                                        },
                                        {
                                            tag: "Sentence",
                                            attr: {
                                                Num: "2"
                                            },
                                            children: ["ロ　消滅会社"]
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
                const result = $tableStruct.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => tableStructToLines(el, []),
        );
    });

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:table-struct:表一

  !第三条　私権の享有は、出生に始まる。
    一  外国人は、法令又は条約の規定により禁止される場合を除き、私権を享有する。

  !* * 項
    * 種名

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = ["$tableStructChildrenBlock: この部分をパースできませんでした。"];
        const expectedRendered = `\
:table-struct:表一

  * * 項
    * 種名
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "TableStruct",
            attr: {},
            children: [
                {
                    tag: "TableStructTitle",
                    attr: {},
                    children: ["表一"]
                },
                {
                    tag: "Table",
                    attr: {},
                    children: [
                        {
                            tag: "TableHeaderRow",
                            attr: {},
                            children: [
                                {
                                    tag: "TableHeaderColumn",
                                    attr: {},
                                    children: ["項"]
                                },
                                {
                                    tag: "TableHeaderColumn",
                                    attr: {},
                                    children: ["種名"]
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
                const result = $tableStruct.match(0, vlines, env);
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => tableStructToLines(el, []),
        );
    });

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:table-struct:表一

  * * 項
    !-! 種名

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = ["table: Column indicator mismatch"];
        const expectedRendered = `\
:table-struct:表一

  * * 項
    * 種名
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "TableStruct",
            attr: {},
            children: [
                {
                    tag: "TableStructTitle",
                    attr: {},
                    children: ["表一"]
                },
                {
                    tag: "Table",
                    attr: {},
                    children: [
                        {
                            tag: "TableHeaderRow",
                            attr: {},
                            children: [
                                {
                                    tag: "TableHeaderColumn",
                                    attr: {},
                                    children: ["項"]
                                },
                                {
                                    tag: "TableHeaderColumn",
                                    attr: {},
                                    children: ["種名"]
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
                const result = $tableStruct.match(0, vlines, env);
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => tableStructToLines(el, []),
        );
    });

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:table-struct:表一

  !!* 項
  * 種名

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = ["table: No first column indicator"];
        const expectedRendered = `\
:table-struct:表一

  * * 項
    * 種名
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "TableStruct",
            attr: {},
            children: [
                {
                    tag: "TableStructTitle",
                    attr: {},
                    children: ["表一"]
                },
                {
                    tag: "Table",
                    attr: {},
                    children: [
                        {
                            tag: "TableHeaderRow",
                            attr: {},
                            children: [
                                {
                                    tag: "TableHeaderColumn",
                                    attr: {},
                                    children: ["項"]
                                },
                                {
                                    tag: "TableHeaderColumn",
                                    attr: {},
                                    children: ["種名"]
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
                const result = $tableStruct.match(0, vlines, env);
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => tableStructToLines(el, []),
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:table-struct:表一

  備考
    備考文１

  * - 項
    - 種名

  :remarks:
    備考文２

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:table-struct:表一

  備考
    備考文１

  * - 項
    - 種名

  :remarks:
    備考文２
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "TableStruct",
            attr: {},
            children: [
                {
                    tag: "TableStructTitle",
                    attr: {},
                    children: ["表一"]
                },
                {
                    tag: "Remarks",
                    attr: {},
                    children: [
                        {
                            tag: "RemarksLabel",
                            attr: {},
                            children: ["備考"],
                        },
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["備考文１"],
                        },
                    ],
                },
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
                        },
                    ]
                },
                {
                    tag: "Remarks",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["備考文２"],
                        },
                    ],
                },
            ]
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $tableStruct.match(0, vlines, env);
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => tableStructToLines(el, []),
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
* - 項
  - 種名

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
* - 項
  - 種名
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
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
                const result = $tableStruct.match(0, vlines, env);
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => tableStructToLines(el, []),
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
* - &#x3000;項
  - 種名

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
* - &#x3000;項
  - 種名
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
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
                                            children: ["　項"]
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
                const result = $tableStruct.match(0, vlines, env);
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => tableStructToLines(el, []),
        );
    });
});
