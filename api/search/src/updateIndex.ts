import { fetch } from "lawtext/dist/src/util/node-fetch";
import { Aliases, InvIndex, Stores } from "./store";
import { Loader } from "lawtext/dist/src/data/loaders/common";

export const updateIndex = async (stores: Stores, loader: Loader) => {
    const { lawInfos, lawInfosByLawnum } = await loader.cacheLawListStruct();

    {
        const items = Object.fromEntries(lawInfos.map(lawInfo => [
            lawInfo.LawID,
            lawInfo.toBaseLawInfo(),
        ]));
        console.log(`LawInfos count: ${Object.keys(items).length}`);
        await stores.lawInfos.empty();
        await stores.lawInfos.set(items);
    }

    const aliases: Aliases = Object.fromEntries(lawInfos.map(l => [l.LawID, { items: [l.LawTitle] }]));
    {
        const html = (await (await fetch("https://elaws.e-gov.go.jp/abb/")).text()).replace(/[\r\n]/g, "");
        const mTable = /<table id="abbreviationTable".+?<\/table>/.exec(html);
        const table = (mTable && mTable[0]) ?? "";
        const mTbody = /<tbody.+?<\/tbody>/.exec(table);
        const tbody = (mTbody && mTbody[0]) ?? "";
        for (const mTr of tbody.matchAll(/<tr.+?<\/tr>/g)) {
            const tr = mTr[0];
            const mLawNum = /<td class="lawNoCol">(.+?)<\/td>/.exec(tr);
            const lawNum = ((mLawNum && mLawNum[1]) ?? "").trim();
            if (!lawNum || !(lawNum in lawInfosByLawnum)) continue;
            const lawInfo = lawInfosByLawnum[lawNum][0];
            for (const mTd of tr.matchAll(/<td class="abbrLawNameCol">(.+?)<\/td>/g)) {
                const alias = mTd[1].trim();
                if (alias) aliases[lawInfo.LawID].items.push(alias);
            }
        }
        console.log(`Aliases count: ${Object.keys(aliases).length}`);
        await stores.aliases.empty();
        await stores.aliases.set(aliases);
    }

    {
        const invIndex: InvIndex = {};
        for (const [LawID, { items }] of Object.entries(aliases)) {
            for (const [ai, alias] of items.entries()) {
                for (const [i, c] of Array.from(alias).entries()) {
                    const key = `${LawID}/${ai}`;
                    if (!(c in invIndex)) invIndex[c] = { items: {} };
                    if (!(key in invIndex[c].items)) invIndex[c].items[key] = [];
                    invIndex[c].items[key].push(i);
                }
            }
        }
        console.log(`LawTitleInvIndex count: ${Object.keys(invIndex).length}`);
        await stores.invIndex.empty();
        await stores.invIndex.set(invIndex);
    }
};
