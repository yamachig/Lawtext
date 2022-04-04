import { testLawtextToStd } from "../testHelper";
import { $appdx, $appdxFig, $appdxFormat, $appdxNote, $appdxStyle, $appdxTable, appdxItemToLines } from "./$appdxItem";

describe("Test $appdx and appdxItemToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:appdx:付録第一（第二十六条、第四十五条、第四十六条の五関係）　

  :arith-formula:
    <Fig src="./pict/001.jpg"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
# 付録第一（第二十六条、第四十五条、第四十六条の五関係）

  :arith-formula:
    <Fig src="./pict/001.jpg"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Appdx",
            attr: {},
            children: [
                {
                    tag: "ArithFormulaNum",
                    attr: {},
                    children: ["付録第一"],
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
                            tag: "Fig",
                            attr: { src: "./pict/001.jpg" },
                            children: [],
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
                const result = $appdx.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:appdx:別記付録第一（第二十六条、第四十五条、第四十六条の五関係）　

  :arith-formula:
    <Fig src="./pict/001.jpg"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:appdx:別記付録第一（第二十六条、第四十五条、第四十六条の五関係）

  :arith-formula:
    <Fig src="./pict/001.jpg"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Appdx",
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
                            tag: "Fig",
                            attr: { src: "./pict/001.jpg" },
                            children: [],
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
                const result = $appdx.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
# 付録第一（第二十六条、第四十五条、第四十六条の五関係）　

  :arith-formula:
    <Fig src="./pict/001.jpg"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
# 付録第一（第二十六条、第四十五条、第四十六条の五関係）

  :arith-formula:
    <Fig src="./pict/001.jpg"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Appdx",
            attr: {},
            children: [
                {
                    tag: "ArithFormulaNum",
                    attr: {},
                    children: ["付録第一"],
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
                            tag: "Fig",
                            attr: { src: "./pict/001.jpg" },
                            children: [],
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
                const result = $appdx.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
# 付録第一（第二十六条、第四十五条、第四十六条の五関係）　

  :arith-formula:
    <Fig src="./pict/001.jpg"/>

  備考

    備考文

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
# 付録第一（第二十六条、第四十五条、第四十六条の五関係）

  :arith-formula:
    <Fig src="./pict/001.jpg"/>

  備考
    備考文
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Appdx",
            attr: {},
            children: [
                {
                    tag: "ArithFormulaNum",
                    attr: {},
                    children: ["付録第一"],
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
                            tag: "Fig",
                            attr: { src: "./pict/001.jpg" },
                            children: [],
                        },
                    ],
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
                            children: ["備考文"],
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
                const result = $appdx.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
# 付録第一（第二十六条、第四十五条、第四十六条の五関係）　

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
# 付録第一（第二十六条、第四十五条、第四十六条の五関係）
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Appdx",
            attr: {},
            children: [
                {
                    tag: "ArithFormulaNum",
                    attr: {},
                    children: ["付録第一"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第二十六条、第四十五条、第四十六条の五関係）"],
                },
            ],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $appdx.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:appdx:

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:appdx:
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Appdx",
            attr: {},
            children: [],
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $appdx.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success with errors case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:appdx:付録第一（第二十六条、第四十五条、第四十六条の五関係）　

  !第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
!
  :arith-formula:
    <Fig src="./pict/001.jpg"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = ["$appdxChildrenBlock: この部分をパースできませんでした。"];
        const expectedRendered = `\
# 付録第一（第二十六条、第四十五条、第四十六条の五関係）

  :arith-formula:
    <Fig src="./pict/001.jpg"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "Appdx",
            attr: {},
            children: [
                {
                    tag: "ArithFormulaNum",
                    attr: {},
                    children: ["付録第一"],
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
                            tag: "Fig",
                            attr: { src: "./pict/001.jpg" },
                            children: [],
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
                const result = $appdx.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});


describe("Test $appdxTable and appdxItemToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:appdx-table:別表第二（第十九条、第二十一条関係）　

  * - 情報照会者
    - 事務

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
# 別表第二（第十九条、第二十一条関係）

  * - 情報照会者
    - 事務
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxTable",
            attr: {},
            children: [
                {
                    tag: "AppdxTableTitle",
                    attr: {},
                    children: ["別表第二"],
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
                const result = $appdxTable.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:appdx-table:付録別表第二（第十九条、第二十一条関係）　

  * - 情報照会者
    - 事務

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:appdx-table:付録別表第二（第十九条、第二十一条関係）

  * - 情報照会者
    - 事務
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxTable",
            attr: {},
            children: [
                {
                    tag: "AppdxTableTitle",
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
                const result = $appdxTable.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
# 別表第二（第十九条、第二十一条関係）
  * - 情報照会者
    - 事務

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
# 別表第二（第十九条、第二十一条関係）

  * - 情報照会者
    - 事務
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxTable",
            attr: {},
            children: [
                {
                    tag: "AppdxTableTitle",
                    attr: {},
                    children: ["別表第二"],
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
                const result = $appdxTable.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
# 別表第二（第十九条、第二十一条関係）

  * - 情報照会者
    - 事務

  備考

    備考文

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
# 別表第二（第十九条、第二十一条関係）

  * - 情報照会者
    - 事務

  備考
    備考文
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxTable",
            attr: {},
            children: [
                {
                    tag: "AppdxTableTitle",
                    attr: {},
                    children: ["別表第二"],
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
                            children: ["備考文"],
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
                const result = $appdxTable.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});


describe("Test $appdxStyle and appdxItemToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:appdx-style:別記様式（第十四条関係）　

  :style-struct:
    <Fig src="./pict/001.pdf"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
# 別記様式（第十四条関係）

  :style-struct:
    <Fig src="./pict/001.pdf"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxStyle",
            attr: {},
            children: [
                {
                    tag: "AppdxStyleTitle",
                    attr: {},
                    children: ["別記様式"],
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
                                    tag: "Fig",
                                    attr: { src: "./pict/001.pdf" },
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
                const result = $appdxStyle.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:appdx-style:付録別記（第十四条関係）　

  :style-struct:
    <Fig src="./pict/001.pdf"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:appdx-style:付録別記（第十四条関係）

  :style-struct:
    <Fig src="./pict/001.pdf"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxStyle",
            attr: {},
            children: [
                {
                    tag: "AppdxStyleTitle",
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
                                    tag: "Fig",
                                    attr: { src: "./pict/001.pdf" },
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
                const result = $appdxStyle.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
# 別記様式（第十四条関係）　

  :style-struct:
    <Fig src="./pict/001.pdf"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
# 別記様式（第十四条関係）

  :style-struct:
    <Fig src="./pict/001.pdf"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxStyle",
            attr: {},
            children: [
                {
                    tag: "AppdxStyleTitle",
                    attr: {},
                    children: ["別記様式"],
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
                                    tag: "Fig",
                                    attr: { src: "./pict/001.pdf" },
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
                const result = $appdxStyle.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
# 別記様式（第十四条関係）　

  :style-struct:
    <Fig src="./pict/001.pdf"/>

  備考

    備考文

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
# 別記様式（第十四条関係）

  :style-struct:
    <Fig src="./pict/001.pdf"/>

  備考
    備考文
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxStyle",
            attr: {},
            children: [
                {
                    tag: "AppdxStyleTitle",
                    attr: {},
                    children: ["別記様式"],
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
                                    tag: "Fig",
                                    attr: { src: "./pict/001.pdf" },
                                    children: [],
                                },
                            ],
                        },
                    ],
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
                            children: ["備考文"],
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
                const result = $appdxStyle.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});


describe("Test $appdxFormat and appdxItemToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:appdx-format:別紙第一号書式（第三条関係）　

  :format-struct:
    <Fig src="./pict/001.pdf"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
# 別紙第一号書式（第三条関係）

  :format-struct:
    <Fig src="./pict/001.pdf"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxFormat",
            attr: {},
            children: [
                {
                    tag: "AppdxFormatTitle",
                    attr: {},
                    children: ["別紙第一号書式"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第三条関係）"],
                },
                {
                    tag: "FormatStruct",
                    attr: { },
                    children: [
                        {
                            tag: "Format",
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
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $appdxFormat.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:appdx-format:付録別記（第三条関係）　

  :format-struct:
    <Fig src="./pict/001.pdf"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:appdx-format:付録別記（第三条関係）

  :format-struct:
    <Fig src="./pict/001.pdf"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxFormat",
            attr: {},
            children: [
                {
                    tag: "AppdxFormatTitle",
                    attr: {},
                    children: ["付録別記"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第三条関係）"],
                },
                {
                    tag: "FormatStruct",
                    attr: { },
                    children: [
                        {
                            tag: "Format",
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
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $appdxFormat.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
# 別紙第一号書式（第三条関係）　

  :format-struct:
    <Fig src="./pict/001.pdf"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
# 別紙第一号書式（第三条関係）

  :format-struct:
    <Fig src="./pict/001.pdf"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxFormat",
            attr: {},
            children: [
                {
                    tag: "AppdxFormatTitle",
                    attr: {},
                    children: ["別紙第一号書式"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第三条関係）"],
                },
                {
                    tag: "FormatStruct",
                    attr: { },
                    children: [
                        {
                            tag: "Format",
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
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $appdxFormat.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
# 別紙第一号書式（第三条関係）

  :format-struct:
    <Fig src="./pict/001.pdf"/>

  備考

    備考文

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
# 別紙第一号書式（第三条関係）

  :format-struct:
    <Fig src="./pict/001.pdf"/>

  備考
    備考文
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxFormat",
            attr: {},
            children: [
                {
                    tag: "AppdxFormatTitle",
                    attr: {},
                    children: ["別紙第一号書式"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第三条関係）"],
                },
                {
                    tag: "FormatStruct",
                    attr: { },
                    children: [
                        {
                            tag: "Format",
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
                            children: ["備考文"],
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
                const result = $appdxFormat.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});


describe("Test $appdxFig and appdxItemToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:appdx-fig:　別図第十一（第１９条第１項の表の６の項関係）　

  <Fig src="./pict/001.pdf"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
# 別図第十一（第１９条第１項の表の６の項関係）

  <Fig src="./pict/001.pdf"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxFig",
            attr: {},
            children: [
                {
                    tag: "AppdxFigTitle",
                    attr: {},
                    children: ["別図第十一"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第１９条第１項の表の６の項関係）"],
                },
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
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $appdxFig.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:appdx-fig:付録別記（第１９条第１項の表の６の項関係）　

  <Fig src="./pict/001.pdf"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:appdx-fig:付録別記（第１９条第１項の表の６の項関係）

  <Fig src="./pict/001.pdf"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxFig",
            attr: {},
            children: [
                {
                    tag: "AppdxFigTitle",
                    attr: {},
                    children: ["付録別記"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第１９条第１項の表の６の項関係）"],
                },
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
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $appdxFig.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
# 別図第十一（第１９条第１項の表の６の項関係）　

  <Fig src="./pict/001.pdf"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
# 別図第十一（第１９条第１項の表の６の項関係）

  <Fig src="./pict/001.pdf"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxFig",
            attr: {},
            children: [
                {
                    tag: "AppdxFigTitle",
                    attr: {},
                    children: ["別図第十一"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第１９条第１項の表の６の項関係）"],
                },
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
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $appdxFig.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});


describe("Test $appdxNote and appdxItemToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:appdx-note:別記第二号（第一条第一項、第九条関係）　

  :note-struct:
    <Fig src="./pict/001.pdf"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
# 別記第二号（第一条第一項、第九条関係）

  :note-struct:
    <Fig src="./pict/001.pdf"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxNote",
            attr: {},
            children: [
                {
                    tag: "AppdxNoteTitle",
                    attr: {},
                    children: ["別記第二号"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第一条第一項、第九条関係）"],
                },
                {
                    tag: "NoteStruct",
                    attr: { },
                    children: [
                        {
                            tag: "Note",
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
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $appdxNote.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
:appdx-note:付録別記（第一条第一項、第九条関係）　

  :note-struct:
    <Fig src="./pict/001.pdf"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
:appdx-note:付録別記（第一条第一項、第九条関係）

  :note-struct:
    <Fig src="./pict/001.pdf"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxNote",
            attr: {},
            children: [
                {
                    tag: "AppdxNoteTitle",
                    attr: {},
                    children: ["付録別記"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第一条第一項、第九条関係）"],
                },
                {
                    tag: "NoteStruct",
                    attr: { },
                    children: [
                        {
                            tag: "Note",
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
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $appdxNote.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
# 別記第二号（第一条第一項、第九条関係）

  :note-struct:
    <Fig src="./pict/001.pdf"/>

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
# 別記第二号（第一条第一項、第九条関係）

  :note-struct:
    <Fig src="./pict/001.pdf"/>
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxNote",
            attr: {},
            children: [
                {
                    tag: "AppdxNoteTitle",
                    attr: {},
                    children: ["別記第二号"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第一条第一項、第九条関係）"],
                },
                {
                    tag: "NoteStruct",
                    attr: { },
                    children: [
                        {
                            tag: "Note",
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
        };

        testLawtextToStd(
            lawtextWithMarker,
            expectedRendered,
            expectedValue,
            expectedErrorMessages,
            (vlines, env) => {
                const result = $appdxNote.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
# 別記第二号（第一条第一項、第九条関係）

  :note-struct:
    <Fig src="./pict/001.pdf"/>

  備考

    備考文

# 別表第二　外国旅行の旅費（第三十五条―第三十七条、第三十九条、第四十条、第四十一条関係）
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
# 別記第二号（第一条第一項、第九条関係）

  :note-struct:
    <Fig src="./pict/001.pdf"/>

  備考
    備考文
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "AppdxNote",
            attr: {},
            children: [
                {
                    tag: "AppdxNoteTitle",
                    attr: {},
                    children: ["別記第二号"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第一条第一項、第九条関係）"],
                },
                {
                    tag: "NoteStruct",
                    attr: { },
                    children: [
                        {
                            tag: "Note",
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
                            children: ["備考文"],
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
                const result = $appdxNote.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = appdxItemToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});
