import { BaseLawInfo } from "lawtext/dist/src/data/lawinfo";
import { FetchElawsLoader } from "lawtext/dist/src/data/loaders/FetchElawsLoader";


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

export const updateIndex = async (baseLawInfosStore: Store, lawTitleInvIndexStore: Store) => {
    const { lawInfos } = await loader.cacheLawListStruct();

    {
        const origKeys = await baseLawInfosStore.getKeys();
        if (origKeys.length === 0) {
            const items = Object.fromEntries(lawInfos.map(lawInfo => [
                lawInfo.LawID,
                lawInfo.toBaseLawInfo(),
            ]));
            console.log(`LawInfos count: ${Object.keys(items).length}`);
            await baseLawInfosStore.set(items);
        }
    }

    {
        const origKeys = await lawTitleInvIndexStore.getKeys();
        if (origKeys.length === 0) {
            const invIndex: InvIndex = {};
            for (const lawInfo of lawInfos) {
                for (const [i, c] of Array.from(lawInfo.LawTitle).entries()) {
                    const key = lawInfo.LawID;
                    if (!(c in invIndex)) invIndex[c] = { items: {} };
                    if (!(key in invIndex[c].items)) invIndex[c].items[key] = [];
                    invIndex[c].items[key].push(i);
                }
            }
            console.log(`LawTitleInvIndex count: ${Object.keys(invIndex).length}`);
            await lawTitleInvIndexStore.set(invIndex);
        }
    }
};

export const search = async (searchKey: string, baseLawInfosStore: Store, lawTitleInvIndexStore: Store) => {
    const invIndices: InvIndex = await lawTitleInvIndexStore.get(Array.from(searchKey));
    const hitCount: Record<string, number> = {};
    for (const [, c] of Array.from(searchKey).entries()) {
        const items = invIndices[c]?.items ?? {};
        for (const key of Object.keys(items)) {
            if (!(key in hitCount)) hitCount[key] = 0;
            hitCount[key]++;
        }
    }

    let maxCountKeys: string[] = [];
    {
        let maxCount = 0;
        for (const key of Object.keys(hitCount)) {
            if (maxCount < hitCount[key]) {
                maxCount = hitCount[key];
                maxCountKeys = [];
            }
            if (maxCount <= hitCount[key]) {
                maxCountKeys.push(key);
            }
        }
    }

    const lawInfos: BaseLawInfo[] = Object.values(await baseLawInfosStore.get(maxCountKeys));
    if (lawInfos.length === 0) return null;
    lawInfos.sort((a, b) => a.LawTitle.length - b.LawTitle.length);

    for (const lawInfo of lawInfos) {
        if (lawInfo.LawTitle.includes(searchKey)) return lawInfo;
    }

    return lawInfos[0];
};
