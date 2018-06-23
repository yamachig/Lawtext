import * as JSZip from "jszip";
import * as _ from "underscore";
import * as $ from "jquery";
import { wait } from "../../src/util";
import * as levenstein from "js-levenshtein";

interface LawListInfo {
    LawNum: string;
    ReferencingLawNums: string[];
    ReferencedLawNums: string[];
    LawTitle: string;
    Path: string;
    XmlZipName: string;
}

var list: LawListInfo[] = [];
var list_by_lawnum: { [index: string]: LawListInfo } = {};
var _list_ready = false;
async function ensure_list() {
    while (true) {
        if (_list_ready) return;
        wait(30);
    }
}
(async () => {
    try {
        let response = await fetch(`lawdata/list.json`);
        let json = await response.json();
        list = json.map(([LawNum, ReferencingLawNums, ReferencedLawNums, LawTitle, Path, XmlZipName]) => {
            let obj = {
                LawNum: LawNum,
                ReferencingLawNums: ReferencingLawNums,
                ReferencedLawNums: ReferencedLawNums,
                LawTitle: LawTitle,
                Path: Path,
                XmlZipName: XmlZipName,
            } as LawListInfo;
            list_by_lawnum[obj.LawNum] = obj;
            return obj;
        });
    } finally {
        _list_ready = true;
    }
})();




async function get_law_xml(lawnum: string): Promise<string> {
    let xml = (
        await get_law_xml_cache(lawnum) ||
        await get_law_xml_local(lawnum) ||
        await get_law_xml_remote(lawnum)
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

async function get_law_xml_cache(lawnum: string): Promise<string | null> {
    console.log(`get_law_xml_cache("${lawnum}")`);

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

async function get_law_xml_local(lawnum: string): Promise<string | null> {
    console.log(`get_law_xml_local("${lawnum}")`);

    await ensure_list();
    if (lawnum in list_by_lawnum) {
        let info = list_by_lawnum[lawnum];
        let response = await fetch(`lawdata/${info.Path}/${info.XmlZipName}`);
        let zip_data = await response.arrayBuffer();
        let zip = await JSZip.loadAsync(zip_data);
        return await zip.file(/.*\.xml/)[0].async("text");
    }

    return null;
}

async function get_law_xml_remote(lawnum: string): Promise<string> {
    console.log(`get_law_xml_remote("${lawnum}")`);

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





async function get_lawnum(law_search_key: string): Promise<string> {

    let re_lawnum = /^(?:明治|大正|昭和|平成)[元〇一二三四五六七八九十]+年(?:\S+?第[〇一二三四五六七八九十百千]+号|人事院規則[〇一二三四五六七八九―]+|[一二三四五六七八九十]+月[一二三四五六七八九十]+日内閣総理大臣決定)$/;
    let match = re_lawnum.exec(law_search_key);

    let lawnum = (
        (match && match[0]) ||
        await get_lawnum_cache(law_search_key) ||
        await get_lawnum_local(law_search_key) ||
        await get_lawnum_remote(law_search_key)
    );

    if (localStorage) {
        localStorage.setItem(
            "law_num_for:" + law_search_key,
            JSON.stringify({
                datetime: new Date().toISOString(),
                lawnum: lawnum,
            }),
        );
    }

    return lawnum;
}

async function get_lawnum_cache(law_search_key: string): Promise<string | null> {
    console.log(`get_lawnum_cache("${law_search_key}")`);

    let law_num_data_str = localStorage ? localStorage.getItem(`law_num_for:${law_search_key}`) : null;
    if (law_num_data_str) {
        let law_num_data = JSON.parse(law_num_data_str);
        let datetime = new Date(law_num_data.datetime);
        let now = new Date();
        let ms = now.getTime() - datetime.getTime();
        let days = ms / (1000 * 60 * 60 * 24);
        if (days < 1) {
            law_num_data.lawnum;
        }
    }

    return null;
}

async function get_lawnum_local(law_search_key: string): Promise<string | null> {
    console.log(`get_lawnum_local("${law_search_key}")`);

    await ensure_list();

    console.log(`started ${new Date().toISOString()}`);
    let best_match = { score: Infinity, info: <LawListInfo | null>null };
    for (let info of list) {
        let score = levenstein(info.LawTitle, law_search_key);
        if (score < best_match.score) {
            best_match.score = score;
            best_match.info = info;
        }
    }
    console.log(`finished ${new Date().toISOString()}`);

    return best_match.info && best_match.info.LawNum;
}

async function get_lawnum_remote(law_search_key: string): Promise<string> {
    console.log(`get_lawnum_remote("${law_search_key}")`);

    let response = await fetch(`https://lic857vlz1.execute-api.ap-northeast-1.amazonaws.com/prod/Lawtext-API?method=lawnums&lawname=${encodeURI(law_search_key)}`, {
        mode: "cors",
    });
    let data = await response.json();
    if (data.length) {
        return _(data).sortBy(d => d[0].length)[0][1];
    } else {
        throw [
            "法令が見つかりません",
            `「${law_search_key}」を検索しましたが、見つかりませんでした。`,
        ];
    }
}






export async function load_law(law_search_key: string): Promise<string> {
    let lawnum = await get_lawnum(law_search_key);
    let xml = await get_law_xml(lawnum);
    return xml;
}
