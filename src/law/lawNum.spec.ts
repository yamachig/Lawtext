import { assert } from "chai";
import { loader } from "../../test/prepare_test";
import { LawInfo } from "../data/lawinfo";
import { LawIDType, parseLawID } from "./lawID";
import { ptnLawNum, ptnLawNumLike, lawNumLikeToLawNum, parseLawNum } from "./lawNum";


describe("Test lawNum", () => {

    it("Test ptnLawNum", async () => {

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

    it("Test ptnLawNumLike", async () => {

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

    it("Test parseLawNum and parseLawID", async function () {

        this.slow(250);

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
                    (parsedLawNum.Num === null) &&
                    !["", "0", "1"].includes((
                        (
                            (parsedLawID.type === LawIDType.Constitution) || (parsedLawID.type === LawIDType.PrimeMinisterDecision)
                        )
                            ? ""
                            : parsedLawID.num
                    ))
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
                LawNum: parseLawNum(l.LawNum),
                origLawID: l.LawID,
                LawID: parseLawID(l.LawID),
            })), []);
        }
    });

});
