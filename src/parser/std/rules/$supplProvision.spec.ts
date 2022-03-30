import { testLawtextToStd } from "../testHelper";
import $supplProvision, { supplProvisionToLines } from "./$supplProvision";

describe("Test $supplProvision and supplProvisionToLines", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
附　則　抄

  （施行期日）
第一条　この法律は、公布の日から起算して一年六月を超えない範囲内において政令で定める日から施行する。

附則別表第一
  * * 物象の状態の量
    * 計量単位
  * - 力
    - ダイン

附　則　（平成一一年七月一六日法律第一〇二号）　抄
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
附　則　抄
  （施行期日）
第一条　この法律は、公布の日から起算して一年六月を超えない範囲内において政令で定める日から施行する。
附則別表第一
  * * 物象の状態の量
    * 計量単位
  * - 力
    - ダイン
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "SupplProvision",
            attr: {
                Extract: "true"
            },
            children: [
                {
                    tag: "SupplProvisionLabel",
                    attr: {},
                    children: ["附　則"]
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
                            children: ["（施行期日）"]
                        },
                        {
                            tag: "ArticleTitle",
                            attr: {},
                            children: ["第一条"]
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
                                            children: ["この法律は、公布の日から起算して一年六月を超えない範囲内において政令で定める日から施行する。"]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: "SupplProvisionAppdxTable",
                    attr: {},
                    children: [
                        {
                            tag: "SupplProvisionAppdxTableTitle",
                            attr: {},
                            children: ["附則別表第一"]
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
                                            tag: "TableHeaderRow",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "TableHeaderColumn",
                                                    attr: {},
                                                    children: ["物象の状態の量"]
                                                },
                                                {
                                                    tag: "TableHeaderColumn",
                                                    attr: {},
                                                    children: ["計量単位"]
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
                                                            children: ["力"]
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
                                                            children: ["ダイン"]
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
                const result = $supplProvision.match(0, vlines, env);
                // console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = supplProvisionToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtextWithMarker = `\
附　則　（平成五年一一月一二日法律第八九号）　抄　

  （施行期日）
第一条　この法律は、行政手続法（平成五年法律第八十八号）の施行の日から施行する。

附　則　（平成一一年七月一六日法律第一〇二号）　抄
`;
        const expectedErrorMessages: string[] = [];
        const expectedRendered = `\
附　則　（平成五年一一月一二日法律第八九号）　抄
  （施行期日）
第一条　この法律は、行政手続法（平成五年法律第八十八号）の施行の日から施行する。
`.replace(/\r?\n/g, "\r\n");
        const expectedValue = {
            tag: "SupplProvision",
            attr: {
                AmendLawNum: "平成五年一一月一二日法律第八九号",
                Extract: "true"
            },
            children: [
                {
                    tag: "SupplProvisionLabel",
                    attr: {},
                    children: ["附　則"]
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
                            children: ["（施行期日）"]
                        },
                        {
                            tag: "ArticleTitle",
                            attr: {},
                            children: ["第一条"]
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
                                            children: ["この法律は、行政手続法（平成五年法律第八十八号）の施行の日から施行する。"]
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
            (vlines, env) => {
                const result = $supplProvision.match(0, vlines, env);
                console.log(JSON.stringify(vlines, null, 2));
                // if (result.ok) console.log(JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__parsed.json", JSON.stringify(result.value.value.json(false), undefined, 2));
                // if (result.ok) writeFileSync("out__expected.json", JSON.stringify(expectedValue, undefined, 2));
                return result;
            },
            el => {
                const lines = supplProvisionToLines(el, []);
                // console.log(JSON.stringify(lines, null, 2));
                return lines;
            },
        );
    });
});
