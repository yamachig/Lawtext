import { assert } from "chai";
import { assertLoader } from "../../test/prepareTest";
import type { LawInfo } from "../data/lawinfo";
import { LawIDType, parseLawID } from "./lawID";
import { ptnLawNum, ptnLawNumLike, lawNumLikeToLawNum, parseLawNum } from "./lawNum";


describe("Test lawNum", () => {

    it("Test ptnLawNum", async function () {

        const loader = assertLoader(this);
        const { lawInfos } = await loader.cacheLawListStruct();
        const reLawNum = new RegExp(`^(?:${ptnLawNum})$`);

        const failedLawInfos: LawInfo[] = [];
        for (const lawInfo of lawInfos) {
            const m = reLawNum.exec(lawInfo.LawNum);
            if (!m) failedLawInfos.push(lawInfo);
        }
        if (failedLawInfos.length !== 0) {
            assert.strictEqual(failedLawInfos.map(l => l.LawNum), []);
        }
    });

    it("Test ptnLawNumLike", async function () {

        const loader = assertLoader(this);
        const { lawInfos } = await loader.cacheLawListStruct();
        const reLawNumLike = new RegExp(`^(?:${ptnLawNumLike})$`);

        const failedLawInfos: LawInfo[] = [];
        for (const lawInfo of lawInfos) {
            const m = reLawNumLike.exec(lawInfo.LawNum);
            if (!m) failedLawInfos.push(lawInfo);
        }
        if (failedLawInfos.length !== 0) {
            assert.strictEqual(failedLawInfos.map(l => l.LawNum), []);
        }

        assert.isNotNull(reLawNumLike.exec("日本国憲法"));
    });

    it("Test lawNumLikeToLawNum", async () => {
        const reLawNum = new RegExp(`^(?:${ptnLawNum})$`);
        assert.isNotNull(reLawNum.exec(lawNumLikeToLawNum("日本国憲法")));
    });

    it("Test lawNumLikeToLawNum", async () => {
        assert.strictEqual(lawNumLikeToLawNum("平成１６年法律第６３号"), "平成十六年法律第六十三号");
    });

    it("Test parseLawNum and parseLawID", async function () {

        this.slow(250);

        const loader = assertLoader(this);
        const { lawInfos } = await loader.cacheLawListStruct();

        const failedLawInfos: LawInfo[] = [];
        for (const lawInfo of lawInfos) {
            const parsedLawNum = parseLawNum(lawInfo.LawNum);
            const parsedLawID = parseLawID(lawInfo.LawID);
            if (
                (!parsedLawID) ||
                (parsedLawNum.Era !== parsedLawID.era) ||
                (parsedLawNum.Year !== Number(parsedLawID.year)) ||
                (parsedLawNum.LawType !== {
                    [LawIDType.Constitution]: LawIDType.Constitution,
                    [LawIDType.Act]: LawIDType.Act,
                    [LawIDType.CabinetOrder]: LawIDType.CabinetOrder,
                    [LawIDType.ImperialOrder]: LawIDType.ImperialOrder,
                    [LawIDType.DajokanFukoku]: LawIDType.CabinetOrder,
                    [LawIDType.DajokanTasshi]: LawIDType.CabinetOrder,
                    [LawIDType.DajokanFutatsu]: LawIDType.CabinetOrder,
                    [LawIDType.MinisterialOrdinance]: LawIDType.MinisterialOrdinance,
                    [LawIDType.Jinji]: LawIDType.Rule,
                    [LawIDType.Rule]: LawIDType.Rule,
                    [LawIDType.PrimeMinisterDecision]: LawIDType.Rule,
                }[parsedLawID.type]) ||
                (
                    (parsedLawNum.Num === null) && (
                        (
                            parsedLawID.type === LawIDType.Constitution
                            && !/^(?:明治|大正|昭和|平成|令和)[一二三四五六七八九十百千]+年憲法$/.test(lawInfo.LawNum)
                        )
                        || (
                            parsedLawID.type === LawIDType.PrimeMinisterDecision
                            && !/^(?:明治|大正|昭和|平成|令和)[一二三四五六七八九十百千]+年[一二三四五六七八九十]+月[一二三四五六七八九十]+日内閣総理大臣決定$/.test(lawInfo.LawNum)
                        )
                        || (
                            parsedLawID.type === LawIDType.ImperialOrder
                            && !/^(?:明治|大正|昭和|平成|令和)[一二三四五六七八九十百千]+年勅令$/.test(lawInfo.LawNum)
                        )
                        || (
                            parsedLawID.type !== LawIDType.Constitution
                            && parsedLawID.type !== LawIDType.PrimeMinisterDecision
                            && parsedLawID.type !== LawIDType.ImperialOrder
                            && !["", "0", "1"].includes(parsedLawID.num)
                        )
                    )
                ) ||
                (
                    (parsedLawNum.Num !== null) &&
                    (parsedLawNum.Num !== (
                        (parsedLawID.type === LawIDType.Constitution)
                            ? null
                            : parsedLawID.num
                    ))
                )
            ) {
                failedLawInfos.push(lawInfo);
            }
        }
        if (failedLawInfos.length !== 0) {
            assert.strictEqual(failedLawInfos.map(l => ({
                origLawNum: l.LawNum,
                parsedLawNum: parseLawNum(l.LawNum),
                origLawID: l.LawID,
                parsedLawID: parseLawID(l.LawID),
            })), []);
        }
    });

});
