import levenshtein from "js-levenshtein";
import { FetchElawsLoader } from "@coresrc/data/loaders/FetchElawsLoader";
import { FetchStoredLoader } from "@coresrc/data/loaders/FetchStoredLoader";
import { BaseLawInfo, LawInfo } from "@coresrc/data/lawinfo";
import { getTempLaw } from "./temp_law";
import { fetchLawData } from "@coresrc/elaws_api";
import * as std from "@coresrc/std_law";
import * as util from "@coresrc/util";
import { parse } from "@coresrc/parser_wrapper";
import * as analyzer from "@coresrc/analyzer";
import JSZip from "jszip";
import path from "path";

const _dataPath = "./data";
export const elawsLoader = new FetchElawsLoader();
export const storedLoader = new FetchStoredLoader(_dataPath);
interface StoredLawDataProps {
    source: "stored",
    xml: string,
    lawPath: string,
}
const isStoredLawDataProps = (props: LawDataProps):
    props is StoredLawDataProps =>
    props.source === "stored";
interface ElawsLawDataProps {
    source: "elaws",
    xml: string,
    pict: Map<string, Blob> | null,
}
const isElawsLawDataProps = (props: LawDataProps):
    props is ElawsLawDataProps =>
    props.source === "elaws";
interface TempXMLLawDataProps {
    source: "temp_xml",
    xml: string,
}
const isTempXMLLawDataProps = (props: LawDataProps):
    props is TempXMLLawDataProps =>
    props.source === "temp_xml";
interface FileXMLLawDataProps {
    source: "file_xml",
    xml: string,
}
const isFileXMLLawDataProps = (props: LawDataProps):
    props is FileXMLLawDataProps =>
    props.source === "file_xml";
interface TempLawtextLawDataProps {
    source: "temp_lawtext",
    lawtext: string,
}
const isTempLawtextLawDataProps = (props: LawDataProps):
    props is TempLawtextLawDataProps =>
    props.source === "temp_lawtext";
interface FileLawtextLawDataProps {
    source: "file_lawtext",
    lawtext: string,
}
const isFileLawtextLawDataProps = (props: LawDataProps):
    props is FileLawtextLawDataProps =>
    props.source === "file_lawtext";

type LawDataProps = StoredLawDataProps | ElawsLawDataProps | TempXMLLawDataProps | FileXMLLawDataProps | TempLawtextLawDataProps | FileLawtextLawDataProps;

interface LawDataCore {el: std.Law, analysis: analyzer.Analysis}

export type LawData = LawDataProps & LawDataCore;

export type LawDataResult<TLawDataProps extends LawDataProps = LawDataProps> =
    { ok: true, lawData: LawDataCore & TLawDataProps} | {ok: false, error: Error};

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

const getLawDataByNum = async (lawnum: string):
    Promise<LawDataResult<StoredLawDataProps | ElawsLawDataProps>> => {
    try {
        const xmlLawInfo = await getLawStored(lawnum);
        if (xmlLawInfo) {
            const { xml, lawInfo } = xmlLawInfo;
            return toLawData({
                source: "stored",
                xml,
                lawPath: lawInfo.Path,
            });
        } else {
            const elawsLawData = await fetchLawData(lawnum);
            let pict: Map<string, Blob> | null = null;
            if (elawsLawData.imageData) {
                pict = new Map();
                const zip = new JSZip(elawsLawData.imageData);
                for (const relPath in zip.files) {
                    pict.set(
                        path.join("./pict", relPath),
                        await zip.files[relPath].async("blob"),
                    );
                }
            }
            return toLawData({
                source: "elaws",
                xml: elawsLawData.xml,
                pict,
            });
        }
    } catch (error) {
        return {
            ok: false,
            error,
        };
    }
};

const getLawStored = async (lawnum: string): Promise<{xml: string, lawInfo: LawInfo} | null> => {
    console.log(`getLawStored("${lawnum}")`);
    try {
        const lawInfo = await storedLoader.getLawInfoByLawNum(lawnum);
        if (!lawInfo) return null;
        const xml = await storedLoader.loadLawXMLByInfo(lawInfo);
        if (!xml) return null;
        return { xml, lawInfo };
    } catch {
        return null;
    }
};


const getLawnum = async (lawSearchKey: string): Promise<string | null> => {

    const reLawnum = /^(?:明治|大正|昭和|平成|令和)[元〇一二三四五六七八九十]+年(?:\S+?第[〇一二三四五六七八九十百千]+号|人事院規則[〇一二三四五六七八九―]+|[一二三四五六七八九十]+月[一二三四五六七八九十]+日内閣総理大臣決定|憲法)$/;
    const match = reLawnum.exec(lawSearchKey);

    const lawnum = (
        (match && match[0]) ||
        await getLawnumCache(lawSearchKey) ||
        await getLawnumStored(lawSearchKey) ||
        await getLawnumRemote(lawSearchKey)
    );

    if (lawnum && localStorage) {
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
    try {
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
    } catch {
        return null;
    }
};

const getLawnumRemote = async (lawSearchKey: string): Promise<string | null> => {
    console.log(`getLawnumRemote("${lawSearchKey}")`);

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

export const toLawData = <TLawDataProps extends LawDataProps>(props: TLawDataProps): LawDataResult<TLawDataProps> => {
    const _props = props as LawDataProps;
    try {
        if (isStoredLawDataProps(_props) || isElawsLawDataProps(_props) || isTempXMLLawDataProps(_props) || isFileXMLLawDataProps(_props)) {
            const el = util.xmlToJson(_props.xml) as std.Law;
            analyzer.stdxmlToExt(el);
            const analysis = analyzer.analyze(el);
            return {
                ok: true,
                lawData: {
                    ...(_props as typeof props),
                    el,
                    analysis,
                },
            };
        } else if (isTempLawtextLawDataProps(_props) || isFileLawtextLawDataProps(_props)) {
            const el = parse(_props.lawtext, { startRule: "start" }) as std.Law;
            const analysis = analyzer.analyze(el);
            return {
                ok: true,
                lawData: {
                    ...(_props as typeof props),
                    el,
                    analysis,
                },
            };
        } else {
            throw util.assertNever(_props);
        }
    } catch (origError) {
        const error = new Error(`読み込んだ法令データにエラーがあります: ${origError}`);
        error.stack = `${error.stack}
Original Error:
${origError.stack}
`;
        return {
            ok: false,
            error,
        };
    }
};


export const loadLawByKey = async (lawSearchKey: string): Promise<LawDataResult<TempXMLLawDataProps | TempLawtextLawDataProps | StoredLawDataProps | ElawsLawDataProps>> => {
    const text = getTempLaw(lawSearchKey);
    if (text !== null) {
        if (/^(?:<\?xml|<Law)/.test(text.trim())) {
            return toLawData({
                source: "temp_xml",
                xml: text,
            });
        } else {
            return toLawData({
                source: "temp_lawtext",
                lawtext: text,
            });
        }
    }
    const lawnum = await getLawnum(lawSearchKey);
    if (!lawnum) {
        return {
            ok: false,
            error: new Error(`「${lawSearchKey}」を検索しましたが、見つかりませんでした。`),
        };
    }
    return getLawDataByNum(lawnum);
};
