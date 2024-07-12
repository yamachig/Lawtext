import { assert } from "chai";
import { LineType } from "../../../node/cst/line";
import { initialEnv } from "../env";
import $otherLine from "./$otherLine";
import type { SentencesArray, Controls } from "../../../node/cst/inline";
import { matchResultToJson } from "generic-parser/lib/core";
import $lines from "./$lines";

const env = initialEnv({});

describe("Test $otherLine", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
  （施行期日）　

`;
        const expectedResult = {
            ok: true,
            nextOffset: 10,
        } as const;
        const expectedText = `\
  （施行期日）　
`;
        const expectedValue = {
            type: LineType.OTH,
            indentTexts: ["  "] as string[],
            controls: [] as Controls,
            lineEndText: `　
`,
        } as const;
        const expectedColumns = [
            {
                leadingSpace: "",
                leadingSpaceRange: [2, 2] as [number, number],
                attrEntries: [],
                sentences: [
                    {
                        tag: "Sentence",
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
                                        attr: {
                                            type: "round",
                                        },
                                        children: ["（"],
                                    },
                                    {
                                        tag: "__PContent",
                                        attr: { type: "round" },
                                        children: [
                                            {
                                                tag: "__Text",
                                                attr: {},
                                                children: ["施行期日"],
                                            },
                                        ],
                                    },
                                    {
                                        tag: "__PEnd",
                                        attr: { "type": "round" },
                                        children: ["）"],
                                    },
                                ],
                            }
                        ],
                    },
                ],
            },
        ];
        const result = $otherLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(
                result.value.value.sentencesArray.map(c => ({
                    ...c,
                    sentences: c.sentences.map(s => s.json(true))
                })),
                expectedColumns,
            );
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
この法律は、会社法の施行の日から施行する。

`;
        const expectedResult = {
            ok: true,
            nextOffset: 22,
        } as const;
        const expectedText = `\
この法律は、会社法の施行の日から施行する。
`;
        const expectedValue = {
            type: LineType.OTH,
            indentTexts: [] as string[],
            controls: [] as Controls,
            lineEndText: `
`,
        } as const;
        const expectedColumns = [
            {
                leadingSpace: "",
                leadingSpaceRange: [0, 0] as [number, number],
                attrEntries: [],
                sentences: [
                    {
                        tag: "Sentence",
                        attr: {},
                        children: [
                            {
                                tag: "____PointerRanges",
                                attr: {},
                                children: [
                                    {
                                        tag: "____PointerRange",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "____Pointer",
                                                attr: {},
                                                children: [
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "HERE",
                                                            targetType: "Law",
                                                            name: "この法律"
                                                        },
                                                        children: ["この法律"]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                ],
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["は、会社法の施行の日から施行する。"],
                            },
                        ],
                    },
                ],
            },
        ];
        const result = $otherLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(
                result.value.value.sentencesArray.map(c => ({
                    ...c,
                    sentences: c.sentences.map(s => s.json(true))
                })),
                expectedColumns,
            );
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
    :style-struct-title:  様式第一

`;
        const expectedResult = {
            ok: true,
            nextOffset: 31,
        } as const;
        const expectedText = `\
    :style-struct-title:  様式第一
`;
        const expectedValue = {
            type: LineType.OTH,
            indentTexts: ["  ", "  "] as string[],
            controls: [
                {
                    control: ":style-struct-title:",
                    controlRange: [4, 24],
                    trailingSpace: "  ",
                    trailingSpaceRange: [24, 26],
                }
            ] as Controls,
            lineEndText: `
`,
        } as const;
        const expectedColumns = [
            {
                leadingSpace: "",
                leadingSpaceRange: [26, 26] as [number, number],
                attrEntries: [],
                sentences: [
                    {
                        tag: "Sentence",
                        attr: {},
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["様式第一"],
                            },
                        ],
                    },
                ],
            },
        ];
        const result = $otherLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(
                result.value.value.sentencesArray.map(c => ({
                    ...c,
                    sentences: c.sentences.map(s => s.json(true))
                })),
                expectedColumns,
            );
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
    :control-1:  :control-2:　

`;
        const expectedResult = {
            ok: true,
            nextOffset: 30,
        } as const;
        const expectedText = `\
    :control-1:  :control-2:　
`;
        const expectedValue = {
            type: LineType.OTH,
            indentTexts: ["  ", "  "] as string[],
            controls: [
                {
                    control: ":control-1:",
                    controlRange: [4, 15],
                    trailingSpace: "  ",
                    trailingSpaceRange: [15, 17],
                },
                {
                    control: ":control-2:",
                    controlRange: [17, 28],
                    trailingSpace: "　",
                    trailingSpaceRange: [28, 29],
                },
            ] as Controls,
            lineEndText: `
`,
        } as const;
        const expectedColumns: SentencesArray = [];
        const result = $otherLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(
                result.value.value.sentencesArray.map(c => ({
                    ...c,
                    sentences: c.sentences.map(s => s.json(true))
                })),
                expectedColumns,
            );
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
    :keep-leading-spaces:  様式第一

`;
        const expectedResult = {
            ok: true,
            nextOffset: 32,
        } as const;
        const expectedText = `\
    :keep-leading-spaces:  様式第一
`;
        const expectedValue = {
            type: LineType.OTH,
            indentTexts: ["  ", "  "] as string[],
            controls: [
                {
                    control: ":keep-leading-spaces:",
                    controlRange: [4, 25],
                    trailingSpace: "",
                    trailingSpaceRange: [25, 25],
                }
            ] as Controls,
            lineEndText: `
`,
        } as const;
        const expectedColumns = [
            {
                leadingSpace: "",
                leadingSpaceRange: [25, 25] as [number, number],
                attrEntries: [],
                sentences: [
                    {
                        tag: "Sentence",
                        attr: {},
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["  様式第一"],
                            },
                        ],
                    },
                ],
            },
        ];
        const result = $otherLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            assert.deepStrictEqual(
                result.value.value.sentencesArray.map(c => ({
                    ...c,
                    sentences: c.sentences.map(s => s.json(true))
                })),
                expectedColumns,
            );
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
    :ignore-title: 様式第一

`;
        const expectedResult = {
            ok: true,
            nextOffset: 25,
        } as const;
        const expectedText = `\
    :ignore-title: 様式第一
`;
        const expectedValue = {
            type: LineType.OTH,
            indentTexts: ["  ", "  "] as string[],
            controls: [
                {
                    control: ":ignore-title:",
                    controlRange: [4, 18],
                    trailingSpace: " ",
                    trailingSpaceRange: [18, 19],
                }
            ] as Controls,
            lineEndText: `
`,
        } as const;
        const expectedColumns = [
            {
                leadingSpace: "",
                leadingSpaceRange: [19, 19] as [number, number],
                attrEntries: [],
                sentences: [
                    {
                        tag: "Sentence",
                        attr: {},
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["様式第一"],
                            },
                        ],
                    },
                ],
            },
        ];
        const result = $lines.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value[0], expectedValue);
            assert.strictEqual(result.value.value[0].text(), expectedText);
            assert.deepStrictEqual(
                (result.value.value[0] as {sentencesArray: SentencesArray}).sentencesArray.map(c => ({
                    ...c,
                    sentences: c.sentences.map(s => s.json(true))
                })),
                expectedColumns,
            );
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
    :remarks:[LineBreak="true"]

`;
        const expectedResult = {
            ok: true,
            nextOffset: 33,
        } as const;
        const expectedText = `\
    :remarks:[LineBreak="true"]
`;
        const expectedValue = {
            type: LineType.OTH,
            indentTexts: ["  ", "  "] as string[],
            controls: [
                {
                    control: ":remarks:",
                    controlRange: [4, 13],
                    trailingSpace: "",
                    trailingSpaceRange: [13, 13],
                }
            ] as Controls,
            lineEndText: `
`,
        } as const;
        const expectedColumns = [
            {
                leadingSpace: "",
                leadingSpaceRange: [13, 13] as [number, number],
                attrEntries: [
                    {
                        entry: [
                            "LineBreak",
                            "true",
                        ] as [string, string],
                        entryRange: [13, 31] as [number, number],
                        entryText: "[LineBreak=\"true\"]",
                        trailingSpace: "",
                        trailingSpaceRange: [31, 31] as [number, number],
                    }
                ],
                sentences: [],
            },
        ];
        const result = $lines.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value[0], expectedValue);
            assert.strictEqual(result.value.value[0].text(), expectedText);
            assert.deepStrictEqual(
                (result.value.value[0] as {sentencesArray: SentencesArray}).sentencesArray.map(c => ({
                    ...c,
                    sentences: c.sentences.map(s => s.json(true))
                })),
                expectedColumns,
            );
        }
    });

    it("Fail case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = "";
        const expectedResult = {
            ok: false,
            offset: 0,
            expected: "otherLine",
        } as const;
        const result = $otherLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
    });
});
