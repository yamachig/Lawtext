import { assert } from "chai";
import { JsonEL } from "../../node/el/jsonEL";
import getSentenceEnvs from "../getSentenceEnvs";
import { parse } from "../../parser/lawtext";
import { assertELVaridity } from "../../parser/std/testHelper";
import getPointerEnvs from "./getPointerEnvs";
import getScope from "./getScope";

describe("Test getScope", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
電波法
（昭和二十五年法律第百三十一号）

      第一章　総則

  （目的）
第一条　この法律は、電波の公平且つ能率的な利用を確保することによつて、公共の福祉を増進することを目的とする。

  （定義）
第二条　この法律及びこの法律に基づく命令の規定の解釈に関しては、次の定義に従うものとする。
  一　「電波」とは、三百万メガヘルツ以下の周波数の電磁波をいう。

      附　則　抄

  （施行期日）
１　この法律は、公布の日から起算して三十日を経過した日から施行する。

      附　則　（昭和二七年七月三一日法律第二四九号）　抄

１　この法律は、公布の日から施行する。但し、第三十三条第三項、第三十三条の二から第三十六条まで、第三十七条（船舶安全法第二条の規定に基く命令により船舶に備えなければならない救命艇用携帯無線電信に係る部分に限る。）、第六十三条、第六十五条及び第九十九条の十一第一号の改正規定は、昭和二十七年十一月十九日から施行する。

# 別表第一（第二十四条の二関係）

  # 一　第一級総合無線通信士、第二級総合無線通信士、第三級総合無線通信士、第一級海上無線通信士、第二級海上無線通信士、第四級海上無線通信士、航空無線通信士、第一級陸上無線技術士、第二級陸上無線技術士、陸上特殊無線技士又は第一級アマチュア無線技士の資格を有すること。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const getPointerEnvsResult = getPointerEnvs(sentenceEnvsStruct);

        const expectedSentenceTexts = [
            "この法律は、電波の公平且つ能率的な利用を確保することによつて、公共の福祉を増進することを目的とする。",
            "この法律及びこの法律に基づく命令の規定の解釈に関しては、次の定義に従うものとする。",
            "「電波」とは、三百万メガヘルツ以下の周波数の電磁波をいう。",
            "この法律は、公布の日から起算して三十日を経過した日から施行する。",
            "第一級総合無線通信士、第二級総合無線通信士、第三級総合無線通信士、第一級海上無線通信士、第二級海上無線通信士、第四級海上無線通信士、航空無線通信士、第一級陸上無線技術士、第二級陸上無線技術士、陸上特殊無線技士又は第一級アマチュア無線技士の資格を有すること。",
        ];

        const expectedPointerRangesList: JsonEL[] = [
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
        ];
        const expectedErrorMessages: string[] = [];

        [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        // console.log(JSON.stringify(sentenceEnvsStruct.sentenceEnvs.map(s => s.text), null, 2));
        assert.deepStrictEqual(
            sentenceEnvsStruct.sentenceEnvs.map(s => s.text),
            expectedSentenceTexts,
        );

        // console.log(JSON.stringify(getPointerEnvsResult.value.pointerRangesList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            getPointerEnvsResult.value.pointerRangesList.map(r => r.json(true)),
            expectedPointerRangesList,
        );

        assert.deepStrictEqual(getPointerEnvsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
第五条　第七十六条第二項及び第四項（第一号を除く。）の規定により第四項の無線局の免許の取消しを受け、その取消しの日から二年を経過しない者。
４　電気通信業務を行うことを目的として開設する無線局
  一　法人又は団体

第七十六条　総務大臣は、三月以内の期間を定めて無線局の運用の停止を命じ、又は期間を定めて運用許容時間、周波数若しくは空中線電力を制限することができる。
２　規定による期限の延長があつたときは、その期限。
４　総務大臣は、免許人（包括免許人を除く。）が次の各号のいずれかに該当するときは、その免許を取り消すことができる。
  一　正当な理由がないのに、無線局の運用を引き続き六月以上休止したとき。
  二　第一号の規定による命令又は制限に従わないとき。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const getPointerEnvsResult = getPointerEnvs(sentenceEnvsStruct);

        const expectedPointerRangesList: JsonEL[] = [
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[2][num=76]-Paragraph[2][num=2]\"},{\"from\":\"container-Law-MainProvision[1]-Article[2][num=76]-Paragraph[3][num=4]\",\"exclude\":[{\"from\":\"container-Law-MainProvision[1]-Article[2][num=76]-Paragraph[3][num=4]-Item[1][num=1]\"}]}]",
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
                                            name: "第七十六条",
                                            num: "76",
                                        },
                                        children: ["第七十六条"],
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
                                            targetType: "Paragraph",
                                            name: "第四項",
                                            num: "4",
                                        },
                                        children: ["第四項"],
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
                                                attr: {
                                                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[2][num=76]-Paragraph[3][num=4]-Item[1][num=1]\"}]",
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
                                                                            targetType: "Item",
                                                                            name: "第一号",
                                                                            num: "1",
                                                                        },
                                                                        children: ["第一号"],
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
                                                children: ["を除く。"],
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
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[2][num=76]-Paragraph[3][num=4]-Item[1][num=1]\"}]",
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
                                            targetType: "Item",
                                            name: "第一号",
                                            num: "1",
                                        },
                                        children: ["第一号"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[1][num=5]-Paragraph[2][num=4]\"}]",
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
                                            targetType: "Paragraph",
                                            name: "第四項",
                                            num: "4",
                                        },
                                        children: ["第四項"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[2][num=76]-Paragraph[3][num=4]-Item[1][num=1]\"}]",
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
                                            targetType: "Item",
                                            name: "第一号",
                                            num: "1",
                                        },
                                        children: ["第一号"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];
        const expectedErrorMessages: string[] = [];

        [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        // console.log(JSON.stringify(getPointerEnvsResult.value.pointerRangesList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            getPointerEnvsResult.value.pointerRangesList.map(r => r.json(true)),
            expectedPointerRangesList,
        );

        assert.deepStrictEqual(getPointerEnvsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （免許の申請）
第六条　無線局の免許を受けようとする者は、申請書に、次に掲げる事項を記載した書類を添えて、総務大臣に提出しなければならない。
  四　無線設備の設置場所（移動する無線局のうち、次のイ又はロに掲げるものについては、それぞれイ又はロに定める事項。第十八条第一項を除き、以下同じ。）
    イ　人工衛星の無線局（以下「人工衛星局」という。）　その人工衛星の軌道又は位置
    ロ　人工衛星局、船舶の無線局（人工衛星局の中継によつてのみ無線通信を行うものを除く。第三項において同じ。）、船舶地球局（船舶に開設する無線局であつて、人工衛星局の中継によつてのみ無線通信を行うもの（実験等無線局及びアマチュア無線局を除く。）をいう。以下同じ。）、航空機の無線局（人工衛星局の中継によつてのみ無線通信を行うものを除く。第五項において同じ。）及び航空機地球局（航空機に開設する無線局であつて、人工衛星局の中継によつてのみ無線通信を行うもの（実験等無線局及びアマチュア無線局を除く。）をいう。以下同じ。）以外の無線局　移動範囲
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const getPointerEnvsResult = getPointerEnvs(sentenceEnvsStruct);

        const expectedPointerRangesList: JsonEL[] = [
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[1][num=6]-Paragraph[1][num=1]-Item[1][num=4]-Subitem1[1][num=1]\"},{\"from\":\"container-Law-MainProvision[1]-Article[1][num=6]-Paragraph[1][num=1]-Item[1][num=4]-Subitem1[2][num=2]\"}]",
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
                                            targetType: "SUBITEM",
                                            name: "イ",
                                            num: "1",
                                        },
                                        children: ["イ"],
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
                                            targetType: "SUBITEM",
                                            name: "ロ",
                                            num: "2",
                                        },
                                        children: ["ロ"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[1][num=6]-Paragraph[1][num=1]-Item[1][num=4]-Subitem1[1][num=1]\"},{\"from\":\"container-Law-MainProvision[1]-Article[1][num=6]-Paragraph[1][num=1]-Item[1][num=4]-Subitem1[2][num=2]\"}]",
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
                                            targetType: "SUBITEM",
                                            name: "イ",
                                            num: "1",
                                        },
                                        children: ["イ"],
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
                                            targetType: "SUBITEM",
                                            name: "ロ",
                                            num: "2",
                                        },
                                        children: ["ロ"],
                                    },
                                ],
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
                                            name: "第十八条",
                                            num: "18",
                                        },
                                        children: ["第十八条"],
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
                                            name: "第五項",
                                            num: "5",
                                        },
                                        children: ["第五項"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];
        const expectedErrorMessages: string[] = [];

        [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        // console.log(JSON.stringify(getPointerEnvsResult.value.pointerRangesList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            getPointerEnvsResult.value.pointerRangesList.map(r => r.json(true)),
            expectedPointerRangesList,
        );

        assert.deepStrictEqual(getPointerEnvsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （免許の承継等）
第二十条　免許人について相続があつたときは、その相続人は、免許人の地位を承継する。
２　免許人（第七項及び第八項に規定する無線局の免許人を除く。以下この項及び次項において同じ。）たる法人が合併又は分割（無線局をその用に供する事業の全部を承継させるものに限る。）をしたときは、合併後存続する法人若しくは合併により設立された法人又は分割により当該事業の全部を承継した法人は、総務大臣の許可を受けて免許人の地位を承継することができる。
３　免許人が無線局をその用に供する事業の全部の譲渡しをしたときは、譲受人は、総務大臣の許可を受けて免許人の地位を承継することができる。
４　特定地上基幹放送局の免許人たる法人が分割をした場合において、分割により当該基幹放送局を承継し、これを分割により地上基幹放送の業務を承継した他の法人の業務の用に供する業務を行おうとする法人が総務大臣の許可を受けたときは、当該法人が当該特定地上基幹放送局の免許人から当該業務に係る基幹放送局の免許人の地位を承継したものとみなす。特定地上基幹放送局の免許人が当該基幹放送局を譲渡し、譲受人が当該基幹放送局を譲渡人の地上基幹放送の業務の用に供する業務を行おうとする場合において、当該譲受人が総務大臣の許可を受けたとき、又は特定地上基幹放送局の免許人が地上基幹放送の業務を譲渡し、その譲渡人が当該基幹放送局を譲受人の地上基幹放送の業務の用に供する業務を行おうとする場合において、当該譲渡人が総務大臣の許可を受けたときも、同様とする。
５　他の地上基幹放送の業務の用に供する基幹放送局の免許人が当該地上基幹放送の業務を行う認定基幹放送事業者と合併をし、又は当該地上基幹放送の業務を行う事業を譲り受けた場合において、合併後存続する法人若しくは合併により設立された法人又は譲受人が総務大臣の許可を受けたときは、当該法人又は譲受人が当該基幹放送局の免許人から特定地上基幹放送局の免許人の地位を承継したものとみなす。地上基幹放送の業務を行う認定基幹放送事業者が当該地上基幹放送の業務の用に供する基幹放送局を譲り受けた場合において、総務大臣の許可を受けたときも、同様とする。
６　第五条及び第七条の規定は、第二項から前項までの許可について準用する。
７　船舶局若しくは船舶地球局（電気通信業務を行うことを目的とするものを除く。）のある船舶又は無線設備が遭難自動通報設備若しくはレーダーのみの無線局のある船舶について、船舶の所有権の移転その他の理由により船舶を運行する者に変更があつたときは、変更後船舶を運行する者は、免許人の地位を承継する。
８　前項の規定は、航空機局若しくは航空機地球局（電気通信業務を行うことを目的とするものを除く。）のある航空機又は無線設備がレーダーのみの無線局のある航空機について準用する。
９　第一項及び前二項の規定により免許人の地位を承継した者は、遅滞なく、その事実を証する書面を添えてその旨を総務大臣に届け出なければならない。
１０　前各項の規定は、第八条の予備免許を受けた者について準用する。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const getPointerEnvsResult = getPointerEnvs(sentenceEnvsStruct);

        const expectedPointerRangesList: JsonEL[] = [
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[7][num=7]\"},{\"from\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[8][num=8]\"}]",
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
                                            targetType: "Paragraph",
                                            name: "第七項",
                                            num: "7",
                                        },
                                        children: ["第七項"],
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
                                            targetType: "Paragraph",
                                            name: "第八項",
                                            num: "8",
                                        },
                                        children: ["第八項"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[2][num=2]\"},{\"from\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[3][num=3]\"}]",
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
                                            targetType: "Paragraph",
                                            name: "この項",
                                        },
                                        children: ["この項"],
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
                                            relPos: "NEXT",
                                            targetType: "Paragraph",
                                            name: "次項",
                                        },
                                        children: ["次項"],
                                    },
                                ],
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
                                            name: "第五条",
                                            num: "5",
                                        },
                                        children: ["第五条"],
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
                                            targetType: "Article",
                                            name: "第七条",
                                            num: "7",
                                        },
                                        children: ["第七条"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[2][num=2]\",\"to\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[5][num=5]\"}]",
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
                                            targetType: "Paragraph",
                                            name: "第二項",
                                            num: "2",
                                        },
                                        children: ["第二項"],
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
                                            targetType: "Paragraph",
                                            name: "前項",
                                        },
                                        children: ["前項"],
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
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[7][num=7]\"}]",
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
                                            relPos: "PREV",
                                            targetType: "Paragraph",
                                            name: "前項",
                                        },
                                        children: ["前項"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[1][num=1]\"},{\"from\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[7][num=7]\"},{\"from\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[8][num=8]\"}]",
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
                                            relPos: "PREV",
                                            targetType: "Paragraph",
                                            name: "前二項",
                                            count: "2",
                                        },
                                        children: ["前二項"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[1][num=1]\"},{\"from\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[2][num=2]\"},{\"from\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[3][num=3]\"},{\"from\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[4][num=4]\"},{\"from\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[5][num=5]\"},{\"from\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[6][num=6]\"},{\"from\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[7][num=7]\"},{\"from\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[8][num=8]\"},{\"from\":\"container-Law-MainProvision[1]-Article[1][num=20]-Paragraph[9][num=9]\"}]",
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
                                            relPos: "PREV",
                                            targetType: "Paragraph",
                                            name: "前各項",
                                            count: "all",
                                        },
                                        children: ["前各項"],
                                    },
                                ],
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
                                ],
                            },
                        ],
                    },
                ],
            },
        ];
        const expectedErrorMessages: string[] = [];

        [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        // console.log(JSON.stringify(getPointerEnvsResult.value.pointerRangesList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            getPointerEnvsResult.value.pointerRangesList.map(r => r.json(true)),
            expectedPointerRangesList,
        );

        assert.deepStrictEqual(getPointerEnvsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
第二十七条の五　次に掲げる事項（第三号に掲げる事項を除く。）及び無線設備の設置場所とすることができる区域。
  一　電波の型式及び周波数
  二　空中線電力
  三　指定無線局数（同時に開設されている特定無線局の数の上限をいう。以下同じ。）
  四　運用開始の期限（一以上の特定無線局の運用を最初に開始する期限をいう。）
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const getPointerEnvsResult = getPointerEnvs(sentenceEnvsStruct);

        const expectedPointerRangesList: JsonEL[] = [
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[1][num=27_5]-Paragraph[1][num=1]-Item[3][num=3]\"}]",
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
        ]
          ;
        const expectedErrorMessages: string[] = [];

        [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        // console.log(JSON.stringify(getPointerEnvsResult.value.pointerRangesList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            getPointerEnvsResult.value.pointerRangesList.map(r => r.json(true)),
            expectedPointerRangesList,
        );

        assert.deepStrictEqual(getPointerEnvsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
第四条の二　この場合において、当該無線設備については、適用しない。
２　この項の規定による届出（第二号及び第三号に掲げる事項を同じくするものに限る。）をしたことがある者については、この限りでない。
  一　氏名又は名称及び住所並びに法人にあつては、その代表者の氏名
  二　実験、試験又は調査の目的
  三　無線設備の規格
  四　無線設備の設置場所（移動する無線局にあつては、移動範囲）
  五　運用開始の予定期日
  六　その他総務省令で定める事項
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const getPointerEnvsResult = getPointerEnvs(sentenceEnvsStruct);

        const expectedPointerRangesList: JsonEL[] = [
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[1][num=4_2]-Paragraph[2][num=2]\"}]",
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
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[1][num=4_2]-Paragraph[2][num=2]-Item[2][num=2]\"},{\"from\":\"container-Law-MainProvision[1]-Article[1][num=4_2]-Paragraph[2][num=2]-Item[3][num=3]\"}]",
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
        ]
;
        const expectedErrorMessages: string[] = [];

        [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        // console.log(JSON.stringify(getPointerEnvsResult.value.pointerRangesList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            getPointerEnvsResult.value.pointerRangesList.map(r => r.json(true)),
            expectedPointerRangesList,
        );

        assert.deepStrictEqual(getPointerEnvsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
第二十四条の二　無線設備等の検査又は点検の事業を行う者は、総務大臣の登録を受けることができる。
２　前項の登録を受けようとする者は、総務省令で定めるところにより、次に掲げる事項を記載した申請書を総務大臣に提出しなければならない。
  一　氏名又は名称及び住所並びに法人にあつては、その代表者の氏名
  二　事務所の名称及び所在地
  三　点検に用いる測定器その他の設備の概要
  四　無線設備等の点検の事業のみを行う者にあつては、その旨

第二十四条の十　総務大臣は、登録検査等事業者が次の各号のいずれかに該当するときは、その登録を取り消し、又は期間を定めてその登録に係る検査又は点検の業務の全部若しくは一部の停止を命ずることができる。
  一　第二十四条の二第二項各号（第二号を除く。）のいずれかに該当するに至つたとき。
  二　規定に違反したとき。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const getPointerEnvsResult = getPointerEnvs(sentenceEnvsStruct);

        const expectedPointerRangesList: JsonEL[] = [
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[1][num=24_2]-Paragraph[1][num=1]\"}]",
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
                                            relPos: "PREV",
                                            targetType: "Paragraph",
                                            name: "前項",
                                        },
                                        children: ["前項"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[1][num=24_2]-Paragraph[2][num=2]\"}]",
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
                                            name: "第二十四条の二",
                                            num: "24_2",
                                        },
                                        children: ["第二十四条の二"],
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
                tag: "____PointerRanges",
                attr: {
                    targetContainerIDRanges: "[{\"from\":\"container-Law-MainProvision[1]-Article[1][num=24_2]-Paragraph[2][num=2]-Item[2][num=2]\"}]",
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
                ],
            },
        ]
          ;
        const expectedErrorMessages: string[] = [];

        [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));

        // console.log(JSON.stringify(getPointerEnvsResult.value.pointerRangesList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            getPointerEnvsResult.value.pointerRangesList.map(r => r.json(true)),
            expectedPointerRangesList,
        );

        assert.deepStrictEqual(getPointerEnvsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });
});
