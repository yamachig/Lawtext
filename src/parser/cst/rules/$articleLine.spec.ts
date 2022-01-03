import { assert } from "chai";
import { LineType } from "../../../node/line";
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
        const expectedValue = {
            type: LineType.ART,
            text: `\
第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。　
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: "第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。",
            lineEndText: `　
`,
        } as const;
        const expectedContent = {
            tag: "Article",
            attr: {
                Num: "2",
            },
            children: [
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["第二条"],
                        },
                    ],
                },
                {
                    tag: "Paragraph",
                    attr: {
                        Num: "1",
                    },
                    children: [
                        {
                            tag: "ParagraphNum",
                            attr: {},
                            children: [],
                        },
                        {
                            tag: "ParagraphSentence",
                            attr: {},
                            children: [
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
                    ],
                },
            ],
        };
        const result = $articleLine.abstract().match(offset, target, env);
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
第三十六条の三　何人も、法令に違反する事実がある場合において、
２　前項の申出は、次に掲げる事項を記載した申出書を提出してしなければならない。
  一　申出をする者の氏名又は名称及び住所又は居所
`;
        const expectedResult = {
            ok: true,
            nextOffset: 32,
        } as const;
        const expectedValue = {
            type: LineType.ART,
            text: `\
第三十六条の三　何人も、法令に違反する事実がある場合において、
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: "第三十六条の三　何人も、法令に違反する事実がある場合において、",
            lineEndText: `
`,
        } as const;
        const expectedContent = {
            tag: "Article",
            attr: {
                Num: "36_3",
            },
            children: [
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["第三十六条の三"],
                        },
                    ],
                },
                {
                    tag: "Paragraph",
                    attr: {
                        Num: "1",
                    },
                    children: [
                        {
                            tag: "ParagraphNum",
                            attr: {},
                            children: [],
                        },
                        {
                            tag: "ParagraphSentence",
                            attr: {},
                            children: [
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
                    ],
                },
            ],
        };
        const result = $articleLine.abstract().match(offset, target, env);
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
第百九十八条から第二百九条まで　削除
`;
        const expectedResult = {
            ok: true,
            nextOffset: 19,
        } as const;
        const expectedValue = {
            type: LineType.ART,
            text: `\
第百九十八条から第二百九条まで　削除
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: "第百九十八条から第二百九条まで　削除",
            lineEndText: `
`,
        } as const;
        const expectedContent = {
            tag: "Article",
            attr: {
                Num: "198:209",
            },
            children: [
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["第百九十八条から第二百九条まで"],
                        },
                    ],
                },
                {
                    tag: "Paragraph",
                    attr: {
                        Num: "1",
                    },
                    children: [
                        {
                            tag: "ParagraphNum",
                            attr: {},
                            children: [],
                        },
                        {
                            tag: "ParagraphSentence",
                            attr: {},
                            children: [
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
                    ],
                },
            ],
        };
        const result = $articleLine.abstract().match(offset, target, env);
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
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。
`;
        const expectedResult = {
            ok: false,
            offset: 0,
            expected: "articleLine",
        } as const;
        const result = $articleLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });
});
