import { assert } from "chai";
import { initialEnv as cstInitialEnv } from "../../cst/env";
import { loadEl } from "../../../node/el";
import { columnsOrSentencesToSentencesArray, sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import $sentencesArray, { sentencesArrayToString } from "../../cst/rules/$sencencesArray";
import * as std from "../../../law/std";

const cstEnv = cstInitialEnv({});

describe("Test sentencesArrayToColumnsOrSentences and columnsOrSentencesToSentencesArray", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const target = `\
不利益処分　行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。ただし、次のいずれかに該当するものを除く。　
    イ　事実上の行為及び事実上の行為をするに当たりその範囲、時期等を明らかにするために法令上必要とされている手続としての処分
`;
        const expectedRendered = `\
不利益処分　行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。ただし、次のいずれかに該当するものを除く。`;
        const expectedSTD = [
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
                                children: ["不利益処分"],
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
                        attr: {
                            Function: "main",
                            Num: "1",
                        },
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。"],
                            },
                        ],
                    },
                    {
                        tag: "Sentence",
                        attr: {
                            Function: "proviso",
                            Num: "2",
                        },
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["ただし、次のいずれかに該当するものを除く。"],
                            },
                        ],
                    },
                ],
            },
        ];

        const result = $sentencesArray.abstract().match(0, target, cstEnv);
        assert.isTrue(result.ok);
        if (result.ok) {
            const sentencesArray = sentencesArrayToColumnsOrSentences(result.value);
            assert.deepStrictEqual(sentencesArray.map(s => s.json(true)), expectedSTD);
        }

        const sentencesArray = columnsOrSentencesToSentencesArray(expectedSTD.map(loadEl) as std.Column[]);
        const text = sentencesArrayToString(sentencesArray);
        assert.strictEqual(text, expectedRendered);
    });
});
