import { assert } from "chai";
import { Controls } from "../../../node/cst/inline";
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

  .. figure:: ./pict/001.jpg
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
            indentDepth: 0,
            indentTexts: [] as string[],
            mainTag: "SupplProvisionAppdx",
            controls: [
                {
                    control: ":suppl-provision-appdx:",
                    trailingSpace: "　",
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedInline = [
            {
                tag: "__Text",
                attr: {},
                children: ["附則付録第一"],
            },
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
        ];
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.sentenceChildren.map(el => el.json(true)), expectedInline);
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
        const expectedText = `\
附則付録第一（第二十六条、第四十五条、第四十六条の五関係）　
`;
        const expectedValue = {
            type: LineType.SPA,
            indentDepth: 0,
            indentTexts: [] as string[],
            mainTag: "SupplProvisionAppdx",
            controls: [] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedInline = [
            {
                tag: "__Text",
                attr: {},
                children: ["附則付録第一"],
            },
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
        ];
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.sentenceChildren.map(el => el.json(true)), expectedInline);
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
            indentDepth: 0,
            indentTexts: [] as string[],
            mainTag: "SupplProvisionAppdxTable",
            controls: [
                {
                    control: ":suppl-provision-appdx-table:",
                    trailingSpace: "",
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedInline = [
            {
                tag: "__Text",
                attr: {},
                children: ["附則別表第二"],
            },
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
        ];
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.sentenceChildren.map(el => el.json(true)), expectedInline);
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
        const expectedText = `\
附則別表第二（第十九条、第二十一条関係）　
`;
        const expectedValue = {
            type: LineType.SPA,
            indentDepth: 0,
            indentTexts: [] as string[],
            mainTag: "SupplProvisionAppdxTable",
            controls: [] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedInline = [
            {
                tag: "__Text",
                attr: {},
                children: ["附則別表第二"],
            },
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
        ];
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.sentenceChildren.map(el => el.json(true)), expectedInline);
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
        const expectedText = `\
:suppl-provision-appdx-style:附則別記様式（第十四条関係）　
`;
        const expectedValue = {
            type: LineType.SPA,
            indentDepth: 0,
            indentTexts: [] as string[],
            mainTag: "SupplProvisionAppdxStyle",
            controls: [
                {
                    control: ":suppl-provision-appdx-style:",
                    trailingSpace: "",
                }
            ] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedInline = [
            {
                tag: "__Text",
                attr: {},
                children: ["附則別記様式"],
            },
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
        ];
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.sentenceChildren.map(el => el.json(true)), expectedInline);
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
        const expectedText = `\
附則別記様式（第十四条関係）　
`;
        const expectedValue = {
            type: LineType.SPA,
            indentDepth: 0,
            indentTexts: [] as string[],
            controls: [] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedInline = [
            {
                tag: "__Text",
                attr: {},
                children: ["附則別記様式"],
            },
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
        ];
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(result.value.value.sentenceChildren.map(el => el.json(true)), expectedInline);
        }
    });

    it("Fail case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
別表第二（第十九条、第二十一条関係）

  * - 情報照会者
    - 事務
`;
        const expectedResult = {
            ok: false,
            offset: 0,
            expected: "supplProvisionAppdxItemHeadLine",
        } as const;
        const result = $supplProvisionAppdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });

});
