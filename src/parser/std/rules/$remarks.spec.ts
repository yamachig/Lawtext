import { testLawtextToStd } from "../testHelper";
import { $noteStruct, noteLikeStructToLines } from "./$noteLike";
import $remarks, { remarksToLines } from "./$remarks";

describe("Test $remarks and remarksToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
備考　

  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
備考
  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
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
                    children: ["路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。"],
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => $remarks.match(0, vlines, env),
            el => remarksToLines(el, []),
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
備考　

  一　路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
備考
  一　路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Remarks",
            attr: {},
            children: [
                {
                    tag: "RemarksLabel",
                    attr: {},
                    children: ["備考"],
                },
                {
                    tag: "Item",
                    attr: {
                        Delete: "false",
                    },
                    children: [
                        {
                            tag: "ItemTitle",
                            attr: {},
                            children: ["一"],
                        },
                        {
                            tag: "ItemSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。"],
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
            (vlines, env) => {
                const result = $remarks.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = remarksToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:remarks:（注）
  １．　レートベースの算定に当たり原価算定期間が２年以上の期間である場合にあっては、年度ごとに算定した額の合計額とする。
  ２．　次のいずれかに該当する導管を新設する一般ガス事業者は、当該導管に係る事業報酬率を、この表に掲げる事業報酬率の１．４倍とすることができる。
    （１）　一般ガス導管事業者間の供給区域を連結する導管
    （２）　ガス事業法施行規則第２条の２に規定する導管

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:remarks:（注）
  １．　レートベースの算定に当たり原価算定期間が２年以上の期間である場合にあっては、年度ごとに算定した額の合計額とする。
  ２．　次のいずれかに該当する導管を新設する一般ガス事業者は、当該導管に係る事業報酬率を、この表に掲げる事業報酬率の１．４倍とすることができる。
    （１）　一般ガス導管事業者間の供給区域を連結する導管
    （２）　ガス事業法施行規則第２条の２に規定する導管
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Remarks",
            attr: {},
            children: [
                {
                    tag: "RemarksLabel",
                    attr: {},
                    children: ["（注）"]
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
                            children: ["１．"]
                        },
                        {
                            tag: "ItemSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["レートベースの算定に当たり原価算定期間が２年以上の期間である場合にあっては、年度ごとに算定した額の合計額とする。"]
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
                            children: ["２．"]
                        },
                        {
                            tag: "ItemSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["次のいずれかに該当する導管を新設する一般ガス事業者は、当該導管に係る事業報酬率を、この表に掲げる事業報酬率の１．４倍とすることができる。"]
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
                                    children: ["（１）"]
                                },
                                {
                                    tag: "Subitem1Sentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["一般ガス導管事業者間の供給区域を連結する導管"]
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
                                    children: ["（２）"]
                                },
                                {
                                    tag: "Subitem1Sentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["ガス事業法施行規則第２条の２に規定する導管"]
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
                const result = $remarks.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = remarksToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:note-struct:
  備考　
  
    !:paragraph:２　路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。
!    # 一　路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = ["$remarksChildrenBlock: この部分をパースできませんでした。"];
        const expectedRendered = `\
:note-struct:
  備考
    一　路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "NoteStruct",
            attr: {},
            children: [
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
                            tag: "Item",
                            attr: {
                                Delete: "false",
                            },
                            children: [
                                {
                                    tag: "ItemTitle",
                                    attr: {},
                                    children: ["一"],
                                },
                                {
                                    tag: "ItemSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。"],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                }
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => $noteStruct.match(0, vlines, env),
            el => noteLikeStructToLines(el, []),
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
備考　

  !# ２  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。
!
# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = ["$remarksChildrenBlock: この部分をパースできませんでした。"];
        const expectedRendered = `\
備考
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Remarks",
            attr: {},
            children: [
                {
                    tag: "RemarksLabel",
                    attr: {},
                    children: ["備考"],
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $remarks.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = remarksToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
備　考
  １　この支払調書は、非居住者及び外国法人に支払う法第１６１条第１項第４号に規定する利益について使用すること。

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
備　考
  １　この支払調書は、非居住者及び外国法人に支払う法第１６１条第１項第４号に規定する利益について使用すること。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Remarks",
            attr: {},
            children: [
                {
                    tag: "RemarksLabel",
                    attr: {},
                    children: ["備　考"]
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
                            children: ["１"]
                        },
                        {
                            tag: "ItemSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["この支払調書は、非居住者及び外国法人に支払う法第１６１条第１項第４号に規定する利益について使用すること。"]
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
                const result = $remarks.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = remarksToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:remarks:備考１　

  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:remarks:備考１
  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Remarks",
            attr: {},
            children: [
                {
                    tag: "RemarksLabel",
                    attr: {},
                    children: ["備考１"],
                },
                {
                    tag: "Sentence",
                    attr: {},
                    children: ["路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。"],
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $remarks.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = remarksToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
備考

  １　標石（その一）

    :fig-struct:標石（その三）

      :remarks:
        基線標石

      <Fig src="./pict/S24F04201000016-042.jpg"/>

      :remarks:
        （単位は、センチメートル）

  ２　標識

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
備考
  １　標石（その一）

    :fig-struct:標石（その三）
      :remarks:
        基線標石

      <Fig src="./pict/S24F04201000016-042.jpg"/>

      :remarks:
        （単位は、センチメートル）

  ２　標識
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Remarks",
            attr: {},
            children: [
                {
                    tag: "RemarksLabel",
                    attr: {},
                    children: ["備考"]
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
                            children: ["１"]
                        },
                        {
                            tag: "ItemSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["標石（その一）"]
                                }
                            ]
                        },
                        {
                            tag: "FigStruct",
                            attr: {},
                            children: [
                                {
                                    tag: "FigStructTitle",
                                    attr: {},
                                    children: ["標石（その三）"]
                                },
                                {
                                    tag: "Remarks",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["基線標石"]
                                        }
                                    ]
                                },
                                {
                                    tag: "Fig",
                                    attr: {
                                        src: "./pict/S24F04201000016-042.jpg"
                                    },
                                    children: []
                                },
                                {
                                    tag: "Remarks",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["（単位は、センチメートル）"]
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
                            children: ["２"]
                        },
                        {
                            tag: "ItemSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["標識"]
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
                const result = $remarks.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = remarksToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:remarks:　

  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:remarks:
  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Remarks",
            attr: {},
            children: [
                {
                    tag: "Sentence",
                    attr: {},
                    children: ["路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。"],
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $remarks.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = remarksToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
注
  :anonym-item:この表における用語については、次に定めるところによる。
    （１）
      （ａ）　「国民一般特定金融機関等」とは、別表第一第一号から第七号までの中欄に掲げる者に対するそれぞれこれらの号の下欄に掲げる資金の貸付け又は同表第一号、第三号、第四号、第六号及び第七号の中欄に掲げる者がそれぞれこれらの号の下欄に掲げる資金を調達するために発行する社債（社債、株式等の振替に関する法律第六十六条第一号に規定する短期社債を除く。（３）、（４）、（６）、（７）及び（９）において同じ。）の取得を行う金融機関その他の法人のうち、主務省令で定めるものをいう。

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
注
  :anonym-item:この表における用語については、次に定めるところによる。
    （１）
      （ａ）　「国民一般特定金融機関等」とは、別表第一第一号から第七号までの中欄に掲げる者に対するそれぞれこれらの号の下欄に掲げる資金の貸付け又は同表第一号、第三号、第四号、第六号及び第七号の中欄に掲げる者がそれぞれこれらの号の下欄に掲げる資金を調達するために発行する社債（社債、株式等の振替に関する法律第六十六条第一号に規定する短期社債を除く。（３）、（４）、（６）、（７）及び（９）において同じ。）の取得を行う金融機関その他の法人のうち、主務省令で定めるものをいう。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Remarks",
            attr: {},
            children: [
                {
                    tag: "RemarksLabel",
                    attr: {},
                    children: ["注"]
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
                            children: []
                        },
                        {
                            tag: "ItemSentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["この表における用語については、次に定めるところによる。"]
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
                                    children: ["（１）"]
                                },
                                {
                                    tag: "Subitem1Sentence",
                                    attr: {},
                                    children: []
                                },
                                {
                                    tag: "Subitem2",
                                    attr: {
                                        Delete: "false"
                                    },
                                    children: [
                                        {
                                            tag: "Subitem2Title",
                                            attr: {},
                                            children: ["（ａ）"]
                                        },
                                        {
                                            tag: "Subitem2Sentence",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["「国民一般特定金融機関等」とは、別表第一第一号から第七号までの中欄に掲げる者に対するそれぞれこれらの号の下欄に掲げる資金の貸付け又は同表第一号、第三号、第四号、第六号及び第七号の中欄に掲げる者がそれぞれこれらの号の下欄に掲げる資金を調達するために発行する社債（社債、株式等の振替に関する法律第六十六条第一号に規定する短期社債を除く。（３）、（４）、（６）、（７）及び（９）において同じ。）の取得を行う金融機関その他の法人のうち、主務省令で定めるものをいう。"]
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
                const result = $remarks.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = remarksToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:note-struct:
  注
    :anonym-item:この表における用語については、次に定めるところによる。
      :subitem1:イ
        :subitem2:（ａ）　「国民一般特定金融機関等」とは、別表第一第一号から第七号までの中欄に掲げる者に対するそれぞれこれらの号の下欄に掲げる資金の貸付け又は同表第一号、第三号、第四号、第六号及び第七号の中欄に掲げる者がそれぞれこれらの号の下欄に掲げる資金を調達するために発行する社債（社債、株式等の振替に関する法律第六十六条第一号に規定する短期社債を除く。（３）、（４）、（６）、（７）及び（９）において同じ。）の取得を行う金融機関その他の法人のうち、主務省令で定めるものをいう。

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:note-struct:
  注
    :anonym-item:この表における用語については、次に定めるところによる。
      イ
        （ａ）　「国民一般特定金融機関等」とは、別表第一第一号から第七号までの中欄に掲げる者に対するそれぞれこれらの号の下欄に掲げる資金の貸付け又は同表第一号、第三号、第四号、第六号及び第七号の中欄に掲げる者がそれぞれこれらの号の下欄に掲げる資金を調達するために発行する社債（社債、株式等の振替に関する法律第六十六条第一号に規定する短期社債を除く。（３）、（４）、（６）、（７）及び（９）において同じ。）の取得を行う金融機関その他の法人のうち、主務省令で定めるものをいう。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "NoteStruct",
            attr: {},
            children: [
                {
                    tag: "Remarks",
                    attr: {},
                    children: [
                        {
                            tag: "RemarksLabel",
                            attr: {},
                            children: ["注"]
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
                                    children: []
                                },
                                {
                                    tag: "ItemSentence",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["この表における用語については、次に定めるところによる。"]
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
                                            children: []
                                        },
                                        {
                                            tag: "Subitem2",
                                            attr: {
                                                Delete: "false"
                                            },
                                            children: [
                                                {
                                                    tag: "Subitem2Title",
                                                    attr: {},
                                                    children: ["（ａ）"]
                                                },
                                                {
                                                    tag: "Subitem2Sentence",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "Sentence",
                                                            attr: {},
                                                            children: ["「国民一般特定金融機関等」とは、別表第一第一号から第七号までの中欄に掲げる者に対するそれぞれこれらの号の下欄に掲げる資金の貸付け又は同表第一号、第三号、第四号、第六号及び第七号の中欄に掲げる者がそれぞれこれらの号の下欄に掲げる資金を調達するために発行する社債（社債、株式等の振替に関する法律第六十六条第一号に規定する短期社債を除く。（３）、（４）、（６）、（７）及び（９）において同じ。）の取得を行う金融機関その他の法人のうち、主務省令で定めるものをいう。"]
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
                const result = $noteStruct.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = noteLikeStructToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
備考　

    !（成年）
  第四条　年齢二十歳をもって、成年とする。
!
  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。
`;
        const expectedErrorMessages = ["$remarksChildrenBlock: この部分をパースできませんでした。"];
        const expectedRendered = `\
備考
  路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
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
                    children: ["路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。"],
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $remarks.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = remarksToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});
