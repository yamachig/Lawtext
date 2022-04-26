import { assert } from "chai";
import * as std from "../../law/std";
import { JsonEL } from "../../node/el/jsonEL";
import loadEL from "../../node/el/loadEL";
import addSentenceChildrenControls from "../../parser/addSentenceChildrenControls";
import detectTokens from "../detectTokens";
import getSentenceEnvs from "../getSentenceEnvs";
import detectDeclarations from ".";
import { parse } from "../../parser/lawtext";

describe("Test detectDeclarations", () => {

    it("Success case: nameInline", () => {
        /* eslint-disable no-irregular-whitespace */
        const inputElToBeModified = loadEL({
            tag: "Subitem1",
            attr: {},
            children: [
                {
                    tag: "Subitem1Title",
                    attr: {},
                    children: ["イ"],
                },
                {
                    tag: "Subitem1Sentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["法律に基づく命令（処分の要件を定める告示を含む。次条第二項において単に「命令」という。）又は規則"],
                        },
                    ],
                },
            ],
        }) as std.Subitem1;
        addSentenceChildrenControls(inputElToBeModified);
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        detectTokens(sentenceEnvsStruct);

        const expected: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_36_38",
                    type: "Keyword",
                    name: "命令",
                    scope: "[]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":36},\"end\":{\"sentenceIndex\":0,\"textOffset\":38}}",
                },
                children: ["命令"],
            },
        ];
        const expectedErrorMessages: string[] = ["No scope found"];
        const expectedModifiedInput = {
            tag: "Subitem1",
            attr: {},
            children: [
                {
                    tag: "Subitem1Title",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["イ"],
                        },
                    ],
                },
                {
                    tag: "Subitem1Sentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: [
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["法律に基づく命令"],
                                },
                                {
                                    tag: "__Parentheses",
                                    attr: {
                                        type: "round",
                                        depth: "1",
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
                                            attr: {
                                                type: "round",
                                            },
                                            children: [
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["処分の要件を定める告示を含む。"],
                                                },
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
                                                                                relPos: "NEXT",
                                                                                targetType: "Article",
                                                                                name: "次条",
                                                                            },
                                                                            children: ["次条"],
                                                                        },
                                                                        {
                                                                            tag: "____PF",
                                                                            attr: {
                                                                                relPos: "NAMED",
                                                                                targetType: "Paragraph",
                                                                                name: "第二項",
                                                                                num: "2",
                                                                            },
                                                                            children: ["第二項"],
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["において単に"],
                                                },
                                                {
                                                    tag: "__Parentheses",
                                                    attr: {
                                                        type: "square",
                                                        depth: "2",
                                                    },
                                                    children: [
                                                        {
                                                            tag: "__PStart",
                                                            attr: {
                                                                type: "square",
                                                            },
                                                            children: ["「"],
                                                        },
                                                        {
                                                            tag: "__PContent",
                                                            attr: {
                                                                type: "square",
                                                            },
                                                            children: [
                                                                {
                                                                    tag: "____Declaration",
                                                                    attr: {
                                                                        declarationID: "decl-sentence_0-text_36_38",
                                                                        type: "Keyword",
                                                                        name: "命令",
                                                                        scope: "[]",
                                                                        nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":36},\"end\":{\"sentenceIndex\":0,\"textOffset\":38}}",
                                                                    },
                                                                    children: ["命令"],
                                                                },
                                                            ],
                                                        },
                                                        {
                                                            tag: "__PEnd",
                                                            attr: {
                                                                type: "square",
                                                            },
                                                            children: ["」"],
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["という。"],
                                                },
                                            ],
                                        },
                                        {
                                            tag: "__PEnd",
                                            attr: {
                                                type: "round",
                                            },
                                            children: ["）"],
                                        },
                                    ],
                                },
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["又は規則"],
                                },
                            ],
                        },
                    ],
                },
            ],
        }
        ;

        const result = detectDeclarations(sentenceEnvsStruct);

        // console.log(JSON.stringify(result.value.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        // console.log(JSON.stringify(inputElToBeModified.json(true), null, 2));
        assert.deepStrictEqual(
            inputElToBeModified.json(true),
            expectedModifiedInput,
        );
    });

    it("Success case: lawRef", () => {
        /* eslint-disable no-irregular-whitespace */
        const inputElToBeModified = loadEL({
            tag: "Subitem1",
            attr: {},
            children: [
                {
                    tag: "Subitem1Title",
                    attr: {},
                    children: ["イ"],
                },
                {
                    tag: "Subitem1Sentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["この法律は、独立行政法人通則法の一部を改正する法律（平成二十六年法律第六十六号。以下「通則法改正法」という。）の施行の日から施行する。"],
                        },
                    ],
                },
            ],
        }) as std.Subitem1;
        addSentenceChildrenControls(inputElToBeModified);
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        detectTokens(sentenceEnvsStruct);

        const expected: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_43_49",
                    type: "LawName",
                    name: "通則法改正法",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":39},\"end\":{\"sentenceIndex\":null,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":43},\"end\":{\"sentenceIndex\":0,\"textOffset\":49}}",
                    value: "平成二十六年法律第六十六号",
                },
                children: ["通則法改正法"],
            },
        ] ;
        const expectedErrorMessages: string[] = [];
        const expectedModifiedInput = {
            tag: "Subitem1",
            attr: {},
            children: [
                {
                    tag: "Subitem1Title",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["イ"],
                        },
                    ],
                },
                {
                    tag: "Subitem1Sentence",
                    attr: {},
                    children: [
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
                                                                name: "この法律",
                                                            },
                                                            children: ["この法律"],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["は、独立行政法人通則法の一部を改正する法律"],
                                },
                                {
                                    tag: "__Parentheses",
                                    attr: {
                                        type: "round",
                                        depth: "1",
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
                                            attr: {
                                                type: "round",
                                            },
                                            children: [
                                                {
                                                    tag: "____LawNum",
                                                    attr: {},
                                                    children: ["平成二十六年法律第六十六号"],
                                                },
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["。以下"],
                                                },
                                                {
                                                    tag: "__Parentheses",
                                                    attr: {
                                                        type: "square",
                                                        depth: "2",
                                                    },
                                                    children: [
                                                        {
                                                            tag: "__PStart",
                                                            attr: {
                                                                type: "square",
                                                            },
                                                            children: ["「"],
                                                        },
                                                        {
                                                            tag: "__PContent",
                                                            attr: {
                                                                type: "square",
                                                            },
                                                            children: [
                                                                {
                                                                    tag: "____Declaration",
                                                                    attr: {
                                                                        declarationID: "decl-sentence_0-text_43_49",
                                                                        type: "LawName",
                                                                        name: "通則法改正法",
                                                                        scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":39},\"end\":{\"sentenceIndex\":null,\"textOffset\":0}}]",
                                                                        nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":43},\"end\":{\"sentenceIndex\":0,\"textOffset\":49}}",
                                                                        value: "平成二十六年法律第六十六号",
                                                                    },
                                                                    children: ["通則法改正法"],
                                                                },
                                                            ],
                                                        },
                                                        {
                                                            tag: "__PEnd",
                                                            attr: {
                                                                type: "square",
                                                            },
                                                            children: ["」"],
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["という。"],
                                                },
                                            ],
                                        },
                                        {
                                            tag: "__PEnd",
                                            attr: {
                                                type: "round",
                                            },
                                            children: ["）"],
                                        },
                                    ],
                                },
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["の施行の日から施行する。"],
                                },
                            ],
                        },
                    ],
                },
            ],
        } ;

        const result = detectDeclarations(sentenceEnvsStruct);

        // console.log(JSON.stringify(result.value.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        // console.log(JSON.stringify(inputElToBeModified.json(true), null, 2));
        assert.deepStrictEqual(
            inputElToBeModified.json(true),
            expectedModifiedInput,
        );
    });

    it("Success case: lawRef", () => {
        /* eslint-disable no-irregular-whitespace */
        const inputElToBeModified = loadEL({
            tag: "Subitem1",
            attr: {},
            children: [
                {
                    tag: "Subitem1Title",
                    attr: {},
                    children: ["イ"],
                },
                {
                    tag: "Subitem1Sentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["国の機関相互間の関係について定める命令等並びに地方自治法（昭和二十二年法律第六十七号）第二編第十一章に規定する国と普通地方公共団体との関係及び普通地方公共団体相互間の関係その他の国と地方公共団体との関係及び地方公共団体相互間の関係について定める命令等（第一項の規定によりこの法律の規定を適用しないこととされる処分に係る命令等を含む。）"],
                        },
                    ],
                },
            ],
        }) as std.Subitem1;
        addSentenceChildrenControls(inputElToBeModified);
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        detectTokens(sentenceEnvsStruct);

        const expected: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_23_28",
                    type: "LawName",
                    name: "地方自治法",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":42},\"end\":{\"sentenceIndex\":null,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":23},\"end\":{\"sentenceIndex\":0,\"textOffset\":28}}",
                    value: "昭和二十二年法律第六十七号",
                },
                children: ["地方自治法"],
            },
        ] ;
        const expectedErrorMessages: string[] = [];
        const expectedModifiedInput = {
            tag: "Subitem1",
            attr: {},
            children: [
                {
                    tag: "Subitem1Title",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["イ"],
                        },
                    ],
                },
                {
                    tag: "Subitem1Sentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: [
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["国の機関相互間の関係について定める命令等並びに"],
                                },
                                {
                                    tag: "____Declaration",
                                    attr: {
                                        declarationID: "decl-sentence_0-text_23_28",
                                        type: "LawName",
                                        name: "地方自治法",
                                        scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":42},\"end\":{\"sentenceIndex\":null,\"textOffset\":0}}]",
                                        nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":23},\"end\":{\"sentenceIndex\":0,\"textOffset\":28}}",
                                        value: "昭和二十二年法律第六十七号",
                                    },
                                    children: ["地方自治法"],
                                },
                                {
                                    tag: "__Parentheses",
                                    attr: {
                                        type: "round",
                                        depth: "1",
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
                                            attr: {
                                                type: "round",
                                            },
                                            children: [
                                                {
                                                    tag: "____LawNum",
                                                    attr: {},
                                                    children: ["昭和二十二年法律第六十七号"],
                                                },
                                            ],
                                        },
                                        {
                                            tag: "__PEnd",
                                            attr: {
                                                type: "round",
                                            },
                                            children: ["）"],
                                        },
                                    ],
                                },
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
                                                                relPos: "NAMED",
                                                                targetType: "Part",
                                                                name: "第二編",
                                                                num: "2",
                                                            },
                                                            children: ["第二編"],
                                                        },
                                                        {
                                                            tag: "____PF",
                                                            attr: {
                                                                relPos: "NAMED",
                                                                targetType: "Chapter",
                                                                name: "第十一章",
                                                                num: "11",
                                                            },
                                                            children: ["第十一章"],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["に規定する国と普通地方公共団体との関係及び普通地方公共団体相互間の関係その他の国と地方公共団体との関係及び地方公共団体相互間の関係について定める命令等"],
                                },
                                {
                                    tag: "__Parentheses",
                                    attr: {
                                        type: "round",
                                        depth: "1",
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
                                            attr: {
                                                type: "round",
                                            },
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
                                                                                relPos: "NAMED",
                                                                                targetType: "Paragraph",
                                                                                name: "第一項",
                                                                                num: "1",
                                                                            },
                                                                            children: ["第一項"],
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["の規定によりこの法律の規定を適用しないこととされる処分に係る命令等を含む。"],
                                                },
                                            ],
                                        },
                                        {
                                            tag: "__PEnd",
                                            attr: {
                                                type: "round",
                                            },
                                            children: ["）"],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        } ;

        const result = detectDeclarations(sentenceEnvsStruct);

        // console.log(JSON.stringify(result.value.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        // console.log(JSON.stringify(inputElToBeModified.json(true), null, 2));
        assert.deepStrictEqual(
            inputElToBeModified.json(true),
            expectedModifiedInput,
        );
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （定義）
第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。
  二　処分　行政庁の処分その他公権力の行使に当たる行為をいう。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const detectTokensResult = detectTokens(sentenceEnvsStruct);
        void detectTokensResult;

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_1-text_0_2",
                    type: "Keyword",
                    name: "法令",
                    scope: "[{\"start\":{\"sentenceIndex\":1,\"textOffset\":0},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}},{\"start\":{\"sentenceIndex\":3,\"textOffset\":0},\"end\":{\"sentenceIndex\":5,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":0},\"end\":{\"sentenceIndex\":1,\"textOffset\":2}}",
                    value: "法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。",
                },
                children: ["法令"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_3-text_0_2",
                    type: "Keyword",
                    name: "処分",
                    scope: "[{\"start\":{\"sentenceIndex\":1,\"textOffset\":0},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}},{\"start\":{\"sentenceIndex\":3,\"textOffset\":0},\"end\":{\"sentenceIndex\":5,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":3,\"textOffset\":0},\"end\":{\"sentenceIndex\":3,\"textOffset\":2}}",
                    value: "行政庁の処分その他公権力の行使に当たる行為をいう。",
                },
                children: ["処分"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_2-text_48_50",
                    type: "Keyword",
                    name: "規則",
                    scope: "[{\"start\":{\"sentenceIndex\":2,\"textOffset\":51},\"end\":{\"sentenceIndex\":6,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":2,\"textOffset\":48},\"end\":{\"sentenceIndex\":2,\"textOffset\":50}}",
                },
                children: ["規則"],
            },
        ];

        const expectedModifiedInput = {
            tag: "Law",
            attr: {
                Lang: "ja",
            },
            children: [
                {
                    tag: "LawBody",
                    attr: {},
                    children: [
                        {
                            tag: "MainProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "Article",
                                    attr: {
                                        Delete: "false",
                                        Hide: "false",
                                    },
                                    children: [
                                        {
                                            tag: "ArticleCaption",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "__Parentheses",
                                                    attr: {
                                                        type: "round",
                                                        depth: "1",
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
                                                            attr: {
                                                                type: "round",
                                                            },
                                                            children: [
                                                                {
                                                                    tag: "__Text",
                                                                    attr: {},
                                                                    children: ["定義"],
                                                                },
                                                            ],
                                                        },
                                                        {
                                                            tag: "__PEnd",
                                                            attr: {
                                                                type: "round",
                                                            },
                                                            children: ["）"],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                        {
                                            tag: "ArticleTitle",
                                            attr: {},
                                            children: ["第二条"],
                                        },
                                        {
                                            tag: "Paragraph",
                                            attr: {
                                                OldStyle: "false",
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
                                                                                                name: "この法律",
                                                                                            },
                                                                                            children: ["この法律"],
                                                                                        },
                                                                                    ],
                                                                                },
                                                                            ],
                                                                        },
                                                                    ],
                                                                },
                                                                {
                                                                    tag: "__Text",
                                                                    attr: {},
                                                                    children: ["において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。"],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: "Item",
                                                    attr: {
                                                        Delete: "false",
                                                    },
                                                    children: [
                                                        {
                                                            tag: "ItemTitle",
                                                            attr: {},
                                                            children: ["一"],
                                                        },
                                                        {
                                                            tag: "ItemSentence",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Column",
                                                                    attr: {},
                                                                    children: [
                                                                        {
                                                                            tag: "Sentence",
                                                                            attr: {},
                                                                            children: [
                                                                                {
                                                                                    tag: "____Declaration",
                                                                                    attr: {
                                                                                        declarationID: "decl-sentence_1-text_0_2",
                                                                                        type: "Keyword",
                                                                                        name: "法令",
                                                                                        scope: "[{\"start\":{\"sentenceIndex\":1,\"textOffset\":0},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}},{\"start\":{\"sentenceIndex\":3,\"textOffset\":0},\"end\":{\"sentenceIndex\":5,\"textOffset\":0}}]",
                                                                                        nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":0},\"end\":{\"sentenceIndex\":1,\"textOffset\":2}}",
                                                                                        value: "法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。",
                                                                                    },
                                                                                    children: ["法令"],
                                                                                },
                                                                            ],
                                                                        },
                                                                    ],
                                                                },
                                                                {
                                                                    tag: "Column",
                                                                    attr: {},
                                                                    children: [
                                                                        {
                                                                            tag: "Sentence",
                                                                            attr: {},
                                                                            children: [
                                                                                {
                                                                                    tag: "__Text",
                                                                                    attr: {},
                                                                                    children: ["法律、法律に基づく命令"],
                                                                                },
                                                                                {
                                                                                    tag: "__Parentheses",
                                                                                    attr: {
                                                                                        type: "round",
                                                                                        depth: "1",
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
                                                                                            attr: {
                                                                                                type: "round",
                                                                                            },
                                                                                            children: [
                                                                                                {
                                                                                                    tag: "__Text",
                                                                                                    attr: {},
                                                                                                    children: ["告示を含む。"],
                                                                                                },
                                                                                            ],
                                                                                        },
                                                                                        {
                                                                                            tag: "__PEnd",
                                                                                            attr: {
                                                                                                type: "round",
                                                                                            },
                                                                                            children: ["）"],
                                                                                        },
                                                                                    ],
                                                                                },
                                                                                {
                                                                                    tag: "__Text",
                                                                                    attr: {},
                                                                                    children: ["、条例及び地方公共団体の執行機関の規則"],
                                                                                },
                                                                                {
                                                                                    tag: "__Parentheses",
                                                                                    attr: {
                                                                                        type: "round",
                                                                                        depth: "1",
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
                                                                                            attr: {
                                                                                                type: "round",
                                                                                            },
                                                                                            children: [
                                                                                                {
                                                                                                    tag: "__Text",
                                                                                                    attr: {},
                                                                                                    children: ["規程を含む。以下"],
                                                                                                },
                                                                                                {
                                                                                                    tag: "__Parentheses",
                                                                                                    attr: {
                                                                                                        type: "square",
                                                                                                        depth: "2",
                                                                                                    },
                                                                                                    children: [
                                                                                                        {
                                                                                                            tag: "__PStart",
                                                                                                            attr: {
                                                                                                                type: "square",
                                                                                                            },
                                                                                                            children: ["「"],
                                                                                                        },
                                                                                                        {
                                                                                                            tag: "__PContent",
                                                                                                            attr: {
                                                                                                                type: "square",
                                                                                                            },
                                                                                                            children: [
                                                                                                                {
                                                                                                                    tag: "____Declaration",
                                                                                                                    attr: {
                                                                                                                        declarationID: "decl-sentence_2-text_48_50",
                                                                                                                        type: "Keyword",
                                                                                                                        name: "規則",
                                                                                                                        scope: "[{\"start\":{\"sentenceIndex\":2,\"textOffset\":51},\"end\":{\"sentenceIndex\":6,\"textOffset\":0}}]",
                                                                                                                        nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":2,\"textOffset\":48},\"end\":{\"sentenceIndex\":2,\"textOffset\":50}}",
                                                                                                                    },
                                                                                                                    children: ["規則"],
                                                                                                                },
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            tag: "__PEnd",
                                                                                                            attr: {
                                                                                                                type: "square",
                                                                                                            },
                                                                                                            children: ["」"],
                                                                                                        },
                                                                                                    ],
                                                                                                },
                                                                                                {
                                                                                                    tag: "__Text",
                                                                                                    attr: {},
                                                                                                    children: ["という。"],
                                                                                                },
                                                                                            ],
                                                                                        },
                                                                                        {
                                                                                            tag: "__PEnd",
                                                                                            attr: {
                                                                                                type: "round",
                                                                                            },
                                                                                            children: ["）"],
                                                                                        },
                                                                                    ],
                                                                                },
                                                                                {
                                                                                    tag: "__Text",
                                                                                    attr: {},
                                                                                    children: ["をいう。"],
                                                                                },
                                                                            ],
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: "Item",
                                                    attr: {
                                                        Delete: "false",
                                                    },
                                                    children: [
                                                        {
                                                            tag: "ItemTitle",
                                                            attr: {},
                                                            children: ["二"],
                                                        },
                                                        {
                                                            tag: "ItemSentence",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Column",
                                                                    attr: {},
                                                                    children: [
                                                                        {
                                                                            tag: "Sentence",
                                                                            attr: {},
                                                                            children: [
                                                                                {
                                                                                    tag: "____Declaration",
                                                                                    attr: {
                                                                                        declarationID: "decl-sentence_3-text_0_2",
                                                                                        type: "Keyword",
                                                                                        name: "処分",
                                                                                        scope: "[{\"start\":{\"sentenceIndex\":1,\"textOffset\":0},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}},{\"start\":{\"sentenceIndex\":3,\"textOffset\":0},\"end\":{\"sentenceIndex\":5,\"textOffset\":0}}]",
                                                                                        nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":3,\"textOffset\":0},\"end\":{\"sentenceIndex\":3,\"textOffset\":2}}",
                                                                                        value: "行政庁の処分その他公権力の行使に当たる行為をいう。",
                                                                                    },
                                                                                    children: ["処分"],
                                                                                },
                                                                            ],
                                                                        },
                                                                    ],
                                                                },
                                                                {
                                                                    tag: "Column",
                                                                    attr: {},
                                                                    children: [
                                                                        {
                                                                            tag: "Sentence",
                                                                            attr: {},
                                                                            children: [
                                                                                {
                                                                                    tag: "__Text",
                                                                                    attr: {},
                                                                                    children: ["行政庁の処分その他公権力の行使に当たる行為をいう。"],
                                                                                },
                                                                            ],
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const expectedErrorMessages: string[] = [];

        const declarationsResult = detectDeclarations(sentenceEnvsStruct);

        // console.log(JSON.stringify(declarationsResult.value.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsResult.value.map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify(inputElToBeModified.json(true), null, 2));
        assert.deepStrictEqual(
            inputElToBeModified.json(true),
            expectedModifiedInput,
        );

        assert.deepStrictEqual(declarationsResult.errors.map(e => e.message), expectedErrorMessages);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （定義）
第一条　この省令において使用する用語は、臨床研究法（平成二十九年法律第十六号。以下「法」という。）において使用する用語の例によるほか、次の定義に従うものとする。
  一　「実施医療機関」とは、臨床研究が実施される医療機関をいう。
  二　「多施設共同研究」とは、一の臨床研究の計画書（以下「研究計画書」という。）に基づき複数の実施医療機関において実施される臨床研究をいう。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const detectTokensResult = detectTokens(sentenceEnvsStruct);
        void detectTokensResult;

        const expectedDeclarations: JsonEL[] = [
            {
                "tag": "____Declaration",
                "attr": {
                    "declarationID": "decl-sentence_1-text_1_7",
                    "type": "Keyword",
                    "name": "実施医療機関",
                    "scope": "[{\"start\":{\"sentenceIndex\":1,\"textOffset\":0},\"end\":{\"sentenceIndex\":2,\"textOffset\":0}},{\"start\":{\"sentenceIndex\":2,\"textOffset\":0},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
                    "nameSentenceTextRange": "{\"start\":{\"sentenceIndex\":1,\"textOffset\":1},\"end\":{\"sentenceIndex\":1,\"textOffset\":7}}",
                    "value": "臨床研究が実施される医療機関",
                },
                "children": ["実施医療機関"],
            },
            {
                "tag": "____Declaration",
                "attr": {
                    "declarationID": "decl-sentence_2-text_1_8",
                    "type": "Keyword",
                    "name": "多施設共同研究",
                    "scope": "[{\"start\":{\"sentenceIndex\":1,\"textOffset\":0},\"end\":{\"sentenceIndex\":2,\"textOffset\":0}},{\"start\":{\"sentenceIndex\":2,\"textOffset\":0},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
                    "nameSentenceTextRange": "{\"start\":{\"sentenceIndex\":2,\"textOffset\":1},\"end\":{\"sentenceIndex\":2,\"textOffset\":8}}",
                    "value": "一の臨床研究の計画書（以下「研究計画書」という。）に基づき複数の実施医療機関において実施される臨床研究",
                },
                "children": ["多施設共同研究"],
            },
            {
                "tag": "____Declaration",
                "attr": {
                    "declarationID": "decl-sentence_0-text_38_39",
                    "type": "LawName",
                    "name": "法",
                    "scope": "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":34},\"end\":{\"sentenceIndex\":4,\"textOffset\":0}}]",
                    "nameSentenceTextRange": "{\"start\":{\"sentenceIndex\":0,\"textOffset\":38},\"end\":{\"sentenceIndex\":0,\"textOffset\":39}}",
                    "value": "平成二十九年法律第十六号",
                },
                "children": ["法"],
            },
            {
                "tag": "____Declaration",
                "attr": {
                    "declarationID": "decl-sentence_2-text_26_31",
                    "type": "Keyword",
                    "name": "研究計画書",
                    "scope": "[{\"start\":{\"sentenceIndex\":2,\"textOffset\":32},\"end\":{\"sentenceIndex\":4,\"textOffset\":0}}]",
                    "nameSentenceTextRange": "{\"start\":{\"sentenceIndex\":2,\"textOffset\":26},\"end\":{\"sentenceIndex\":2,\"textOffset\":31}}",
                },
                "children": ["研究計画書"],
            },
        ]
          ;

        const expectedModifiedInput = {
            tag: "Law",
            attr: {
                Lang: "ja",
            },
            children: [
                {
                    tag: "LawBody",
                    attr: {},
                    children: [
                        {
                            tag: "MainProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "Article",
                                    attr: {
                                        Delete: "false",
                                        Hide: "false",
                                    },
                                    children: [
                                        {
                                            tag: "ArticleCaption",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "__Parentheses",
                                                    attr: {
                                                        type: "round",
                                                        depth: "1",
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
                                                            attr: {
                                                                type: "round",
                                                            },
                                                            children: [
                                                                {
                                                                    tag: "__Text",
                                                                    attr: {},
                                                                    children: ["定義"],
                                                                },
                                                            ],
                                                        },
                                                        {
                                                            tag: "__PEnd",
                                                            attr: {
                                                                type: "round",
                                                            },
                                                            children: ["）"],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                        {
                                            tag: "ArticleTitle",
                                            attr: {},
                                            children: ["第一条"],
                                        },
                                        {
                                            tag: "Paragraph",
                                            attr: {
                                                OldStyle: "false",
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
                                                                                                name: "この省令",
                                                                                            },
                                                                                            children: ["この省令"],
                                                                                        },
                                                                                    ],
                                                                                },
                                                                            ],
                                                                        },
                                                                    ],
                                                                },
                                                                {
                                                                    tag: "__Text",
                                                                    attr: {},
                                                                    children: ["において使用する用語は、臨床研究法"],
                                                                },
                                                                {
                                                                    tag: "__Parentheses",
                                                                    attr: {
                                                                        type: "round",
                                                                        depth: "1",
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
                                                                            attr: {
                                                                                type: "round",
                                                                            },
                                                                            children: [
                                                                                {
                                                                                    tag: "____LawNum",
                                                                                    attr: {},
                                                                                    children: ["平成二十九年法律第十六号"],
                                                                                },
                                                                                {
                                                                                    tag: "__Text",
                                                                                    attr: {},
                                                                                    children: ["。以下"],
                                                                                },
                                                                                {
                                                                                    tag: "__Parentheses",
                                                                                    attr: {
                                                                                        type: "square",
                                                                                        depth: "2",
                                                                                    },
                                                                                    children: [
                                                                                        {
                                                                                            tag: "__PStart",
                                                                                            attr: {
                                                                                                type: "square",
                                                                                            },
                                                                                            children: ["「"],
                                                                                        },
                                                                                        {
                                                                                            tag: "__PContent",
                                                                                            attr: {
                                                                                                type: "square",
                                                                                            },
                                                                                            children: [
                                                                                                {
                                                                                                    tag: "____Declaration",
                                                                                                    attr: {
                                                                                                        declarationID: "decl-sentence_0-text_38_39",
                                                                                                        type: "LawName",
                                                                                                        name: "法",
                                                                                                        scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":34},\"end\":{\"sentenceIndex\":4,\"textOffset\":0}}]",
                                                                                                        nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":38},\"end\":{\"sentenceIndex\":0,\"textOffset\":39}}",
                                                                                                        value: "平成二十九年法律第十六号",
                                                                                                    },
                                                                                                    children: ["法"],
                                                                                                },
                                                                                            ],
                                                                                        },
                                                                                        {
                                                                                            tag: "__PEnd",
                                                                                            attr: {
                                                                                                type: "square",
                                                                                            },
                                                                                            children: ["」"],
                                                                                        },
                                                                                    ],
                                                                                },
                                                                                {
                                                                                    tag: "__Text",
                                                                                    attr: {},
                                                                                    children: ["という。"],
                                                                                },
                                                                            ],
                                                                        },
                                                                        {
                                                                            tag: "__PEnd",
                                                                            attr: {
                                                                                type: "round",
                                                                            },
                                                                            children: ["）"],
                                                                        },
                                                                    ],
                                                                },
                                                                {
                                                                    tag: "__Text",
                                                                    attr: {},
                                                                    children: ["において使用する用語の例によるほか、次の定義に従うものとする。"],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: "Item",
                                                    attr: {
                                                        Delete: "false",
                                                    },
                                                    children: [
                                                        {
                                                            tag: "ItemTitle",
                                                            attr: {},
                                                            children: ["一"],
                                                        },
                                                        {
                                                            tag: "ItemSentence",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: [
                                                                        {
                                                                            tag: "__Parentheses",
                                                                            attr: {
                                                                                type: "square",
                                                                                depth: "1",
                                                                            },
                                                                            children: [
                                                                                {
                                                                                    tag: "__PStart",
                                                                                    attr: {
                                                                                        type: "square",
                                                                                    },
                                                                                    children: ["「"],
                                                                                },
                                                                                {
                                                                                    tag: "__PContent",
                                                                                    attr: {
                                                                                        type: "square",
                                                                                    },
                                                                                    children: [
                                                                                        {
                                                                                            tag: "____Declaration",
                                                                                            attr: {
                                                                                                declarationID: "decl-sentence_1-text_1_7",
                                                                                                type: "Keyword",
                                                                                                name: "実施医療機関",
                                                                                                scope: "[{\"start\":{\"sentenceIndex\":1,\"textOffset\":0},\"end\":{\"sentenceIndex\":2,\"textOffset\":0}},{\"start\":{\"sentenceIndex\":2,\"textOffset\":0},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
                                                                                                nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":1},\"end\":{\"sentenceIndex\":1,\"textOffset\":7}}",
                                                                                                value: "臨床研究が実施される医療機関",
                                                                                            },
                                                                                            children: ["実施医療機関"],
                                                                                        },
                                                                                    ],
                                                                                },
                                                                                {
                                                                                    tag: "__PEnd",
                                                                                    attr: {
                                                                                        type: "square",
                                                                                    },
                                                                                    children: ["」"],
                                                                                },
                                                                            ],
                                                                        },
                                                                        {
                                                                            tag: "__Text",
                                                                            attr: {},
                                                                            children: ["とは、臨床研究が実施される医療機関をいう。"],
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: "Item",
                                                    attr: {
                                                        Delete: "false",
                                                    },
                                                    children: [
                                                        {
                                                            tag: "ItemTitle",
                                                            attr: {},
                                                            children: ["二"],
                                                        },
                                                        {
                                                            tag: "ItemSentence",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: [
                                                                        {
                                                                            tag: "__Parentheses",
                                                                            attr: {
                                                                                type: "square",
                                                                                depth: "1",
                                                                            },
                                                                            children: [
                                                                                {
                                                                                    tag: "__PStart",
                                                                                    attr: {
                                                                                        type: "square",
                                                                                    },
                                                                                    children: ["「"],
                                                                                },
                                                                                {
                                                                                    tag: "__PContent",
                                                                                    attr: {
                                                                                        type: "square",
                                                                                    },
                                                                                    children: [
                                                                                        {
                                                                                            tag: "____Declaration",
                                                                                            attr: {
                                                                                                declarationID: "decl-sentence_2-text_1_8",
                                                                                                type: "Keyword",
                                                                                                name: "多施設共同研究",
                                                                                                scope: "[{\"start\":{\"sentenceIndex\":1,\"textOffset\":0},\"end\":{\"sentenceIndex\":2,\"textOffset\":0}},{\"start\":{\"sentenceIndex\":2,\"textOffset\":0},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
                                                                                                nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":2,\"textOffset\":1},\"end\":{\"sentenceIndex\":2,\"textOffset\":8}}",
                                                                                                value: "一の臨床研究の計画書（以下「研究計画書」という。）に基づき複数の実施医療機関において実施される臨床研究",
                                                                                            },
                                                                                            children: ["多施設共同研究"],
                                                                                        },
                                                                                    ],
                                                                                },
                                                                                {
                                                                                    tag: "__PEnd",
                                                                                    attr: {
                                                                                        type: "square",
                                                                                    },
                                                                                    children: ["」"],
                                                                                },
                                                                            ],
                                                                        },
                                                                        {
                                                                            tag: "__Text",
                                                                            attr: {},
                                                                            children: ["とは、一の臨床研究の計画書"],
                                                                        },
                                                                        {
                                                                            tag: "__Parentheses",
                                                                            attr: {
                                                                                type: "round",
                                                                                depth: "1",
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
                                                                                    attr: {
                                                                                        type: "round",
                                                                                    },
                                                                                    children: [
                                                                                        {
                                                                                            tag: "__Text",
                                                                                            attr: {},
                                                                                            children: ["以下"],
                                                                                        },
                                                                                        {
                                                                                            tag: "__Parentheses",
                                                                                            attr: {
                                                                                                type: "square",
                                                                                                depth: "2",
                                                                                            },
                                                                                            children: [
                                                                                                {
                                                                                                    tag: "__PStart",
                                                                                                    attr: {
                                                                                                        type: "square",
                                                                                                    },
                                                                                                    children: ["「"],
                                                                                                },
                                                                                                {
                                                                                                    tag: "__PContent",
                                                                                                    attr: {
                                                                                                        type: "square",
                                                                                                    },
                                                                                                    children: [
                                                                                                        {
                                                                                                            tag: "____Declaration",
                                                                                                            attr: {
                                                                                                                declarationID: "decl-sentence_2-text_26_31",
                                                                                                                type: "Keyword",
                                                                                                                name: "研究計画書",
                                                                                                                scope: "[{\"start\":{\"sentenceIndex\":2,\"textOffset\":32},\"end\":{\"sentenceIndex\":4,\"textOffset\":0}}]",
                                                                                                                nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":2,\"textOffset\":26},\"end\":{\"sentenceIndex\":2,\"textOffset\":31}}",
                                                                                                            },
                                                                                                            children: ["研究計画書"],
                                                                                                        },
                                                                                                    ],
                                                                                                },
                                                                                                {
                                                                                                    tag: "__PEnd",
                                                                                                    attr: {
                                                                                                        type: "square",
                                                                                                    },
                                                                                                    children: ["」"],
                                                                                                },
                                                                                            ],
                                                                                        },
                                                                                        {
                                                                                            tag: "__Text",
                                                                                            attr: {},
                                                                                            children: ["という。"],
                                                                                        },
                                                                                    ],
                                                                                },
                                                                                {
                                                                                    tag: "__PEnd",
                                                                                    attr: {
                                                                                        type: "round",
                                                                                    },
                                                                                    children: ["）"],
                                                                                },
                                                                            ],
                                                                        },
                                                                        {
                                                                            tag: "__Text",
                                                                            attr: {},
                                                                            children: ["に基づき複数の実施医療機関において実施される臨床研究をいう。"],
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const expectedErrorMessages: string[] = [];

        const declarationsResult = detectDeclarations(sentenceEnvsStruct);

        // console.log(JSON.stringify(declarationsResult.value.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsResult.value.map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify(inputElToBeModified.json(true), null, 2));
        assert.deepStrictEqual(
            inputElToBeModified.json(true),
            expectedModifiedInput,
        );

        assert.deepStrictEqual(declarationsResult.errors.map(e => e.message), expectedErrorMessages);
    });
});
