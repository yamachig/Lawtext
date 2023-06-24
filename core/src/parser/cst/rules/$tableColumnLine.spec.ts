import { assert } from "chai";
import { matchResultToJson } from "generic-parser/lib/core";
import { AttrEntries } from "../../../node/cst/inline";
import { LineType } from "../../../node/cst/line";
import { initialEnv } from "../env";
import $tableColumnLine from "./$tableColumnLine";

const env = initialEnv({});

describe("Test $tableColumnLine", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
  * - [Valign="top"][rowspan="2"]前条第一項　
    - 各号
`;
        const expectedResult = {
            ok: true,
            nextOffset: 40,
        } as const;
        const expectedText = `\
  * - [Valign="top"][rowspan="2"]前条第一項　
`;
        const expectedValue = {
            type: LineType.TBL,
            indentTexts: ["  "] as string[],
            firstColumnIndicator: "*",
            midIndicatorsSpace: " ",
            columnIndicator: "-",
            midSpace: " ",
            attrEntries: [
                {
                    entryText: "[Valign=\"top\"]",
                    entry: ["Valign", "top"],
                    entryRange: [6, 20],
                    trailingSpace: "",
                    trailingSpaceRange: [20, 20],
                },
                {
                    entryText: "[rowspan=\"2\"]",
                    entry: ["rowspan", "2"],
                    entryRange: [20, 33],
                    trailingSpace: "",
                    trailingSpaceRange: [33, 33],
                },
            ] as AttrEntries,
            lineEndText: `　
`,
        } as const;
        const expectedColumns = [
            {
                leadingSpace: "",
                leadingSpaceRange: [
                    33,
                    33
                ] as [number, number],
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
                                                            relPos: "PREV",
                                                            targetType: "Article",
                                                            name: "前条"
                                                        },
                                                        children: ["前条"]
                                                    },
                                                    {
                                                        tag: "____PF",
                                                        attr: {
                                                            relPos: "NAMED",
                                                            targetType: "Paragraph",
                                                            name: "第一項"
                                                        },
                                                        children: ["第一項"]
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
          ;
        const result = $tableColumnLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value.value, expectedValue);
            assert.strictEqual(result.value.value.text(), expectedText);
            const resultColumns = result.value.value.sentencesArray.map(c => ({
                ...c,
                sentences: c.sentences.map(s => s.json(true))
            }));
            // console.log(JSON.stringify(resultColumns, null, 2));
            assert.deepStrictEqual(
                resultColumns,
                expectedColumns,
            );
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
    -   [Valign="top"]  又は他の
`;
        const expectedResult = {
            ok: true,
            nextOffset: 29,
        } as const;
        const expectedText = `\
    -   [Valign="top"]  又は他の
`;
        const expectedValue = {
            type: LineType.TBL,
            indentTexts: ["  ", "  "] as string[],
            firstColumnIndicator: "",
            midIndicatorsSpace: "",
            columnIndicator: "-",
            midSpace: "   ",
            attrEntries: [
                {
                    entryText: "[Valign=\"top\"]",
                    entry: ["Valign", "top"],
                    entryRange: [8, 22],
                    trailingSpace: "  ",
                    trailingSpaceRange: [22, 24],
                },
            ] as AttrEntries,
            lineEndText: `
`,
        } as const;
        const expectedColumns = [
            {
                leadingSpace: "",
                leadingSpaceRange: [24, 24] as [number, number],
                attrEntries: [],
                sentences: [
                    {
                        tag: "Sentence",
                        attr: {},
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["又は他の"],
                            },
                        ],
                    },
                ],
            },
        ];
        const result = $tableColumnLine.abstract().match(offset, target, env);
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
    - 又は他の
`;
        const expectedResult = {
            ok: true,
            nextOffset: 11,
        } as const;
        const expectedText = `\
    - 又は他の
`;
        const expectedValue = {
            type: LineType.TBL,
            indentTexts: ["  ", "  "] as string[],
            firstColumnIndicator: "",
            midIndicatorsSpace: "",
            columnIndicator: "-",
            midSpace: " ",
            attrEntries: [] as AttrEntries,
            lineEndText: `
`,
        } as const;
        const expectedColumns = [
            {
                leadingSpace: "",
                leadingSpaceRange: [6, 6] as [number, number],
                attrEntries: [],
                sentences: [
                    {
                        tag: "Sentence",
                        attr: {},
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["又は他の"],
                            },
                        ],
                    },
                ],
            },
        ];
        const result = $tableColumnLine.abstract().match(offset, target, env);
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
    * 又は他の
`;
        const expectedResult = {
            ok: true,
            nextOffset: 11,
        } as const;
        const expectedText = `\
    * 又は他の
`;
        const expectedValue = {
            type: LineType.TBL,
            indentTexts: ["  ", "  "] as string[],
            firstColumnIndicator: "",
            midIndicatorsSpace: "",
            columnIndicator: "*",
            midSpace: " ",
            attrEntries: [] as AttrEntries,
            lineEndText: `
`,
        } as const;
        const expectedColumns = [
            {
                leadingSpace: "",
                leadingSpaceRange: [6, 6] as [number, number],
                attrEntries: [],
                sentences: [
                    {
                        tag: "Sentence",
                        attr: {},
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["又は他の"],
                            },
                        ],
                    },
                ],
            },
        ];
        const result = $tableColumnLine.abstract().match(offset, target, env);
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
    * * 又は他の
`;
        const expectedResult = {
            ok: true,
            nextOffset: 13,
        } as const;
        const expectedText = `\
    * * 又は他の
`;
        const expectedValue = {
            type: LineType.TBL,
            indentTexts: ["  ", "  "] as string[],
            firstColumnIndicator: "*",
            midIndicatorsSpace: " ",
            columnIndicator: "*",
            midSpace: " ",
            attrEntries: [] as AttrEntries,
            lineEndText: `
`,
        } as const;
        const expectedColumns = [
            {
                leadingSpace: "",
                leadingSpaceRange: [8, 8] as [number, number],
                attrEntries: [],
                sentences: [
                    {
                        tag: "Sentence",
                        attr: {},
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["又は他の"],
                            },
                        ],
                    },
                ],
            },
        ];
        const result = $tableColumnLine.abstract().match(offset, target, env);
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
    * - 又は他の
`;
        const expectedResult = {
            ok: true,
            nextOffset: 13,
        } as const;
        const expectedText = `\
    * - 又は他の
`;
        const expectedValue = {
            type: LineType.TBL,
            indentTexts: ["  ", "  "] as string[],
            firstColumnIndicator: "*",
            midIndicatorsSpace: " ",
            columnIndicator: "-",
            midSpace: " ",
            attrEntries: [] as AttrEntries,
            lineEndText: `
`,
        } as const;
        const expectedColumns = [
            {
                leadingSpace: "",
                leadingSpaceRange: [8, 8] as [number, number],
                attrEntries: [],
                sentences: [
                    {
                        tag: "Sentence",
                        attr: {},
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["又は他の"],
                            },
                        ],
                    },
                ],
            },
        ];
        const result = $tableColumnLine.abstract().match(offset, target, env);
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

    it("Fail case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。
`;
        const expectedResult = {
            ok: false,
            offset: 0,
            expected: "tableColumnLine",
        } as const;
        const result = $tableColumnLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
    });
});
