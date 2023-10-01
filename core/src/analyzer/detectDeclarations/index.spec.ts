import { assert } from "chai";
import * as std from "../../law/std";
import { JsonEL } from "../../node/el/jsonEL";
import loadEL from "../../node/el/loadEL";
import addSentenceChildrenControls from "../../parser/addSentenceChildrenControls";
import getSentenceEnvs from "../getSentenceEnvs";
import detectDeclarations from ".";
import { parse } from "../../parser/lawtext";
import { assertELVaridity } from "../../parser/std/testHelper";
import getPointerEnvs from "../pointerEnvs/getPointerEnvs";

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
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;

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

        const result = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct);

        // console.log(JSON.stringify(result.value.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.declarations.values().map(r => r.json(true)),
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
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        const expected: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_43_49",
                    type: "LawName",
                    name: "通則法改正法",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":50},\"end\":{\"sentenceIndex\":1,\"textOffset\":0}}]",
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
                                    tag: "____LawRef",
                                    attr: {
                                        includingDeclarationID: "decl-sentence_0-text_43_49",
                                    },
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
                                                                                scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":50},\"end\":{\"sentenceIndex\":1,\"textOffset\":0}}]",
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
        };

        const result = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct);

        // console.log(JSON.stringify(result.value.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.declarations.values().map(r => r.json(true)),
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
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

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
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["地方自治法"],
                    },
                ],
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
                                    tag: "____LawRef",
                                    attr: {
                                        includingDeclarationID: "decl-sentence_0-text_23_28",
                                    },
                                    children: [
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
                                            children: [
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["地方自治法"],
                                                },
                                            ],
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
                                                    children: ["の規定により"],
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
                                                    children: ["の規定を適用しないこととされる処分に係る命令等を含む。"],
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
        };


        const result = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct);

        // console.log(JSON.stringify(result.value.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.declarations.values().map(r => r.json(true)),
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
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_1-text_0_2",
                    type: "Keyword",
                    name: "法令",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":5,\"textOffset\":0}}]",
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
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":5,\"textOffset\":0}}]",
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
                    scope: "[{\"start\":{\"sentenceIndex\":2,\"textOffset\":51},\"end\":{\"sentenceIndex\":5,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":2,\"textOffset\":48},\"end\":{\"sentenceIndex\":2,\"textOffset\":50}}",
                },
                children: ["規則"],
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
                                        Num: "2",
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
                                                                    tag: "____PointerRanges",
                                                                    attr: {
                                                                        targetContainerIDRanges: "[{\"from\":\"container-Law\"}]",
                                                                    },
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
                                                        Num: "1",
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
                                                                                        scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":5,\"textOffset\":0}}]",
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
                                                                                                                        scope: "[{\"start\":{\"sentenceIndex\":2,\"textOffset\":51},\"end\":{\"sentenceIndex\":5,\"textOffset\":0}}]",
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
                                                        Num: "2",
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
                                                                                        scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":5,\"textOffset\":0}}]",
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

        const declarationsResult = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct);

        // console.log(JSON.stringify(declarationsResult.value.declarations.values().map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsResult.value.declarations.values().map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify(inputElToBeModified.json(true), null, 2));
        assert.deepStrictEqual(
            inputElToBeModified.json(true),
            expectedModifiedInput,
        );

        assert.deepStrictEqual(declarationsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
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
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_2-text_1_8",
                    type: "Keyword",
                    name: "多施設共同研究",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":2,\"textOffset\":1},\"end\":{\"sentenceIndex\":2,\"textOffset\":8}}",
                    value: "一の臨床研究の計画書（以下「研究計画書」という。）に基づき複数の実施医療機関において実施される臨床研究",
                },
                children: ["多施設共同研究"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_1-text_1_7",
                    type: "Keyword",
                    name: "実施医療機関",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":1},\"end\":{\"sentenceIndex\":1,\"textOffset\":7}}",
                    value: "臨床研究が実施される医療機関",
                },
                children: ["実施医療機関"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_2-text_26_31",
                    type: "Keyword",
                    name: "研究計画書",
                    scope: "[{\"start\":{\"sentenceIndex\":2,\"textOffset\":32},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":2,\"textOffset\":26},\"end\":{\"sentenceIndex\":2,\"textOffset\":31}}",
                },
                children: ["研究計画書"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_38_39",
                    type: "LawName",
                    name: "法",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":40},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":38},\"end\":{\"sentenceIndex\":0,\"textOffset\":39}}",
                    value: "平成二十九年法律第十六号",
                },
                children: ["法"],
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
                                        Num: "1",
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
                                                                    tag: "____PointerRanges",
                                                                    attr: {
                                                                        targetContainerIDRanges: "[{\"from\":\"container-Law\"}]",
                                                                    },
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
                                                                    tag: "____LawRef",
                                                                    attr: {
                                                                        includingDeclarationID: "decl-sentence_0-text_38_39",
                                                                    },
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
                                                                                                                scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":40},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
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
                                                        Num: "1",
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
                                                                                                scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
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
                                                        Num: "2",
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
                                                                                                scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
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
                                                                                                                scope: "[{\"start\":{\"sentenceIndex\":2,\"textOffset\":32},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
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

        const declarationsResult = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct);

        // console.log(JSON.stringify(declarationsResult.value.declarations.values().map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsResult.value.declarations.values().map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify(inputElToBeModified.json(true), null, 2));
        assert.deepStrictEqual(
            inputElToBeModified.json(true),
            expectedModifiedInput,
        );

        assert.deepStrictEqual(declarationsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （定義）
第二条　この法律及びこの法律に基づく命令の規定の解釈に関しては、次の定義に従うものとする。
  一　「電波」とは、三百万メガヘルツ以下の周波数の電磁波をいう。
  五　「無線局」とは、無線設備及び無線設備の操作を行う者の総体をいう。但し、受信のみを目的とするものを含まない。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_2-text_1_4",
                    type: "Keyword",
                    name: "無線局",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":4,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":2,\"textOffset\":1},\"end\":{\"sentenceIndex\":2,\"textOffset\":4}}",
                    value: "無線設備及び無線設備の操作を行う者の総体",
                },
                children: ["無線局"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_1-text_1_3",
                    type: "Keyword",
                    name: "電波",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":4,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":1},\"end\":{\"sentenceIndex\":1,\"textOffset\":3}}",
                    value: "三百万メガヘルツ以下の周波数の電磁波",
                },
                children: ["電波"],
            },
        ] ;

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
                                        Num: "2",
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
                                                                    tag: "____PointerRanges",
                                                                    attr: {
                                                                        targetContainerIDRanges: "[{\"from\":\"container-Law\"}]",
                                                                    },
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
                                                                        {
                                                                            tag: "__Text",
                                                                            attr: {},
                                                                            children: ["及び"],
                                                                        },
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
                                                                                        {
                                                                                            tag: "____PF",
                                                                                            attr: {
                                                                                                relPos: "NAMED",
                                                                                                targetType: "INFERIOR",
                                                                                                name: "に基づく命令",
                                                                                            },
                                                                                            children: ["に基づく命令"],
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
                                                                    children: ["の規定の解釈に関しては、次の定義に従うものとする。"],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: "Item",
                                                    attr: {
                                                        Num: "1",
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
                                                                                                declarationID: "decl-sentence_1-text_1_3",
                                                                                                type: "Keyword",
                                                                                                name: "電波",
                                                                                                scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":4,\"textOffset\":0}}]",
                                                                                                nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":1},\"end\":{\"sentenceIndex\":1,\"textOffset\":3}}",
                                                                                                value: "三百万メガヘルツ以下の周波数の電磁波",
                                                                                            },
                                                                                            children: ["電波"],
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
                                                                            children: ["とは、三百万メガヘルツ以下の周波数の電磁波をいう。"],
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
                                                        Num: "5",
                                                    },
                                                    children: [
                                                        {
                                                            tag: "ItemTitle",
                                                            attr: {},
                                                            children: ["五"],
                                                        },
                                                        {
                                                            tag: "ItemSentence",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {
                                                                        Num: "1",
                                                                        Function: "main",
                                                                    },
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
                                                                                                declarationID: "decl-sentence_2-text_1_4",
                                                                                                type: "Keyword",
                                                                                                name: "無線局",
                                                                                                scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":4,\"textOffset\":0}}]",
                                                                                                nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":2,\"textOffset\":1},\"end\":{\"sentenceIndex\":2,\"textOffset\":4}}",
                                                                                                value: "無線設備及び無線設備の操作を行う者の総体",
                                                                                            },
                                                                                            children: ["無線局"],
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
                                                                            children: ["とは、無線設備及び無線設備の操作を行う者の総体をいう。"],
                                                                        },
                                                                    ],
                                                                },
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {
                                                                        Num: "2",
                                                                        Function: "proviso",
                                                                    },
                                                                    children: [
                                                                        {
                                                                            tag: "__Text",
                                                                            attr: {},
                                                                            children: ["但し、受信のみを目的とするものを含まない。"],
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

        const declarationsResult = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct);

        // console.log(JSON.stringify(declarationsResult.value.declarations.values().map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsResult.value.declarations.values().map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify(inputElToBeModified.json(true), null, 2));
        assert.deepStrictEqual(
            inputElToBeModified.json(true),
            expectedModifiedInput,
        );

        assert.deepStrictEqual(declarationsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （定義）
第二条　法律の規定に基づき内閣に置かれる機関若しくは内閣の所轄の下に置かれる機関、宮内庁、内閣府設置法（平成十一年法律第八十九号）第四十九条第一項若しくは第二項に規定する機関、国家行政組織法（昭和二十三年法律第百二十号）第三条第二項に規定する機関、会計検査院若しくはこれらに置かれる機関又はこれらの機関の職員であって法律上独立に権限を行使することを認められた職員。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_84_91",
                    type: "LawName",
                    name: "国家行政組織法",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":105},\"end\":{\"sentenceIndex\":2,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":84},\"end\":{\"sentenceIndex\":0,\"textOffset\":91}}",
                    value: "昭和二十三年法律第百二十号",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["国家行政組織法"],
                    },
                ],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_41_47",
                    type: "LawName",
                    name: "内閣府設置法",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":60},\"end\":{\"sentenceIndex\":2,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":41},\"end\":{\"sentenceIndex\":0,\"textOffset\":47}}",
                    value: "平成十一年法律第八十九号",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["内閣府設置法"],
                    },
                ],
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
                                        Num: "2",
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
                                                                    children: ["法律の規定に基づき内閣に置かれる機関若しくは内閣の所轄の下に置かれる機関、宮内庁、"],
                                                                },
                                                                {
                                                                    tag: "____LawRef",
                                                                    attr: {
                                                                        includingDeclarationID: "decl-sentence_0-text_41_47",
                                                                    },
                                                                    children: [
                                                                        {
                                                                            tag: "____Declaration",
                                                                            attr: {
                                                                                declarationID: "decl-sentence_0-text_41_47",
                                                                                type: "LawName",
                                                                                name: "内閣府設置法",
                                                                                scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":60},\"end\":{\"sentenceIndex\":2,\"textOffset\":0}}]",
                                                                                nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":41},\"end\":{\"sentenceIndex\":0,\"textOffset\":47}}",
                                                                                value: "平成十一年法律第八十九号",
                                                                            },
                                                                            children: [
                                                                                {
                                                                                    tag: "__Text",
                                                                                    attr: {},
                                                                                    children: ["内閣府設置法"],
                                                                                },
                                                                            ],
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
                                                                                            children: ["平成十一年法律第八十九号"],
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
                                                                                                targetType: "Article",
                                                                                                name: "第四十九条",
                                                                                                num: "49",
                                                                                            },
                                                                                            children: ["第四十九条"],
                                                                                        },
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
                                                                        {
                                                                            tag: "__Text",
                                                                            attr: {},
                                                                            children: ["若しくは"],
                                                                        },
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
                                                                    children: ["に規定する機関、"],
                                                                },
                                                                {
                                                                    tag: "____LawRef",
                                                                    attr: {
                                                                        includingDeclarationID: "decl-sentence_0-text_84_91",
                                                                    },
                                                                    children: [
                                                                        {
                                                                            tag: "____Declaration",
                                                                            attr: {
                                                                                declarationID: "decl-sentence_0-text_84_91",
                                                                                type: "LawName",
                                                                                name: "国家行政組織法",
                                                                                scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":105},\"end\":{\"sentenceIndex\":2,\"textOffset\":0}}]",
                                                                                nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":84},\"end\":{\"sentenceIndex\":0,\"textOffset\":91}}",
                                                                                value: "昭和二十三年法律第百二十号",
                                                                            },
                                                                            children: [
                                                                                {
                                                                                    tag: "__Text",
                                                                                    attr: {},
                                                                                    children: ["国家行政組織法"],
                                                                                },
                                                                            ],
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
                                                                                            children: ["昭和二十三年法律第百二十号"],
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
                                                                                                targetType: "Article",
                                                                                                name: "第三条",
                                                                                                num: "3",
                                                                                            },
                                                                                            children: ["第三条"],
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
                                                                    children: ["に規定する機関、会計検査院若しくはこれらに置かれる機関又はこれらの機関の職員であって法律上独立に権限を行使することを認められた職員。"],
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

        const declarationsResult = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct);

        // console.log(JSON.stringify(declarationsResult.value.declarations.values().map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsResult.value.declarations.values().map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify(inputElToBeModified.json(true), null, 2));
        assert.deepStrictEqual(
            inputElToBeModified.json(true),
            expectedModifiedInput,
        );

        assert.deepStrictEqual(declarationsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
行政手続法
（平成五年法律第八十八号）

  （目的等）
第一条　この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。
２　（略）

  （地方公共団体の措置）
第四十六条　地方公共団体は、第三条第三項において第二章から前章までの規定を適用しないこととされた処分、行政指導及び届出並びに命令等を定める行為に関する手続について、この法律の規定の趣旨にのっとり、行政運営における公正の確保と透明性の向上を図るため必要な措置を講ずるよう努めなければならない。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_70_73",
                    type: "Keyword",
                    name: "透明性",
                    scope: "[{\"start\":{\"sentenceIndex\":2,\"textOffset\":0},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":70},\"end\":{\"sentenceIndex\":0,\"textOffset\":73}}",
                },
                children: ["透明性"],
            },
        ];

        const expectedModifiedInput = {
            tag: "Law",
            attr: {
                Lang: "ja",
                Era: "Heisei",
                Year: "5",
                LawType: "Act",
                Num: "88",
            },
            children: [
                {
                    tag: "LawNum",
                    attr: {},
                    children: ["平成五年法律第八十八号"],
                },
                {
                    tag: "LawBody",
                    attr: {},
                    children: [
                        {
                            tag: "LawTitle",
                            attr: {},
                            children: [
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["行政手続法"],
                                },
                            ],
                        },
                        {
                            tag: "MainProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "Article",
                                    attr: {
                                        Num: "1",
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
                                                                    children: ["目的等"],
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
                                                                    children: ["は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と"],
                                                                },
                                                                {
                                                                    tag: "____Declaration",
                                                                    attr: {
                                                                        declarationID: "decl-sentence_0-text_70_73",
                                                                        type: "Keyword",
                                                                        name: "透明性",
                                                                        scope: "[{\"start\":{\"sentenceIndex\":2,\"textOffset\":0},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
                                                                        nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":70},\"end\":{\"sentenceIndex\":0,\"textOffset\":73}}",
                                                                    },
                                                                    children: ["透明性"],
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
                                                                                    children: ["行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。"],
                                                                                },
                                                                                {
                                                                                    tag: "____PointerRanges",
                                                                                    attr: {
                                                                                        targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[2][num=46]\"}]",
                                                                                    },
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
                                                                                                                targetType: "Article",
                                                                                                                name: "第四十六条",
                                                                                                                num: "46",
                                                                                                            },
                                                                                                            children: ["第四十六条"],
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
                                                                                    children: ["において同じ。"],
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
                                                                    children: ["の向上を図り、もって国民の権利利益の保護に資することを目的とする。"],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                        {
                                            tag: "Paragraph",
                                            attr: {
                                                Num: "2",
                                            },
                                            children: [
                                                {
                                                    tag: "ParagraphNum",
                                                    attr: {},
                                                    children: ["２"],
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
                                                                                    children: ["略"],
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
                                        },
                                    ],
                                },
                                {
                                    tag: "Article",
                                    attr: {
                                        Num: "46",
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
                                                                    children: ["地方公共団体の措置"],
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
                                            children: ["第四十六条"],
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
                                                                    children: ["地方公共団体は、"],
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
                                                                                                targetType: "Article",
                                                                                                name: "第三条",
                                                                                                num: "3",
                                                                                            },
                                                                                            children: ["第三条"],
                                                                                        },
                                                                                        {
                                                                                            tag: "____PF",
                                                                                            attr: {
                                                                                                relPos: "NAMED",
                                                                                                targetType: "Paragraph",
                                                                                                name: "第三項",
                                                                                                num: "3",
                                                                                            },
                                                                                            children: ["第三項"],
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
                                                                    children: ["において"],
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
                                                                                                targetType: "Chapter",
                                                                                                name: "第二章",
                                                                                                num: "2",
                                                                                            },
                                                                                            children: ["第二章"],
                                                                                        },
                                                                                    ],
                                                                                },
                                                                                {
                                                                                    tag: "__Text",
                                                                                    attr: {},
                                                                                    children: ["から"],
                                                                                },
                                                                                {
                                                                                    tag: "____Pointer",
                                                                                    attr: {},
                                                                                    children: [
                                                                                        {
                                                                                            tag: "____PF",
                                                                                            attr: {
                                                                                                relPos: "PREV",
                                                                                                targetType: "Chapter",
                                                                                                name: "前章",
                                                                                            },
                                                                                            children: ["前章"],
                                                                                        },
                                                                                    ],
                                                                                },
                                                                                {
                                                                                    tag: "__Text",
                                                                                    attr: {},
                                                                                    children: ["まで"],
                                                                                },
                                                                            ],
                                                                        },
                                                                    ],
                                                                },
                                                                {
                                                                    tag: "__Text",
                                                                    attr: {},
                                                                    children: ["の規定を適用しないこととされた処分、行政指導及び届出並びに命令等を定める行為に関する手続について、"],
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
                                                                    children: ["の規定の趣旨にのっとり、行政運営における公正の確保と透明性の向上を図るため必要な措置を講ずるよう努めなければならない。"],
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

        const declarationsResult = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct);

        // console.log(JSON.stringify(declarationsResult.value.declarations.values().map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsResult.value.declarations.values().map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify(inputElToBeModified.json(true), null, 2));
        assert.deepStrictEqual(
            inputElToBeModified.json(true),
            expectedModifiedInput,
        );

        assert.deepStrictEqual(declarationsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
電波法
（昭和二十五年法律第百三十一号）

      第一章　総則

第二条　この法律及びこの法律に基づく命令の規定の解釈に関しては、次の定義に従うものとする。
  五　「無線局」とは、無線設備及び無線設備の操作を行う者の総体をいう。但し、受信のみを目的とするものを含まない。

第四条の二　（略）
２　次章に定める技術基準に相当する技術基準として総務大臣が指定する技術基準に適合している無線設備を使用して実験等無線局（科学若しくは技術の発達のための実験、電波の利用の効率性に関する試験又は電波の利用の需要に関する調査に専用する無線局をいう。以下同じ。）（前条第三号の総務省令で定める無線局のうち、用途、周波数その他の条件を勘案して総務省令で定めるものであるものに限る。）を開設しようとする者は、総務省令で定めるところにより、次に掲げる事項を総務大臣に届け出ることができる。ただし、この項の規定による届出（第二号及び第三号に掲げる事項を同じくするものに限る。）をしたことがある者については、この限りでない。
  一～六　（略）
３～７　（略）

      附　則　抄

１　第四条の二第二項の規定による届出をした者は、当該届出に係る実験等無線局を廃止したときは、遅滞なく、その旨を総務大臣に届け出なければならない。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_4-text_51_57",
                    type: "Keyword",
                    name: "実験等無線局",
                    scope: "[{\"start\":{\"sentenceIndex\":4,\"textOffset\":57},\"end\":{\"sentenceIndex\":9,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":4,\"textOffset\":51},\"end\":{\"sentenceIndex\":4,\"textOffset\":57}}",
                },
                children: ["実験等無線局"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_1-text_1_4",
                    type: "Keyword",
                    name: "無線局",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":9,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":1},\"end\":{\"sentenceIndex\":1,\"textOffset\":4}}",
                    value: "無線設備及び無線設備の操作を行う者の総体",
                },
                children: ["無線局"],
            },
        ];


        const expectedModifiedInput = {
            tag: "Law",
            attr: {
                Lang: "ja",
                Era: "Showa",
                Year: "25",
                LawType: "Act",
                Num: "131",
            },
            children: [
                {
                    tag: "LawNum",
                    attr: {},
                    children: ["昭和二十五年法律第百三十一号"],
                },
                {
                    tag: "LawBody",
                    attr: {},
                    children: [
                        {
                            tag: "LawTitle",
                            attr: {},
                            children: [
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["電波法"],
                                },
                            ],
                        },
                        {
                            tag: "MainProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "Chapter",
                                    attr: {
                                        Num: "1",
                                    },
                                    children: [
                                        {
                                            tag: "ChapterTitle",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["第一章　総則"],
                                                },
                                            ],
                                        },
                                        {
                                            tag: "Article",
                                            attr: {
                                                Num: "2",
                                            },
                                            children: [
                                                {
                                                    tag: "ArticleTitle",
                                                    attr: {},
                                                    children: ["第二条"],
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
                                                                            tag: "____PointerRanges",
                                                                            attr: {
                                                                                targetContainerIDRanges: "[{\"from\":\"container-Law\"}]",
                                                                            },
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
                                                                                {
                                                                                    tag: "__Text",
                                                                                    attr: {},
                                                                                    children: ["及び"],
                                                                                },
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
                                                                                                {
                                                                                                    tag: "____PF",
                                                                                                    attr: {
                                                                                                        relPos: "NAMED",
                                                                                                        targetType: "INFERIOR",
                                                                                                        name: "に基づく命令",
                                                                                                    },
                                                                                                    children: ["に基づく命令"],
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
                                                                            children: ["の規定の解釈に関しては、次の定義に従うものとする。"],
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                        {
                                                            tag: "Item",
                                                            attr: {
                                                                Num: "5",
                                                            },
                                                            children: [
                                                                {
                                                                    tag: "ItemTitle",
                                                                    attr: {},
                                                                    children: ["五"],
                                                                },
                                                                {
                                                                    tag: "ItemSentence",
                                                                    attr: {},
                                                                    children: [
                                                                        {
                                                                            tag: "Sentence",
                                                                            attr: {
                                                                                Num: "1",
                                                                                Function: "main",
                                                                            },
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
                                                                                                        declarationID: "decl-sentence_1-text_1_4",
                                                                                                        type: "Keyword",
                                                                                                        name: "無線局",
                                                                                                        scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":9,\"textOffset\":0}}]",
                                                                                                        nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":1},\"end\":{\"sentenceIndex\":1,\"textOffset\":4}}",
                                                                                                        value: "無線設備及び無線設備の操作を行う者の総体",
                                                                                                    },
                                                                                                    children: ["無線局"],
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
                                                                                    children: ["とは、無線設備及び無線設備の操作を行う者の総体をいう。"],
                                                                                },
                                                                            ],
                                                                        },
                                                                        {
                                                                            tag: "Sentence",
                                                                            attr: {
                                                                                Num: "2",
                                                                                Function: "proviso",
                                                                            },
                                                                            children: [
                                                                                {
                                                                                    tag: "__Text",
                                                                                    attr: {},
                                                                                    children: ["但し、受信のみを目的とするものを含まない。"],
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
                                        {
                                            tag: "Article",
                                            attr: {
                                                Num: "4_2",
                                            },
                                            children: [
                                                {
                                                    tag: "ArticleTitle",
                                                    attr: {},
                                                    children: ["第四条の二"],
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
                                                                                            children: ["略"],
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
                                                },
                                                {
                                                    tag: "Paragraph",
                                                    attr: {
                                                        Num: "2",
                                                    },
                                                    children: [
                                                        {
                                                            tag: "ParagraphNum",
                                                            attr: {},
                                                            children: ["２"],
                                                        },
                                                        {
                                                            tag: "ParagraphSentence",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {
                                                                        Num: "1",
                                                                        Function: "main",
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
                                                                                                        relPos: "NEXT",
                                                                                                        targetType: "Chapter",
                                                                                                        name: "次章",
                                                                                                    },
                                                                                                    children: ["次章"],
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
                                                                            children: ["に定める技術基準に相当する技術基準として総務大臣が指定する技術基準に適合している無線設備を使用して"],
                                                                        },
                                                                        {
                                                                            tag: "____Declaration",
                                                                            attr: {
                                                                                declarationID: "decl-sentence_4-text_51_57",
                                                                                type: "Keyword",
                                                                                name: "実験等無線局",
                                                                                scope: "[{\"start\":{\"sentenceIndex\":4,\"textOffset\":57},\"end\":{\"sentenceIndex\":9,\"textOffset\":0}}]",
                                                                                nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":4,\"textOffset\":51},\"end\":{\"sentenceIndex\":4,\"textOffset\":57}}",
                                                                            },
                                                                            children: ["実験等無線局"],
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
                                                                                            children: ["科学若しくは技術の発達のための実験、電波の利用の効率性に関する試験又は電波の利用の需要に関する調査に専用する無線局をいう。以下同じ。"],
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
                                                                                                                        relPos: "PREV",
                                                                                                                        targetType: "Article",
                                                                                                                        name: "前条",
                                                                                                                    },
                                                                                                                    children: ["前条"],
                                                                                                                },
                                                                                                                {
                                                                                                                    tag: "____PF",
                                                                                                                    attr: {
                                                                                                                        relPos: "NAMED",
                                                                                                                        targetType: "Item",
                                                                                                                        name: "第三号",
                                                                                                                        num: "3",
                                                                                                                    },
                                                                                                                    children: ["第三号"],
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
                                                                                            children: ["の総務省令で定める無線局のうち、用途、周波数その他の条件を勘案して総務省令で定めるものであるものに限る。"],
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
                                                                            children: ["を開設しようとする者は、総務省令で定めるところにより、次に掲げる事項を総務大臣に届け出ることができる。"],
                                                                        },
                                                                    ],
                                                                },
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {
                                                                        Num: "2",
                                                                        Function: "proviso",
                                                                    },
                                                                    children: [
                                                                        {
                                                                            tag: "__Text",
                                                                            attr: {},
                                                                            children: ["ただし、"],
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
                                                                                                        relPos: "HERE",
                                                                                                        targetType: "Paragraph",
                                                                                                        name: "この項",
                                                                                                    },
                                                                                                    children: ["この項"],
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
                                                                            children: ["の規定による届出"],
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
                                                                                                                        targetType: "Item",
                                                                                                                        name: "第二号",
                                                                                                                        num: "2",
                                                                                                                    },
                                                                                                                    children: ["第二号"],
                                                                                                                },
                                                                                                            ],
                                                                                                        },
                                                                                                    ],
                                                                                                },
                                                                                                {
                                                                                                    tag: "__Text",
                                                                                                    attr: {},
                                                                                                    children: ["及び"],
                                                                                                },
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
                                                                                                                        targetType: "Item",
                                                                                                                        name: "第三号",
                                                                                                                        num: "3",
                                                                                                                    },
                                                                                                                    children: ["第三号"],
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
                                                                                            children: ["に掲げる事項を同じくするものに限る。"],
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
                                                                            children: ["をしたことがある者については、この限りでない。"],
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                        {
                                                            tag: "Item",
                                                            attr: {
                                                                Num: "1:6",
                                                            },
                                                            children: [
                                                                {
                                                                    tag: "ItemTitle",
                                                                    attr: {},
                                                                    children: ["一～六"],
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
                                                                                                    children: ["略"],
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
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: "Paragraph",
                                                    attr: {
                                                        Num: "3:7",
                                                    },
                                                    children: [
                                                        {
                                                            tag: "ParagraphNum",
                                                            attr: {},
                                                            children: ["３～７"],
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
                                                                                            children: ["略"],
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
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            tag: "SupplProvision",
                            attr: {
                                Extract: "true",
                            },
                            children: [
                                {
                                    tag: "SupplProvisionLabel",
                                    attr: {},
                                    children: ["附　則"],
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
                                            children: ["１"],
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
                                                                                        relPos: "NAMED",
                                                                                        targetType: "Article",
                                                                                        name: "第四条の二",
                                                                                        num: "4_2",
                                                                                    },
                                                                                    children: ["第四条の二"],
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
                                                            children: ["の規定による届出をした者は、当該届出に係る実験等無線局を廃止したときは、遅滞なく、その旨を総務大臣に届け出なければならない。"],
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

        const declarationsResult = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct);

        // console.log(JSON.stringify(declarationsResult.value.declarations.values().map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsResult.value.declarations.values().map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify(inputElToBeModified.json(true), null, 2));
        assert.deepStrictEqual(
            inputElToBeModified.json(true),
            expectedModifiedInput,
        );

        assert.deepStrictEqual(declarationsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
第三十九条　命令等制定機関は、命令等を定めようとする場合には、当該命令等の案（命令等で定めようとする内容を示すものをいう。以下同じ。）及びこれに関連する資料をあらかじめ公示し、（略）
２　前項の規定により公示する命令等の案は、具体的かつ明確な内容のものであって、かつ、当該命令等の題名及び当該命令等を定める根拠となる法令の条項が明示されたものでなければならない。
３・４　（略）

第四十条　命令等制定機関は、命令等を定めようとする場合において、三十日以上の意見提出期間を定めることができないやむを得ない理由があるときは、前条第三項の規定にかかわらず、三十日を下回る意見提出期間を定めることができる。この場合においては、当該命令等の案の公示の際その理由を明らかにしなければならない。
２　命令等制定機関は、委員会等の議を経て命令等を定めようとする場合（前条第四項第四号に該当する場合を除く。）において、当該委員会等が意見公募手続に準じた手続を実施したときは、同条第一項の規定にかかわらず、自ら意見公募手続を実施することを要しない。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_27_32",
                    type: "Keyword",
                    name: "命令等の案",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":32},\"end\":{\"sentenceIndex\":6,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":27},\"end\":{\"sentenceIndex\":0,\"textOffset\":32}}",
                },
                children: ["命令等の案"],
            },
        ];


        const expectedErrorMessages: string[] = [];

        const declarationsResult = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct);

        // console.log(JSON.stringify(declarationsResult.value.declarations.values().map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsResult.value.declarations.values().map(r => r.json(true)),
            expectedDeclarations,
        );

        assert.deepStrictEqual(declarationsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
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
                            children: ["特に、裁判員の参加する刑事裁判に関する法律（平成１６年法律第６３号）第２条第１項に規定する事件に該当する事件の捜査を行う場合は、国民の中から選任された裁判員に分かりやすい立証が可能となるよう、配慮しなければならない。"],
                        },
                    ],
                },
            ],
        }) as std.Subitem1;
        addSentenceChildrenControls(inputElToBeModified);
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        const expected: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_3_21",
                    type: "LawName",
                    name: "裁判員の参加する刑事裁判に関する法律",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":33},\"end\":{\"sentenceIndex\":null,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":3},\"end\":{\"sentenceIndex\":0,\"textOffset\":21}}",
                    value: "平成１６年法律第６３号",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["裁判員の参加する刑事裁判に関する法律"],
                    },
                ],
            },
        ];
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
                                    children: ["特に、"],
                                },
                                {
                                    tag: "____LawRef",
                                    attr: {
                                        includingDeclarationID: "decl-sentence_0-text_3_21",
                                    },
                                    children: [
                                        {
                                            tag: "____Declaration",
                                            attr: {
                                                declarationID: "decl-sentence_0-text_3_21",
                                                type: "LawName",
                                                name: "裁判員の参加する刑事裁判に関する法律",
                                                scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":33},\"end\":{\"sentenceIndex\":null,\"textOffset\":0}}]",
                                                nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":3},\"end\":{\"sentenceIndex\":0,\"textOffset\":21}}",
                                                value: "平成１６年法律第６３号",
                                            },
                                            children: [
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["裁判員の参加する刑事裁判に関する法律"],
                                                },
                                            ],
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
                                                            children: ["平成１６年法律第６３号"],
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
                                                                targetType: "Article",
                                                                name: "第２条",
                                                                num: "2",
                                                            },
                                                            children: ["第２条"],
                                                        },
                                                        {
                                                            tag: "____PF",
                                                            attr: {
                                                                relPos: "NAMED",
                                                                targetType: "Paragraph",
                                                                name: "第１項",
                                                                num: "1",
                                                            },
                                                            children: ["第１項"],
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
                                    children: ["に規定する事件に該当する事件の捜査を行う場合は、国民の中から選任された裁判員に分かりやすい立証が可能となるよう、配慮しなければならない。"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const result = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct);

        // console.log(JSON.stringify(result.value.declarations.values().map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.declarations.values().map(r => r.json(true)),
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
                            children: ["この法律において官民データ活用推進基本法（平成二十八年法律第百三号）に規定する人工知能関連技術。"],
                        },
                    ],
                },
            ],
        }) as std.Subitem1;
        addSentenceChildrenControls(inputElToBeModified);
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        const expected: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_8_20",
                    type: "LawName",
                    name: "官民データ活用推進基本法",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":33},\"end\":{\"sentenceIndex\":null,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":8},\"end\":{\"sentenceIndex\":0,\"textOffset\":20}}",
                    value: "平成二十八年法律第百三号",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["官民データ活用推進基本法"],
                    },
                ],
            },
        ];
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
                                    children: ["において"],
                                },
                                {
                                    tag: "____LawRef",
                                    attr: {
                                        includingDeclarationID: "decl-sentence_0-text_8_20",
                                    },
                                    children: [
                                        {
                                            tag: "____Declaration",
                                            attr: {
                                                declarationID: "decl-sentence_0-text_8_20",
                                                type: "LawName",
                                                name: "官民データ活用推進基本法",
                                                scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":33},\"end\":{\"sentenceIndex\":null,\"textOffset\":0}}]",
                                                nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":8},\"end\":{\"sentenceIndex\":0,\"textOffset\":20}}",
                                                value: "平成二十八年法律第百三号",
                                            },
                                            children: [
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["官民データ活用推進基本法"],
                                                },
                                            ],
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
                                                            children: ["平成二十八年法律第百三号"],
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
                                    tag: "__Text",
                                    attr: {},
                                    children: ["に規定する人工知能関連技術。"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const result = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct);

        // console.log(JSON.stringify(result.value.declarations.values().map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.declarations.values().map(r => r.json(true)),
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
                            children: [
                                "この法律において",
                                {
                                    tag: "Ruby",
                                    attr: {},
                                    children: [
                                        "へ",
                                        {
                                            tag: "Rt",
                                            attr: {},
                                            children: ["ヽ"],
                                        },
                                    ],
                                },
                                {
                                    tag: "Ruby",
                                    attr: {},
                                    children: [
                                        "き",
                                        {
                                            tag: "Rt",
                                            attr: {},
                                            children: ["ヽ"],
                                        },
                                    ],
                                },
                                "地教育振興法（昭和二十九年法律第百四十三号）に規定する人工知能関連技術。",
                            ],
                        },
                    ],
                },
            ],
        }) as std.Subitem1;
        addSentenceChildrenControls(inputElToBeModified);
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        const expected: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_8_16",
                    type: "LawName",
                    name: "へき地教育振興法",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":31},\"end\":{\"sentenceIndex\":null,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":8},\"end\":{\"sentenceIndex\":0,\"textOffset\":16}}",
                    value: "昭和二十九年法律第百四十三号",
                },
                children: [
                    {
                        tag: "Ruby",
                        attr: {},
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["へ"],
                            },
                            {
                                tag: "Rt",
                                attr: {},
                                children: [
                                    {
                                        tag: "__Text",
                                        attr: {},
                                        children: ["ヽ"],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        tag: "Ruby",
                        attr: {},
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["き"],
                            },
                            {
                                tag: "Rt",
                                attr: {},
                                children: [
                                    {
                                        tag: "__Text",
                                        attr: {},
                                        children: ["ヽ"],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["地教育振興法"],
                    },
                ],
            },
        ];
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
                                    children: ["において"],
                                },
                                {
                                    tag: "____LawRef",
                                    attr: {
                                        includingDeclarationID: "decl-sentence_0-text_8_16",
                                    },
                                    children: [
                                        {
                                            tag: "____Declaration",
                                            attr: {
                                                declarationID: "decl-sentence_0-text_8_16",
                                                type: "LawName",
                                                name: "へき地教育振興法",
                                                scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":31},\"end\":{\"sentenceIndex\":null,\"textOffset\":0}}]",
                                                nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":8},\"end\":{\"sentenceIndex\":0,\"textOffset\":16}}",
                                                value: "昭和二十九年法律第百四十三号",
                                            },
                                            children: [
                                                {
                                                    tag: "Ruby",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "__Text",
                                                            attr: {},
                                                            children: ["へ"],
                                                        },
                                                        {
                                                            tag: "Rt",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "__Text",
                                                                    attr: {},
                                                                    children: ["ヽ"],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: "Ruby",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "__Text",
                                                            attr: {},
                                                            children: ["き"],
                                                        },
                                                        {
                                                            tag: "Rt",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "__Text",
                                                                    attr: {},
                                                                    children: ["ヽ"],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["地教育振興法"],
                                                },
                                            ],
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
                                                            children: ["昭和二十九年法律第百四十三号"],
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
                                    tag: "__Text",
                                    attr: {},
                                    children: ["に規定する人工知能関連技術。"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const result = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct);

        // console.log(JSON.stringify(result.value.declarations.values().map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.declarations.values().map(r => r.json(true)),
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
                            children: [
                                "公営住宅法（昭和二十六年法律第百九十三号）第八条第一項又は激",
                                {
                                    tag: "Ruby",
                                    attr: {},
                                    children: [
                                        "甚",
                                        {
                                            tag: "Rt",
                                            attr: {},
                                            children: ["じん"],
                                        },
                                    ],
                                },
                                "災害に対処するための特別の財政援助等に関する法律（昭和三十七年法律第百五十号）第二十二条第一項の規定による国の補助を受けて",
                            ],
                        },
                    ],
                },
            ],
        }) as std.Subitem1;
        addSentenceChildrenControls(inputElToBeModified);
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        const expected: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_29_55",
                    type: "LawName",
                    name: "激甚災害に対処するための特別の財政援助等に関する法律",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":69},\"end\":{\"sentenceIndex\":null,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":29},\"end\":{\"sentenceIndex\":0,\"textOffset\":55}}",
                    value: "昭和三十七年法律第百五十号",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["激"],
                    },
                    {
                        tag: "Ruby",
                        attr: {},
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["甚"],
                            },
                            {
                                tag: "Rt",
                                attr: {},
                                children: [
                                    {
                                        tag: "__Text",
                                        attr: {},
                                        children: ["じん"],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["災害に対処するための特別の財政援助等に関する法律"],
                    },
                ],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_0_5",
                    type: "LawName",
                    name: "公営住宅法",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":20},\"end\":{\"sentenceIndex\":null,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":0,\"textOffset\":5}}",
                    value: "昭和二十六年法律第百九十三号",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["公営住宅法"],
                    },
                ],
            },
        ];
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
                                    tag: "____LawRef",
                                    attr: {
                                        includingDeclarationID: "decl-sentence_0-text_0_5",
                                    },
                                    children: [
                                        {
                                            tag: "____Declaration",
                                            attr: {
                                                declarationID: "decl-sentence_0-text_0_5",
                                                type: "LawName",
                                                name: "公営住宅法",
                                                scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":20},\"end\":{\"sentenceIndex\":null,\"textOffset\":0}}]",
                                                nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":0,\"textOffset\":5}}",
                                                value: "昭和二十六年法律第百九十三号",
                                            },
                                            children: [
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["公営住宅法"],
                                                },
                                            ],
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
                                                            children: ["昭和二十六年法律第百九十三号"],
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
                                                                targetType: "Article",
                                                                name: "第八条",
                                                                num: "8",
                                                            },
                                                            children: ["第八条"],
                                                        },
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
                                    children: ["又は"],
                                },
                                {
                                    tag: "____LawRef",
                                    attr: {
                                        includingDeclarationID: "decl-sentence_0-text_29_55",
                                    },
                                    children: [
                                        {
                                            tag: "____Declaration",
                                            attr: {
                                                declarationID: "decl-sentence_0-text_29_55",
                                                type: "LawName",
                                                name: "激甚災害に対処するための特別の財政援助等に関する法律",
                                                scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":69},\"end\":{\"sentenceIndex\":null,\"textOffset\":0}}]",
                                                nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":29},\"end\":{\"sentenceIndex\":0,\"textOffset\":55}}",
                                                value: "昭和三十七年法律第百五十号",
                                            },
                                            children: [
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["激"],
                                                },
                                                {
                                                    tag: "Ruby",
                                                    attr: {},
                                                    children: [
                                                        {
                                                            tag: "__Text",
                                                            attr: {},
                                                            children: ["甚"],
                                                        },
                                                        {
                                                            tag: "Rt",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "__Text",
                                                                    attr: {},
                                                                    children: ["じん"],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    tag: "__Text",
                                                    attr: {},
                                                    children: ["災害に対処するための特別の財政援助等に関する法律"],
                                                },
                                            ],
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
                                                            children: ["昭和三十七年法律第百五十号"],
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
                                                                targetType: "Article",
                                                                name: "第二十二条",
                                                                num: "22",
                                                            },
                                                            children: ["第二十二条"],
                                                        },
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
                                    children: ["の規定による国の補助を受けて"],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const result = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct);

        // console.log(JSON.stringify(result.value.declarations.values().map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.declarations.values().map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        // console.log(JSON.stringify(inputElToBeModified.json(true), null, 2));
        assert.deepStrictEqual(
            inputElToBeModified.json(true),
            expectedModifiedInput,
        );
    });
});
