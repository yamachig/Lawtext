import { getTempLaw } from "../actions/temp_law";
import { ElawsLawDataProps, StoredLawDataProps, TempXMLLawDataProps, TempLawtextLawDataProps } from "./common";
import { elawsLoader, storedLoader } from "./loaders";
import { searchLawnum } from "./searchLawNum";
import * as util from "lawtext/dist/src/util";
import { LawDataResult, Timing, toLawData } from "lawtext/dist/src/data/lawdata";

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
                lawXMLStruct: null,
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
    } else if (typeof lawnum !== "string") {
        return {
            ok: false,
            error: new Error(`「${lawSearchKey}」の検索時にエラーが発生しました： ${lawnum.error}: "${lawnum.message}"`),
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
        const [loadDataTime, lawXMLStruct] = lawInfo && await util.withTime(storedLoader.loadLawXMLStructByInfo.bind(storedLoader))(lawInfo);
        timing.loadData = loadDataTime;

        onMessage("法令XMLをパースしています...");
        // console.log("navigateLawData: parsing law xml...");
        await util.wait(30);
        return toLawData({
            source: "stored",
            xml: lawXMLStruct.xml,
            lawPath: lawInfo.Path,
            lawXMLStruct,
        }, onMessage, timing);
    } catch {
        //
    }

    try {
        onMessage("e-Gov 法令APIから法令XMLを取得しています...");
        console.log(`navigateLawData: fetching law data via e-LAWS API for "${lawnum}"...`);
        const [loadDataTime, lawXMLStruct] = await util.withTime(elawsLoader.loadLawXMLStructByInfo.bind(storedLoader))(lawnum);
        timing.loadData = loadDataTime;

        onMessage("法令XMLをパースしています...");
        // console.log("navigateLawData: parsing law xml...");
        await util.wait(30);
        return toLawData({
            source: "elaws",
            xml: lawXMLStruct.xml,
            lawXMLStruct,
        }, onMessage, timing);

    } catch (error) {
        return {
            ok: false,
            error: error as Error,
        };
    }
};
