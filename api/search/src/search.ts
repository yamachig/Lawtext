import { BaseLawInfo } from "lawtext/dist/src/data/lawinfo";
import { Aliases, InvIndex, Stores } from "./store";


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
