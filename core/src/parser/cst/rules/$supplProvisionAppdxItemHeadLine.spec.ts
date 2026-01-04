import { assert } from "chai";
import { matchResultToJson } from "generic-parser/lib/core";
import type { Controls } from "../../../node/cst/inline";
import { LineType } from "../../../node/cst/line";
import { initialEnv } from "../env";
import $supplProvisionAppdxItemHeadLine from "./$supplProvisionAppdxItemHeadLine";

const env = initialEnv({});

describe("Test $supplProvisionAppdxItemHeadLine", () => {

    it("Success case (:suppl-provision-appdx:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:suppl-provision-appdx:　附則付録第一（第二十六条、第四十五条、第四十六条の五関係）　

  <Fig src="./pict/001.jpg"/>
`;
        const expectedResult = {
            ok: true,
            nextOffset: 55,
        } as const;
        const expectedText = `\
:suppl-provision-appdx:　附則付録第一（第二十六条、第四十五条、第四十六条の五関係）　
`;
        const expectedValue = {
            type: LineType.SPA,
            indentTexts: [] as string[],
            mainTag: "SupplProvisionAppdx",
            controls: [
                {
                    control: ":suppl-provision-appdx:",
                    controlRange: [0, 23],
                    trailingSpace: "　",
                    trailingSpaceRange: [23, 24],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["附則付録第一"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["第二十六条、第四十五条、第四十六条の五関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ]
          ;
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Success case (w/o :suppl-provision-appdx:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
# 附則付録第一（第二十六条、第四十五条、第四十六条の五関係）　

  <Fig src="./pict/001.jpg"/>
`;
        const expectedResult = {
            ok: true,
            nextOffset: 33,
        } as const;
        const expectedText = `\
# 附則付録第一（第二十六条、第四十五条、第四十六条の五関係）　
`;
        const expectedValue = {
            type: LineType.SPA,
            indentTexts: [] as string[],
            mainTag: "SupplProvisionAppdx",
            controls: [
                {
                    control: "#",
                    controlRange: [0, 1],
                    trailingSpace: " ",
                    trailingSpaceRange: [1, 2],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["附則付録第一"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["第二十六条、第四十五条、第四十六条の五関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ]
          ;
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Success case (:suppl-provision-appdx-table:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:suppl-provision-appdx-table:附則別表第二（第十九条、第二十一条関係）　

  * - 情報照会者
    - 事務
`;
        const expectedResult = {
            ok: true,
            nextOffset: 51,
        } as const;
        const expectedText = `\
:suppl-provision-appdx-table:附則別表第二（第十九条、第二十一条関係）　
`;
        const expectedValue = {
            type: LineType.SPA,
            indentTexts: [] as string[],
            mainTag: "SupplProvisionAppdxTable",
            controls: [
                {
                    control: ":suppl-provision-appdx-table:",
                    controlRange: [0, 29],
                    trailingSpace: "",
                    trailingSpaceRange: [29, 29],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["附則別表第二"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["第十九条、第二十一条関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ]
          ;
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Success case (w/o :suppl-provision-appdx-table:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
# 附則別表第二（第十九条、第二十一条関係）　

  * - 情報照会者
    - 事務
`;
        const expectedResult = {
            ok: true,
            nextOffset: 24,
        } as const;
        const expectedText = `\
# 附則別表第二（第十九条、第二十一条関係）　
`;
        const expectedValue = {
            type: LineType.SPA,
            indentTexts: [] as string[],
            mainTag: "SupplProvisionAppdxTable",
            controls: [
                {
                    control: "#",
                    controlRange: [0, 1],
                    trailingSpace: " ",
                    trailingSpaceRange: [1, 2],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["附則別表第二"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["第十九条、第二十一条関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ]
          ;
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Success case (:suppl-provision-appdx-style:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:suppl-provision-appdx-style:附則別記様式（第十四条関係）　

  <Fig src="./pict/001.pdf"/>
`;
        const expectedResult = {
            ok: true,
            nextOffset: 45,
        } as const;
        const expectedText = `\
:suppl-provision-appdx-style:附則別記様式（第十四条関係）　
`;
        const expectedValue = {
            type: LineType.SPA,
            indentTexts: [] as string[],
            mainTag: "SupplProvisionAppdxStyle",
            controls: [
                {
                    control: ":suppl-provision-appdx-style:",
                    controlRange: [0, 29],
                    trailingSpace: "",
                    trailingSpaceRange: [29, 29],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["附則別記様式"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["第十四条関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ]
          ;
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Success case (w/o :suppl-provision-appdx-style:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
# 附則別記様式（第十四条関係）　

  <Fig src="./pict/001.pdf"/>
`;
        const expectedResult = {
            ok: true,
            nextOffset: 18,
        } as const;
        const expectedText = `\
# 附則別記様式（第十四条関係）　
`;
        const expectedValue = {
            type: LineType.SPA,
            indentTexts: [] as string[],
            controls: [
                {
                    control: "#",
                    controlRange: [0, 1],
                    trailingSpace: " ",
                    trailingSpaceRange: [1, 2],
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedTitle = [
            {
                tag: "__Text",
                attr: {},
                children: ["附則別記様式"],
            },
        ];
        const expectedRelatedArticleNum = [
            {
                tag: "__Parentheses",
                attr: {
                    type: "round",
                    depth: "1"
                },
                children: [
                    {
                        tag: "__PStart",
                        attr: {
                            type: "round"
                        },
                        children: ["（"]
                    },
                    {
                        tag: "__PContent",
                        attr: {
                            type: "round"
                        },
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["第十四条関係"]
                            }
                        ]
                    },
                    {
                        tag: "__PEnd",
                        attr: {
                            type: "round"
                        },
                        children: ["）"]
                    }
                ]
            }
        ]
          ;
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.title.map(el => el.json(true)), expectedTitle);
            // console.log(JSON.stringify(result.value.value.relatedArticleNum.map(el => el.json(true)), null, 2));
            assert.deepStrictEqual(result.value.value.relatedArticleNum.map(el => el.json(true)), expectedRelatedArticleNum);
        }
    });

    it("Fail case", () => {
        const offset = 0;
        const target = `\
# 別表第二（第十九条、第二十一条関係）

  * - 情報照会者
    - 事務
`;
        const expectedResult = {
            ok: false,
            offset: 0,
            expected: "supplProvisionAppdxItemHeadLine",
        } as const;
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
    });

});
