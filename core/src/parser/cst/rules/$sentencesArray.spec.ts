import { assert } from "chai";
import { initialEnv } from "../env";
import type * as std from "../../../law/std";
import $sentencesArray, { sentencesArrayToString } from "./$sentencesArray";
import type { ErrorMessage } from "../error";
import loadEL from "../../../node/el/loadEL";
import { matchResultToJson } from "generic-parser/lib/core";

const env = initialEnv({});

describe("Test $sentencesArray and sentencesArrayToString", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const target = `\
不利益処分　行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。ただし、次のいずれかに該当するものを除く。　
    イ　事実上の行為及び事実上の行為をするに当たりその範囲、時期等を明らかにするために法令上必要とされている手続としての処分
`;
        const expectedRendered = "\
不利益処分　行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。ただし、次のいずれかに該当するものを除く。";
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

    it("Success case", () => {
        const target = `\
旧酒税法の規定により甘味果実酒又はスピリッツとされていたもののうち、新酒税法の規定により果実酒又はブランデーとして分類される酒類につき旧酒税法の規定により製造免許等を受けていた者は、平成三十年四月一日に、新酒税法の規定により果実酒（新酒税法第三条第十三号ホに掲げるものに限る。）又はブランデー（同条第十六号に規定するブランデーのうち、旧酒税法第三条第二十号に規定するスピリッツに該当するものに限る。）の製造免許等を受けたものとみなす。
`;
        const expectedRendered = "\
旧酒税法の規定により甘味果実酒又はスピリッツとされていたもののうち、新酒税法の規定により果実酒又はブランデーとして分類される酒類につき旧酒税法の規定により製造免許等を受けていた者は、平成三十年四月一日に、新酒税法の規定により果実酒（新酒税法第三条第十三号ホに掲げるものに限る。）又はブランデー（同条第十六号に規定するブランデーのうち、旧酒税法第三条第二十号に規定するスピリッツに該当するものに限る。）の製造免許等を受けたものとみなす。";
        const expectedCST = [
            {
                leadingSpace: "",
                leadingSpaceRange: [
                    0,
                    0
                ] as [number, number],
                attrEntries: [],
                sentences: [
                    {
                        tag: "Sentence",
                        attr: {},
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["旧酒税法の規定により甘味果実酒又はスピリッツとされていたもののうち、新酒税法の規定により果実酒又はブランデーとして分類される酒類につき旧酒税法の規定により製造免許等を受けていた者は、平成三十年四月一日に、新酒税法の規定により果実酒"]
                            },
                            {
                                tag: "__Parentheses",
                                attr: {
                                    type: "round",
                                    depth: "1"
                                },
                                children: [
                                    {
                                        tag: "__PStart",
                                        attr: {
                                            type: "round"
                                        },
                                        children: ["（"]
                                    },
                                    {
                                        tag: "__PContent",
                                        attr: {
                                            type: "round"
                                        },
                                        children: [
                                            {
                                                tag: "__Text",
                                                attr: {},
                                                children: ["新酒税法第三条第十三号ホに掲げるものに限る。"]
                                            }
                                        ]
                                    },
                                    {
                                        tag: "__PEnd",
                                        attr: {
                                            type: "round"
                                        },
                                        children: ["）"]
                                    }
                                ]
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["又はブランデー"]
                            },
                            {
                                tag: "__Parentheses",
                                attr: {
                                    type: "round",
                                    depth: "1"
                                },
                                children: [
                                    {
                                        tag: "__PStart",
                                        attr: {
                                            type: "round"
                                        },
                                        children: ["（"]
                                    },
                                    {
                                        tag: "__PContent",
                                        attr: {
                                            type: "round"
                                        },
                                        children: [
                                            {
                                                tag: "__Text",
                                                attr: {},
                                                children: ["同条第十六号に規定するブランデーのうち、旧酒税法第三条第二十号に規定するスピリッツに該当するものに限る。"]
                                            }
                                        ]
                                    },
                                    {
                                        tag: "__PEnd",
                                        attr: {
                                            type: "round"
                                        },
                                        children: ["）"]
                                    }
                                ]
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["の製造免許等を受けたものとみなす。"]
                            }
                        ]
                    }
                ]
            }
        ];
        const expectedErrors: ErrorMessage[] = [];

        const result = $sentencesArray.abstract().match(0, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.map(col => ({ ...col, sentences: col.sentences.map(s => s.json(true)) })), null, 2));
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

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const target = `\
南極<Ruby>哺<Rt>ほ</Rt></Ruby>乳類　<Ruby>哺<Rt>ほ</Rt></Ruby>乳綱に属する種であってその個体が南極地域に生息するものとして環境省令で定めるものの生きている個体をいう。
`;
        const expectedRendered = "\
南極<Ruby>哺<Rt>ほ</Rt></Ruby>乳類　<Ruby>哺<Rt>ほ</Rt></Ruby>乳綱に属する種であってその個体が南極地域に生息するものとして環境省令で定めるものの生きている個体をいう。";
        const expectedCST = [
            {
                leadingSpace: "",
                leadingSpaceRange: [
                    0,
                    0
                ] as [number, number],
                attrEntries: [],
                sentences: [
                    {
                        tag: "Sentence",
                        attr: {},
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["南極"]
                            },
                            {
                                tag: "Ruby",
                                attr: {},
                                children: [
                                    {
                                        tag: "__Text",
                                        attr: {},
                                        children: ["哺"]
                                    },
                                    {
                                        tag: "Rt",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "__Text",
                                                attr: {},
                                                children: ["ほ"]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["乳類"]
                            }
                        ]
                    }
                ]
            },
            {
                leadingSpace: "　",
                leadingSpaceRange: [
                    28,
                    29
                ] as [number, number],
                attrEntries: [],
                sentences: [
                    {
                        tag: "Sentence",
                        attr: {},
                        children: [
                            {
                                tag: "Ruby",
                                attr: {},
                                children: [
                                    {
                                        tag: "__Text",
                                        attr: {},
                                        children: ["哺"]
                                    },
                                    {
                                        tag: "Rt",
                                        attr: {},
                                        children: [
                                            {
                                                tag: "__Text",
                                                attr: {},
                                                children: ["ほ"]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["乳綱に属する種であってその個体が南極地域に生息するものとして環境省令で定めるものの生きている個体をいう。"]
                            }
                        ]
                    }
                ]
            }
        ];
        const expectedErrors: ErrorMessage[] = [];

        const result = $sentencesArray.abstract().match(0, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.map(col => ({ ...col, sentences: col.sentences.map(s => s.json(true)) })), undefined, 2));
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
        assert.deepInclude(matchResultToJson(result), expectedResult);
    });
});
