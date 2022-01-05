import { assert } from "chai";
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
            indentDepth: 1,
            indentTexts: ["  "] as string[],
            firstColumnIndicator: "*",
            midIndicatorsSpace: " ",
            columnIndicator: "-",
            midSpace: " ",
            attrEntries: [
                {
                    text: "[Valign=\"top\"]",
                    entry: ["Valign", "top"],
                    trailingSpace: "",
                },
                {
                    text: "[rowspan=\"2\"]",
                    entry: ["rowspan", "2"],
                    trailingSpace: "",
                },
            ] as AttrEntries,
            lineEndText: `　
`,
        } as const;
        const expectedColumns = [
            {
                leadingSpace: "",
                attrEntries: [],
                sentences: [
                    {
                        tag: "Sentence",
                        attr: {},
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["前条第一項"],
                            },
                        ],
                    },
                ],
            },
        ];
        const result = $tableColumnLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.strictEqual(result.value.text(), expectedText);
            assert.deepStrictEqual(
                result.value.sentencesArray.map(c => ({
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
            indentDepth: 2,
            indentTexts: ["  ", "  "] as string[],
            firstColumnIndicator: "",
            midIndicatorsSpace: "",
            columnIndicator: "-",
            midSpace: "   ",
            attrEntries: [
                {
                    text: "[Valign=\"top\"]",
                    entry: ["Valign", "top"],
                    trailingSpace: "  ",
                },
            ] as AttrEntries,
            lineEndText: `
`,
        } as const;
        const expectedColumns = [
            {
                leadingSpace: "",
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
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.strictEqual(result.value.text(), expectedText);
            assert.deepStrictEqual(
                result.value.sentencesArray.map(c => ({
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
            indentDepth: 2,
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
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.strictEqual(result.value.text(), expectedText);
            assert.deepStrictEqual(
                result.value.sentencesArray.map(c => ({
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
        assert.deepInclude(result, expectedResult);
    });
});
