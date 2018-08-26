import * as JSZip from "jszip";
import * as util from "../../../js/src/util";
const levenshtein = require("js-levenshtein");

interface LawListInfo {
    LawNum: string;
    ReferencingLawNums: string[];
    ReferencedLawNums: string[];
    LawTitle: string;
    Path: string;
    XmlZipName: string;
}

var list: LawListInfo[] = [];
var listByLawnum: { [index: string]: LawListInfo } = {};
var _listReady = false;
async function ensureList() {
    while (true) {
        if (_listReady) return;
        util.wait(30);
    }
}
(async () => {
    try {
        let response = await fetch(`lawdata/list.json`);
        let json = await response.json();
        list = json.map(
            ([
                LawNum,
                ReferencingLawNums,
                ReferencedLawNums,
                LawTitle,
                Path,
                XmlZipName,
            ]: [string, string[], string[], string, string, string]) => {
                let obj = {
                    LawNum: LawNum,
                    ReferencingLawNums: ReferencingLawNums,
                    ReferencedLawNums: ReferencedLawNums,
                    LawTitle: LawTitle,
                    Path: Path,
                    XmlZipName: XmlZipName,
                } as LawListInfo;
                listByLawnum[obj.LawNum] = obj;
                return obj;
            }
        );
    } finally {
        _listReady = true;
    }
})();




async function getLawXml(lawnum: string): Promise<string> {
    let xml = (
        await getLawXmlCache(lawnum) ||
        await getLawXmlLocal(lawnum) ||
        await getLawXmlRemote(lawnum)
    );

    if (localStorage) {
        localStorage.setItem(
            `law_for:${lawnum}`,
            JSON.stringify({
                datetime: new Date().toISOString(),
                xml: xml,
            }),
        );
    }

    return xml;
}

async function getLawXmlCache(lawnum: string): Promise<string | null> {
    console.log(`getLawXmlCache("${lawnum}")`);

    let law_data_str = localStorage ? localStorage.getItem(`law_for:${lawnum}`) : null;
    if (law_data_str) {
        let law_data = JSON.parse(law_data_str);
        let datetime = new Date(law_data.datetime);
        let now = new Date();
        let ms = now.getTime() - datetime.getTime();
        let days = ms / (1000 * 60 * 60 * 24);
        if (days < 1) {
            return law_data.xml;
        }
    }
    return null;
}

async function getLawXmlLocal(lawnum: string): Promise<string | null> {
    console.log(`getLawXmlLocal("${lawnum}")`);

    await ensureList();
    if (lawnum in listByLawnum) {
        let info = listByLawnum[lawnum];
        let response = await fetch(`lawdata/${info.Path}/${info.XmlZipName}`);
        let zip_data = await response.arrayBuffer();
        let zip = await JSZip.loadAsync(zip_data);
        return await zip.file(/.*\.xml/)[0].async("text");
    }

    return null;
}

async function getLawXmlRemote(lawnum: string): Promise<string> {
    console.log(`getLawXmlRemote("${lawnum}")`);

    let response = await fetch(`https://lic857vlz1.execute-api.ap-northeast-1.amazonaws.com/prod/Lawtext-API?method=lawdata&lawnum=${encodeURI(lawnum)}`, {
        mode: "cors",
    });
    let text = await response.text();

    if (response.ok) {

        if (!/^(?:<\?xml|<Law)/.test(text.trim())) {
            let zip = await JSZip.loadAsync(text, { base64: true });
            text = await zip.file("body.xml").async("text");
        }
        return text;

    } else {
        console.log(response);
        throw [
            "法令の読み込み中にエラーが発生しました",
            text,
        ];
    }
}





async function getLawnum(lawSearchKey: string): Promise<string> {

    let reLawnum = /^(?:明治|大正|昭和|平成)[元〇一二三四五六七八九十]+年(?:\S+?第[〇一二三四五六七八九十百千]+号|人事院規則[〇一二三四五六七八九―]+|[一二三四五六七八九十]+月[一二三四五六七八九十]+日内閣総理大臣決定)$/;
    let match = reLawnum.exec(lawSearchKey);

    let lawnum = (
        (match && match[0]) ||
        await getLawnumCache(lawSearchKey) ||
        await getLawnumLocal(lawSearchKey) ||
        await getLawnumRemote(lawSearchKey)
    );

    if (localStorage) {
        localStorage.setItem(
            "law_num_for:" + lawSearchKey,
            JSON.stringify({
                datetime: new Date().toISOString(),
                lawnum: lawnum,
            }),
        );
    }

    return lawnum;
}

async function getLawnumCache(lawSearchKey: string): Promise<string | null> {
    console.log(`getLawnumCache("${lawSearchKey}")`);

    let lawNumDataStr = localStorage ? localStorage.getItem(`law_num_for:${lawSearchKey}`) : null;
    if (lawNumDataStr) {
        let lawNumData = JSON.parse(lawNumDataStr);
        let datetime = new Date(lawNumData.datetime);
        let now = new Date();
        let ms = now.getTime() - datetime.getTime();
        let days = ms / (1000 * 60 * 60 * 24);
        if (days < 1) {
            lawNumData.lawnum;
        }
    }

    return null;
}

async function getLawnumLocal(lawSearchKey: string): Promise<string | null> {
    console.log(`getLawnumLocal("${lawSearchKey}")`);

    await ensureList();

    console.log(`started ${new Date().toISOString()}`);
    let bestMatch = { score: Infinity, info: <LawListInfo | null>null };
    for (let info of list) {
        let score = levenshtein(info.LawTitle, lawSearchKey);
        if (score < bestMatch.score) {
            bestMatch.score = score;
            bestMatch.info = info;
        }
    }
    console.log(`finished ${new Date().toISOString()}`);

    return bestMatch.info && bestMatch.info.LawNum;
}

async function getLawnumRemote(lawSearchKey: string): Promise<string> {
    console.log(`getLawnumRemote("${lawSearchKey}")`);

    let response = await fetch(`https://lic857vlz1.execute-api.ap-northeast-1.amazonaws.com/prod/Lawtext-API?method=lawnums&lawname=${encodeURI(lawSearchKey)}`, {
        mode: "cors",
    });
    let data = await response.json() as string[][];
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






export async function loadLaw(lawSearchKey: string): Promise<string> {
    let lawnum = await getLawnum(lawSearchKey);
    let xml = await getLawXml(lawnum);
    return xml;
}
