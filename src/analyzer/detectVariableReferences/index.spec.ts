import { assert } from "chai";
import { JsonEL } from "../../node/el/jsonEL";
import detectTokens from "../detectTokens";
import getSentenceEnvs from "../getSentenceEnvs";
import detectDeclarations from "../detectDeclarations";
import { parse } from "../../parser/lawtext";
import detectVariableReferences from ".";
import { Declarations } from "../common/declarations";

describe("Test detectVariableReferences", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （文書等の閲覧）
第十八条　当事者及び当該不利益処分がされた場合に自己の利益を害されることとなる参加人（以下この条及び第二十四条第三項において「当事者等」という。）は、聴聞の通知があった時から聴聞が終結する時までの間、行政庁に対し、当該事案についてした調査の結果に係る調書その他の当該不利益処分の原因となる事実を証する資料の閲覧を求めることができる。この場合において、行政庁は、第三者の利益を害するおそれがあるときその他正当な理由があるときでなければ、その閲覧を拒むことができない。
２　前項の規定は、当事者等が聴聞の期日における審理の進行に応じて必要となった資料の閲覧を更に求めることを妨げない。
３　行政庁は、前二項の閲覧について日時及び場所を指定することができる。

  （聴聞調書及び報告書）
第二十四条　主宰者は、聴聞の審理の経過を記載した調書を作成し、当該調書において、不利益処分の原因となる事実に対する当事者及び参加人の陳述の要旨を明らかにしておかなければならない。
２　前項の調書は、聴聞の期日における審理が行われた場合には各期日ごとに、当該審理が行われなかった場合には聴聞の終結後速やかに作成しなければならない。
３　主宰者は、聴聞の終結後速やかに、不利益処分の原因となる事実に対する当事者等の主張に理由があるかどうかについての意見を記載した報告書を作成し、第一項の調書とともに行政庁に提出しなければならない。
４　当事者又は参加人は、第一項の調書及び前項の報告書の閲覧を求めることができる。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const detectTokensResult = detectTokens(sentenceEnvsStruct);
        void detectTokensResult;
        const declarations = new Declarations();
        for (const declaration of detectDeclarations(sentenceEnvsStruct).value) {
            // console.log(JSON.stringify(declaration.json(true), null, 2));
            declarations.add(declaration);
        }

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_58_62",
                    type: "Keyword",
                    name: "当事者等",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":63},\"end\":{\"sentenceIndex\":4,\"textOffset\":0}},{\"start\":{\"sentenceIndex\":0,\"textOffset\":63},\"end\":{\"sentenceIndex\":7,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":58},\"end\":{\"sentenceIndex\":0,\"textOffset\":62}}",
                },
                children: ["当事者等"],
            },

        ];

        const expected: JsonEL[] = [
            {
                tag: "____VarRef",
                attr: {
                    refName: "当事者等",
                    declarationID: "decl-sentence_0-text_58_62",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":2,\"textOffset\":7},\"end\":{\"sentenceIndex\":2,\"textOffset\":11}}",
                },
                children: ["当事者等"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "当事者等",
                    declarationID: "decl-sentence_0-text_58_62",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":6,\"textOffset\":33},\"end\":{\"sentenceIndex\":6,\"textOffset\":37}}",
                },
                children: ["当事者等"],
            },
        ] ;
        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations);

        // console.log(JSON.stringify(declarations.values().map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarations.values().map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify(result.value.varRefs.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.varRefs.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （定義）
第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  八　命令等　内閣又は行政機関が定める次に掲げるものをいう。
    イ　法律に基づく命令（処分の要件を定める告示を含む。次条第二項において単に「命令」という。）又は規則

第三条　次に掲げる処分及び行政指導については、次章から第四章の二までの規定は、適用しない。
２　次に掲げる命令等を定める行為については、第六章の規定は、適用しない。
  一　法律の施行期日について定める政令
  二　恩赦に関する命令
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const detectTokensResult = detectTokens(sentenceEnvsStruct);
        void detectTokensResult;
        const declarations = new Declarations();
        for (const declaration of detectDeclarations(sentenceEnvsStruct).value) {
            // console.log(JSON.stringify(declaration.json(true), null, 2));
            declarations.add(declaration);
        }

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_1-text_0_3",
                    type: "Keyword",
                    name: "命令等",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":8,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":0},\"end\":{\"sentenceIndex\":1,\"textOffset\":3}}",
                    value: "内閣又は行政機関が定める次に掲げるものをいう。",
                },
                children: ["命令等"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_3-text_36_38",
                    type: "Keyword",
                    name: "命令",
                    scope: "[{\"start\":{\"sentenceIndex\":5,\"textOffset\":0},\"end\":{\"sentenceIndex\":8,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":3,\"textOffset\":36},\"end\":{\"sentenceIndex\":3,\"textOffset\":38}}",
                },
                children: ["命令"],
            },
        ];

        const expected: JsonEL[] = [
            {
                tag: "____VarRef",
                attr: {
                    refName: "命令等",
                    declarationID: "decl-sentence_1-text_0_3",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":5,\"textOffset\":5},\"end\":{\"sentenceIndex\":5,\"textOffset\":8}}",
                },
                children: ["命令等"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "命令",
                    declarationID: "decl-sentence_3-text_36_38",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":7,\"textOffset\":6},\"end\":{\"sentenceIndex\":7,\"textOffset\":8}}",
                },
                children: ["命令"],
            },
        ]
          ;
        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations);

        // console.log(JSON.stringify(declarations.values().map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarations.values().map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify(result.value.varRefs.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.varRefs.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
      附　則　抄

  （施行期日）
１　この法律は、公布の日から起算して三十日を経過した日から施行する。

  （無線電信法の廃止）
２　無線電信法（大正四年法律第二十六号。以下「旧法」という。）は、廃止する。

  （旧法の罰則の適用）
４　この法律の施行前にした行為に対する罰則の適用については、旧法は、この法律施行後も、なおその効力を有する。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const detectTokensResult = detectTokens(sentenceEnvsStruct);
        void detectTokensResult;
        const declarations = new Declarations();
        for (const declaration of detectDeclarations(sentenceEnvsStruct).value) {
            // console.log(JSON.stringify(declaration.json(true), null, 2));
            declarations.add(declaration);
        }

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_1-text_21_23",
                    type: "LawName",
                    name: "旧法",
                    scope: "[{\"start\":{\"sentenceIndex\":1,\"textOffset\":17},\"end\":{\"sentenceIndex\":4,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":21},\"end\":{\"sentenceIndex\":1,\"textOffset\":23}}",
                    value: "大正四年法律第二十六号",
                },
                children: ["旧法"],
            },
        ];

        const expected: JsonEL[] = [
            {
                tag: "____VarRef",
                attr: {
                    refName: "旧法",
                    declarationID: "decl-sentence_1-text_21_23",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":2,\"textOffset\":28},\"end\":{\"sentenceIndex\":2,\"textOffset\":30}}",
                },
                children: ["旧法"],
            },
        ];
        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations);

        // console.log(JSON.stringify(declarations.values().map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarations.values().map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify(result.value.varRefs.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.varRefs.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （定義）
第二条　この法律及びこの法律に基づく命令の規定の解釈に関しては、次の定義に従うものとする。
  五　「無線局」とは、無線設備及び無線設備の操作を行う者の総体をいう。但し、受信のみを目的とするものを含まない。

      附　則　抄

  （無線電信法の廃止）
２　無線電信法（大正四年法律第二十六号。以下「旧法」という。）は、廃止する。

  （旧法の罰則の適用）
４　この法律の施行前にした行為に対する罰則の適用については、旧法は、この法律施行後も、なおその効力を有する。

  （無線従事者に関する経過規定）
５　この法律施行の際、現に無線通信士資格検定規則（昭和六年逓信省令第八号）の規定によつて第一級、第二級、第三級、電話級又は聴守員級の無線通信士の資格を有する者は、この法律施行の日に、それぞれこの法律の規定による第一級無線通信士、第二級無線通信士、第三級無線通信士、電話級無線通信士又は聴守員級無線通信士の免許を受けたものとみなす。

６　旧電気通信技術者資格検定規則（昭和十五年逓信省令第十三号）廃止の際（昭和二十四年六月一日）、現に同規則の規定によつて第一級若しくは第二級の電気通信技術者の資格又は第三級（無線）の電気通信技術者の資格を有していた者は、この法律施行の日に、それぞれこの法律の規定による第一級無線技術士又は第二級無線技術士の免許を受けたものとみなす。

  （この法律の施行前になした処分等）
９　第五項又は第六項に規定するものの外、旧法又はこれに基く命令の規定に基く処分、手続その他の行為は、この法律中これに相当する規定があるときは、この法律によつてしたものとみなす。この場合において、無線局（船舶安全法第四条の船舶及び漁船の操業区域の制限に関する政令第五条の漁船の船舶無線電信局を除く。）の免許の有効期間は、第十三条第一項の規定にかかわらず、この法律施行の日から起算して一年以上三年以内において無線局の種別ごとに郵政省令で定める期間とする。

  （電報の事業に関する経過措置）
１３　電気通信事業法附則第五条第一項の規定により電報の事業が電気通信事業とみなされる間は、第二十七条の三十五第一項、第百二条の二第一項第一号及び第百八条の二第一項に規定する電気通信業務には、当該電報の事業に係る業務が含まれるものとする。

      附　則　（昭和六二年六月二日法律第五五号）　抄

  （施行期日）
１　この法律は、公布の日から起算して六月を超えない範囲内において政令で定める日から施行する。ただし、第十三条の改正規定及び附則第四項の規定は、公布の日から施行する。

  （経過措置）
２　この法律の施行の際現に免許を受けている無線局のうち、改正後の電波法（以下「新法」という。）第四条第三号の郵政省令で定める無線局に該当するものの無線設備は、この法律の施行の日に、新法第三十八条の二第一項の規定による技術基準適合証明を受け、かつ、新法第四条の二第一項の規定による呼出符号又は呼出名称の指定を受けたものとみなす。

３　前項の無線局の免許は、この法律の施行の日に、その効力を失う。

４　第十三条の改正規定の施行の際現に新法第十三条第二項の無線局の免許を受けている者は、当該無線局の免許状に記載された免許の有効期間に関する事項については、新法第二十一条の規定による訂正を受けることを要しない。

５　この法律の施行前にした行為に対する罰則の適用については、なお従前の例による。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const detectTokensResult = detectTokens(sentenceEnvsStruct);
        void detectTokensResult;
        const declarations = new Declarations();
        for (const declaration of detectDeclarations(sentenceEnvsStruct).value) {
            // console.log(JSON.stringify(declaration.json(true), null, 2));
            declarations.add(declaration);
        }

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_5-text_NaN_22",
                    type: "LawName",
                    name: "施行の際、現に無線通信士資格検定規則",
                    scope: "[{\"start\":{\"sentenceIndex\":5,\"textOffset\":34},\"end\":{\"sentenceIndex\":11,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":5,\"textOffset\":null},\"end\":{\"sentenceIndex\":5,\"textOffset\":22}}",
                    value: "昭和六年逓信省令第八号",
                },
                children: ["施行の際、現に無線通信士資格検定規則"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_6-text_NaN_14",
                    type: "LawName",
                    name: "旧電気通信技術者資格検定規則",
                    scope: "[{\"start\":{\"sentenceIndex\":6,\"textOffset\":28},\"end\":{\"sentenceIndex\":11,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":6,\"textOffset\":null},\"end\":{\"sentenceIndex\":6,\"textOffset\":14}}",
                    value: "昭和十五年逓信省令第十三号",
                },
                children: ["旧電気通信技術者資格検定規則"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_1-text_1_4",
                    type: "Keyword",
                    name: "無線局",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":10,\"textOffset\":0}},{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":10,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":1},\"end\":{\"sentenceIndex\":1,\"textOffset\":4}}",
                    value: "無線設備及び無線設備の操作を行う者の総体",
                },
                children: ["無線局"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_3-text_21_23",
                    type: "LawName",
                    name: "旧法",
                    scope: "[{\"start\":{\"sentenceIndex\":3,\"textOffset\":17},\"end\":{\"sentenceIndex\":11,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":3,\"textOffset\":21},\"end\":{\"sentenceIndex\":3,\"textOffset\":23}}",
                    value: "大正四年法律第二十六号",
                },
                children: ["旧法"],
            },
        ]
          ;

        const expected: JsonEL[] = [
            {
                tag: "____VarRef",
                attr: {
                    refName: "旧法",
                    declarationID: "decl-sentence_3-text_21_23",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":4,\"textOffset\":28},\"end\":{\"sentenceIndex\":4,\"textOffset\":30}}",
                },
                children: ["旧法"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "旧法",
                    declarationID: "decl-sentence_3-text_21_23",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":7,\"textOffset\":18},\"end\":{\"sentenceIndex\":7,\"textOffset\":20}}",
                },
                children: ["旧法"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "無線局",
                    declarationID: "decl-sentence_1-text_1_4",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":8,\"textOffset\":9},\"end\":{\"sentenceIndex\":8,\"textOffset\":12}}",
                },
                children: ["無線局"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "無線局",
                    declarationID: "decl-sentence_1-text_1_4",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":8,\"textOffset\":114},\"end\":{\"sentenceIndex\":8,\"textOffset\":117}}",
                },
                children: ["無線局"],
            },
        ];
        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations);

        // console.log(JSON.stringify(declarations.values().map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarations.values().map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify(result.value.varRefs.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            result.value.varRefs.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);
    });
});
