import * as levenshtein from "js-levenshtein";
import * as JSZip from "jszip";
import * as util from "../../../core/src/util";
import {fetchLawData} from "../../../core/src/elaws_api";

interface LawListInfo {
    LawNum: string;
    ReferencingLawNums: string[];
    ReferencedLawNums: string[];
    LawTitle: string;
    Path: string;
    XmlZipName: string;
}

let list: LawListInfo[] = [];
const listByLawnum: { [index: string]: LawListInfo } = {};
let _listReady = false;
const ensureList = async () => {
    await fetchList();
    let waitTime = 30;
    while (true) {
        if (_listReady) return;
        console.log("wait fetching lawdata/list.json");
        await util.wait(waitTime);
        if (waitTime < 1000) waitTime += 300;
    }
}

let _fetchListInvoked = false;
const fetchList = async () => {
    if (_fetchListInvoked) return;
    _fetchListInvoked = true;
    try {
        console.log("start fetching lawdata/list.json");
        const response = await fetch(`lawdata/list.json`);
        if (response.ok) {
            const json = await response.json();
            list = json.map(
                ([
                    LawNum,
                    ReferencingLawNums,
                    ReferencedLawNums,
                    LawTitle,
                    Path,
                    XmlZipName,
                ]: [string, string[], string[], string, string, string]) => {
                    const obj = {
                        LawNum,
                        ReferencingLawNums,
                        ReferencedLawNums,
                        LawTitle,
                        Path,
                        XmlZipName,
                    } as LawListInfo;
                    listByLawnum[obj.LawNum] = obj;
                    return obj;
                }
            );
        }
    } finally {
        console.log("finish fetching lawdata/list.json");
        _listReady = true;
    }
    return [];
};
if (!(typeof module !== 'undefined' && module.exports)) {
    fetchList();
}




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
}

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
}

const getLawXmlLocal = async (lawnum: string): Promise<string | null> => {
    console.log(`getLawXmlLocal("${lawnum}")`);

    await ensureList();
    if (lawnum in listByLawnum) {
        const info = listByLawnum[lawnum];
        const response = await fetch(`lawdata/${info.Path}/${info.XmlZipName}`);
        const zipData = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(zipData);
        return await zip.file(/.*\.xml/)[0].async("text");
    }

    return null;
}

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
}


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
}

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
}

const getLawnumLocal = async (lawSearchKey: string): Promise<string | null> => {
    console.log(`getLawnumLocal("${lawSearchKey}")`);

    await ensureList();

    console.log(`started ${new Date().toISOString()}`);
    let partMatchMode = false;
    const bestMatch = { score: Infinity, info: null as LawListInfo | null };
    for (const info of list) {
        if (info.LawTitle.includes(lawSearchKey)) {
            if (!partMatchMode) {
                partMatchMode = true;
                bestMatch.score = Infinity;
                bestMatch.info = null;
            }
        } else {
            if (partMatchMode) continue;
        }
        const score = levenshtein(info.LawTitle.replace(/　抄$/, ""), lawSearchKey);
        if (score < bestMatch.score) {
            bestMatch.score = score;
            bestMatch.info = info;
        }
    }
    console.log(`finished ${new Date().toISOString()}`);

    return bestMatch.info && bestMatch.info.LawNum;
}

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
}






export const loadLaw = async (lawSearchKey: string): Promise<string> => {
    const lawnum = await getLawnum(lawSearchKey);
    const xml = await getLawXml(lawnum);
    return xml;
}
