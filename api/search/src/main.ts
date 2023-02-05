import { BaseLawInfo } from "lawtext/dist/src/data/lawinfo";
import { FetchElawsLoader } from "lawtext/dist/src/data/loaders/FetchElawsLoader";
import { fetch } from "lawtext/dist/src/util/node-fetch";

export abstract class Store {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public abstract get(keys: string[]): Promise<Record<string, any>>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public abstract set(items: {[key: string]: Record<string, any>}): Promise<unknown>;

    public abstract getKeys(): Promise<string[]>;

    public abstract delete(keys: string[]): Promise<unknown>;

    public abstract empty(): Promise<unknown>;
}

const loader = new FetchElawsLoader();
type InvIndex = Record<string, {items: {[key: string]: number[]}}>;
type Aliases = Record<string, {items: string[]}>;
export interface Stores {
    lawInfos: Store,
    aliases: Store,
    invIndex: Store,
}

export const updateIndex = async (stores: Stores) => {
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

export const search = async (searchKey: string, stores: Stores) => {
    const invIndices: InvIndex = await stores.invIndex.get(Array.from(searchKey));
    const hitCount: Record<string, number> = {};
    for (const [, c] of Array.from(searchKey).entries()) {
        const items = invIndices[c]?.items ?? {};
        for (const key of Object.keys(items)) {
            if (!(key in hitCount)) hitCount[key] = 0;
            hitCount[key]++;
        }
    }

    let maxCountAliasKeys: string[] = [];
    {
        let maxCount = 0;
        for (const key of Object.keys(hitCount)) {
            if (maxCount < hitCount[key]) {
                maxCount = hitCount[key];
                maxCountAliasKeys = [];
            }
            if (maxCount <= hitCount[key]) {
                maxCountAliasKeys.push(key);
            }
        }
    }

    const maxCountKeys = Array.from(new Set(maxCountAliasKeys.map(k => k.split("/")[0])));
    const aliases: Aliases = await stores.aliases.get(maxCountKeys);
    const aliasToLawID = maxCountAliasKeys.map(k => {
        const [key, indexStr] = k.split("/");
        const index = Number(indexStr);
        return {
            alias: aliases[key].items[index],
            lawID: key,
        };
    });
    if (aliasToLawID.length === 0) return null;


    aliasToLawID.sort((a, b) => a.alias.length - b.alias.length);

    let foundLawID: string | null = null;
    for (const { alias, lawID } of aliasToLawID) {
        if (alias.includes(searchKey)) {
            foundLawID = lawID;
            break;
        }
    }
    if (!foundLawID) foundLawID = aliasToLawID[0].lawID;
    return (await stores.lawInfos.get([foundLawID]))[foundLawID] as BaseLawInfo;
};
