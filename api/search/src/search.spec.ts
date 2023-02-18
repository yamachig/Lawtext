import { assert } from "chai";
import { InMemoryStore } from "../test/inMemoryStore";
import { search } from "./search";
import { Stores } from "./store";
import { updateIndex } from "./updateIndex";
import { FetchElawsLoader } from "lawtext/dist/src/data/loaders/FetchElawsLoader";

describe("Test search", async () => {
    const stores: Stores = {
        lawInfos: new InMemoryStore(),
        aliases: new InMemoryStore(),
        invIndex: new InMemoryStore(),
    };
    const loader = new FetchElawsLoader();

    before(async function () {
        this.timeout(10000);
        await updateIndex(stores, loader);
    });

    it("Success case", async () => {
        const result = await search("行政手続法", stores);
        assert.strictEqual(result?.LawTitle, "行政手続法");
    });

    it("Success case", async () => {
        const result = await search("デジタル手続法", stores);
        assert.strictEqual(result?.LawTitle, "情報通信技術を活用した行政の推進等に関する法律");
    });

    it("Success case", async () => {
        const result = await search("番号法", stores);
        assert.strictEqual(result?.LawTitle, "行政手続における特定の個人を識別するための番号の利用等に関する法律");
    });

    it("Success case", async function () {
        this.timeout(300000);
        this.slow(200000);
        const aliasKeys = await stores.aliases.getKeys();
        const { lawInfosByLawID } = await loader.cacheLawListStruct();
        for (const [i, key] of aliasKeys.entries()) {
            if ((i + 1) % 1000 === 0) console.log(`${i + 1}th item...`);
            const aliases = (await stores.aliases.get([key]))[key].items as string[];
            for (const alias of aliases) {
                const result = await search(alias, stores);
                const expected = lawInfosByLawID[key][0];
                assert.strictEqual(
                    result?.LawTitle,
                    expected.LawTitle,
                    JSON.stringify({
                        alias,
                        result,
                        expected,
                    }, undefined, 4)
                );
            }
        }
    });
});
