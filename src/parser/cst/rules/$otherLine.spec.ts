import { assert } from "chai";
import { LineType } from "../../../node/cst/line";
import { initialEnv } from "../env";
import $otherLine from "./$otherLine";
import { SentencesArray, Controls } from "../../../node/cst/inline";

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
            indentDepth: 1,
            indentTexts: ["  "] as string[],
            controls: [] as Controls,
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
            indentDepth: 0,
            indentTexts: [] as string[],
            controls: [] as Controls,
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
                                children: ["この法律は、会社法の施行の日から施行する。"],
                            },
                        ],
                    },
                ],
            },
        ];
        const result = $otherLine.abstract().match(offset, target, env);
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
            indentDepth: 2,
            indentTexts: ["  ", "  "] as string[],
            controls: [
                {
                    control: ":style-struct-title:",
                    trailingSpace: "  ",
                }
            ] as Controls,
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
                                children: ["様式第一"],
                            },
                        ],
                    },
                ],
            },
        ];
        const result = $otherLine.abstract().match(offset, target, env);
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
            indentDepth: 2,
            indentTexts: ["  ", "  "] as string[],
            controls: [
                {
                    control: ":control-1:",
                    trailingSpace: "  ",
                },
                {
                    control: ":control-2:",
                    trailingSpace: "　",
                },
            ] as Controls,
            lineEndText: `
`,
        } as const;
        const expectedColumns: SentencesArray = [];
        const result = $otherLine.abstract().match(offset, target, env);
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
        const target = "";
        const expectedResult = {
            ok: false,
            offset: 0,
            expected: "otherLine",
        } as const;
        const result = $otherLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });
});
