import { assert } from "chai";
import { EL } from "../../../node/el";
import { LineType } from "../../../node/line";
import { initialEnv } from "../env";
import $otherLine from "./$otherLine";

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
        const expectedValue = {
            type: LineType.OTH,
            text: `\
  （施行期日）　
`,
            indentDepth: 1,
            indentTexts: ["  "] as string[],
            contentText: "（施行期日）",
            controls: [] as string[],
            lineEndText: `　
`,
        } as const;
        const expectedContent = [
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
        ];
        const result = $otherLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.map(c => c.json(true)), expectedContent);
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
        const expectedValue = {
            type: LineType.OTH,
            text: `\
この法律は、会社法の施行の日から施行する。
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: "この法律は、会社法の施行の日から施行する。",
            controls: [] as string[],
            lineEndText: `
`,
        } as const;
        const expectedContent = [
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
        ];
        const result = $otherLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.map(c => c.json(true)), expectedContent);
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
        const expectedValue = {
            type: LineType.OTH,
            text: `\
    :style-struct-title:  様式第一
`,
            indentDepth: 2,
            indentTexts: ["  ", "  "] as string[],
            contentText: ":style-struct-title:  様式第一",
            controls: [":style-struct-title:"] as string[],
            lineEndText: `
`,
        } as const;
        const expectedContent = [
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
        ];
        const result = $otherLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.map(c => c.json(true)), expectedContent);
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
        const expectedValue = {
            type: LineType.OTH,
            text: `\
    :control-1:  :control-2:　
`,
            indentDepth: 2,
            indentTexts: ["  ", "  "] as string[],
            contentText: ":control-1:  :control-2:",
            controls: [":control-1:", ":control-2:"] as string[],
            content: [] as EL[],
            lineEndText: `　
`,
        } as const;
        const result = $otherLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepStrictEqual(result.value, expectedValue);
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
