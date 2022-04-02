import { assert } from "chai";
import { initialEnv } from "../env";
import $sentenceChildren, { sentenceChildrenToString } from "./$sentenceChildren";
import { loadEl } from "../../../node/el";
import { ErrorMessage } from "../error";
import { SentenceChildEL } from "../../../node/cst/inline";

const env = initialEnv({});

describe("Test $sentenceChildren and sentenceChildrenToString", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const target = `\
第二種指定電気通信設備を設置する電気通信事業者の特定関係法人である電気通信事業者であつて、その一端が特定移動端末設備と接続される伝送路設備を設置するもの（第二種指定電気通信設備を設置する電気通信事業者を除く。）は、対象卸電気通信役務（当該伝送路設備を用いる携帯電話又はＢＷＡアクセスサービス（無線設備規則第三条第十二号に規定する時分割・直交周波数分割多元接続方式又は時分割・シングルキャリア周波数分割多元接続方式広帯域移動無線アクセスシステムのうち、同号に規定するシングルキャリア周波数分割多元接続方式と他の接続方式を組み合わせた接続方式を用いることが可能なものを使用するものに限る。）の卸電気通信役務（通信モジュール（特定の業務の用に供する通信に用途が限定されている利用者の電気通信設備をいう。以下同じ。）向けに提供するものを除く。）をいう。以下この条において同じ。）を電気通信事業者（当該伝送路設備を設置する電気通信事業者の特定関係法人であるもの（その提供を受ける対象卸電気通信役務に用いられる伝送路設備に接続される特定移動端末設備の数が五万未満のものを除く。）又はその提供を受ける対象卸電気通信役務に用いられる伝送路設備に接続される特定移動端末設備の数が五十万以上のものに限る。以下この条において「卸先電気通信事業者」という。）に対して提供する業務を行うときは、当該卸先電気通信事業者ごとの次に掲げる事項について、様式第二十三の九により、当該事項に関する契約書その他の書面の写しを添えて、遅滞なく、書面等により総務大臣に提出しなければならない。　
  一　当該卸先電気通信事業者の氏名又は名称
`;
        const expectedRendered = `\
第二種指定電気通信設備を設置する電気通信事業者の特定関係法人である電気通信事業者であつて、その一端が特定移動端末設備と接続される伝送路設備を設置するもの（第二種指定電気通信設備を設置する電気通信事業者を除く。）は、対象卸電気通信役務（当該伝送路設備を用いる携帯電話又はＢＷＡアクセスサービス（無線設備規則第三条第十二号に規定する時分割・直交周波数分割多元接続方式又は時分割・シングルキャリア周波数分割多元接続方式広帯域移動無線アクセスシステムのうち、同号に規定するシングルキャリア周波数分割多元接続方式と他の接続方式を組み合わせた接続方式を用いることが可能なものを使用するものに限る。）の卸電気通信役務（通信モジュール（特定の業務の用に供する通信に用途が限定されている利用者の電気通信設備をいう。以下同じ。）向けに提供するものを除く。）をいう。以下この条において同じ。）を電気通信事業者（当該伝送路設備を設置する電気通信事業者の特定関係法人であるもの（その提供を受ける対象卸電気通信役務に用いられる伝送路設備に接続される特定移動端末設備の数が五万未満のものを除く。）又はその提供を受ける対象卸電気通信役務に用いられる伝送路設備に接続される特定移動端末設備の数が五十万以上のものに限る。以下この条において「卸先電気通信事業者」という。）に対して提供する業務を行うときは、当該卸先電気通信事業者ごとの次に掲げる事項について、様式第二十三の九により、当該事項に関する契約書その他の書面の写しを添えて、遅滞なく、書面等により総務大臣に提出しなければならない。`;
        const expectedCST = [
            {
                tag: "__Text",
                attr: {},
                children: ["第二種指定電気通信設備を設置する電気通信事業者の特定関係法人である電気通信事業者であつて、その一端が特定移動端末設備と接続される伝送路設備を設置するもの"],
            },
            {
                tag: "__Parentheses",
                attr: {
                    depth: "1",
                    type: "round",
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
                        attr: { type: "round" },
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["第二種指定電気通信設備を設置する電気通信事業者を除く。"],
                            },
                        ],
                    },
                    {
                        tag: "__PEnd",
                        attr: { "type": "round" },
                        children: ["）"],
                    },
                ],
            },
            {
                tag: "__Text",
                attr: {},
                children: ["は、対象卸電気通信役務"],
            },
            {
                tag: "__Parentheses",
                attr: {
                    depth: "1",
                    type: "round",
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
                        attr: { type: "round" },
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["当該伝送路設備を用いる携帯電話又はＢＷＡアクセスサービス"],
                            },
                            {
                                tag: "__Parentheses",
                                attr: {
                                    depth: "2",
                                    type: "round",
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
                                        attr: { type: "round" },
                                        children: [
                                            {
                                                tag: "__Text",
                                                attr: {},
                                                children: ["無線設備規則第三条第十二号に規定する時分割・直交周波数分割多元接続方式又は時分割・シングルキャリア周波数分割多元接続方式広帯域移動無線アクセスシステムのうち、同号に規定するシングルキャリア周波数分割多元接続方式と他の接続方式を組み合わせた接続方式を用いることが可能なものを使用するものに限る。"],
                                            },
                                        ],
                                    },
                                    {
                                        tag: "__PEnd",
                                        attr: { "type": "round" },
                                        children: ["）"],
                                    },
                                ],
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["の卸電気通信役務"],
                            },
                            {
                                tag: "__Parentheses",
                                attr: {
                                    depth: "2",
                                    type: "round",
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
                                        attr: { type: "round" },
                                        children: [
                                            {
                                                tag: "__Text",
                                                attr: {},
                                                children: ["通信モジュール"],
                                            },
                                            {
                                                tag: "__Parentheses",
                                                attr: {
                                                    depth: "3",
                                                    type: "round",
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
                                                        attr: { type: "round" },
                                                        children: [
                                                            {
                                                                tag: "__Text",
                                                                attr: {},
                                                                children: ["特定の業務の用に供する通信に用途が限定されている利用者の電気通信設備をいう。以下同じ。"],
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        tag: "__PEnd",
                                                        attr: { "type": "round" },
                                                        children: ["）"],
                                                    },
                                                ],
                                            },
                                            {
                                                tag: "__Text",
                                                attr: {},
                                                children: ["向けに提供するものを除く。"],
                                            },
                                        ],
                                    },
                                    {
                                        tag: "__PEnd",
                                        attr: { "type": "round" },
                                        children: ["）"],
                                    },
                                ],
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["をいう。以下この条において同じ。"],
                            },
                        ],
                    },
                    {
                        tag: "__PEnd",
                        attr: { "type": "round" },
                        children: ["）"],
                    },
                ],
            },
            {
                tag: "__Text",
                attr: {},
                children: ["を電気通信事業者"],
            },
            {
                tag: "__Parentheses",
                attr: {
                    depth: "1",
                    type: "round",
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
                        attr: { type: "round" },
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["当該伝送路設備を設置する電気通信事業者の特定関係法人であるもの"],
                            },
                            {
                                tag: "__Parentheses",
                                attr: {
                                    depth: "2",
                                    type: "round",
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
                                        attr: { type: "round" },
                                        children: [
                                            {
                                                tag: "__Text",
                                                attr: {},
                                                children: ["その提供を受ける対象卸電気通信役務に用いられる伝送路設備に接続される特定移動端末設備の数が五万未満のものを除く。"],
                                            },
                                        ],
                                    },
                                    {
                                        tag: "__PEnd",
                                        attr: { "type": "round" },
                                        children: ["）"],
                                    },
                                ],
                            },
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["又はその提供を受ける対象卸電気通信役務に用いられる伝送路設備に接続される特定移動端末設備の数が五十万以上のものに限る。以下この条において"],
                            },
                            {
                                tag: "__Parentheses",
                                attr: {
                                    depth: "2",
                                    type: "square",
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
                                        attr: { type: "square" },
                                        children: [
                                            {
                                                tag: "__Text",
                                                attr: {},
                                                children: ["卸先電気通信事業者"],
                                            },
                                        ],
                                    },
                                    {
                                        tag: "__PEnd",
                                        attr: { "type": "square" },
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
                        attr: { "type": "round" },
                        children: ["）"],
                    },
                ],
            },
            {
                tag: "__Text",
                attr: {},
                children: ["に対して提供する業務を行うときは、当該卸先電気通信事業者ごとの次に掲げる事項について、様式第二十三の九により、当該事項に関する契約書その他の書面の写しを添えて、遅滞なく、書面等により総務大臣に提出しなければならない。"],
            },
        ];
        const expectedErrors: ErrorMessage[] = [];

        const result = $sentenceChildren.abstract().match(0, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            assert.deepStrictEqual(result.value.value.map(el => el.json(true)), expectedCST);
            assert.deepStrictEqual(result.value.errors, expectedErrors);
        }

        const text = sentenceChildrenToString(expectedCST.map(loadEl) as SentenceChildEL[]);
        assert.strictEqual(text, expectedRendered);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const target = `\
同法第四十六条中「技術基準（」とあるのは
`;
        const expectedRendered = `\
同法第四十六条中「技術基準（」とあるのは`;
        const expectedCST = [
            {
                tag: "__Text",
                attr: {},
                children: ["同法第四十六条中"],
            },
            {
                tag: "__Parentheses",
                attr: {
                    depth: "1",
                    type: "square",
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
                        attr: { type: "square" },
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["技術基準（"],
                            },
                        ],
                    },
                    {
                        tag: "__PEnd",
                        attr: { "type": "square" },
                        children: ["」"],
                    },
                ],
            },
            {
                tag: "__Text",
                attr: {},
                children: ["とあるのは"],
            },
        ];
        const expectedErrors: ErrorMessage[] = [];

        const result = $sentenceChildren.abstract().match(0, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            assert.deepStrictEqual(result.value.value.map(el => el.json(true)), expectedCST);
            assert.deepStrictEqual(result.value.errors, expectedErrors);
        }

        const text = sentenceChildrenToString(expectedCST.map(loadEl) as SentenceChildEL[]);
        assert.strictEqual(text, expectedRendered);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const target = `\
この法律において「スパイクタイヤ」とは、積雪又は凍結の状態にある路面において滑ることを防止するために金属<Ruby>鋲<Rt>びよう</Rt></Ruby>その他これに類する物をその接地部に固定したタイヤをいう。
`;
        const expectedRendered = `\
この法律において「スパイクタイヤ」とは、積雪又は凍結の状態にある路面において滑ることを防止するために金属<Ruby>鋲<Rt>びよう</Rt></Ruby>その他これに類する物をその接地部に固定したタイヤをいう。`;
        const expectedCST = [
            {
                tag: "__Text",
                attr: {},
                children: ["この法律において"],
            },
            {
                tag: "__Parentheses",
                attr: {
                    depth: "1",
                    type: "square",
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
                        attr: { type: "square" },
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["スパイクタイヤ"],
                            },
                        ],
                    },
                    {
                        tag: "__PEnd",
                        attr: { "type": "square" },
                        children: ["」"],
                    },
                ],
            },
            {
                tag: "__Text",
                attr: {},
                children: ["とは、積雪又は凍結の状態にある路面において滑ることを防止するために金属"],
            },
            {
                tag: "Ruby",
                attr: {},
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["鋲"],
                    },
                    {
                        tag: "Rt",
                        attr: {},
                        children: [
                            {
                                tag: "__Text",
                                attr: {},
                                children: ["びよう"],
                            },
                        ],
                    },
                ],
            },
            {
                tag: "__Text",
                attr: {},
                children: ["その他これに類する物をその接地部に固定したタイヤをいう。"],
            },
        ];
        const expectedErrors: ErrorMessage[] = [];

        const result = $sentenceChildren.abstract().match(0, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            assert.deepStrictEqual(result.value.value.map(el => el.json(true)), expectedCST);
            assert.deepStrictEqual(result.value.errors, expectedErrors);
        }

        const text = sentenceChildrenToString(expectedCST.map(loadEl) as SentenceChildEL[]);
        assert.strictEqual(text, expectedRendered);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const target = `\
技術基準（」
`;
        const expectedRendered = `\
技術基準（」`;
        const expectedCST = [
            {
                tag: "__Text",
                attr: {},
                children: ["技術基準"],
            },
            {
                tag: "__MismatchStartParenthesis",
                attr: {},
                children: ["（"],
            },
            {
                tag: "__MismatchEndParenthesis",
                attr: {},
                children: ["」"],
            },
        ];
        const expectedErrors: ErrorMessage[] = [
            {
                message: "$MISMATCH_START_PARENTHESIS: この括弧に対応する閉じ括弧がありません。",
                location: [
                    {
                        offset: 4,
                        line: 1,
                        column: 5,
                    },
                    {
                        offset: 5,
                        line: 1,
                        column: 6,
                    },
                ],
            },
            {
                message: "$MISMATCH_END_PARENTHESIS: この括弧に対応する開き括弧がありません。",
                location: [
                    {
                        offset: 5,
                        line: 1,
                        column: 6,
                    },
                    {
                        offset: 6,
                        line: 1,
                        column: 7,
                    },
                ],
            },
        ];

        const result = $sentenceChildren.abstract().match(0, target, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            assert.deepStrictEqual(result.value.value.map(el => el.json(true)), expectedCST);
            assert.deepStrictEqual(result.value.errors, expectedErrors);
        }

        const text = sentenceChildrenToString(expectedCST.map(loadEl) as SentenceChildEL[]);
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
            expected: "sentenceChildren",
        } as const;
        const result = $sentenceChildren.abstract().match(offset, target, env);
        assert.deepInclude(result, expectedResult);
    });
});
