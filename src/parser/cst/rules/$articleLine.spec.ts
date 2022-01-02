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
        const expectedContentHead = {
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
            ],
        };
        const result = $articleLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.contentHead.json(true), expectedContentHead);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
第三十六条の三　何人も、法令に違反する事実がある場合において、その是正のためにされるべき処分又は行政指導（その根拠となる規定が法律に置かれているものに限る。）がされていないと思料するときは、当該処分をする権限を有する行政庁又は当該行政指導をする権限を有する行政機関に対し、その旨を申し出て、当該処分又は行政指導をすることを求めることができる。
２　前項の申出は、次に掲げる事項を記載した申出書を提出してしなければならない。
  一　申出をする者の氏名又は名称及び住所又は居所
`;
        const expectedResult = {
            ok: true,
            nextOffset: 172,
        } as const;
        const expectedValue = {
            type: LineType.ART,
            text: `\
第三十六条の三　何人も、法令に違反する事実がある場合において、その是正のためにされるべき処分又は行政指導（その根拠となる規定が法律に置かれているものに限る。）がされていないと思料するときは、当該処分をする権限を有する行政庁又は当該行政指導をする権限を有する行政機関に対し、その旨を申し出て、当該処分又は行政指導をすることを求めることができる。
`,
            indentDepth: 0,
            indentTexts: [] as string[],
            contentText: "第三十六条の三　何人も、法令に違反する事実がある場合において、その是正のためにされるべき処分又は行政指導（その根拠となる規定が法律に置かれているものに限る。）がされていないと思料するときは、当該処分をする権限を有する行政庁又は当該行政指導をする権限を有する行政機関に対し、その旨を申し出て、当該処分又は行政指導をすることを求めることができる。",
            lineEndText: `
`,
        } as const;
        const expectedContentHead = {
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
            ],
        };
        const result = $articleLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.contentHead.json(true), expectedContentHead);
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
        const expectedContentHead = {
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
            ],
        };
        const result = $articleLine.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
        if (result.ok) {
            assert.deepInclude(result.value, expectedValue);
            assert.deepStrictEqual(result.value.contentHead.json(true), expectedContentHead);
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
