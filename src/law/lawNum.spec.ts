import { assert } from "chai";
import { loader } from "../../test/prepare_test";
import { LawInfo } from "../data/lawinfo";
import { ptnLawNum, ptnLawNumLike, toStdLawNum } from "./lawNum";


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

    it("Test toStdLawNum", async () => {
        const reLawNum = new RegExp(`^(?:${ptnLawNum})$`);
        assert.isNotNull(reLawNum.exec(toStdLawNum("日本国憲法")));
    });

});
