import { testLawtextToStd } from "../testHelper";
import { $supplProvisionAppdx, $supplProvisionAppdxStyle, $supplProvisionAppdxTable, supplProvisionAppdxItemToLines } from "./$supplProvisionAppdxItem";

describe("Test $supplProvisionAppdx and supplProvisionAppdxItemToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:suppl-provision-appdx:附則付録第一（第二十六条、第四十五条、第四十六条の五関係）　

  :arith-formula:
    <Fig src="./pict/001.jpg"/>

別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
附則付録第一（第二十六条、第四十五条、第四十六条の五関係）
  :arith-formula:
    <Fig src="./pict/001.jpg"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "SupplProvisionAppdx",
            attr: {},
            children: [
                {
                    tag: "ArithFormulaNum",
                    attr: {},
                    children: ["附則付録第一"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第二十六条、第四十五条、第四十六条の五関係）"],
                },
                {
                    tag: "ArithFormula",
                    attr: {},
                    children: [
                        {
                            tag: "FigStruct",
                            attr: { },
                            children: [
                                {
                                    tag: "Fig",
                                    attr: { src: "./pict/001.jpg" },
                                    children: [],
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
                const result = $supplProvisionAppdx.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = supplProvisionAppdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:suppl-provision-appdx:別記付録第一（第二十六条、第四十五条、第四十六条の五関係）　

  :arith-formula:
    <Fig src="./pict/001.jpg"/>

別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:suppl-provision-appdx:別記付録第一（第二十六条、第四十五条、第四十六条の五関係）
  :arith-formula:
    <Fig src="./pict/001.jpg"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "SupplProvisionAppdx",
            attr: {},
            children: [
                {
                    tag: "ArithFormulaNum",
                    attr: {},
                    children: ["別記付録第一"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第二十六条、第四十五条、第四十六条の五関係）"],
                },
                {
                    tag: "ArithFormula",
                    attr: {},
                    children: [
                        {
                            tag: "FigStruct",
                            attr: { },
                            children: [
                                {
                                    tag: "Fig",
                                    attr: { src: "./pict/001.jpg" },
                                    children: [],
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
                const result = $supplProvisionAppdx.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = supplProvisionAppdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
附則付録第一（第二十六条、第四十五条、第四十六条の五関係）　

  :arith-formula:
    <Fig src="./pict/001.jpg"/>

別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
附則付録第一（第二十六条、第四十五条、第四十六条の五関係）
  :arith-formula:
    <Fig src="./pict/001.jpg"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "SupplProvisionAppdx",
            attr: {},
            children: [
                {
                    tag: "ArithFormulaNum",
                    attr: {},
                    children: ["附則付録第一"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第二十六条、第四十五条、第四十六条の五関係）"],
                },
                {
                    tag: "ArithFormula",
                    attr: {},
                    children: [
                        {
                            tag: "FigStruct",
                            attr: { },
                            children: [
                                {
                                    tag: "Fig",
                                    attr: { src: "./pict/001.jpg" },
                                    children: [],
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
                const result = $supplProvisionAppdx.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = supplProvisionAppdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});


describe("Test $supplProvisionAppdxTable and supplProvisionAppdxItemToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:suppl-provision-appdx-table:附則別表第二（第十九条、第二十一条関係）　

  * - 情報照会者
    - 事務

別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
附則別表第二（第十九条、第二十一条関係）
  * - 情報照会者
    - 事務
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "SupplProvisionAppdxTable",
            attr: {},
            children: [
                {
                    tag: "SupplProvisionAppdxTableTitle",
                    attr: {},
                    children: ["附則別表第二"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第十九条、第二十一条関係）"],
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
                                                    children: ["情報照会者"]
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
                                                    children: ["事務"]
                                                }
                                            ]
                                        }
                                    ]
                                },
                            ]
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
                const result = $supplProvisionAppdxTable.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = supplProvisionAppdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:suppl-provision-appdx-table:付録別表第二（第十九条、第二十一条関係）　

  * - 情報照会者
    - 事務

別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:suppl-provision-appdx-table:付録別表第二（第十九条、第二十一条関係）
  * - 情報照会者
    - 事務
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "SupplProvisionAppdxTable",
            attr: {},
            children: [
                {
                    tag: "SupplProvisionAppdxTableTitle",
                    attr: {},
                    children: ["付録別表第二"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第十九条、第二十一条関係）"],
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
                                                    children: ["情報照会者"]
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
                                                    children: ["事務"]
                                                }
                                            ]
                                        }
                                    ]
                                },
                            ]
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
                const result = $supplProvisionAppdxTable.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = supplProvisionAppdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
附則別表第二（第十九条、第二十一条関係）
  * - 情報照会者
    - 事務

別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
附則別表第二（第十九条、第二十一条関係）
  * - 情報照会者
    - 事務
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "SupplProvisionAppdxTable",
            attr: {},
            children: [
                {
                    tag: "SupplProvisionAppdxTableTitle",
                    attr: {},
                    children: ["附則別表第二"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第十九条、第二十一条関係）"],
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
                                                    children: ["情報照会者"]
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
                                                    children: ["事務"]
                                                }
                                            ]
                                        }
                                    ]
                                },
                            ]
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
                const result = $supplProvisionAppdxTable.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = supplProvisionAppdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});


describe("Test $supplProvisionAppdxStyle and supplProvisionAppdxItemToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:suppl-provision-appdx-style:附則別記様式（第十四条関係）　

  :style-struct:
    <Fig src="./pict/001.pdf"/>

別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
附則別記様式（第十四条関係）
  :style-struct:
    <Fig src="./pict/001.pdf"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "SupplProvisionAppdxStyle",
            attr: {},
            children: [
                {
                    tag: "SupplProvisionAppdxStyleTitle",
                    attr: {},
                    children: ["附則別記様式"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第十四条関係）"],
                },
                {
                    tag: "StyleStruct",
                    attr: { },
                    children: [
                        {
                            tag: "Style",
                            attr: { },
                            children: [
                                {
                                    tag: "FigStruct",
                                    attr: { },
                                    children: [
                                        {
                                            tag: "Fig",
                                            attr: { src: "./pict/001.pdf" },
                                            children: [],
                                        },
                                    ],
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
                const result = $supplProvisionAppdxStyle.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = supplProvisionAppdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:suppl-provision-appdx-style:付録別記（第十四条関係）　

  :style-struct:
    <Fig src="./pict/001.pdf"/>

別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:suppl-provision-appdx-style:付録別記（第十四条関係）
  :style-struct:
    <Fig src="./pict/001.pdf"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "SupplProvisionAppdxStyle",
            attr: {},
            children: [
                {
                    tag: "SupplProvisionAppdxStyleTitle",
                    attr: {},
                    children: ["付録別記"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第十四条関係）"],
                },
                {
                    tag: "StyleStruct",
                    attr: { },
                    children: [
                        {
                            tag: "Style",
                            attr: { },
                            children: [
                                {
                                    tag: "FigStruct",
                                    attr: { },
                                    children: [
                                        {
                                            tag: "Fig",
                                            attr: { src: "./pict/001.pdf" },
                                            children: [],
                                        },
                                    ],
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
                const result = $supplProvisionAppdxStyle.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = supplProvisionAppdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
附則別記様式（第十四条関係）　

  :style-struct:
    <Fig src="./pict/001.pdf"/>

別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
附則別記様式（第十四条関係）
  :style-struct:
    <Fig src="./pict/001.pdf"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "SupplProvisionAppdxStyle",
            attr: {},
            children: [
                {
                    tag: "SupplProvisionAppdxStyleTitle",
                    attr: {},
                    children: ["附則別記様式"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第十四条関係）"],
                },
                {
                    tag: "StyleStruct",
                    attr: { },
                    children: [
                        {
                            tag: "Style",
                            attr: { },
                            children: [
                                {
                                    tag: "FigStruct",
                                    attr: { },
                                    children: [
                                        {
                                            tag: "Fig",
                                            attr: { src: "./pict/001.pdf" },
                                            children: [],
                                        },
                                    ],
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
                const result = $supplProvisionAppdxStyle.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = supplProvisionAppdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});
