import { assert } from "chai";
import loadEL from "../../../node/el/loadEL";
import { initialEnv } from "../env";
import $lawRef from "./$lawRef";
import * as std from "../../../law/std";
import addSentenceChildrenControls from "../../../parser/addSentenceChildrenControls";
import { SentenceChildEL } from "../../../node/cst/inline";
import detectTokens from "../../detectTokens";
import getSentenceEnvs from "../../getSentenceEnvs";

const env = initialEnv({ target: "" });

describe("Test $lawRef", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["この法律は、独立行政法人通則法の一部を改正する法律（平成二十六年法律第六十六号。以下「通則法改正法」という。）の施行の日から施行する。"],
        }) as std.Sentence;
        addSentenceChildrenControls(origEL);
        const sentenceEnvsStruct = getSentenceEnvs(origEL);
        detectTokens(sentenceEnvsStruct);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];
        const expectedLawNameCandidate = {
            tag: "__Text",
            attr: {},
            children: ["この法律は、独立行政法人通則法の一部を改正する法律"]
        } ;
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
        }
          ;

        const result = $lawRef.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {

            // console.log(JSON.stringify(result.value.value.lawNameCandidate.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.lawNameCandidate.json(true), expectedLawNameCandidate);

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
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["国の機関相互間の関係について定める命令等並びに地方自治法（昭和二十二年法律第六十七号）第二編第十一章に規定する国と普通地方公共団体との関係及び普通地方公共団体相互間の関係その他の国と地方公共団体との関係及び地方公共団体相互間の関係について定める命令等（第一項の規定によりこの法律の規定を適用しないこととされる処分に係る命令等を含む。）"],
        }) as std.Sentence;
        addSentenceChildrenControls(origEL);
        const sentenceEnvsStruct = getSentenceEnvs(origEL);
        detectTokens(sentenceEnvsStruct);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];
        const expectedLawNameCandidate = {
            tag: "__Text",
            attr: {},
            children: ["国の機関相互間の関係について定める命令等並びに地方自治法"]
        } ;
        const expectedLawNum = {
            tag: "____LawNum",
            attr: {},
            children: ["昭和二十二年法律第六十七号"]
        } ;

        const result = $lawRef.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {

            // console.log(JSON.stringify(result.value.value.lawNameCandidate.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.lawNameCandidate.json(true), expectedLawNameCandidate);

            // console.log(JSON.stringify(result.value.value.lawRefInfo.lawNum.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.lawRefInfo.lawNum.json(true), expectedLawNum);

            assert.deepStrictEqual(result.value.value.lawRefInfo.aliasInfo, null);

            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });
});
