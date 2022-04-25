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
});
