import { assert } from "chai";
import loadEL from "../../../node/el/loadEL";
import { initialEnv } from "../env";
import $lawRef from "./$lawRef";
import type * as std from "../../../law/std";
import type { SentenceChildEL } from "../../../node/cst/inline";
import detectPointers from "../../detectPointers";
import getSentenceEnvs from "../../getSentenceEnvs";

const env = initialEnv({ target: "" });

describe("Test $lawRef", () => {

    it("Success case", () => {
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["独立行政法人通則法の一部を改正する法律（平成二十六年法律第六十六号。以下「通則法改正法」という。）の施行の日から施行する。"],
        }) as std.Sentence;
        getSentenceEnvs(origEL);
        detectPointers(origEL);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];
        const expectedLawNameCandidates = [
            {
                tag: "__Text",
                attr: {},
                children: ["独立行政法人通則法の一部を改正する法律"]
            }
        ] ;
        const expectedLawNum = {
            tag: "____LawNum",
            attr: {},
            children: ["平成二十六年法律第六十六号"]
        } ;
        const expectedNameSquareParentheses = {
            tag: "__Parentheses",
            attr: {
                type: "square",
                depth: "2"
            },
            children: [
                {
                    tag: "__PStart",
                    attr: {
                        type: "square"
                    },
                    children: ["「"]
                },
                {
                    tag: "__PContent",
                    attr: {
                        type: "square"
                    },
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["通則法改正法"]
                        }
                    ]
                },
                {
                    tag: "__PEnd",
                    attr: {
                        type: "square"
                    },
                    children: ["」"]
                }
            ]
        };

        const result = $lawRef.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {

            // console.log(JSON.stringify(result.value.value.lawNameCandidate.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.lawTitleCandidates.map(c => c.json(true)), expectedLawNameCandidates);

            // console.log(JSON.stringify(result.value.value.lawRefInfo.lawNum.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.lawRefInfo.lawNum.json(true), expectedLawNum);

            // console.log(JSON.stringify(result.value.value.lawRefInfo.nameInfo?.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.lawRefInfo.aliasInfo?.pointerRanges, null);

            assert.deepStrictEqual(result.value.value.lawRefInfo.aliasInfo?.following, true);

            // console.log(JSON.stringify(result.value.value.lawRefInfo.nameInfo?.nameSquareParentheses.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.lawRefInfo.aliasInfo?.nameSquareParentheses.json(true), expectedNameSquareParentheses);

            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["国の機関相互間の関係について定める命令等並びに地方自治法（昭和二十二年法律第六十七号）第二編第十一章に規定する国と普通地方公共団体との関係及び普通地方公共団体相互間の関係その他の国と地方公共団体との関係及び地方公共団体相互間の関係について定める命令等（第一項の規定によりこの法律の規定を適用しないこととされる処分に係る命令等を含む。）"],
        }) as std.Sentence;
        getSentenceEnvs(origEL);
        detectPointers(origEL);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];
        const expectedLawNameCandidates = [
            {
                tag: "__Text",
                attr: {},
                children: ["国の機関相互間の関係について定める命令等並びに地方自治法"]
            }
        ];
        const expectedLawNum = {
            tag: "____LawNum",
            attr: {},
            children: ["昭和二十二年法律第六十七号"]
        };

        const result = $lawRef.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {

            // console.log(JSON.stringify(result.value.value.lawNameCandidate.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.lawTitleCandidates.map(c => c.json(true)), expectedLawNameCandidates);

            // console.log(JSON.stringify(result.value.value.lawRefInfo.lawNum.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.lawRefInfo.lawNum.json(true), expectedLawNum);

            assert.deepStrictEqual(result.value.value.lawRefInfo.aliasInfo, null);

            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["裁判員の参加する刑事裁判に関する法律（平成１６年法律第６３号）第２条第１項に規定する事件に該当する事件の捜査を行う場合は、国民の中から選任された裁判員に分かりやすい立証が可能となるよう、配慮しなければならない。"],
        }) as std.Sentence;
        getSentenceEnvs(origEL);
        detectPointers(origEL);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];
        const expectedLawNameCandidates = [
            {
                tag: "__Text",
                attr: {},
                children: ["裁判員の参加する刑事裁判に関する法律"]
            }
        ];
        const expectedLawNum = {
            tag: "____LawNum",
            attr: {},
            children: ["平成１６年法律第６３号"]
        };

        const result = $lawRef.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {

            // console.log(JSON.stringify(result.value.value.lawNameCandidate.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.lawTitleCandidates.map(c => c.json(true)), expectedLawNameCandidates);

            // console.log(JSON.stringify(result.value.value.lawRefInfo.lawNum.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.lawRefInfo.lawNum.json(true), expectedLawNum);

            assert.deepStrictEqual(result.value.value.lawRefInfo.aliasInfo, null);

            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["別に定めるもののほか、電気通信事業法（昭和五十九年法律第八十六号。以下「法」という。）の規定を施行するために必要とする事項及び法の委任に基づく事項を定めることを目的とする。"],
        }) as std.Sentence;
        getSentenceEnvs(origEL);
        detectPointers(origEL);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];
        const expectedLawNameCandidates = [
            {
                tag: "__Text",
                attr: {},
                children: ["別に定めるもののほか、電気通信事業法"]
            }
        ];
        const expectedLawNum = {
            tag: "____LawNum",
            attr: {},
            children: ["昭和五十九年法律第八十六号"]
        };
        const expectedNameSquareParentheses = {
            tag: "__Parentheses",
            attr: {
                type: "square",
                depth: "2"
            },
            children: [
                {
                    tag: "__PStart",
                    attr: {
                        type: "square"
                    },
                    children: ["「"]
                },
                {
                    tag: "__PContent",
                    attr: {
                        type: "square"
                    },
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["法"]
                        }
                    ]
                },
                {
                    tag: "__PEnd",
                    attr: {
                        type: "square"
                    },
                    children: ["」"]
                }
            ]
        };

        const result = $lawRef.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {

            // console.log(JSON.stringify(result.value.value.lawNameCandidate.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.lawTitleCandidates.map(c => c.json(true)), expectedLawNameCandidates);

            // console.log(JSON.stringify(result.value.value.lawRefInfo.lawNum.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.lawRefInfo.lawNum.json(true), expectedLawNum);

            assert.deepStrictEqual(result.value.value.lawRefInfo.aliasInfo?.nameSquareParentheses.json(true), expectedNameSquareParentheses);

            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });
});
