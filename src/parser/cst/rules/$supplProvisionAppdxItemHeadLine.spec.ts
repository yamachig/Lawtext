import { assert } from "chai";
import { LineType } from "../../../node/line";
import { initialEnv } from "../env";
import $supplProvisionAppdxItemHeadLine from "./$supplProvisionAppdxItemHeadLine";

const env = initialEnv({});

describe("Test $supplProvisionAppdxItemHeadLine", () => {

    it("Success case (:suppl-provision-appdx:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:suppl-provision-appdx:附則付録第一（第二十六条、第四十五条、第四十六条の五関係）　

  .. figure:: ./pict/001.jpg
`;
        const expectedResult = {
            ok: true,
            nextOffset: 54,
        } as const;
        const expectedValue = {
            type: LineType.SPA,
            text: `\
:suppl-provision-appdx:附則付録第一（第二十六条、第四十五条、第四十六条の五関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: ":suppl-provision-appdx:附則付録第一（第二十六条、第四十五条、第四十六条の五関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "SupplProvisionAppdx",
            attr: {},
            children: [
                {
                    tag: "ArithFormulaNum",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["附則付録第一"],
                        },
                    ],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: [
                        {
                            tag: "__Parentheses",
                            attr: {
                                depth: "1",
                                type: "round",
                            },
                            children: [
                                {
                                    tag: "__PStart",
                                    attr: { type: "round" },
                                    children: ["（"],
                                },
                                {
                                    tag: "__PContent",
                                    attr: { type: "round" },
                                    children: [
                                        {
                                            tag: "__Text",
                                            attr: {},
                                            children: ["第二十六条、第四十五条、第四十六条の五関係"],
                                        },
                                    ],
                                },
                                {
                                    tag: "__PEnd",
                                    attr: { "type": "round" },
                                    children: ["）"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case (w/o :suppl-provision-appdx:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
附則付録第一（第二十六条、第四十五条、第四十六条の五関係）　

  .. figure:: ./pict/001.jpg
`;
        const expectedResult = {
            ok: true,
            nextOffset: 31,
        } as const;
        const expectedValue = {
            type: LineType.SPA,
            text: `\
附則付録第一（第二十六条、第四十五条、第四十六条の五関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: "附則付録第一（第二十六条、第四十五条、第四十六条の五関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "SupplProvisionAppdx",
            attr: {},
            children: [
                {
                    tag: "ArithFormulaNum",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["附則付録第一"],
                        },
                    ],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: [
                        {
                            tag: "__Parentheses",
                            attr: {
                                depth: "1",
                                type: "round",
                            },
                            children: [
                                {
                                    tag: "__PStart",
                                    attr: { type: "round" },
                                    children: ["（"],
                                },
                                {
                                    tag: "__PContent",
                                    attr: { type: "round" },
                                    children: [
                                        {
                                            tag: "__Text",
                                            attr: {},
                                            children: ["第二十六条、第四十五条、第四十六条の五関係"],
                                        },
                                    ],
                                },
                                {
                                    tag: "__PEnd",
                                    attr: { "type": "round" },
                                    children: ["）"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
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
        const expectedValue = {
            type: LineType.SPA,
            text: `\
:suppl-provision-appdx-table:附則別表第二（第十九条、第二十一条関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: ":suppl-provision-appdx-table:附則別表第二（第十九条、第二十一条関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "SupplProvisionAppdxTable",
            attr: {},
            children: [
                {
                    tag: "SupplProvisionAppdxTableTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["附則別表第二"],
                        },
                    ],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: [
                        {
                            tag: "__Parentheses",
                            attr: {
                                depth: "1",
                                type: "round",
                            },
                            children: [
                                {
                                    tag: "__PStart",
                                    attr: { type: "round" },
                                    children: ["（"],
                                },
                                {
                                    tag: "__PContent",
                                    attr: { type: "round" },
                                    children: [
                                        {
                                            tag: "__Text",
                                            attr: {},
                                            children: ["第十九条、第二十一条関係"],
                                        },
                                    ],
                                },
                                {
                                    tag: "__PEnd",
                                    attr: { "type": "round" },
                                    children: ["）"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case (w/o :suppl-provision-appdx-table:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
附則別表第二（第十九条、第二十一条関係）　

  * - 情報照会者
    - 事務
`;
        const expectedResult = {
            ok: true,
            nextOffset: 22,
        } as const;
        const expectedValue = {
            type: LineType.SPA,
            text: `\
附則別表第二（第十九条、第二十一条関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: "附則別表第二（第十九条、第二十一条関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "SupplProvisionAppdxTable",
            attr: {},
            children: [
                {
                    tag: "SupplProvisionAppdxTableTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["附則別表第二"],
                        },
                    ],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: [
                        {
                            tag: "__Parentheses",
                            attr: {
                                depth: "1",
                                type: "round",
                            },
                            children: [
                                {
                                    tag: "__PStart",
                                    attr: { type: "round" },
                                    children: ["（"],
                                },
                                {
                                    tag: "__PContent",
                                    attr: { type: "round" },
                                    children: [
                                        {
                                            tag: "__Text",
                                            attr: {},
                                            children: ["第十九条、第二十一条関係"],
                                        },
                                    ],
                                },
                                {
                                    tag: "__PEnd",
                                    attr: { "type": "round" },
                                    children: ["）"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case (:suppl-provision-appdx-style:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:suppl-provision-appdx-style:附則別記様式（第十四条関係）　

  .. figure:: ./pict/001.pdf
`;
        const expectedResult = {
            ok: true,
            nextOffset: 45,
        } as const;
        const expectedValue = {
            type: LineType.SPA,
            text: `\
:suppl-provision-appdx-style:附則別記様式（第十四条関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: ":suppl-provision-appdx-style:附則別記様式（第十四条関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "SupplProvisionAppdxStyle",
            attr: {},
            children: [
                {
                    tag: "SupplProvisionAppdxStyleTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["附則別記様式"],
                        },
                    ],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: [
                        {
                            tag: "__Parentheses",
                            attr: {
                                depth: "1",
                                type: "round",
                            },
                            children: [
                                {
                                    tag: "__PStart",
                                    attr: { type: "round" },
                                    children: ["（"],
                                },
                                {
                                    tag: "__PContent",
                                    attr: { type: "round" },
                                    children: [
                                        {
                                            tag: "__Text",
                                            attr: {},
                                            children: ["第十四条関係"],
                                        },
                                    ],
                                },
                                {
                                    tag: "__PEnd",
                                    attr: { "type": "round" },
                                    children: ["）"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case (w/o :suppl-provision-appdx-style:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
附則別記様式（第十四条関係）　

  .. figure:: ./pict/001.pdf
`;
        const expectedResult = {
            ok: true,
            nextOffset: 16,
        } as const;
        const expectedValue = {
            type: LineType.SPA,
            text: `\
附則別記様式（第十四条関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: "附則別記様式（第十四条関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "SupplProvisionAppdxStyle",
            attr: {},
            children: [
                {
                    tag: "SupplProvisionAppdxStyleTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["附則別記様式"],
                        },
                    ],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: [
                        {
                            tag: "__Parentheses",
                            attr: {
                                depth: "1",
                                type: "round",
                            },
                            children: [
                                {
                                    tag: "__PStart",
                                    attr: { type: "round" },
                                    children: ["（"],
                                },
                                {
                                    tag: "__PContent",
                                    attr: { type: "round" },
                                    children: [
                                        {
                                            tag: "__Text",
                                            attr: {},
                                            children: ["第十四条関係"],
                                        },
                                    ],
                                },
                                {
                                    tag: "__PEnd",
                                    attr: { "type": "round" },
                                    children: ["）"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

});
