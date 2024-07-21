import { assert } from "chai";
import type { JsonEL } from "../../node/el/jsonEL";
import getSentenceEnvs from "../getSentenceEnvs";
import detectDeclarations from "../detectDeclarations";
import { parse } from "../../parser/lawtext";
import detectVariableReferences from ".";
import { assertELVaridity } from "../../parser/std/testHelper";
import getPointerEnvs from "../pointerEnvs/getPointerEnvs";
import getScope from "../pointerEnvs/getScope";

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
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_58_62",
                    type: "Keyword",
                    name: "当事者等",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":63},\"end\":{\"sentenceIndex\":4,\"textOffset\":0}},{\"start\":{\"sentenceIndex\":6,\"textOffset\":0},\"end\":{\"sentenceIndex\":7,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":58},\"end\":{\"sentenceIndex\":0,\"textOffset\":62}}",
                    value: "{\"isCandidate\":true,\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":0,\"textOffset\":40}}}",
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

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        const varRefs = result.value.varRefs.sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(varRefs.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            varRefs.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
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
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_1-text_0_3",
                    type: "Keyword",
                    name: "命令等",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":8,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":0},\"end\":{\"sentenceIndex\":1,\"textOffset\":3}}",
                    value: "{\"isCandidate\":false,\"text\":\"内閣又は行政機関が定める次に掲げるもの\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":2,\"textOffset\":0},\"end\":{\"sentenceIndex\":2,\"textOffset\":19}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["命令等"],
                    },
                ],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_3-text_36_38",
                    type: "Keyword",
                    name: "命令",
                    scope: "[{\"start\":{\"sentenceIndex\":5,\"textOffset\":0},\"end\":{\"sentenceIndex\":8,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":3,\"textOffset\":36},\"end\":{\"sentenceIndex\":3,\"textOffset\":38}}",
                    value: "{\"isCandidate\":true,\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":3,\"textOffset\":0},\"end\":{\"sentenceIndex\":3,\"textOffset\":24}}}",
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

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        const varRefs = result.value.varRefs.sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(varRefs.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            varRefs.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
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
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_1-text_21_23",
                    type: "LawTitle",
                    name: "旧法",
                    scope: "[{\"start\":{\"sentenceIndex\":1,\"textOffset\":24},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":21},\"end\":{\"sentenceIndex\":1,\"textOffset\":23}}",
                    value: "{\"isCandidate\":false,\"text\":\"大正四年法律第二十六号\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":1,\"textOffset\":6},\"end\":{\"sentenceIndex\":1,\"textOffset\":17}}}",
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

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        const varRefs = result.value.varRefs.sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(varRefs.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            varRefs.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
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
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_1-text_1_4",
                    type: "Keyword",
                    name: "無線局",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":10,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":1},\"end\":{\"sentenceIndex\":1,\"textOffset\":4}}",
                    value: "{\"isCandidate\":false,\"text\":\"無線設備及び無線設備の操作を行う者の総体\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":1,\"textOffset\":8},\"end\":{\"sentenceIndex\":1,\"textOffset\":28}}}",
                },
                children: ["無線局"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_3-text_21_23",
                    type: "LawTitle",
                    name: "旧法",
                    scope: "[{\"start\":{\"sentenceIndex\":3,\"textOffset\":24},\"end\":{\"sentenceIndex\":10,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":3,\"textOffset\":21},\"end\":{\"sentenceIndex\":3,\"textOffset\":23}}",
                    value: "{\"isCandidate\":false,\"text\":\"大正四年法律第二十六号\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":3,\"textOffset\":6},\"end\":{\"sentenceIndex\":3,\"textOffset\":17}}}",
                },
                children: ["旧法"],
            },
        ];

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

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        const varRefs = result.value.varRefs.sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(varRefs.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            varRefs.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （目的等）
第一条　この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。
２　処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。

  （定義）
第二条　この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  一　法令　法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。
  二　処分　行政庁の処分その他公権力の行使に当たる行為をいう。
  三　申請　法令に基づき、行政庁の許可、認可、免許その他の自己に対し何らかの利益を付与する処分（以下「許認可等」という。）を求める行為であって、当該行為に対して行政庁が諾否の応答をすべきこととされているものをいう。
  四　不利益処分　行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。ただし、次のいずれかに該当するものを除く。
    イ　事実上の行為及び事実上の行為をするに当たりその範囲、時期等を明らかにするために法令上必要とされている手続としての処分
    ロ　申請により求められた許認可等を拒否する処分その他申請に基づき当該申請をした者を名あて人としてされる処分
    ハ　名あて人となるべき者の同意の下にすることとされている処分
    ニ　許認可等の効力を失わせる処分であって、当該許認可等の基礎となった事実が消滅した旨の届出があったことを理由としてされるもの
  五　行政機関　次に掲げる機関をいう。
    イ　法律の規定に基づき内閣に置かれる機関若しくは内閣の所轄の下に置かれる機関、宮内庁、内閣府設置法（平成十一年法律第八十九号）第四十九条第一項若しくは第二項に規定する機関、国家行政組織法（昭和二十三年法律第百二十号）第三条第二項に規定する機関、会計検査院若しくはこれらに置かれる機関又はこれらの機関の職員であって法律上独立に権限を行使することを認められた職員
    ロ　地方公共団体の機関（議会を除く。）
  六　行政指導　行政機関がその任務又は所掌事務の範囲内において一定の行政目的を実現するため特定の者に一定の作為又は不作為を求める指導、勧告、助言その他の行為であって処分に該当しないものをいう。
  七　届出　行政庁に対し一定の事項の通知をする行為（申請に該当するものを除く。）であって、法令により直接に当該通知が義務付けられているもの（自己の期待する一定の法律上の効果を発生させるためには当該通知をすべきこととされているものを含む。）をいう。
  八　命令等　内閣又は行政機関が定める次に掲げるものをいう。
    イ　法律に基づく命令（処分の要件を定める告示を含む。次条第二項において単に「命令」という。）又は規則
    ロ　審査基準（申請により求められた許認可等をするかどうかをその法令の定めに従って判断するために必要とされる基準をいう。以下同じ。）
    ハ　処分基準（不利益処分をするかどうか又はどのような不利益処分とするかについてその法令の定めに従って判断するために必要とされる基準をいう。以下同じ。）
    ニ　行政指導指針（同一の行政目的を実現するため一定の条件に該当する複数の者に対し行政指導をしようとするときにこれらの行政指導に共通してその内容となるべき事項をいう。以下同じ。）
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_70_73",
                    type: "Keyword",
                    name: "透明性",
                    scope: "[]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":70},\"end\":{\"sentenceIndex\":0,\"textOffset\":73}}",
                    value: "{\"isCandidate\":true,\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":0,\"textOffset\":74},\"end\":{\"sentenceIndex\":0,\"textOffset\":114}}}",
                },
                children: ["透明性"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_3-text_0_2",
                    type: "Keyword",
                    name: "法令",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":30,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":3,\"textOffset\":0},\"end\":{\"sentenceIndex\":3,\"textOffset\":2}}",
                    value: "{\"isCandidate\":false,\"text\":\"法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":4,\"textOffset\":0},\"end\":{\"sentenceIndex\":4,\"textOffset\":56}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["法令"],
                    },
                ],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_4-text_48_50",
                    type: "Keyword",
                    name: "規則",
                    scope: "[{\"start\":{\"sentenceIndex\":4,\"textOffset\":51},\"end\":{\"sentenceIndex\":30,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":4,\"textOffset\":48},\"end\":{\"sentenceIndex\":4,\"textOffset\":50}}",
                    value: "{\"isCandidate\":true,\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":4,\"textOffset\":0},\"end\":{\"sentenceIndex\":4,\"textOffset\":47}}}",
                },
                children: ["規則"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_5-text_0_2",
                    type: "Keyword",
                    name: "処分",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":30,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":5,\"textOffset\":0},\"end\":{\"sentenceIndex\":5,\"textOffset\":2}}",
                    value: "{\"isCandidate\":false,\"text\":\"行政庁の処分その他公権力の行使に当たる行為\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":6,\"textOffset\":0},\"end\":{\"sentenceIndex\":6,\"textOffset\":21}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["処分"],
                    },
                ],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_7-text_0_2",
                    type: "Keyword",
                    name: "申請",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":30,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":7,\"textOffset\":0},\"end\":{\"sentenceIndex\":7,\"textOffset\":2}}",
                    value: "{\"isCandidate\":false,\"text\":\"法令に基づき、行政庁の許可、認可、免許その他の自己に対し何らかの利益を付与する処分（以下「許認可等」という。）を求める行為であって、当該行為に対して行政庁が諾否の応答をすべきこととされているもの\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":8,\"textOffset\":0},\"end\":{\"sentenceIndex\":8,\"textOffset\":97}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["申請"],
                    },
                ],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_8-text_45_49",
                    type: "Keyword",
                    name: "許認可等",
                    scope: "[{\"start\":{\"sentenceIndex\":8,\"textOffset\":50},\"end\":{\"sentenceIndex\":30,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":8,\"textOffset\":45},\"end\":{\"sentenceIndex\":8,\"textOffset\":49}}",
                    value: "{\"isCandidate\":true,\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":8,\"textOffset\":0},\"end\":{\"sentenceIndex\":8,\"textOffset\":44}}}",
                },
                children: ["許認可等"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_9-text_0_5",
                    type: "Keyword",
                    name: "不利益処分",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":30,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":9,\"textOffset\":0},\"end\":{\"sentenceIndex\":9,\"textOffset\":5}}",
                    value: "{\"isCandidate\":false,\"text\":\"行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。,ただし、次のいずれかに該当するものを除く。\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":10,\"textOffset\":0},\"end\":{\"sentenceIndex\":11,\"textOffset\":21}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["不利益処分"],
                    },
                ],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_16-text_0_4",
                    type: "Keyword",
                    name: "行政機関",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":30,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":16,\"textOffset\":0},\"end\":{\"sentenceIndex\":16,\"textOffset\":4}}",
                    value: "{\"isCandidate\":false,\"text\":\"次に掲げる機関\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":17,\"textOffset\":0},\"end\":{\"sentenceIndex\":17,\"textOffset\":7}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["行政機関"],
                    },
                ],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_18-text_41_47",
                    type: "LawTitle",
                    name: "内閣府設置法",
                    scope: "[{\"start\":{\"sentenceIndex\":18,\"textOffset\":60},\"end\":{\"sentenceIndex\":31,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":18,\"textOffset\":41},\"end\":{\"sentenceIndex\":18,\"textOffset\":47}}",
                    value: "{\"isCandidate\":false,\"text\":\"平成十一年法律第八十九号\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":18,\"textOffset\":48},\"end\":{\"sentenceIndex\":18,\"textOffset\":60}}}",
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
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_18-text_84_91",
                    type: "LawTitle",
                    name: "国家行政組織法",
                    scope: "[{\"start\":{\"sentenceIndex\":18,\"textOffset\":105},\"end\":{\"sentenceIndex\":31,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":18,\"textOffset\":84},\"end\":{\"sentenceIndex\":18,\"textOffset\":91}}",
                    value: "{\"isCandidate\":false,\"text\":\"昭和二十三年法律第百二十号\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":18,\"textOffset\":92},\"end\":{\"sentenceIndex\":18,\"textOffset\":105}}}",
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
                    declarationID: "decl-sentence_20-text_0_4",
                    type: "Keyword",
                    name: "行政指導",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":30,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":20,\"textOffset\":0},\"end\":{\"sentenceIndex\":20,\"textOffset\":4}}",
                    value: "{\"isCandidate\":false,\"text\":\"行政機関がその任務又は所掌事務の範囲内において一定の行政目的を実現するため特定の者に一定の作為又は不作為を求める指導、勧告、助言その他の行為であって処分に該当しないもの\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":21,\"textOffset\":0},\"end\":{\"sentenceIndex\":21,\"textOffset\":84}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["行政指導"],
                    },
                ],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_22-text_0_2",
                    type: "Keyword",
                    name: "届出",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":30,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":22,\"textOffset\":0},\"end\":{\"sentenceIndex\":22,\"textOffset\":2}}",
                    value: "{\"isCandidate\":false,\"text\":\"行政庁に対し一定の事項の通知をする行為（申請に該当するものを除く。）であって、法令により直接に当該通知が義務付けられているもの（自己の期待する一定の法律上の効果を発生させるためには当該通知をすべきこととされているものを含む。）\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":23,\"textOffset\":0},\"end\":{\"sentenceIndex\":23,\"textOffset\":113}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["届出"],
                    },
                ],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_24-text_0_3",
                    type: "Keyword",
                    name: "命令等",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":30,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":24,\"textOffset\":0},\"end\":{\"sentenceIndex\":24,\"textOffset\":3}}",
                    value: "{\"isCandidate\":false,\"text\":\"内閣又は行政機関が定める次に掲げるもの\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":25,\"textOffset\":0},\"end\":{\"sentenceIndex\":25,\"textOffset\":19}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["命令等"],
                    },
                ],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_26-text_36_38",
                    type: "Keyword",
                    name: "命令",
                    scope: "[]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":26,\"textOffset\":36},\"end\":{\"sentenceIndex\":26,\"textOffset\":38}}",
                    value: "{\"isCandidate\":true,\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":26,\"textOffset\":0},\"end\":{\"sentenceIndex\":26,\"textOffset\":24}}}",
                },
                children: ["命令"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_27-text_0_4",
                    type: "Keyword",
                    name: "審査基準",
                    scope: "[{\"start\":{\"sentenceIndex\":27,\"textOffset\":62},\"end\":{\"sentenceIndex\":30,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":27,\"textOffset\":0},\"end\":{\"sentenceIndex\":27,\"textOffset\":4}}",
                    value: "{\"isCandidate\":true,\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":27,\"textOffset\":5},\"end\":{\"sentenceIndex\":27,\"textOffset\":62}}}",
                },
                children: ["審査基準"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_28-text_0_4",
                    type: "Keyword",
                    name: "処分基準",
                    scope: "[{\"start\":{\"sentenceIndex\":28,\"textOffset\":72},\"end\":{\"sentenceIndex\":30,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":28,\"textOffset\":0},\"end\":{\"sentenceIndex\":28,\"textOffset\":4}}",
                    value: "{\"isCandidate\":true,\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":28,\"textOffset\":5},\"end\":{\"sentenceIndex\":28,\"textOffset\":72}}}",
                },
                children: ["処分基準"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_29-text_0_6",
                    type: "Keyword",
                    name: "行政指導指針",
                    scope: "[{\"start\":{\"sentenceIndex\":29,\"textOffset\":85},\"end\":{\"sentenceIndex\":30,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":29,\"textOffset\":0},\"end\":{\"sentenceIndex\":29,\"textOffset\":6}}",
                    value: "{\"isCandidate\":true,\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":29,\"textOffset\":7},\"end\":{\"sentenceIndex\":29,\"textOffset\":85}}}",
                },
                children: ["行政指導指針"],
            },
        ];

        const expected: JsonEL[] = [
            {
                tag: "____VarRef",
                attr: {
                    refName: "処分",
                    declarationID: "decl-sentence_5-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":6},\"end\":{\"sentenceIndex\":0,\"textOffset\":8}}",
                },
                children: ["処分"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "行政指導",
                    declarationID: "decl-sentence_20-text_0_4",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":9},\"end\":{\"sentenceIndex\":0,\"textOffset\":13}}",
                },
                children: ["行政指導"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "届出",
                    declarationID: "decl-sentence_22-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":15},\"end\":{\"sentenceIndex\":0,\"textOffset\":17}}",
                },
                children: ["届出"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "命令等",
                    declarationID: "decl-sentence_24-text_0_3",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":26},\"end\":{\"sentenceIndex\":0,\"textOffset\":29}}",
                },
                children: ["命令等"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "処分",
                    declarationID: "decl-sentence_5-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":0},\"end\":{\"sentenceIndex\":1,\"textOffset\":2}}",
                },
                children: ["処分"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "行政指導",
                    declarationID: "decl-sentence_20-text_0_4",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":3},\"end\":{\"sentenceIndex\":1,\"textOffset\":7}}",
                },
                children: ["行政指導"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "届出",
                    declarationID: "decl-sentence_22-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":9},\"end\":{\"sentenceIndex\":1,\"textOffset\":11}}",
                },
                children: ["届出"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "命令等",
                    declarationID: "decl-sentence_24-text_0_3",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":20},\"end\":{\"sentenceIndex\":1,\"textOffset\":23}}",
                },
                children: ["命令等"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "処分",
                    declarationID: "decl-sentence_5-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":6,\"textOffset\":4},\"end\":{\"sentenceIndex\":6,\"textOffset\":6}}",
                },
                children: ["処分"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "法令",
                    declarationID: "decl-sentence_3-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":8,\"textOffset\":0},\"end\":{\"sentenceIndex\":8,\"textOffset\":2}}",
                },
                children: ["法令"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "処分",
                    declarationID: "decl-sentence_5-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":8,\"textOffset\":39},\"end\":{\"sentenceIndex\":8,\"textOffset\":41}}",
                },
                children: ["処分"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "法令",
                    declarationID: "decl-sentence_3-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":10,\"textOffset\":5},\"end\":{\"sentenceIndex\":10,\"textOffset\":7}}",
                },
                children: ["法令"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "処分",
                    declarationID: "decl-sentence_5-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":10,\"textOffset\":49},\"end\":{\"sentenceIndex\":10,\"textOffset\":51}}",
                },
                children: ["処分"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "法令",
                    declarationID: "decl-sentence_3-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":12,\"textOffset\":39},\"end\":{\"sentenceIndex\":12,\"textOffset\":41}}",
                },
                children: ["法令"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "処分",
                    declarationID: "decl-sentence_5-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":12,\"textOffset\":56},\"end\":{\"sentenceIndex\":12,\"textOffset\":58}}",
                },
                children: ["処分"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "申請",
                    declarationID: "decl-sentence_7-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":13,\"textOffset\":0},\"end\":{\"sentenceIndex\":13,\"textOffset\":2}}",
                },
                children: ["申請"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "許認可等",
                    declarationID: "decl-sentence_8-text_45_49",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":13,\"textOffset\":10},\"end\":{\"sentenceIndex\":13,\"textOffset\":14}}",
                },
                children: ["許認可等"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "処分",
                    declarationID: "decl-sentence_5-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":13,\"textOffset\":19},\"end\":{\"sentenceIndex\":13,\"textOffset\":21}}",
                },
                children: ["処分"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "申請",
                    declarationID: "decl-sentence_7-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":13,\"textOffset\":24},\"end\":{\"sentenceIndex\":13,\"textOffset\":26}}",
                },
                children: ["申請"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "申請",
                    declarationID: "decl-sentence_7-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":13,\"textOffset\":32},\"end\":{\"sentenceIndex\":13,\"textOffset\":34}}",
                },
                children: ["申請"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "処分",
                    declarationID: "decl-sentence_5-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":13,\"textOffset\":49},\"end\":{\"sentenceIndex\":13,\"textOffset\":51}}",
                },
                children: ["処分"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "処分",
                    declarationID: "decl-sentence_5-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":14,\"textOffset\":26},\"end\":{\"sentenceIndex\":14,\"textOffset\":28}}",
                },
                children: ["処分"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "許認可等",
                    declarationID: "decl-sentence_8-text_45_49",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":15,\"textOffset\":0},\"end\":{\"sentenceIndex\":15,\"textOffset\":4}}",
                },
                children: ["許認可等"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "処分",
                    declarationID: "decl-sentence_5-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":15,\"textOffset\":12},\"end\":{\"sentenceIndex\":15,\"textOffset\":14}}",
                },
                children: ["処分"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "許認可等",
                    declarationID: "decl-sentence_8-text_45_49",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":15,\"textOffset\":21},\"end\":{\"sentenceIndex\":15,\"textOffset\":25}}",
                },
                children: ["許認可等"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "届出",
                    declarationID: "decl-sentence_22-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":15,\"textOffset\":41},\"end\":{\"sentenceIndex\":15,\"textOffset\":43}}",
                },
                children: ["届出"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "行政機関",
                    declarationID: "decl-sentence_16-text_0_4",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":21,\"textOffset\":0},\"end\":{\"sentenceIndex\":21,\"textOffset\":4}}",
                },
                children: ["行政機関"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "処分",
                    declarationID: "decl-sentence_5-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":21,\"textOffset\":74},\"end\":{\"sentenceIndex\":21,\"textOffset\":76}}",
                },
                children: ["処分"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "申請",
                    declarationID: "decl-sentence_7-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":23,\"textOffset\":20},\"end\":{\"sentenceIndex\":23,\"textOffset\":22}}",
                },
                children: ["申請"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "法令",
                    declarationID: "decl-sentence_3-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":23,\"textOffset\":39},\"end\":{\"sentenceIndex\":23,\"textOffset\":41}}",
                },
                children: ["法令"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "行政機関",
                    declarationID: "decl-sentence_16-text_0_4",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":25,\"textOffset\":4},\"end\":{\"sentenceIndex\":25,\"textOffset\":8}}",
                },
                children: ["行政機関"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "処分",
                    declarationID: "decl-sentence_5-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":26,\"textOffset\":9},\"end\":{\"sentenceIndex\":26,\"textOffset\":11}}",
                },
                children: ["処分"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "規則",
                    declarationID: "decl-sentence_4-text_48_50",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":26,\"textOffset\":46},\"end\":{\"sentenceIndex\":26,\"textOffset\":48}}",
                },
                children: ["規則"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "申請",
                    declarationID: "decl-sentence_7-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":27,\"textOffset\":5},\"end\":{\"sentenceIndex\":27,\"textOffset\":7}}",
                },
                children: ["申請"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "許認可等",
                    declarationID: "decl-sentence_8-text_45_49",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":27,\"textOffset\":15},\"end\":{\"sentenceIndex\":27,\"textOffset\":19}}",
                },
                children: ["許認可等"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "法令",
                    declarationID: "decl-sentence_3-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":27,\"textOffset\":29},\"end\":{\"sentenceIndex\":27,\"textOffset\":31}}",
                },
                children: ["法令"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "不利益処分",
                    declarationID: "decl-sentence_9-text_0_5",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":28,\"textOffset\":5},\"end\":{\"sentenceIndex\":28,\"textOffset\":10}}",
                },
                children: ["不利益処分"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "不利益処分",
                    declarationID: "decl-sentence_9-text_0_5",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":28,\"textOffset\":24},\"end\":{\"sentenceIndex\":28,\"textOffset\":29}}",
                },
                children: ["不利益処分"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "法令",
                    declarationID: "decl-sentence_3-text_0_2",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":28,\"textOffset\":39},\"end\":{\"sentenceIndex\":28,\"textOffset\":41}}",
                },
                children: ["法令"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "行政指導",
                    declarationID: "decl-sentence_20-text_0_4",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":29,\"textOffset\":38},\"end\":{\"sentenceIndex\":29,\"textOffset\":42}}",
                },
                children: ["行政指導"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "行政指導",
                    declarationID: "decl-sentence_20-text_0_4",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":29,\"textOffset\":56},\"end\":{\"sentenceIndex\":29,\"textOffset\":60}}",
                },
                children: ["行政指導"],
            },
        ];
        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        const varRefs = result.value.varRefs.sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(varRefs.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            varRefs.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
第二条　この法律（第四条を除く。）において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。
  八　命令等　内閣又は行政機関が定める次に掲げるものをいう。

第三条　次に掲げる命令等を定める行為については、適用しない。

第四条　次に掲げる命令等を定める行為については、適用しない。

第五条　次に掲げる命令等を定める行為については、適用しない。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_1-text_0_3",
                    type: "Keyword",
                    name: "命令等",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":4,\"textOffset\":0}},{\"start\":{\"sentenceIndex\":5,\"textOffset\":0},\"end\":{\"sentenceIndex\":6,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":0},\"end\":{\"sentenceIndex\":1,\"textOffset\":3}}",
                    value: "{\"isCandidate\":false,\"text\":\"内閣又は行政機関が定める次に掲げるもの\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":2,\"textOffset\":0},\"end\":{\"sentenceIndex\":2,\"textOffset\":19}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["命令等"],
                    },
                ],
            },
        ];

        const expected: JsonEL[] = [
            {
                tag: "____VarRef",
                attr: {
                    refName: "命令等",
                    declarationID: "decl-sentence_1-text_0_3",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":3,\"textOffset\":5},\"end\":{\"sentenceIndex\":3,\"textOffset\":8}}",
                },
                children: ["命令等"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "命令等",
                    declarationID: "decl-sentence_1-text_0_3",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":5,\"textOffset\":5},\"end\":{\"sentenceIndex\":5,\"textOffset\":8}}",
                },
                children: ["命令等"],
            },
        ]
          ;
        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        const varRefs = result.value.varRefs.sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(varRefs.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            varRefs.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

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
３　前項の規定による届出があつたときは、当該届出に係る同項の実験等無線局に使用される同項の無線設備は、適合表示無線設備でない場合であつても、前条第三号の規定の適用については、当該届出の日から同日以後百八十日を超えない範囲内で総務省令で定める期間を経過する日又は当該実験等無線局を廃止した日のいずれか早い日までの間に限り、適合表示無線設備とみなす。（略）
４～７　（略）

      附　則　抄

１６　令和四年三月三十一日までの間における前項の規定により読み替えて適用する第百三条の二第四項の規定の適用については、同項中「十二の四　大規模な自然災害が発生した場合においても、地上基幹放送又は移動受信用地上基幹放送の業務に用いられる電気通信設備の損壊又は故障により当該業務に著しい支障を及ぼさないようにするために行われる当該電気通信設備（当該電気通信設備と一体として設置される総務省令で定める附属設備並びに当該電気通信設備及び当該附属設備を設置するために必要な工作物を含む。）の整備（放送法第百十一条第一項の総務省令で定める技術基準又は同法第百二十一条第一項の総務省令で定める技術基準に適合させるために行われるものを除く。）のための補助金の交付」とあるのは、「<QuoteStruct><Item Num="12_4"><ItemTitle>十二の四</ItemTitle><ItemSentence><Sentence>大規模な自然災害が発生した場合においても、地上基幹放送又は移動受信用地上基幹放送の業務に用いられる電気通信設備の損壊又は故障により当該業務に著しい支障を及ぼさないようにするために行われる当該電気通信設備（当該電気通信設備と一体として設置される総務省令で定める附属設備並びに当該電気通信設備及び当該附属設備を設置するために必要な工作物を含む。）の整備（放送法第百十一条第一項の総務省令で定める技術基準又は同法第百二十一条第一項の総務省令で定める技術基準に適合させるために行われるものを除く。）のための補助金の交付</Sentence></ItemSentence></Item><Item Num="12_5"><ItemTitle>十二の五</ItemTitle><ItemSentence><Sentence>電波法及び電気通信事業法の一部を改正する法律（平成二十九年法律第二十七号）附則第一条第一号に掲げる規定の施行の日の前日（以下この号において「基準日」という。）において設置されているイに掲げる衛星基幹放送（放送法第二条第十三号の衛星基幹放送をいう。以下この号において同じ。）の受信を目的とする受信設備（基準日において第三章に定める技術基準に適合していないものを除き、増幅器及び配線並びに分配器、接続子その他の配線のために必要な器具に限る。）であつて、ロに掲げる衛星基幹放送の電波を受けるための空中線を接続した場合に当該技術基準に適合しないこととなるものについて、当該技術基準に適合させるために行われる改修のための補助金の交付その他の必要な援助</Sentence></ItemSentence><Subitem1 Num="1"><Subitem1Title>イ</Subitem1Title><Subitem1Sentence><Sentence>基準日において行われている衛星基幹放送であつて、基準日の翌日以後引き続き行われるもの（実験等無線局を用いて行われるものを除く。）</Sentence></Subitem1Sentence></Subitem1><Subitem1 Num="2"><Subitem1Title>ロ</Subitem1Title><Subitem1Sentence><Sentence>基準日の翌日以後にイに掲げる衛星基幹放送と同時に行われる衛星基幹放送であつて、イに掲げる衛星基幹放送に使用される電波と周波数が同一で、かつ、電界の回転の方向が反対である電波を使用して行われるもの</Sentence></Subitem1Sentence></Subitem1></Item></QuoteStruct>」とする。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_1-text_1_4",
                    type: "Keyword",
                    name: "無線局",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":11,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":1},\"end\":{\"sentenceIndex\":1,\"textOffset\":4}}",
                    value: "{\"isCandidate\":false,\"text\":\"無線設備及び無線設備の操作を行う者の総体\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":1,\"textOffset\":8},\"end\":{\"sentenceIndex\":1,\"textOffset\":28}}}",
                },
                children: ["無線局"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_4-text_51_57",
                    type: "Keyword",
                    name: "実験等無線局",
                    scope: "[{\"start\":{\"sentenceIndex\":4,\"textOffset\":124},\"end\":{\"sentenceIndex\":11,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":4,\"textOffset\":51},\"end\":{\"sentenceIndex\":4,\"textOffset\":57}}",
                    value: "{\"isCandidate\":true,\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":4,\"textOffset\":58},\"end\":{\"sentenceIndex\":4,\"textOffset\":124}}}",
                },
                children: ["実験等無線局"],
            },
        ]
          ;

        const expected: JsonEL[] = [
            {
                tag: "____VarRef",
                attr: {
                    refName: "無線局",
                    declarationID: "decl-sentence_1-text_1_4",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":4,\"textOffset\":112},\"end\":{\"sentenceIndex\":4,\"textOffset\":115}}",
                },
                children: ["無線局"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "無線局",
                    declarationID: "decl-sentence_1-text_1_4",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":4,\"textOffset\":140},\"end\":{\"sentenceIndex\":4,\"textOffset\":143}}",
                },
                children: ["無線局"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "実験等無線局",
                    declarationID: "decl-sentence_4-text_51_57",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":7,\"textOffset\":28},\"end\":{\"sentenceIndex\":7,\"textOffset\":34}}",
                },
                children: ["実験等無線局"],
            },
            {
                tag: "____VarRef",
                attr: {
                    refName: "実験等無線局",
                    declarationID: "decl-sentence_4-text_51_57",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":7,\"textOffset\":130},\"end\":{\"sentenceIndex\":7,\"textOffset\":136}}",
                },
                children: ["実験等無線局"],
            },
        ];


        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        const varRefs = result.value.varRefs.sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(varRefs.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            varRefs.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });
});

describe("Test detectVariableReferences and PointerRanges with lawNum", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
第二条　法律の規定に基づき内閣に置かれる機関若しくは内閣の所轄の下に置かれる機関、宮内庁、内閣府設置法（平成十一年法律第八十九号）第四十九条第一項若しくは第二項に規定する機関、国家行政組織法（昭和二十三年法律第百二十号）第三条第二項に規定する機関、会計検査院若しくはこれらに置かれる機関又はこれらの機関の職員であって法律上独立に権限を行使することを認められた職員
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_41_47",
                    type: "LawTitle",
                    name: "内閣府設置法",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":60},\"end\":{\"sentenceIndex\":2,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":41},\"end\":{\"sentenceIndex\":0,\"textOffset\":47}}",
                    value: "{\"isCandidate\":false,\"text\":\"平成十一年法律第八十九号\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":0,\"textOffset\":48},\"end\":{\"sentenceIndex\":0,\"textOffset\":60}}}",
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
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_84_91",
                    type: "LawTitle",
                    name: "国家行政組織法",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":105},\"end\":{\"sentenceIndex\":2,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":84},\"end\":{\"sentenceIndex\":0,\"textOffset\":91}}",
                    value: "{\"isCandidate\":false,\"text\":\"昭和二十三年法律第百二十号\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":0,\"textOffset\":92},\"end\":{\"sentenceIndex\":0,\"textOffset\":105}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["国家行政組織法"],
                    },
                ],
            },
        ];

        const expectedPointerEnvsList: object[] = [
            {
                pointer: {
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
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "内閣府設置法",
                        lawNum: "平成十一年法律第八十九号",
                    },
                    fqPrefixFragments: [],
                    skipSameCount: 0,
                },
                prependedLawRef: {
                    suggestedLawTitle: "内閣府設置法",
                    lawNum: "平成十一年法律第八十九号",
                },
                namingParent: null,
                namingChildren: ["第二項"],
                seriesPrev: null,
                seriesNext: "第二項",
            },
            {
                pointer: {
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
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "内閣府設置法",
                        lawNum: "平成十一年法律第八十九号",
                    },
                    fqPrefixFragments: ["第四十九条"],
                    skipSameCount: 0,
                },
                prependedLawRef: null,
                namingParent: "第四十九条第一項",
                namingChildren: [],
                seriesPrev: "第四十九条第一項",
                seriesNext: "第三条第二項",
            },
            {
                pointer: {
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
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "国家行政組織法",
                        lawNum: "昭和二十三年法律第百二十号",
                    },
                    fqPrefixFragments: [],
                    skipSameCount: 0,
                },
                prependedLawRef: {
                    suggestedLawTitle: "国家行政組織法",
                    lawNum: "昭和二十三年法律第百二十号",
                },
                namingParent: null,
                namingChildren: [],
                seriesPrev: "第二項",
                seriesNext: null,
            },
        ];


        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify([...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()), null, 2));
        assert.deepStrictEqual(
            [...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()),
            expectedPointerEnvsList,
        );


        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
第二条　公務員（国家公務員法（昭和二十二年法律第百二十号）第二条第一項に規定する国家公務員及び地方公務員法（昭和二十五年法律第二百六十一号）第三条第一項に規定する地方公務員をいう。以下同じ。）又は公務員であった者に対してその職務又は身分に関してされる処分及び行政指導
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_0_3",
                    type: "Keyword",
                    name: "公務員",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":91},\"end\":{\"sentenceIndex\":1,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":0,\"textOffset\":3}}",
                    value: "{\"isCandidate\":true,\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":0,\"textOffset\":4},\"end\":{\"sentenceIndex\":0,\"textOffset\":91}}}",
                },
                children: ["公務員"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_4_10",
                    type: "LawTitle",
                    name: "国家公務員法",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":24},\"end\":{\"sentenceIndex\":2,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":4},\"end\":{\"sentenceIndex\":0,\"textOffset\":10}}",
                    value: "{\"isCandidate\":false,\"text\":\"昭和二十二年法律第百二十号\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":0,\"textOffset\":11},\"end\":{\"sentenceIndex\":0,\"textOffset\":24}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["国家公務員法"],
                    },
                ],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_0-text_43_49",
                    type: "LawTitle",
                    name: "地方公務員法",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":65},\"end\":{\"sentenceIndex\":2,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":0,\"textOffset\":43},\"end\":{\"sentenceIndex\":0,\"textOffset\":49}}",
                    value: "{\"isCandidate\":false,\"text\":\"昭和二十五年法律第二百六十一号\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":0,\"textOffset\":50},\"end\":{\"sentenceIndex\":0,\"textOffset\":65}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["地方公務員法"],
                    },
                ],
            },
        ];

        const expectedPointerEnvsList: object[] = [
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Article",
                                name: "第二条",
                                num: "2",
                            },
                            children: ["第二条"],
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
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "国家公務員法",
                        lawNum: "昭和二十二年法律第百二十号",
                    },
                    fqPrefixFragments: [],
                    skipSameCount: 0,
                },
                prependedLawRef: {
                    suggestedLawTitle: "国家公務員法",
                    lawNum: "昭和二十二年法律第百二十号",
                },
                namingParent: null,
                namingChildren: [],
                seriesPrev: null,
                seriesNext: "第三条第一項",
            },
            {
                pointer: {
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
                                name: "第一項",
                                num: "1",
                            },
                            children: ["第一項"],
                        },
                    ],
                },
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "地方公務員法",
                        lawNum: "昭和二十五年法律第二百六十一号",
                    },
                    fqPrefixFragments: [],
                    skipSameCount: 0,
                },
                prependedLawRef: {
                    suggestedLawTitle: "地方公務員法",
                    lawNum: "昭和二十五年法律第二百六十一号",
                },
                namingParent: null,
                namingChildren: [],
                seriesPrev: "第二条第一項",
                seriesNext: null,
            },
        ];


        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify([...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()), null, 2));
        assert.deepStrictEqual(
            [...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()),
            expectedPointerEnvsList,
        );


        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （国の機関等に対する処分等の適用除外）
第四条　「参照先」
２・３　
４　（略）
  一～五　（略）
  六　国の機関相互間の関係について定める命令等並びに地方自治法（昭和二十二年法律第六十七号）第二編第十一章に規定する国と普通地方公共団体との関係及び普通地方公共団体相互間の関係その他の国と地方公共団体との関係及び地方公共団体相互間の関係について定める命令等（第一項の規定によりこの法律の規定を適用しないこととされる処分に係る命令等を含む。）
  七　（略）
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_3-text_23_28",
                    type: "LawTitle",
                    name: "地方自治法",
                    scope: "[{\"start\":{\"sentenceIndex\":3,\"textOffset\":42},\"end\":{\"sentenceIndex\":6,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":3,\"textOffset\":23},\"end\":{\"sentenceIndex\":3,\"textOffset\":28}}",
                    value: "{\"isCandidate\":false,\"text\":\"昭和二十二年法律第六十七号\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":3,\"textOffset\":29},\"end\":{\"sentenceIndex\":3,\"textOffset\":42}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["地方自治法"],
                    },
                ],
            },
        ];

        const expectedPointerEnvsList: object[] = [
            {
                pointer: {
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
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "地方自治法",
                        lawNum: "昭和二十二年法律第六十七号",
                    },
                    fqPrefixFragments: [],
                    skipSameCount: 0,
                },
                prependedLawRef: {
                    suggestedLawTitle: "地方自治法",
                    lawNum: "昭和二十二年法律第六十七号",
                },
                namingParent: null,
                namingChildren: [],
                seriesPrev: null,
                seriesNext: "第一項",
            },
            {
                pointer: {
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
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "第一項",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=4]-Paragraph[1][num=1]"],
                        },
                    ],
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: "第二編第十一章",
                seriesNext: "この法律",
            },
            {
                pointer: {
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
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "この法律",
                            containers: ["container-Law"],
                        },
                    ],
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: "第一項",
                seriesNext: null,
            },
        ];

        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify([...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()), null, 2));
        assert.deepStrictEqual(
            [...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()),
            expectedPointerEnvsList,
        );


        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （適用除外）
第三条　（略）
  一～九　（略）
  十　外国人の出入国、出入国管理及び難民認定法（昭和二十六年政令第三百十九号）第六十一条の二第一項に規定する難民の認定、同条第二項に規定する補完的保護対象者の認定又は帰化に関する処分及び行政指導
  十一～十六　（略）
２・３　（略）
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_2-text_8_20",
                    type: "LawTitle",
                    name: "出入国管理及び難民認定法",
                    scope: "[{\"start\":{\"sentenceIndex\":2,\"textOffset\":35},\"end\":{\"sentenceIndex\":6,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":2,\"textOffset\":8},\"end\":{\"sentenceIndex\":2,\"textOffset\":20}}",
                    value: "{\"isCandidate\":false,\"text\":\"昭和二十六年政令第三百十九号\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":2,\"textOffset\":21},\"end\":{\"sentenceIndex\":2,\"textOffset\":35}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["出入国管理及び難民認定法"],
                    },
                ],
            },
        ];

        const expectedPointerEnvsList: object[] = [
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Article",
                                name: "第六十一条の二",
                                num: "61_2",
                            },
                            children: ["第六十一条の二"],
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
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "出入国管理及び難民認定法",
                        lawNum: "昭和二十六年政令第三百十九号",
                    },
                    fqPrefixFragments: [],
                    skipSameCount: 0,
                },
                prependedLawRef: {
                    suggestedLawTitle: "出入国管理及び難民認定法",
                    lawNum: "昭和二十六年政令第三百十九号",
                },
                namingParent: null,
                namingChildren: [],
                seriesPrev: null,
                seriesNext: "同条第二項",
            },
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "SAME",
                                targetType: "Article",
                                name: "同条",
                            },
                            children: ["同条"],
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
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "出入国管理及び難民認定法",
                        lawNum: "昭和二十六年政令第三百十九号",
                    },
                    fqPrefixFragments: ["第六十一条の二"],
                    skipSameCount: 1,
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: "第六十一条の二第一項",
                seriesNext: null,
            },
        ];

        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify([...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()), null, 2));
        assert.deepStrictEqual(
            [...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()),
            expectedPointerEnvsList,
        );


        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （申請の審査）
第七条　（略）
２　（略）
  一　（略）
  二　（略）
  三　（略）
  四　（略）
  五　他人の地上基幹放送の業務の用に供する無線局のうち、地上基幹放送の業務を行うことについて放送法（昭和二十五年法律第百三十二号）第九十三条第一項の規定により認定を受けようとする者の当該業務に用いられる無線局にあつては、当該認定を受けようとする者が同項各号（第四号を除く。）に掲げる要件のいずれにも該当すること。
  六　（略）
  七　（略）
  八　（略）
３～６　（略）
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_6-text_43_46",
                    type: "LawTitle",
                    name: "放送法",
                    scope: "[{\"start\":{\"sentenceIndex\":6,\"textOffset\":61},\"end\":{\"sentenceIndex\":12,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":6,\"textOffset\":43},\"end\":{\"sentenceIndex\":6,\"textOffset\":46}}",
                    value: "{\"isCandidate\":false,\"text\":\"昭和二十五年法律第百三十二号\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":6,\"textOffset\":47},\"end\":{\"sentenceIndex\":6,\"textOffset\":61}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["放送法"],
                    },
                ],
            },
        ];

        const expectedPointerEnvsList: object[] = [
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Article",
                                name: "第九十三条",
                                num: "93",
                            },
                            children: ["第九十三条"],
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
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "放送法",
                        lawNum: "昭和二十五年法律第百三十二号",
                    },
                    fqPrefixFragments: [],
                    skipSameCount: 0,
                },
                prependedLawRef: {
                    suggestedLawTitle: "放送法",
                    lawNum: "昭和二十五年法律第百三十二号",
                },
                namingParent: null,
                namingChildren: [],
                seriesPrev: null,
                seriesNext: "同項各号",
            },
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "SAME",
                                targetType: "Paragraph",
                                name: "同項",
                            },
                            children: ["同項"],
                        },
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "EACH",
                                targetType: "Item",
                                name: "各号",
                            },
                            children: ["各号"],
                        },
                    ],
                },
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "放送法",
                        lawNum: "昭和二十五年法律第百三十二号",
                    },
                    fqPrefixFragments: [
                        "第九十三条",
                        "第一項",
                    ],
                    skipSameCount: 1,
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: ["第四号"],
                seriesPrev: "第九十三条第一項",
                seriesNext: "第四号",
            },
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Item",
                                name: "第四号",
                                num: "4",
                            },
                            children: ["第四号"],
                        },
                    ],
                },
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "放送法",
                        lawNum: "昭和二十五年法律第百三十二号",
                    },
                    fqPrefixFragments: [
                        "第九十三条",
                        "第一項",
                    ],
                    skipSameCount: 0,
                },
                prependedLawRef: null,
                namingParent: "同項各号",
                namingChildren: [],
                seriesPrev: "同項各号",
                seriesNext: null,
            },
        ];

        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify([...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()), null, 2));
        assert.deepStrictEqual(
            [...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()),
            expectedPointerEnvsList,
        );


        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （この法律の目的及び効力）
第一条　（略）
②　この法律は、もつぱら日本国憲法第七十三条にいう官吏に関する事務を掌理する基準を定めるものである。
③～⑤　（略）
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [];

        const expectedPointerEnvsList: object[] = [
            {
                pointer: {
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
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "この法律",
                            containers: ["container-Law"],
                        },
                    ],
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: null,
                seriesNext: "第七十三条",
            },
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Article",
                                name: "第七十三条",
                                num: "73",
                            },
                            children: ["第七十三条"],
                        },
                    ],
                },
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "日本国憲法",
                        lawNum: "昭和二十一年憲法",
                    },
                    fqPrefixFragments: [],
                    skipSameCount: 0,
                },
                prependedLawRef: {
                    suggestedLawTitle: "日本国憲法",
                    lawNum: "昭和二十一年憲法",
                },
                namingParent: null,
                namingChildren: [],
                seriesPrev: "この法律",
                seriesNext: null,
            },
        ];

        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify([...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()), null, 2));
        assert.deepStrictEqual(
            [...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()),
            expectedPointerEnvsList,
        );


        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （欠格事由）
第五条　（略）
２　（略）
３　次の各号のいずれかに該当する者には、無線局の免許を与えないことができる。
  一　（略）又は放送法（昭和二十五年法律第百三十二号）に規定する（略）
  二～四　（略）
４　公衆によつて直接受信されることを目的とする無線通信の送信（略）であつて、第二十六条第二項第五号イに掲げる周波数（略）の電波を使用するもの（略）をする無線局（受信障害対策中継放送、衛星基幹放送（放送法第二条第十三号に規定する衛星基幹放送をいう。（略）第八十条の二において同じ。）及び移動受信用地上基幹放送（同法第二条第十四号に規定する移動受信用地上基幹放送をいう。（略））をする無線局を除く。）については、第一項及び前項の規定にかかわらず、次の各号（コミュニティ放送（同法第九十三条第一項第七号に規定するコミュニティ放送をいう。（略））をする無線局にあつては、（略））のいずれかに該当する者には、無線局の免許を与えない。
  一～四　（略）
５・６　（略）
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_3-text_5_8",
                    type: "LawTitle",
                    name: "放送法",
                    scope: "[{\"start\":{\"sentenceIndex\":3,\"textOffset\":23},\"end\":{\"sentenceIndex\":9,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":3,\"textOffset\":5},\"end\":{\"sentenceIndex\":3,\"textOffset\":8}}",
                    value: "{\"isCandidate\":false,\"text\":\"昭和二十五年法律第百三十二号\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":3,\"textOffset\":9},\"end\":{\"sentenceIndex\":3,\"textOffset\":23}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["放送法"],
                    },
                ],
            },
        ];

        const expectedPointerEnvsList: object[] = [
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Article",
                                name: "第二十六条",
                                num: "26",
                            },
                            children: ["第二十六条"],
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
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Item",
                                name: "第五号",
                                num: "5",
                            },
                            children: ["第五号"],
                        },
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
                located: null,
                prependedLawRef: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: null,
                seriesNext: "第二条第十三号",
            },
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Article",
                                name: "第二条",
                                num: "2",
                            },
                            children: ["第二条"],
                        },
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Item",
                                name: "第十三号",
                                num: "13",
                            },
                            children: ["第十三号"],
                        },
                    ],
                },
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "放送法",
                        lawNum: "昭和二十五年法律第百三十二号",
                    },
                    fqPrefixFragments: [],
                    skipSameCount: 0,
                },
                prependedLawRef: {
                    suggestedLawTitle: "放送法",
                    lawNum: "昭和二十五年法律第百三十二号",
                },
                namingParent: null,
                namingChildren: [],
                seriesPrev: "第二十六条第二項第五号イ",
                seriesNext: "第八十条の二",
            },
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Article",
                                name: "第八十条の二",
                                num: "80_2",
                            },
                            children: ["第八十条の二"],
                        },
                    ],
                },
                located: null,
                prependedLawRef: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: "第二条第十三号",
                seriesNext: "同法第二条第十四号",
            },
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "SAME",
                                targetType: "Law",
                                name: "同法",
                            },
                            children: ["同法"],
                        },
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Article",
                                name: "第二条",
                                num: "2",
                            },
                            children: ["第二条"],
                        },
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Item",
                                name: "第十四号",
                                num: "14",
                            },
                            children: ["第十四号"],
                        },
                    ],
                },
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "放送法",
                        lawNum: "昭和二十五年法律第百三十二号",
                    },
                    fqPrefixFragments: [],
                    skipSameCount: 1,
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: "第八十条の二",
                seriesNext: "第一項",
            },
            {
                pointer: {
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
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "第一項",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=5]-Paragraph[1][num=1]"],
                        },
                    ],
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: ["前項"],
                seriesPrev: "同法第二条第十四号",
                seriesNext: "前項",
            },
            {
                pointer: {
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
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "前項",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=5]-Paragraph[3][num=3]"],
                        },
                    ],
                },
                prependedLawRef: null,
                namingParent: "第一項",
                namingChildren: [],
                seriesPrev: "第一項",
                seriesNext: "同法第九十三条第一項第七号",
            },
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "SAME",
                                targetType: "Law",
                                name: "同法",
                            },
                            children: ["同法"],
                        },
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Article",
                                name: "第九十三条",
                                num: "93",
                            },
                            children: ["第九十三条"],
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
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Item",
                                name: "第七号",
                                num: "7",
                            },
                            children: ["第七号"],
                        },
                    ],
                },
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "放送法",
                        lawNum: "昭和二十五年法律第百三十二号",
                    },
                    fqPrefixFragments: [],
                    skipSameCount: 1,
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: "前項",
                seriesNext: null,
            },
        ];

        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify([...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()), null, 2));
        assert.deepStrictEqual(
            [...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()),
            expectedPointerEnvsList,
        );


        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （欠格事由）
第五条　（略）
２　（略）
３　次の各号のいずれかに該当する者には、無線局の免許を与えないことができる。
  一　（略）又は放送法（昭和二十五年法律第百三十二号）に規定する（略）
  二～四　（略）
４　（略）
  一　（略）若しくは前項各号に掲げる者又は放送法第百三条第一項若しくは第百四条（第五号を除く。）の規定による認定の取消し若しくは同法第百三十一条の規定により登録の取消しを受け、その取消しの日から二年を経過しない者
  二～四　（略）
５・６　（略）
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_3-text_5_8",
                    type: "LawTitle",
                    name: "放送法",
                    scope: "[{\"start\":{\"sentenceIndex\":3,\"textOffset\":23},\"end\":{\"sentenceIndex\":10,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":3,\"textOffset\":5},\"end\":{\"sentenceIndex\":3,\"textOffset\":8}}",
                    value: "{\"isCandidate\":false,\"text\":\"昭和二十五年法律第百三十二号\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":3,\"textOffset\":9},\"end\":{\"sentenceIndex\":3,\"textOffset\":23}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["放送法"],
                    },
                ],
            },
        ];

        const expectedPointerEnvsList: object[] = [
            {
                pointer: {
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
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "EACH",
                                targetType: "Item",
                                name: "各号",
                            },
                            children: ["各号"],
                        },
                    ],
                },
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "前項",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=5]-Paragraph[3][num=3]"],
                        },
                        {
                            text: "各号",
                            containers: [
                                "container-Law-MainProvision[1]-Article[1][num=5]-Paragraph[3][num=3]-Item[1][num=1]",
                                "container-Law-MainProvision[1]-Article[1][num=5]-Paragraph[3][num=3]-Item[2][num=2:4]",
                            ],
                        },
                    ],
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: null,
                seriesNext: "第百三条第一項",
            },
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Article",
                                name: "第百三条",
                                num: "103",
                            },
                            children: ["第百三条"],
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
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "放送法",
                        lawNum: "昭和二十五年法律第百三十二号",
                    },
                    fqPrefixFragments: [],
                    skipSameCount: 0,
                },
                prependedLawRef: {
                    suggestedLawTitle: "放送法",
                    lawNum: "昭和二十五年法律第百三十二号",
                },
                namingParent: null,
                namingChildren: ["第百四条"],
                seriesPrev: "前項各号",
                seriesNext: "第百四条",
            },
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Article",
                                name: "第百四条",
                                num: "104",
                            },
                            children: ["第百四条"],
                        },
                    ],
                },
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "放送法",
                        lawNum: "昭和二十五年法律第百三十二号",
                    },
                    fqPrefixFragments: [],
                    skipSameCount: 0,
                },
                prependedLawRef: null,
                namingParent: "第百三条第一項",
                namingChildren: ["第五号"],
                seriesPrev: "第百三条第一項",
                seriesNext: "第五号",
            },
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Item",
                                name: "第五号",
                                num: "5",
                            },
                            children: ["第五号"],
                        },
                    ],
                },
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "放送法",
                        lawNum: "昭和二十五年法律第百三十二号",
                    },
                    fqPrefixFragments: ["第百四条"],
                    skipSameCount: 0,
                },
                prependedLawRef: null,
                namingParent: "第百四条",
                namingChildren: [],
                seriesPrev: "第百四条",
                seriesNext: "同法第百三十一条",
            },
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "SAME",
                                targetType: "Law",
                                name: "同法",
                            },
                            children: ["同法"],
                        },
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Article",
                                name: "第百三十一条",
                                num: "131",
                            },
                            children: ["第百三十一条"],
                        },
                    ],
                },
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "放送法",
                        lawNum: "昭和二十五年法律第百三十二号",
                    },
                    fqPrefixFragments: [],
                    skipSameCount: 1,
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: "第五号",
                seriesNext: null,
            },
        ];

        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify([...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()), null, 2));
        assert.deepStrictEqual(
            [...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()),
            expectedPointerEnvsList,
        );


        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （第一種指定電気通信設備を設置する電気通信事業者等の禁止行為等）
第三十条　（略）
２　（略）
  一　（略）
  二　（略）
３　（略）
４　第一種指定電気通信設備を設置する電気通信事業者は、次に掲げる行為をしてはならない。
  一　他の電気通信事業者の電気通信設備との接続の業務に関して知り得た当該他の電気通信事業者及びその利用者に関する情報を当該業務の用に供する目的以外の目的のために利用し、又は提供すること。
  二　その電気通信業務について、特定の電気通信事業者に対し、不当に優先的な取扱いをし、若しくは利益を与え、又は不当に不利な取扱いをし、若しくは不利益を与えること。
  三　他の電気通信事業者（略）又は電気通信設備の製造業者若しくは販売業者に対し、その業務について、不当に規律をし、又は干渉をすること。
５・６　（略）

第三十一条　（略）
２　第一種指定電気通信設備を設置する電気通信事業者は、次に掲げる行為をしてはならない。ただし、総務省令で定めるやむを得ない理由があるときは、この限りでない。
  一　第一種指定電気通信設備との接続に必要な電気通信設備の設置若しくは保守、土地及びこれに定着する建物その他の工作物の利用又は情報の提供について、特定関係事業者に比して他の電気通信事業者に不利な取扱いをすること。
  二　電気通信役務の提供に関する契約の締結の媒介等その他他の電気通信事業者からの業務の受託について、特定関係事業者に比して他の電気通信事業者に不利な取扱いをすること。
３　第一種指定電気通信設備を設置する電気通信事業者は、電気通信業務又はこれに付随する業務の全部又は一部を子会社に委託する場合には、当該委託に係る業務に関し（略）に掲げる行為（略）が行われないよう、当該委託を受けた子会社に対し必要かつ適切な監督を行わなければならない。
４　総務大臣は、第一種指定電気通信設備を設置する電気通信事業者が第二項各号に掲げる行為を行つていると認めるとき、又は前項の委託を受けた子会社が前条第四項各号に掲げる行為若しくは第二項各号に掲げる行為を行つていると認めるときは、当該電気通信事業者に対し、同項各号に掲げる行為の停止若しくは変更を命じ、又は当該委託を受けた子会社による同条第四項各号に掲げる行為若しくは第二項各号に掲げる行為を停止させ、若しくは変更させるために必要な措置をとるべきことを命ずることができる。
５～８　（略）
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [];

        const expectedPointerEnvsList: object[] = [
            {
                pointer: {
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
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "EACH",
                                targetType: "Item",
                                name: "各号",
                            },
                            children: ["各号"],
                        },
                    ],
                },
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "第二項",
                            containers: ["container-Law-MainProvision[1]-Article[2][num=31]-Paragraph[2][num=2]"],
                        },
                        {
                            text: "各号",
                            containers: [
                                "container-Law-MainProvision[1]-Article[2][num=31]-Paragraph[2][num=2]-Item[1][num=1]",
                                "container-Law-MainProvision[1]-Article[2][num=31]-Paragraph[2][num=2]-Item[2][num=2]",
                            ],
                        },
                    ],
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: null,
                seriesNext: "前項",
            },
            {
                pointer: {
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
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "前項",
                            containers: ["container-Law-MainProvision[1]-Article[2][num=31]-Paragraph[3][num=3]"],
                        },
                    ],
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: "第二項各号",
                seriesNext: "前条第四項各号",
            },
            {
                pointer: {
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
                                targetType: "Paragraph",
                                name: "第四項",
                                num: "4",
                            },
                            children: ["第四項"],
                        },
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "EACH",
                                targetType: "Item",
                                name: "各号",
                            },
                            children: ["各号"],
                        },
                    ],
                },
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "前条",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=30]"],
                        },
                        {
                            text: "第四項",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=30]-Paragraph[4][num=4]"],
                        },
                        {
                            text: "各号",
                            containers: [
                                "container-Law-MainProvision[1]-Article[1][num=30]-Paragraph[4][num=4]-Item[1][num=1]",
                                "container-Law-MainProvision[1]-Article[1][num=30]-Paragraph[4][num=4]-Item[2][num=2]",
                                "container-Law-MainProvision[1]-Article[1][num=30]-Paragraph[4][num=4]-Item[3][num=3]",
                            ],
                        },
                    ],
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: "前項",
                seriesNext: "第二項各号",
            },
            {
                pointer: {
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
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "EACH",
                                targetType: "Item",
                                name: "各号",
                            },
                            children: ["各号"],
                        },
                    ],
                },
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "第二項",
                            containers: ["container-Law-MainProvision[1]-Article[2][num=31]-Paragraph[2][num=2]"],
                        },
                        {
                            text: "各号",
                            containers: [
                                "container-Law-MainProvision[1]-Article[2][num=31]-Paragraph[2][num=2]-Item[1][num=1]",
                                "container-Law-MainProvision[1]-Article[2][num=31]-Paragraph[2][num=2]-Item[2][num=2]",
                            ],
                        },
                    ],
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: "前条第四項各号",
                seriesNext: "同項各号",
            },
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "SAME",
                                targetType: "Paragraph",
                                name: "同項",
                            },
                            children: ["同項"],
                        },
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "EACH",
                                targetType: "Item",
                                name: "各号",
                            },
                            children: ["各号"],
                        },
                    ],
                },
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "同項",
                            containers: ["container-Law-MainProvision[1]-Article[2][num=31]-Paragraph[2][num=2]"],
                        },
                        {
                            text: "各号",
                            containers: [
                                "container-Law-MainProvision[1]-Article[2][num=31]-Paragraph[2][num=2]-Item[1][num=1]",
                                "container-Law-MainProvision[1]-Article[2][num=31]-Paragraph[2][num=2]-Item[2][num=2]",
                            ],
                        },
                    ],
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: "第二項各号",
                seriesNext: "同条第四項各号",
            },
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "SAME",
                                targetType: "Article",
                                name: "同条",
                            },
                            children: ["同条"],
                        },
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
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "EACH",
                                targetType: "Item",
                                name: "各号",
                            },
                            children: ["各号"],
                        },
                    ],
                },
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "同条",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=30]"],
                        },
                        {
                            text: "第四項",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=30]-Paragraph[4][num=4]"],
                        },
                        {
                            text: "各号",
                            containers: [
                                "container-Law-MainProvision[1]-Article[1][num=30]-Paragraph[4][num=4]-Item[1][num=1]",
                                "container-Law-MainProvision[1]-Article[1][num=30]-Paragraph[4][num=4]-Item[2][num=2]",
                                "container-Law-MainProvision[1]-Article[1][num=30]-Paragraph[4][num=4]-Item[3][num=3]",
                            ],
                        },
                    ],
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: "同項各号",
                seriesNext: "第二項各号",
            },
            {
                pointer: {
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
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "EACH",
                                targetType: "Item",
                                name: "各号",
                            },
                            children: ["各号"],
                        },
                    ],
                },
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "第二項",
                            containers: ["container-Law-MainProvision[1]-Article[2][num=31]-Paragraph[2][num=2]"],
                        },
                        {
                            text: "各号",
                            containers: [
                                "container-Law-MainProvision[1]-Article[2][num=31]-Paragraph[2][num=2]-Item[1][num=1]",
                                "container-Law-MainProvision[1]-Article[2][num=31]-Paragraph[2][num=2]-Item[2][num=2]",
                            ],
                        },
                    ],
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: "同条第四項各号",
                seriesNext: null,
            },
        ];

        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify([...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()), null, 2));
        assert.deepStrictEqual(
            [...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()),
            expectedPointerEnvsList,
        );


        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
  （代理人）
第十六条　（略）の通知を受けた者（略）は、代理人を選任することができる。
２　代理人は、各自、当事者のために、聴聞に関する一切の行為をすることができる。
３　代理人の資格は、書面で証明しなければならない。
４　代理人がその資格を失ったときは、当該代理人を選任した当事者は、書面でその旨を行政庁に届け出なければならない。

  （参加人）
第十七条　（略）
２　（略）当該聴聞に関する手続に参加する者（略）は、代理人を選任することができる。
３　前条第二項から第四項までの規定は、前項の代理人について準用する。この場合において、同条第二項及び第四項中「当事者」とあるのは、「参加人」と読み替えるものとする。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        // [...getPointerEnvsResult.value.pointerRangesList.values()].forEach(r => getScope(r, getPointerEnvsResult.value));
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [];

        const expectedPointerEnvsList: object[] = [
            {
                pointer: {
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
                                targetType: "Paragraph",
                                name: "第二項",
                                num: "2",
                            },
                            children: ["第二項"],
                        },
                    ],
                },
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "前条",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=16]"],
                        },
                        {
                            text: "第二項",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=16]-Paragraph[2][num=2]"],
                        },
                    ],
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: ["第四項"],
                seriesPrev: null,
                seriesNext: "第四項",
            },
            {
                pointer: {
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
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "第四項",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=16]-Paragraph[4][num=4]"],
                        },
                    ],
                },
                prependedLawRef: null,
                namingParent: "前条第二項",
                namingChildren: [],
                seriesPrev: "前条第二項",
                seriesNext: "前項",
            },
            {
                pointer: {
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
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "前項",
                            containers: ["container-Law-MainProvision[1]-Article[2][num=17]-Paragraph[2][num=2]"],
                        },
                    ],
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: "第四項",
                seriesNext: "同条第二項",
            },
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "SAME",
                                targetType: "Article",
                                name: "同条",
                            },
                            children: ["同条"],
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
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "同条",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=16]"],
                        },
                        {
                            text: "第二項",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=16]-Paragraph[2][num=2]"],
                        },
                    ],
                },
                prependedLawRef: null,
                namingParent: null,
                namingChildren: ["第四項"],
                seriesPrev: "前項",
                seriesNext: "第四項",
            },
            {
                pointer: {
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
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "第四項",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=16]-Paragraph[4][num=4]"],
                        },
                    ],
                },
                prependedLawRef: null,
                namingParent: "同条第二項",
                namingChildren: [],
                seriesPrev: "同条第二項",
                seriesNext: null,
            },
        ];

        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        // console.log(JSON.stringify([...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()), null, 2));
        assert.deepStrictEqual(
            [...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()),
            expectedPointerEnvsList,
        );


        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
      附　則

  （施行期日）
１　この法律は、公布の日から起算して一年を超えない範囲内において政令で定める日から施行する。

  （経過措置）
２　この法律の施行前に第十五条第一項又は第三十条の規定による通知に相当する行為がされた場合においては、当該通知に相当する行為に係る不利益処分の手続に関しては、第三章の規定にかかわらず、なお従前の例による。

３　この法律の施行前に、届出その他政令で定める行為（以下「届出等」という。）がされた後一定期間内に限りすることができることとされている不利益処分に係る当該届出等がされた場合においては、当該不利益処分に係る手続に関しては、第三章の規定にかかわらず、なお従前の例による。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_2-text_27_30",
                    type: "Keyword",
                    name: "届出等",
                    scope: "[{\"start\":{\"sentenceIndex\":2,\"textOffset\":31},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":2,\"textOffset\":27},\"end\":{\"sentenceIndex\":2,\"textOffset\":30}}",
                    value: "{\"isCandidate\":true,\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":2,\"textOffset\":0},\"end\":{\"sentenceIndex\":2,\"textOffset\":26}}}",
                },
                children: ["届出等"],
            },
        ];

        const expected: JsonEL[] = [
            {
                tag: "____VarRef",
                attr: {
                    refName: "届出等",
                    declarationID: "decl-sentence_2-text_27_30",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":2,\"textOffset\":75},\"end\":{\"sentenceIndex\":2,\"textOffset\":78}}",
                },
                children: ["届出等"],
            },
        ];
        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        const varRefs = result.value.varRefs.sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(varRefs.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            varRefs.map(r => r.json(true)),
            expected,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
第三条　次に掲げる処分及び行政指導については、次章から第四章の二までの規定は、適用しない。
  九　公務員（国家公務員法（昭和二十二年法律第百二十号）第二条第一項に規定する国家公務員及び地方公務員法（昭和二十五年法律第二百六十一号）第三条第一項に規定する地方公務員をいう。以下同じ。）又は公務員であった者に対してその職務又は身分に関してされる処分及び行政指導
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);
        const pointerEnvsStruct = getPointerEnvs(sentenceEnvsStruct).value;
        const { declarations, lawRefByDeclarationID } = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct).value;

        const expectedDeclarations: JsonEL[] = [
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_1-text_0_3",
                    type: "Keyword",
                    name: "公務員",
                    scope: "[{\"start\":{\"sentenceIndex\":1,\"textOffset\":91},\"end\":{\"sentenceIndex\":2,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":0},\"end\":{\"sentenceIndex\":1,\"textOffset\":3}}",
                    value: "{\"isCandidate\":true,\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":1,\"textOffset\":4},\"end\":{\"sentenceIndex\":1,\"textOffset\":91}}}",
                },
                children: ["公務員"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_1-text_4_10",
                    type: "LawTitle",
                    name: "国家公務員法",
                    scope: "[{\"start\":{\"sentenceIndex\":1,\"textOffset\":24},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":4},\"end\":{\"sentenceIndex\":1,\"textOffset\":10}}",
                    value: "{\"isCandidate\":false,\"text\":\"昭和二十二年法律第百二十号\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":1,\"textOffset\":11},\"end\":{\"sentenceIndex\":1,\"textOffset\":24}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["国家公務員法"],
                    },
                ],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_1-text_43_49",
                    type: "LawTitle",
                    name: "地方公務員法",
                    scope: "[{\"start\":{\"sentenceIndex\":1,\"textOffset\":65},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":43},\"end\":{\"sentenceIndex\":1,\"textOffset\":49}}",
                    value: "{\"isCandidate\":false,\"text\":\"昭和二十五年法律第二百六十一号\",\"sentenceTextRange\":{\"start\":{\"sentenceIndex\":1,\"textOffset\":50},\"end\":{\"sentenceIndex\":1,\"textOffset\":65}}}",
                },
                children: [
                    {
                        tag: "__Text",
                        attr: {},
                        children: ["地方公務員法"],
                    },
                ],
            },
        ];

        const expected: JsonEL[] = [
            {
                tag: "____VarRef",
                attr: {
                    refName: "公務員",
                    declarationID: "decl-sentence_1-text_0_3",
                    refSentenceTextRange: "{\"start\":{\"sentenceIndex\":1,\"textOffset\":94},\"end\":{\"sentenceIndex\":1,\"textOffset\":97}}",
                },
                children: ["公務員"],
            },
        ];

        const expectedPointerEnvsList: object[] = [
            {
                pointer: {
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
                located: null,
                prependedLawRef: null,
                namingParent: null,
                namingChildren: ["第四章の二"],
                seriesPrev: null,
                seriesNext: "第四章の二",
            },
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Chapter",
                                name: "第四章の二",
                                num: "4_2",
                            },
                            children: ["第四章の二"],
                        },
                    ],
                },
                located: null,
                prependedLawRef: null,
                namingParent: "次章",
                namingChildren: [],
                seriesPrev: "次章",
                seriesNext: null,
            },
            {
                pointer: {
                    tag: "____Pointer",
                    attr: {},
                    children: [
                        {
                            tag: "____PF",
                            attr: {
                                relPos: "NAMED",
                                targetType: "Article",
                                name: "第二条",
                                num: "2",
                            },
                            children: ["第二条"],
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
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "国家公務員法",
                        lawNum: "昭和二十二年法律第百二十号",
                    },
                    fqPrefixFragments: [],
                    skipSameCount: 0,
                },
                prependedLawRef: {
                    suggestedLawTitle: "国家公務員法",
                    lawNum: "昭和二十二年法律第百二十号",
                },
                namingParent: null,
                namingChildren: [],
                seriesPrev: null,
                seriesNext: "第三条第一項",
            },
            {
                pointer: {
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
                                name: "第一項",
                                num: "1",
                            },
                            children: ["第一項"],
                        },
                    ],
                },
                located: {
                    type: "external",
                    lawRef: {
                        suggestedLawTitle: "地方公務員法",
                        lawNum: "昭和二十五年法律第二百六十一号",
                    },
                    fqPrefixFragments: [],
                    skipSameCount: 0,
                },
                prependedLawRef: {
                    suggestedLawTitle: "地方公務員法",
                    lawNum: "昭和二十五年法律第二百六十一号",
                },
                namingParent: null,
                namingChildren: [],
                seriesPrev: "第二条第一項",
                seriesNext: null,
            },
        ];

        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                sentenceEnvs: sentenceEnvsStruct.sentenceEnvs,
            },
        });

        const declarationsList = declarations.values().sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(declarationsList.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            declarationsList.map(r => r.json(true)),
            expectedDeclarations,
        );

        const varRefs = result.value.varRefs.sort((a, b) => (a.range && b.range) ? ((a.range[0] - b.range[0]) || (a.range[1] - b.range[1])) : 0);
        // console.log(JSON.stringify(varRefs.map(r => r.json(true)), null, 2));
        assert.deepStrictEqual(
            varRefs.map(r => r.json(true)),
            expected,
        );

        // console.log(JSON.stringify([...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()), null, 2));
        assert.deepStrictEqual(
            [...pointerEnvsStruct.pointerEnvByEL.values()].map(r => r.json()),
            expectedPointerEnvsList,
        );

        assert.deepStrictEqual(result.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });
});
