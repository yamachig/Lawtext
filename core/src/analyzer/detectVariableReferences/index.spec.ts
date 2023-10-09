import { assert } from "chai";
import { JsonEL } from "../../node/el/jsonEL";
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
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope(pointerRanges, pointerEnvsStruct);

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
                    value: "内閣又は行政機関が定める次に掲げるものをいう。",
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
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope(pointerRanges, pointerEnvsStruct);

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
                    type: "LawName",
                    name: "旧法",
                    scope: "[{\"start\":{\"sentenceIndex\":1,\"textOffset\":24},\"end\":{\"sentenceIndex\":3,\"textOffset\":0}}]",
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

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope(pointerRanges, pointerEnvsStruct);

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
                    scope: "[{\"start\":{\"sentenceIndex\":3,\"textOffset\":24},\"end\":{\"sentenceIndex\":10,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":3,\"textOffset\":21},\"end\":{\"sentenceIndex\":3,\"textOffset\":23}}",
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
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope(pointerRanges, pointerEnvsStruct);

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
                    value: "法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。",
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
                    value: "行政庁の処分その他公権力の行使に当たる行為をいう。",
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
                    value: "法令に基づき、行政庁の許可、認可、免許その他の自己に対し何らかの利益を付与する処分（以下「許認可等」という。）を求める行為であって、当該行為に対して行政庁が諾否の応答をすべきこととされているものをいう。",
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
                    value: "行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。ただし、次のいずれかに該当するものを除く。",
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
                    value: "次に掲げる機関をいう。",
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
                    type: "LawName",
                    name: "内閣府設置法",
                    scope: "[{\"start\":{\"sentenceIndex\":18,\"textOffset\":60},\"end\":{\"sentenceIndex\":31,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":18,\"textOffset\":41},\"end\":{\"sentenceIndex\":18,\"textOffset\":47}}",
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
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_18-text_84_91",
                    type: "LawName",
                    name: "国家行政組織法",
                    scope: "[{\"start\":{\"sentenceIndex\":18,\"textOffset\":105},\"end\":{\"sentenceIndex\":31,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":18,\"textOffset\":84},\"end\":{\"sentenceIndex\":18,\"textOffset\":91}}",
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
                    declarationID: "decl-sentence_20-text_0_4",
                    type: "Keyword",
                    name: "行政指導",
                    scope: "[{\"start\":{\"sentenceIndex\":0,\"textOffset\":0},\"end\":{\"sentenceIndex\":30,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":20,\"textOffset\":0},\"end\":{\"sentenceIndex\":20,\"textOffset\":4}}",
                    value: "行政機関がその任務又は所掌事務の範囲内において一定の行政目的を実現するため特定の者に一定の作為又は不作為を求める指導、勧告、助言その他の行為であって処分に該当しないものをいう。",
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
                    value: "行政庁に対し一定の事項の通知をする行為（申請に該当するものを除く。）であって、法令により直接に当該通知が義務付けられているもの（自己の期待する一定の法律上の効果を発生させるためには当該通知をすべきこととされているものを含む。）をいう。",
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
                    value: "内閣又は行政機関が定める次に掲げるものをいう。",
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
                },
                children: ["命令"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_27-text_0_4",
                    type: "Keyword",
                    name: "審査基準",
                    scope: "[{\"start\":{\"sentenceIndex\":27,\"textOffset\":4},\"end\":{\"sentenceIndex\":30,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":27,\"textOffset\":0},\"end\":{\"sentenceIndex\":27,\"textOffset\":4}}",
                },
                children: ["審査基準"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_28-text_0_4",
                    type: "Keyword",
                    name: "処分基準",
                    scope: "[{\"start\":{\"sentenceIndex\":28,\"textOffset\":4},\"end\":{\"sentenceIndex\":30,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":28,\"textOffset\":0},\"end\":{\"sentenceIndex\":28,\"textOffset\":4}}",
                },
                children: ["処分基準"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_29-text_0_6",
                    type: "Keyword",
                    name: "行政指導指針",
                    scope: "[{\"start\":{\"sentenceIndex\":29,\"textOffset\":6},\"end\":{\"sentenceIndex\":30,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":29,\"textOffset\":0},\"end\":{\"sentenceIndex\":29,\"textOffset\":6}}",
                },
                children: ["行政指導指針"],
            },
        ]
;

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
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope(pointerRanges, pointerEnvsStruct);

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
                    value: "内閣又は行政機関が定める次に掲げるものをいう。",
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
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope(pointerRanges, pointerEnvsStruct);

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
                    value: "無線設備及び無線設備の操作を行う者の総体",
                },
                children: ["無線局"],
            },
            {
                tag: "____Declaration",
                attr: {
                    declarationID: "decl-sentence_4-text_51_57",
                    type: "Keyword",
                    name: "実験等無線局",
                    scope: "[{\"start\":{\"sentenceIndex\":4,\"textOffset\":57},\"end\":{\"sentenceIndex\":11,\"textOffset\":0}}]",
                    nameSentenceTextRange: "{\"start\":{\"sentenceIndex\":4,\"textOffset\":51},\"end\":{\"sentenceIndex\":4,\"textOffset\":57}}",
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
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope(pointerRanges, pointerEnvsStruct);

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
                    lawNum: "平成十一年法律第八十九号",
                    fqPrefixFragments: [],
                },
                directLawNum: "平成十一年法律第八十九号",
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
                    lawNum: "平成十一年法律第八十九号",
                    fqPrefixFragments: ["第四十九条"],
                },
                directLawNum: null,
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
                    lawNum: "昭和二十三年法律第百二十号",
                    fqPrefixFragments: [],
                },
                directLawNum: "昭和二十三年法律第百二十号",
                namingParent: null,
                namingChildren: [],
                seriesPrev: "第二項",
                seriesNext: null,
            },
        ];


        const expectedErrorMessages: string[] = [];

        const result = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
        for (const pointerRanges of pointerEnvsStruct.pointerRangesList) getScope(pointerRanges, pointerEnvsStruct);

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
});
