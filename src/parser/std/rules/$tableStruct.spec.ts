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

別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
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
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["項"]
                                        }
                                    ]
                                },
                                {
                                    tag: "TableHeaderColumn",
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

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:table-struct:表一

  * * 項
    !-! 種名

別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
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
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["項"]
                                        }
                                    ]
                                },
                                {
                                    tag: "TableHeaderColumn",
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

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:table-struct:表一

  !!* 項
  * 種名

別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
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
                                    children: [
                                        {
                                            tag: "Sentence",
                                            attr: {},
                                            children: ["項"]
                                        }
                                    ]
                                },
                                {
                                    tag: "TableHeaderColumn",
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
