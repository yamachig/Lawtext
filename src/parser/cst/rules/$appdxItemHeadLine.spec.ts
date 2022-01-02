import { assert } from "chai";
import { LineType } from "../../../node/line";
import { initialEnv } from "../env";
import $appdxItemHeadLine from "./$appdxItemHeadLine";

const env = initialEnv({});

describe("Test $appdxItemHeadLine", () => {

    it("Success case (:appdx:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:appdx:付録第一（第二十六条、第四十五条、第四十六条の五関係）　

  .. figure:: ./pict/001.jpg
`;
        const expectedResult = {
            ok: true,
            nextOffset: 36,
        } as const;
        const expectedValue = {
            type: LineType.APP,
            text: `\
:appdx:付録第一（第二十六条、第四十五条、第四十六条の五関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: ":appdx:付録第一（第二十六条、第四十五条、第四十六条の五関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "Appdx",
            attr: {},
            children: [
                {
                    tag: "ArithFormulaNum",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["付録第一"],
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
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case (w/o :appdx:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
付録第一（第二十六条、第四十五条、第四十六条の五関係）　

  .. figure:: ./pict/001.jpg
`;
        const expectedResult = {
            ok: true,
            nextOffset: 29,
        } as const;
        const expectedValue = {
            type: LineType.APP,
            text: `\
付録第一（第二十六条、第四十五条、第四十六条の五関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: "付録第一（第二十六条、第四十五条、第四十六条の五関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "Appdx",
            attr: {},
            children: [
                {
                    tag: "ArithFormulaNum",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["付録第一"],
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
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case (:appdx-table:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:appdx-table:別表第二（第十九条、第二十一条関係）　

  * - 情報照会者
    - 事務
`;
        const expectedResult = {
            ok: true,
            nextOffset: 33,
        } as const;
        const expectedValue = {
            type: LineType.APP,
            text: `\
:appdx-table:別表第二（第十九条、第二十一条関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: ":appdx-table:別表第二（第十九条、第二十一条関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "AppdxTable",
            attr: {},
            children: [
                {
                    tag: "AppdxTableTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["別表第二"],
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
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case (w/o :appdx-table:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
別表第二（第十九条、第二十一条関係）　

  * - 情報照会者
    - 事務
`;
        const expectedResult = {
            ok: true,
            nextOffset: 20,
        } as const;
        const expectedValue = {
            type: LineType.APP,
            text: `\
別表第二（第十九条、第二十一条関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: "別表第二（第十九条、第二十一条関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "AppdxTable",
            attr: {},
            children: [
                {
                    tag: "AppdxTableTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["別表第二"],
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
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case (:appdx-style:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:appdx-style:別記様式（第十四条関係）　

  .. figure:: ./pict/001.pdf
`;
        const expectedResult = {
            ok: true,
            nextOffset: 27,
        } as const;
        const expectedValue = {
            type: LineType.APP,
            text: `\
:appdx-style:別記様式（第十四条関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: ":appdx-style:別記様式（第十四条関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "AppdxStyle",
            attr: {},
            children: [
                {
                    tag: "AppdxStyleTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["別記様式"],
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
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case (:appdx-style:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:appdx-style:別記様式　

  .. figure:: ./pict/001.pdf
`;
        const expectedResult = {
            ok: true,
            nextOffset: 19,
        } as const;
        const expectedValue = {
            type: LineType.APP,
            text: `\
:appdx-style:別記様式　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: ":appdx-style:別記様式",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "AppdxStyle",
            attr: {},
            children: [
                {
                    tag: "AppdxStyleTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["別記様式"],
                        },
                    ],
                },
            ],
        };
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case (w/o :appdx-style:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
別記様式（第十四条関係）　

  .. figure:: ./pict/001.pdf
`;
        const expectedResult = {
            ok: true,
            nextOffset: 14,
        } as const;
        const expectedValue = {
            type: LineType.APP,
            text: `\
別記様式（第十四条関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: "別記様式（第十四条関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "AppdxStyle",
            attr: {},
            children: [
                {
                    tag: "AppdxStyleTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["別記様式"],
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
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case (:appdx-format:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:appdx-format:別紙第一号書式（第三条関係）　

  .. figure:: ./pict/001.pdf
`;
        const expectedResult = {
            ok: true,
            nextOffset: 30,
        } as const;
        const expectedValue = {
            type: LineType.APP,
            text: `\
:appdx-format:別紙第一号書式（第三条関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: ":appdx-format:別紙第一号書式（第三条関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "AppdxFormat",
            attr: {},
            children: [
                {
                    tag: "AppdxFormatTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["別紙第一号書式"],
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
                                            children: ["第三条関係"],
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
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case (w/o :appdx-format:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
別紙第一号書式（第三条関係）　

  .. figure:: ./pict/001.pdf
`;
        const expectedResult = {
            ok: true,
            nextOffset: 16,
        } as const;
        const expectedValue = {
            type: LineType.APP,
            text: `\
別紙第一号書式（第三条関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: "別紙第一号書式（第三条関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "AppdxFormat",
            attr: {},
            children: [
                {
                    tag: "AppdxFormatTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["別紙第一号書式"],
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
                                            children: ["第三条関係"],
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
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case (:appdx-fig:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:appdx-fig:　別図第十一（第１９条第１項の表の６の項関係）　

  .. figure:: ./pict/011.jpg
`;
        const expectedResult = {
            ok: true,
            nextOffset: 36,
        } as const;
        const expectedValue = {
            type: LineType.APP,
            text: `\
:appdx-fig:　別図第十一（第１９条第１項の表の６の項関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: ":appdx-fig:　別図第十一（第１９条第１項の表の６の項関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "AppdxFig",
            attr: {},
            children: [
                {
                    tag: "AppdxFigTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["別図第十一"],
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
                                            children: ["第１９条第１項の表の６の項関係"],
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
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case (w/o :appdx-fig:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
別図第十一（第１９条第１項の表の６の項関係）　

  .. figure:: ./pict/011.jpg
`;
        const expectedResult = {
            ok: true,
            nextOffset: 24,
        } as const;
        const expectedValue = {
            type: LineType.APP,
            text: `\
別図第十一（第１９条第１項の表の６の項関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: "別図第十一（第１９条第１項の表の６の項関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "AppdxFig",
            attr: {},
            children: [
                {
                    tag: "AppdxFigTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["別図第十一"],
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
                                            children: ["第１９条第１項の表の６の項関係"],
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
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case (:appdx-note:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
:appdx-note:別記第二号（第一条第一項、第九条関係）　

  .. figure:: ./pict/002.pdf
`;
        const expectedResult = {
            ok: true,
            nextOffset: 33,
        } as const;
        const expectedValue = {
            type: LineType.APP,
            text: `\
:appdx-note:別記第二号（第一条第一項、第九条関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: ":appdx-note:別記第二号（第一条第一項、第九条関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "AppdxNote",
            attr: {},
            children: [
                {
                    tag: "AppdxNoteTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["別記第二号"],
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
                                            children: ["第一条第一項、第九条関係"],
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
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });

    it("Success case (w/o :appdx-note:)", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
別記第二号（第一条第一項、第九条関係）　

  .. figure:: ./pict/002.pdf
`;
        const expectedResult = {
            ok: true,
            nextOffset: 21,
        } as const;
        const expectedValue = {
            type: LineType.APP,
            text: `\
別記第二号（第一条第一項、第九条関係）　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: "別記第二号（第一条第一項、第九条関係）",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "AppdxNote",
            attr: {},
            children: [
                {
                    tag: "AppdxNoteTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["別記第二号"],
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
                                            children: ["第一条第一項、第九条関係"],
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
        const result = $appdxItemHeadLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
        }
    });
});
