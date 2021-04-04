import { getTempLaw } from "../actions/temp_law";
import { fetchLawData } from "@coresrc/elaws_api";
import JSZip from "jszip";
import path from "path";
import { ElawsLawDataProps, LawDataResult, StoredLawDataProps, TempXMLLawDataProps, TempLawtextLawDataProps, toLawData, Timing } from "./common";
import { storedLoader } from "./loaders";
import { searchLawnum } from "./searchLawNum";
import * as util from "@coresrc/util";


export const navigateLawData = async (
    lawSearchKey: string,
    onMessage: (message: string) => unknown,
    timing: Timing,
): Promise<LawDataResult<TempXMLLawDataProps | TempLawtextLawDataProps | StoredLawDataProps | ElawsLawDataProps>> => {

    const text = getTempLaw(lawSearchKey);
    if (text !== null) {
        if (/^(?:<\?xml|<Law)/.test(text.trim())) {
            onMessage("法令XMLをパースしています...");
            console.log("navigateLawData: parsing law xml...");
            await util.wait(30);
            return toLawData({
                source: "temp_xml",
                xml: text,
            }, onMessage, timing);
        } else {
            onMessage("Lawtextをパースしています...");
            console.log("navigateLawData: parsing lawtext...");
            await util.wait(30);
            return toLawData({
                source: "temp_lawtext",
                lawtext: text,
            }, onMessage, timing);
        }
    }

    onMessage("法令番号を検索しています...");
    console.log("navigateLawData: searching lawnum...");
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
        console.log(`navigateLawData: fetching stored law info for "${lawnum}"...`);
        const [fetchStoredLawInfoTime, lawInfo] = await util.withTime(storedLoader.getLawInfoByLawNum.bind(storedLoader))(lawnum);
        timing.fetchStoredLawInfo = fetchStoredLawInfoTime;
        if (!lawInfo) throw null;

        onMessage("保存されている法令XMLの取得を試みています...");
        console.log("navigateLawData: fetching stored law data...");
        const [loadDataTime, xml] = lawInfo && await util.withTime(storedLoader.loadLawXMLByInfo.bind(storedLoader))(lawInfo);
        timing.loadData = loadDataTime;
        if (!xml) throw null;

        onMessage("法令XMLをパースしています...");
        console.log("navigateLawData: parsing law xml...");
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
            console.log("navigateLawData: extracting pict...");
            const start = new Date();
            pict = new Map();
            const zip = new JSZip(elawsLawData.imageData);
            for (const relPath in zip.files) {
                pict.set(
                    path.join("./pict", relPath),
                    await zip.files[relPath].async("blob"),
                );
            }
            timing.extractPict = (new Date()).getTime() - start.getTime();
        }

        onMessage("法令XMLをパースしています...");
        console.log("navigateLawData: parsing law xml...");
        await util.wait(30);
        return toLawData({
            source: "elaws",
            xml: elawsLawData.xml,
            pict,
        }, onMessage, timing);

    } catch (error) {
        return {
            ok: false,
            error,
        };
    }
};
