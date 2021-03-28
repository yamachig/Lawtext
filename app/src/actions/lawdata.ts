import levenshtein from "js-levenshtein";
import { FetchElawsLoader } from "@coresrc/data/loaders/FetchElawsLoader";
import { FetchStoredLoader } from "@coresrc/data/loaders/FetchStoredLoader";
import { BaseLawInfo, LawInfo } from "@coresrc/data/lawinfo";
import { getTempLaw } from "./temp_law";

const _dataPath = "./data";
export const elawsLoader = new FetchElawsLoader();
export const storedLoader = new FetchStoredLoader(_dataPath);

export const saveListJson = async (
    onProgress: (ratio: number, message: string) => void = () => undefined,
): Promise<Blob | null> => {

    const progress = (() => {
        let currentRatio = 0;
        let currentMessage = "";
        return (ratio?: number, message?: string) => {
            currentRatio = ratio || currentRatio;
            currentMessage = message || currentMessage;
            onProgress(currentRatio, currentMessage);
        };
    })();

    progress(0, "Loading CSV...");

    console.log("\nListing up XMLs...");
    let infos: BaseLawInfo[];
    try {
        infos = await storedLoader.loadBaseLawInfosFromCSV();
    } catch (e) {
        console.error("CSV list cannot be fetched.");
        console.error(e.message, e.stack);
        return null;
    }

    console.log(`Processing ${infos.length} XMLs...`);

    const list = await storedLoader.makeLawListFromBaseLawInfos(infos);
    progress(undefined, "Generating json...");
    const json = JSON.stringify(list);
    progress(undefined, "Saving json...");
    const blob = new Blob(
        [json],
        { type: "application/json" },
    );
    return blob;
};

const getLawXml = async (lawnum: string): Promise<string> => {
    const xml = (
        await getLawXmlStored(lawnum) ||
        await getLawXmlCache(lawnum) ||
        await getLawXmlElaws(lawnum)
    );

    if (localStorage) {
        try {
            localStorage.setItem(
                `law_for:${lawnum}`,
                JSON.stringify({
                    datetime: new Date().toISOString(),
                    xml,
                }),
            );
        } catch (e) {
            console.log(e);
            localStorage.clear();
        }
    }

    return xml;
};

const getLawXmlCache = async (lawnum: string): Promise<string | null> => {
    console.log(`getLawXmlCache("${lawnum}")`);

    const lawDataStr = localStorage ? localStorage.getItem(`law_for:${lawnum}`) : null;
    if (lawDataStr) {
        const lawData = JSON.parse(lawDataStr);
        const datetime = new Date(lawData.datetime);
        const now = new Date();
        const ms = now.getTime() - datetime.getTime();
        const days = ms / (1000 * 60 * 60 * 24);
        if (days < 1) {
            return lawData.xml;
        }
    }
    return null;
};

const getLawXmlStored = async (lawnum: string): Promise<string | null> => {
    console.log(`getLawXmlStored("${lawnum}")`);

    return storedLoader.getLawXmlByLawNum(lawnum);
};

const getLawXmlElaws = async (lawnum: string): Promise<string> => {
    console.log(`getLawXmlElaws("${lawnum}")`);

    // const response = await fetch(`https://lic857vlz1.execute-api.ap-northeast-1.amazonaws.com/prod/Lawtext-API?method=lawdata&lawnum=${encodeURI(lawnum)}`, {
    //     mode: "cors",
    // });
    try {
        const xml = await elawsLoader.getLawXmlByLawNum(lawnum);
        if (xml === null) throw new Error("法令XMLを読み込めませんでした");
        return xml;
    } catch (e) {
        console.error(e);
        throw [
            "法令の読み込み中にエラーが発生しました",
            e.message,
        ];
    }
};


const getLawnum = async (lawSearchKey: string): Promise<string> => {

    const reLawnum = /^(?:明治|大正|昭和|平成|令和)[元〇一二三四五六七八九十]+年(?:\S+?第[〇一二三四五六七八九十百千]+号|人事院規則[〇一二三四五六七八九―]+|[一二三四五六七八九十]+月[一二三四五六七八九十]+日内閣総理大臣決定|憲法)$/;
    const match = reLawnum.exec(lawSearchKey);

    const lawnum = (
        (match && match[0]) ||
        await getLawnumCache(lawSearchKey) ||
        await getLawnumStored(lawSearchKey) ||
        await getLawnumRemote(lawSearchKey)
    );

    if (localStorage) {
        for (let i = 0; i < 5; i++) {
            try {
                localStorage.setItem(
                    "law_num_for:" + lawSearchKey,
                    JSON.stringify({
                        datetime: new Date().toISOString(),
                        lawnum,
                    }),
                );
            } catch (e) {
                console.log(e);
                localStorage.clear();
            }
        }
    }

    return lawnum;
};

const getLawnumCache = async (lawSearchKey: string): Promise<string | null> => {
    console.log(`getLawnumCache("${lawSearchKey}")`);

    const lawNumDataStr = localStorage ? localStorage.getItem(`law_num_for:${lawSearchKey}`) : null;
    if (lawNumDataStr) {
        const lawNumData = JSON.parse(lawNumDataStr);
        const datetime = new Date(lawNumData.datetime);
        const now = new Date();
        const ms = now.getTime() - datetime.getTime();
        const days = ms / (1000 * 60 * 60 * 24);
        if (days < 1) {
            return lawNumData.lawnum;
        }
    }

    return null;
};

const getLawnumStored = async (lawSearchKey: string): Promise<string | null> => {
    console.log(`getLawnumStored("${lawSearchKey}")`);

    const { lawInfos } = await storedLoader.loadLawInfosStruct();

    console.log(`started ${new Date().toISOString()}`);
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
    console.log(`finished ${new Date().toISOString()}`);

    return bestMatch.info && bestMatch.info.LawNum;
};

const getLawnumRemote = async (lawSearchKey: string): Promise<string> => {
    console.log(`getLawnumRemote("${lawSearchKey}")`);

    const response = await fetch(`https://lic857vlz1.execute-api.ap-northeast-1.amazonaws.com/prod/Lawtext-API?method=lawnums&lawname=${encodeURI(lawSearchKey)}`, {
        mode: "cors",
    });
    const data = await response.json() as string[][];
    if (data.length) {
        data.sort((a, b) => a[0].length - b[0].length);
        return data[0][1];
    } else {
        throw [
            "法令が見つかりません",
            `「${lawSearchKey}」を検索しましたが、見つかりませんでした。`,
        ];
    }
};


export const loadLaw = async (lawSearchKey: string): Promise<string> => {
    const temp_xml = getTempLaw(lawSearchKey);
    if (temp_xml !== null) {
        return temp_xml;
    }
    const lawnum = await getLawnum(lawSearchKey);
    const xml = await getLawXml(lawnum);
    return xml;
};
