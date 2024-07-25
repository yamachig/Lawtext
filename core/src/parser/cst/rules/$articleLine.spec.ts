import { assert } from "chai";
import { matchResultToJson } from "generic-parser/lib/core";
import { LineType } from "../../../node/cst/line";
import { initialEnv } from "../env";
import $articleLine from "./$articleLine";

const env = initialEnv({});

describe("Test $articleLine", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。　
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。
`;
        const expectedResult = {
            ok: true,
            nextOffset: 45,
        } as const;
        const expectedText = `\
第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。　
`;
        const expectedValue = {
            type: LineType.ART,
            indentTexts: [] as string[],
            title: "第二条",
            midSpace: "　",
            lineEndText: `　
`,
        } as const;
        const expectedColumns = [
            {
                leadingSpace: "",
                leadingSpaceRange: [4, 4] as [number, number],
                attrEntries: [],
                sentences: [
                    {
                        tag: "Sentence",
                        attr: {},
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。"],
                            },
                        ],
                    },
                ],
            },
        ];
        const result = $articleLine.abstract().match(offset, target, env);
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
第三十六条の三　何人も、法令に違反する事実がある場合において、
２　前項の申出は、次に掲げる事項を記載した申出書を提出してしなければならない。
  一　申出をする者の氏名又は名称及び住所又は居所
`;
        const expectedResult = {
            ok: true,
            nextOffset: 32,
        } as const;
        const expectedText = `\
第三十六条の三　何人も、法令に違反する事実がある場合において、
`;
        const expectedValue = {
            type: LineType.ART,
            indentTexts: [] as string[],
            title: "第三十六条の三",
            midSpace: "　",
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
                                children: ["何人も、法令に違反する事実がある場合において、"],
                            },
                        ],
                    },
                ],
            },
        ];
        const result = $articleLine.abstract().match(offset, target, env);
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
第百九十八条から第二百九条まで　削除
`;
        const expectedResult = {
            ok: true,
            nextOffset: 19,
        } as const;
        const expectedText = `\
第百九十八条から第二百九条まで　削除
`;
        const expectedValue = {
            type: LineType.ART,
            indentTexts: [] as string[],
            title: "第百九十八条から第二百九条まで",
            midSpace: "　",
            lineEndText: `
`,
        } as const;
        const expectedColumns = [
            {
                leadingSpace: "",
                leadingSpaceRange: [16, 16] as [number, number],
                attrEntries: [],
                sentences: [
                    {
                        tag: "Sentence",
                        attr: {},
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["削除"],
                            },
                        ],
                    },
                ],
            },
        ];
        const result = $articleLine.abstract().match(offset, target, env);
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
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。
`;
        const expectedResult = {
            ok: false,
            offset: 0,
            expected: "articleLine",
        } as const;
        const result = $articleLine.abstract().match(offset, target, env);
        assert.deepInclude(matchResultToJson(result), expectedResult);
    });
});
