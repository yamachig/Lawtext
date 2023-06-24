import { assert } from "chai";
import getSentenceEnvs from "../getSentenceEnvs";
import { parse } from "../../parser/lawtext";
import { assertELVaridity } from "../../parser/std/testHelper";
import getPointerEnvs from "./getPointerEnvs";

describe("Test getPointerEnvs", () => {

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
                    ],
                },
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "前項",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=24_2]-Paragraph[1][num=1]"],
                        },
                    ],
                },
                directLawNum: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: null,
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
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "第二十四条の二",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=24_2]"],
                        },
                        {
                            text: "第二項",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=24_2]-Paragraph[2][num=2]"],
                        },
                    ],
                },
                directLawNum: null,
                namingParent: null,
                namingChildren: ["第二号"],
                seriesPrev: null,
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
                                targetType: "Item",
                                name: "第二号",
                                num: "2",
                            },
                            children: ["第二号"],
                        },
                    ],
                },
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "第二号",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=24_2]-Paragraph[2][num=2]-Item[2][num=2]"],
                        },
                    ],
                },
                directLawNum: null,
                namingParent: "第二十四条の二第二項",
                namingChildren: [],
                seriesPrev: null,
                seriesNext: null,
            },
        ];


        const expectedErrorMessages: string[] = [];

        const getPointerEnvsResult = getPointerEnvs(sentenceEnvsStruct);
        [...getPointerEnvsResult.value.pointerEnvByEL.values()].forEach(p => p.locate());

        // console.log(JSON.stringify([...getPointerEnvsResult.value.pointerEnvByEL.values()].map(r => r.json()), null, 2));
        assert.deepStrictEqual(
            [...getPointerEnvsResult.value.pointerEnvByEL.values()].map(r => r.json()),
            expectedPointerEnvsList,
        );

        assert.deepStrictEqual(getPointerEnvsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
第五条　（略）
２　（略）
３　次の各号のいずれかに該当する者には、無線局の免許を与えないことができる。
  一　（略）
  二　第七十五条第一項又は第七十六条第四項（第四号を除く。）若しくは第五項（第五号を除く。）の規定により無線局の免許の取消しを受け、その取消しの日から二年を経過しない者
  三　（略）
  四　「参照されない」
  五　「参照されない」
４　（略）
５　「参照されない」
  一～四　（略）
  五　「参照されない」
６　（略）

第七十五条　「参照先」
２　（略）


第七十六条　（略）
２・３　（略）
４　「参照先」
  一～三　（略）
  四　「参照先」
  五　（略）
５　「参照先」
  一～四　（略）
  五　「参照先」
６～８　（略）
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);

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
                                name: "第七十五条",
                                num: "75",
                            },
                            children: ["第七十五条"],
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
                    type: "internal",
                    fragments: [
                        {
                            text: "第七十五条",
                            containers: ["container-Law-MainProvision[1]-Article[2][num=75]"],
                        },
                        {
                            text: "第一項",
                            containers: ["container-Law-MainProvision[1]-Article[2][num=75]-Paragraph[1][num=1]"],
                        },
                    ],
                },
                directLawNum: null,
                namingParent: null,
                namingChildren: ["第七十六条第四項"],
                seriesPrev: null,
                seriesNext: "第七十六条第四項",
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
                            text: "第七十六条",
                            containers: ["container-Law-MainProvision[1]-Article[3][num=76]"],
                        },
                        {
                            text: "第四項",
                            containers: ["container-Law-MainProvision[1]-Article[3][num=76]-Paragraph[3][num=4]"],
                        },
                    ],
                },
                directLawNum: null,
                namingParent: "第七十五条第一項",
                namingChildren: ["第四号", "第五項"],
                seriesPrev: "第七十五条第一項",
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
                                targetType: "Item",
                                name: "第四号",
                                num: "4",
                            },
                            children: ["第四号"],
                        },
                    ],
                },
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "第四号",
                            containers: ["container-Law-MainProvision[1]-Article[3][num=76]-Paragraph[3][num=4]-Item[2][num=4]"],
                        },
                    ],
                },
                directLawNum: null,
                namingParent: "第七十六条第四項",
                namingChildren: [],
                seriesPrev: null,
                seriesNext: "第五項",
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
                                name: "第五項",
                                num: "5",
                            },
                            children: ["第五項"],
                        },
                    ],
                },
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "第五項",
                            containers: ["container-Law-MainProvision[1]-Article[3][num=76]-Paragraph[4][num=5]"],
                        },
                    ],
                },
                directLawNum: null,
                namingParent: "第七十六条第四項",
                namingChildren: ["第五号"],
                seriesPrev: "第四号",
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
                                targetType: "Item",
                                name: "第五号",
                                num: "5",
                            },
                            children: ["第五号"],
                        },
                    ],
                },
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "第五号",
                            containers: ["container-Law-MainProvision[1]-Article[3][num=76]-Paragraph[4][num=5]-Item[2][num=5]"],
                        },
                    ],
                },
                directLawNum: null,
                namingParent: "第五項",
                namingChildren: [],
                seriesPrev: null,
                seriesNext: null,
            },
        ];


        const expectedErrorMessages: string[] = [];

        const getPointerEnvsResult = getPointerEnvs(sentenceEnvsStruct);
        [...getPointerEnvsResult.value.pointerEnvByEL.values()].forEach(p => p.locate());

        // console.log(JSON.stringify([...getPointerEnvsResult.value.pointerEnvByEL.values()].map(r => r.json()), null, 2));
        assert.deepStrictEqual(
            [...getPointerEnvsResult.value.pointerEnvByEL.values()].map(r => r.json()),
            expectedPointerEnvsList,
        );

        assert.deepStrictEqual(getPointerEnvsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
第四条の二　（略）
２　「参照先」
３・４　（略）
５　（略）第三十八条の二十一第一項の規定は第二項の規定による届出をした者及び当該届出に係る無線設備について、（略）
６・７　（略）

第三十八条の二十一　「参照先」
２　「参照されない」
３　（略）
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);

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
                                name: "第三十八条の二十一",
                                num: "38_21",
                            },
                            children: ["第三十八条の二十一"],
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
                    type: "internal",
                    fragments: [
                        {
                            text: "第三十八条の二十一",
                            containers: ["container-Law-MainProvision[1]-Article[2][num=38_21]"],
                        },
                        {
                            text: "第一項",
                            containers: ["container-Law-MainProvision[1]-Article[2][num=38_21]-Paragraph[1][num=1]"],
                        },
                    ],
                },
                directLawNum: null,
                namingParent: null,
                namingChildren: [],
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
                    type: "internal",
                    fragments: [
                        {
                            text: "第二項",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=4_2]-Paragraph[2][num=2]"],
                        },
                    ],
                },
                directLawNum: null,
                namingParent: null,
                namingChildren: [],
                seriesPrev: "第三十八条の二十一第一項",
                seriesNext: null,
            },
        ];


        const expectedErrorMessages: string[] = [];

        const getPointerEnvsResult = getPointerEnvs(sentenceEnvsStruct);
        [...getPointerEnvsResult.value.pointerEnvByEL.values()].forEach(p => p.locate());

        // console.log(JSON.stringify([...getPointerEnvsResult.value.pointerEnvByEL.values()].map(r => r.json()), null, 2));
        assert.deepStrictEqual(
            [...getPointerEnvsResult.value.pointerEnvByEL.values()].map(r => r.json()),
            expectedPointerEnvsList,
        );

        assert.deepStrictEqual(getPointerEnvsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
第三十九条　（略）
２～４　（略）

第四十三条　（略）
  一～四　（略）
２　（略）
３　（略）
４　（略）
５　（略）

第四十四条　（略）

第四十五条　第三十九条第一項並びに第四十三条第一項（前条において読み替えて準用する場合を含む。）、第四項（前条において準用する場合を含む。）及び第五項の規定による公示は、電子情報処理組織を使用する方法その他の情報通信の技術を利用する方法により行うものとする。
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);

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
                                name: "第三十九条",
                                num: "39",
                            },
                            children: ["第三十九条"],
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
                    type: "internal",
                    fragments: [
                        {
                            text: "第三十九条",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=39]"],
                        },
                        {
                            text: "第一項",
                            containers: ["container-Law-MainProvision[1]-Article[1][num=39]-Paragraph[1][num=1]"],
                        },
                    ],
                },
                directLawNum: null,
                namingParent: null,
                namingChildren: ["第四十三条第一項"],
                seriesPrev: null,
                seriesNext: "第四十三条第一項",
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
                                name: "第四十三条",
                                num: "43",
                            },
                            children: ["第四十三条"],
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
                    type: "internal",
                    fragments: [
                        {
                            text: "第四十三条",
                            containers: ["container-Law-MainProvision[1]-Article[2][num=43]"],
                        },
                        {
                            text: "第一項",
                            containers: ["container-Law-MainProvision[1]-Article[2][num=43]-Paragraph[1][num=1]"],
                        },
                    ],
                },
                directLawNum: null,
                namingParent: "第三十九条第一項",
                namingChildren: [
                    "前条",
                    "第四項",
                ],
                seriesPrev: "第三十九条第一項",
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
                                relPos: "PREV",
                                targetType: "Article",
                                name: "前条",
                            },
                            children: ["前条"],
                        },
                    ],
                },
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "前条",
                            containers: ["container-Law-MainProvision[1]-Article[3][num=44]"],
                        },
                    ],
                },
                directLawNum: null,
                namingParent: "第四十三条第一項",
                namingChildren: [],
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
                            containers: ["container-Law-MainProvision[1]-Article[2][num=43]-Paragraph[4][num=4]"],
                        },
                    ],
                },
                directLawNum: null,
                namingParent: "第四十三条第一項",
                namingChildren: [
                    "前条",
                    "第五項",
                ],
                seriesPrev: "前条",
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
                                relPos: "PREV",
                                targetType: "Article",
                                name: "前条",
                            },
                            children: ["前条"],
                        },
                    ],
                },
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "前条",
                            containers: ["container-Law-MainProvision[1]-Article[3][num=44]"],
                        },
                    ],
                },
                directLawNum: null,
                namingParent: "第四項",
                namingChildren: [],
                seriesPrev: null,
                seriesNext: "第五項",
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
                                name: "第五項",
                                num: "5",
                            },
                            children: ["第五項"],
                        },
                    ],
                },
                located: {
                    type: "internal",
                    fragments: [
                        {
                            text: "第五項",
                            containers: ["container-Law-MainProvision[1]-Article[2][num=43]-Paragraph[5][num=5]"],
                        },
                    ],
                },
                directLawNum: null,
                namingParent: "第四項",
                namingChildren: [],
                seriesPrev: "前条",
                seriesNext: null,
            },
        ];


        const expectedErrorMessages: string[] = [];

        const getPointerEnvsResult = getPointerEnvs(sentenceEnvsStruct);
        [...getPointerEnvsResult.value.pointerEnvByEL.values()].forEach(p => p.locate());

        // console.log(JSON.stringify([...getPointerEnvsResult.value.pointerEnvByEL.values()].map(r => r.json()), null, 2));
        assert.deepStrictEqual(
            [...getPointerEnvsResult.value.pointerEnvByEL.values()].map(r => r.json()),
            expectedPointerEnvsList,
        );

        assert.deepStrictEqual(getPointerEnvsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const lawtext = `\
第一条　（略）
②　（略）もつぱら日本国憲法第七十三条にいう官吏に関する事務を掌理する基準を定めるものである。
③～⑤　（略）
`;
        const inputElToBeModified = parse(lawtext).value;
        const sentenceEnvsStruct = getSentenceEnvs(inputElToBeModified);

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
                                name: "第七十三条",
                                num: "73",
                            },
                            children: ["第七十三条"],
                        },
                    ],
                },
                located: {
                    type: "external",
                    lawNum: "昭和二十一年憲法",
                    fqPrefixFragments: [],
                },
                directLawNum: "昭和二十一年憲法",
                namingParent: null,
                namingChildren: [],
                seriesPrev: null,
                seriesNext: null,
            },
        ];


        const expectedErrorMessages: string[] = [];

        const getPointerEnvsResult = getPointerEnvs(sentenceEnvsStruct);
        [...getPointerEnvsResult.value.pointerEnvByEL.values()].forEach(p => p.locate());

        // console.log(JSON.stringify([...getPointerEnvsResult.value.pointerEnvByEL.values()].map(r => r.json()), null, 2));
        assert.deepStrictEqual(
            [...getPointerEnvsResult.value.pointerEnvByEL.values()].map(r => r.json()),
            expectedPointerEnvsList,
        );

        assert.deepStrictEqual(getPointerEnvsResult.errors.map(e => e.message), expectedErrorMessages);

        assertELVaridity(inputElToBeModified, lawtext, true);
    });
});
