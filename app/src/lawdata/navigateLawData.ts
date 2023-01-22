import { getTempLaw } from "../actions/temp_law";
import { ElawsLawDataProps, StoredLawDataProps, TempXMLLawDataProps, TempLawtextLawDataProps } from "./common";
import { elawsLoader, storedLoader } from "./loaders";
import { searchLawnum } from "./searchLawNum";
import * as util from "lawtext/dist/src/util";
import { LawDataResult, Timing, toLawData } from "lawtext/dist/src/data/lawdata";
import { ptnLawNumLike } from "lawtext/dist/src/law/lawNum";
import parsePath from "lawtext/dist/src/path/v1/parse";
import { parseLawID } from "lawtext/dist/src/law/lawID";

export const navigateLawData = async (
    pathStr: string,
    onMessage: (message: string) => unknown,
    timing: Timing,
): Promise<LawDataResult<TempXMLLawDataProps | TempLawtextLawDataProps | StoredLawDataProps | ElawsLawDataProps>> => {

    const firstPart = pathStr.split("/")[0];

    const text = getTempLaw(firstPart);
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

    let lawIDOrLawNum: string | null;

    {
        let lawID: string | null = null;
        let lawnum: string | null = null;

        const v1Match = /^v1:(.+)$/.exec(pathStr);
        if (v1Match) {
            const path = parsePath(v1Match[1]);
            if (!path.ok) {
                return {
                    ok: false,
                    error: new Error(`パス「${v1Match[1]}」にエラーがあります：${JSON.stringify(path.errors)}`),
                };
            }
            const firstFragment = path.value[0];
            if (firstFragment.type !== "LAW") {
                return {
                    ok: false,
                    error: new Error(`パス「${v1Match[1]}」の先頭には法令IDを指定してください。`),
                };
            }
            lawID = firstFragment.text;
        }

        const reLawNumLike = new RegExp(`^(?:${ptnLawNumLike})$`);
        if (lawID === null && parseLawID(firstPart)) {
            lawID = firstPart;

        } else if (reLawNumLike.test(firstPart)) {
            lawnum = firstPart;

        }

        lawIDOrLawNum = lawID ?? lawnum;

    }


    if (lawIDOrLawNum === null) {
        onMessage("法令番号を検索しています...");
        // console.log("navigateLawData: searching lawnum...");
        const [searchLawNumTime, lawnumResult] = await util.withTime(searchLawnum)(firstPart);
        timing.searchLawNum = searchLawNumTime;

        if (!lawnumResult) {
            return {
                ok: false,
                error: new Error(`「${firstPart}」を検索しましたが、見つかりませんでした。`),
            };
        } else if (typeof lawnumResult !== "string") {
            return {
                ok: false,
                error: new Error(`「${firstPart}」の検索時にエラーが発生しました： ${lawnumResult.error}: "${lawnumResult.message}"`),
            };
        }

        lawIDOrLawNum = lawnumResult;
    }


    try {
        onMessage("保存されている法令情報を探しています...");
        // console.log(`navigateLawData: fetching stored law info for "${lawnum}"...`);
        const [fetchStoredLawInfoTime, lawInfo] = await util.withTime(storedLoader.getLawInfoByLawIDOrLawNum.bind(storedLoader))(lawIDOrLawNum);
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
        console.log(`navigateLawData: fetching law data via e-LAWS API for "${lawIDOrLawNum}"...`);
        const [loadDataTime, lawXMLStruct] = await util.withTime(elawsLoader.loadLawXMLStructByInfo.bind(storedLoader))(lawIDOrLawNum);
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
