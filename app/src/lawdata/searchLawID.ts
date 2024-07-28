import type { LawInfo } from "lawtext/dist/src/data/lawinfo";
import levenshtein from "js-levenshtein";
import { storedLoader } from "./loaders";
import Fuse from "fuse.js";
import { getLawList } from "lawtext/dist/src/law/getLawList";
import type { ResolvedType } from "lawtext/dist/src/util";

export const searchLawID = async (lawSearchKey: string): Promise<string | {error: string, message: string} | null> => {

    const lawid = (
        await getLawIDStored(lawSearchKey) ||
        await getLawIDRemote(lawSearchKey)
    );

    return lawid;
};

const getLawIDStored = async (lawSearchKey: string): Promise<string | null> => {
    try {
        // console.log(`getLawIDStored("${lawSearchKey}")`);

        const { lawInfos } = await storedLoader.loadLawInfosStruct();

        let partMatchMode = false;
        const bestMatch = { score: Infinity, info: null as LawInfo | null };
        for (const info of lawInfos) {
            if (info.LawTitle.includes(lawSearchKey)) {
                if (!partMatchMode) {
                    partMatchMode = true;
                    bestMatch.score = Infinity;
                    bestMatch.info = null;
                }
            } else {
                if (partMatchMode) continue;
            }
            // eslint-disable-next-line no-irregular-whitespace
            const score = levenshtein(info.LawTitle.replace(/　抄$/, ""), lawSearchKey);
            if (score < bestMatch.score) {
                bestMatch.score = score;
                bestMatch.info = info;
            }
        }

        return bestMatch.info && bestMatch.info.LawID;
    } catch {
        return null;
    }
};

export type LawListItem = (ResolvedType<ReturnType<typeof getLawList>>)[number];

let _lawTitleFuse: Fuse<LawListItem> | null = null;

export const lawTitleFusePromise = (async () => {
    if (!_lawTitleFuse) {
        const lawList = await getLawList();
        _lawTitleFuse = new Fuse(lawList, {
            keys: [
                "lawTitle",
                {
                    name: "abbrev",
                    weight: 0.7,
                },
                {
                    name: "lawNum",
                    weight: 0.7,
                },
                "lawID",
            ],
            includeScore: true,
            includeMatches: true,
        });
    }
    return _lawTitleFuse;
})();

const getLawIDRemote = async (lawSearchKey: string): Promise<string | {error: string, message: string} | null> => {
    const result = (await lawTitleFusePromise).search(lawSearchKey);
    if (result.length > 0) {
        return result[0].item.lawID;
    }

    return null;
};
