import { assert } from "chai";
import { LineType } from "../../../node/line";
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
        const expectedValue = {
            type: LineType.TBL,
            text: `\
  * - [Valign="top"][rowspan="2"]前条第一項　
`,
            indentDepth: 1,
            indentTexts: ["  "] as string[],
            contentText: "* - [Valign=\"top\"][rowspan=\"2\"]前条第一項",
            isFirstColumn: true,
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "TableColumn",
            attr: {
                Valign: "top",
                rowspan: "2",
            },
            children: [
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
        };
        const result = $tableColumnLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
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
        const expectedValue = {
            type: LineType.TBL,
            text: `\
    -   [Valign="top"]  又は他の
`,
            indentDepth: 2,
            indentTexts: ["  ", "  "] as string[],
            contentText: "-   [Valign=\"top\"]  又は他の",
            isFirstColumn: false,
            lineEndText: `
`,
        } as const;
        const expectedContent = {
            tag: "TableColumn",
            attr: {
                Valign: "top",
            },
            children: [
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
        };
        const result = $tableColumnLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
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
        const expectedValue = {
            type: LineType.TBL,
            text: `\
    - 又は他の
`,
            indentDepth: 2,
            indentTexts: ["  ", "  "] as string[],
            contentText: "- 又は他の",
            isFirstColumn: false,
            lineEndText: `
`,
        } as const;
        const expectedContent = {
            tag: "TableColumn",
            attr: {},
            children: [
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
        };
        const result = $tableColumnLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.content.json(true), expectedContent);
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
