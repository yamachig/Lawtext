import { assert } from "chai";
import { initialEnv } from "../env";
import * as std from "../../../law/std";
import $sentencesArray, { sentencesArrayToString } from "./$sentencesArray";
import { ErrorMessage } from "../error";
import loadEL from "../../../node/el/loadEL";

const env = initialEnv({});

describe("Test $sentencesArray and sentencesArrayToString", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const target = `\
不利益処分　行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。ただし、次のいずれかに該当するものを除く。　
    イ　事実上の行為及び事実上の行為をするに当たりその範囲、時期等を明らかにするために法令上必要とされている手続としての処分
`;
        const expectedRendered = `\
不利益処分　行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。ただし、次のいずれかに該当するものを除く。`;
        const expectedCST = [
            {
                leadingSpace: "",
                leadingSpaceRange: [0, 0] as [number, number],
                attrEntries: [],
                sentences: [
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
                leadingSpace: "　",
                leadingSpaceRange: [5, 6] as [number, number],
                attrEntries: [],
                sentences: [
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
        const expectedErrors: ErrorMessage[] = [];

        const result = $sentencesArray.abstract().match(0, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            assert.deepStrictEqual(result.value.value.map(col => ({ ...col, sentences: col.sentences.map(s => s.json(true)) })), expectedCST);
            assert.deepStrictEqual(result.value.errors, expectedErrors);
        }

        const text = sentencesArrayToString(
            expectedCST.map(col =>
                ({ ...col, sentences: col.sentences.map(loadEL) as std.Sentence[] })
            )
        );
        assert.strictEqual(text, expectedRendered);
    });


    it("Fail case", () => {
        /* eslint-disable no-irregular-whitespace */
        const offset = 0;
        const target = `\
　
`;
        const expectedResult = {
            ok: false,
            offset: 0,
            expected: "sentencesArray",
        } as const;
        const result = $sentencesArray.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });
});
