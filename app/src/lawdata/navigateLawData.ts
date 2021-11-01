import { getTempLaw } from "../actions/temp_law";
import { fetchLawData } from "@coresrc/elaws_api";
import JSZip from "jszip";
import path from "path";
import { ElawsLawDataProps, StoredLawDataProps, TempXMLLawDataProps, TempLawtextLawDataProps } from "./common";
import { storedLoader } from "./loaders";
import { searchLawnum } from "./searchLawNum";
import * as util from "@coresrc/util";
import { LawDataResult, Timing, toLawData } from "@coresrc/data/lawdata";

const pictMimeDict = {
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".pdf": "application/pdf",
    ".bmp": "image/bmp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
} as const;

export const navigateLawData = async (
    lawSearchKey: string,
    onMessage: (message: string) => unknown,
    timing: Timing,
): Promise<LawDataResult<TempXMLLawDataProps | TempLawtextLawDataProps | StoredLawDataProps | ElawsLawDataProps>> => {

    const text = getTempLaw(lawSearchKey);
    if (text !== null) {
        if (/^(?:<\?xml|<Law)/.test(text.trim())) {
            onMessage("法令XMLをパースしています...");
            // console.log("navigateLawData: parsing law xml...");
            await util.wait(30);
            return toLawData({
                source: "temp_xml",
                xml: text,
            }, onMessage, timing);
        } else {
            onMessage("Lawtextをパースしています...");
            // console.log("navigateLawData: parsing lawtext...");
            await util.wait(30);
            return toLawData({
                source: "temp_lawtext",
                lawtext: text,
            }, onMessage, timing);
        }
    }

    onMessage("法令番号を検索しています...");
    // console.log("navigateLawData: searching lawnum...");
    const [searchLawNumTime, lawnum] = await util.withTime(searchLawnum)(lawSearchKey);
    timing.searchLawNum = searchLawNumTime;

    if (!lawnum) {
        return {
            ok: false,
            error: new Error(`「${lawSearchKey}」を検索しましたが、見つかりませんでした。`),
        };
    }

    try {
        onMessage("保存されている法令情報を探しています...");
        // console.log(`navigateLawData: fetching stored law info for "${lawnum}"...`);
        const [fetchStoredLawInfoTime, lawInfo] = await util.withTime(storedLoader.getLawInfoByLawNum.bind(storedLoader))(lawnum);
        timing.fetchStoredLawInfo = fetchStoredLawInfoTime;
        if (!lawInfo) throw null;

        onMessage("保存されている法令XMLの取得を試みています...");
        // console.log("navigateLawData: fetching stored law data...");
        const [loadDataTime, xml] = lawInfo && await util.withTime(storedLoader.loadLawXMLByInfo.bind(storedLoader))(lawInfo);
        timing.loadData = loadDataTime;
        if (!xml) throw null;

        onMessage("法令XMLをパースしています...");
        // console.log("navigateLawData: parsing law xml...");
        await util.wait(30);
        return toLawData({
            source: "stored",
            xml,
            lawPath: lawInfo.Path,
        }, onMessage, timing);
    } catch {
        //
    }

    try {
        onMessage("e-Gov 法令APIから法令XMLを取得しています...");
        console.log(`navigateLawData: fetching law data via e-LAWS API for "${lawnum}"...`);
        const [loadDataTime, elawsLawData] = await util.withTime(fetchLawData)(lawnum);
        timing.loadData = loadDataTime;

        let pict: Map<string, Blob> | null = null;
        if (elawsLawData.imageData) {
            onMessage("画像情報を読み込んでいます...");
            // console.log("navigateLawData: extracting pict...");
            const start = new Date();
            pict = new Map();
            const zip = await JSZip.loadAsync(elawsLawData.imageData);
            for (const relPath in zip.files) {
                const buf = await zip.files[relPath].async("arraybuffer");
                const ext = path.extname(relPath) as keyof typeof pictMimeDict;
                const type = ext in pictMimeDict ? pictMimeDict[ext] : "application/octet-stream";
                const blob = new Blob([buf], { type });
                pict.set(`./pict/${relPath}`, blob);
            }
            timing.extractPict = (new Date()).getTime() - start.getTime();
        }

        onMessage("法令XMLをパースしています...");
        // console.log("navigateLawData: parsing law xml...");
        await util.wait(30);
        return toLawData({
            source: "elaws",
            xml: elawsLawData.xml,
            pict,
        }, onMessage, timing);

    } catch (error) {
        return {
            ok: false,
            error: error as Error,
        };
    }
};
