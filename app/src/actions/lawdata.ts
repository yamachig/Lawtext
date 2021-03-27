import levenshtein from "js-levenshtein";
import { fetchLawData } from "@coresrc/elaws_api";
import { getLawList, LawInfo, BaseLawInfo, TextFetcher, getLawXml as core_getLawXml, getLawXmlByInfo, getLawCSVList, makeList } from "@coresrc/data/lawlist";
import iconv from "iconv-lite";
import { Buffer } from "buffer";
import { getTempLaw } from "./query";

let dataPath = "./data";
export const setDataPath = (p: string): void => {
    dataPath = p;
};
export const getDataPath = (): string => {
    return dataPath;
};

export const textFetcher: TextFetcher = async (textPath: string) => {
    try {
        const res = await fetch(textPath);
        if (!res.ok) {
            console.log(res.statusText);
            return null;
        }
        return await res.text();
    } catch (e) {
        console.log(e);
        return null;
    }
};

export const sjisTextFetcher: TextFetcher = async (textPath: string) => {
    try {
        const res = await fetch(textPath);
        if (!res.ok) {
            console.log(res.statusText);
            return null;
        }
        const buf = await res.arrayBuffer();
        return iconv.decode(Buffer.from(buf), "Shift_JIS");
    } catch (e) {
        console.log(e);
        return null;
    }
};

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
    const infos = await getLawCSVList(dataPath, sjisTextFetcher);

    if (infos === null) {
        console.error("CSV list cannot be fetched.");
        return null;
    }

    console.log(`Processing ${infos.length} XMLs...`);

    async function* lawIdXmls(list: BaseLawInfo[]) {
        for (const info of list) {
            const xml = await getLawXmlByInfo(dataPath, info, textFetcher);
            if (xml === null) {
                console.error("XML cannot fetched", info);
                continue;
            }
            yield { lawID: info.LawID, xml, Path: info.Path, XmlName: info.XmlName };
        }
    }

    const list = await makeList(lawIdXmls(infos), infos.length, progress);
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
        await getLawXmlCache(lawnum) ||
        await getLawXmlLocal(lawnum) ||
        await getLawXmlRemote(lawnum)
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

const getLawXmlLocal = async (lawnum: string): Promise<string | null> => {
    console.log(`getLawXmlLocal("${lawnum}")`);

    return core_getLawXml(dataPath, lawnum, textFetcher);
};

const getLawXmlRemote = async (lawnum: string): Promise<string> => {
    console.log(`getLawXmlRemote("${lawnum}")`);

    // const response = await fetch(`https://lic857vlz1.execute-api.ap-northeast-1.amazonaws.com/prod/Lawtext-API?method=lawdata&lawnum=${encodeURI(lawnum)}`, {
    //     mode: "cors",
    // });
    try {
        const lawData = await fetchLawData(lawnum);
        return lawData.xml;
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
        await getLawnumLocal(lawSearchKey) ||
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

const getLawnumLocal = async (lawSearchKey: string): Promise<string | null> => {
    console.log(`getLawnumLocal("${lawSearchKey}")`);

    const [lawList /**/] = await getLawList(dataPath, textFetcher);

    console.log(`started ${new Date().toISOString()}`);
    let partMatchMode = false;
    const bestMatch = { score: Infinity, info: null as LawInfo | null };
    for (const info of lawList) {
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

export const ensureAllLawListCSV = async (): Promise<boolean> => {
    try {
        const res = await fetch("./data/lawdata/all_law_list.csv", { method: "HEAD" });
        return res.ok;
    } catch (e) {
        return false;
    }
};

export const ensureLawListJson = async (): Promise<boolean> => {
    try {
        const res = await fetch("./data/list.json", { method: "HEAD" });
        return res.ok;
    } catch (e) {
        return false;
    }
};
