import { LawInfo } from "lawtext/dist/src/data/lawinfo";
import levenshtein from "js-levenshtein";
import { storedLoader } from "./loaders";

export const searchLawnum = async (lawSearchKey: string): Promise<string | null> => {

    const reLawnum = /^(?:明治|大正|昭和|平成|令和)[元〇一二三四五六七八九十]+年(?:\S+?第[〇一二三四五六七八九十百千]+号|人事院規則[〇一二三四五六七八九―]+|[一二三四五六七八九十]+月[一二三四五六七八九十]+日内閣総理大臣決定|憲法)$/;
    const match = reLawnum.exec(lawSearchKey);

    const lawnum = (
        (match && match[0]) ||
        // await getLawnumCache(lawSearchKey) ||
        await getLawnumStored(lawSearchKey) ||
        await getLawnumRemote(lawSearchKey)
    );

    // if (lawnum && localStorage) {
    //     for (let i = 0; i < 5; i++) {
    //         try {
    //             localStorage.setItem(
    //                 "law_num_for:" + lawSearchKey,
    //                 JSON.stringify({
    //                     datetime: new Date().toISOString(),
    //                     lawnum,
    //                 }),
    //             );
    //         } catch (e) {
    //             console.log(e);
    //             localStorage.clear();
    //         }
    //     }
    // }

    return lawnum;
};

// const getLawnumCache = async (lawSearchKey: string): Promise<string | null> => {
//     console.log(`getLawnumCache("${lawSearchKey}")`);

//     const lawNumDataStr = localStorage ? localStorage.getItem(`law_num_for:${lawSearchKey}`) : null;
//     if (lawNumDataStr) {
//         const lawNumData = JSON.parse(lawNumDataStr);
//         const datetime = new Date(lawNumData.datetime);
//         const now = new Date();
//         const ms = now.getTime() - datetime.getTime();
//         const days = ms / (1000 * 60 * 60 * 24);
//         if (days < 1) {
//             return lawNumData.lawnum;
//         }
//     }

//     return null;
// };

const getLawnumStored = async (lawSearchKey: string): Promise<string | null> => {
    try {
        // console.log(`getLawnumStored("${lawSearchKey}")`);

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

        return bestMatch.info && bestMatch.info.LawNum;
    } catch {
        return null;
    }
};

const getLawnumRemote = async (lawSearchKey: string): Promise<string | null> => {
    // console.log(`getLawnumRemote("${lawSearchKey}")`);

    const response = await fetch(`https://lic857vlz1.execute-api.ap-northeast-1.amazonaws.com/prod/Lawtext-API?method=lawnums&lawname=${encodeURI(lawSearchKey)}`, {
        mode: "cors",
    });
    const data = await response.json() as string[][];
    if (data.length) {
        data.sort((a, b) => a[0].length - b[0].length);
        return data[0][1];
    }
    return null;
};
