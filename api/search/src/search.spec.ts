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
});
