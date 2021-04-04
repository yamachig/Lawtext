import { getTempLaw } from "../actions/temp_law";
import { fetchLawData } from "@coresrc/elaws_api";
import JSZip from "jszip";
import path from "path";
import { ElawsLawDataProps, LawDataResult, StoredLawDataProps, TempXMLLawDataProps, TempLawtextLawDataProps, toLawData } from "./common";
import { storedLoader } from "./loaders";
import { searchLawnum } from "./searchLawNum";
import * as util from "@coresrc/util";


export const navigateLawData = async (
    lawSearchKey: string,
    onMessage: (message: string) => unknown,
): Promise<LawDataResult<TempXMLLawDataProps | TempLawtextLawDataProps | StoredLawDataProps | ElawsLawDataProps>> => {

    const text = getTempLaw(lawSearchKey);
    if (text !== null) {
        if (/^(?:<\?xml|<Law)/.test(text.trim())) {
            onMessage("法令XMLをパースしています...");
            await util.wait(30);
            return toLawData({
                source: "temp_xml",
                xml: text,
            });
        } else {
            onMessage("Lawtextをパースしています...");
            await util.wait(30);
            return toLawData({
                source: "temp_lawtext",
                lawtext: text,
            });
        }
    }

    onMessage("法令番号を検索しています...");
    const lawnum = await searchLawnum(lawSearchKey);
    if (!lawnum) {
        return {
            ok: false,
            error: new Error(`「${lawSearchKey}」を検索しましたが、見つかりませんでした。`),
        };
    }

    try {
        onMessage("保存されている法令情報を探しています...");
        const lawInfo = await storedLoader.getLawInfoByLawNum(lawnum);
        if (!lawInfo) throw null;

        onMessage("保存されている法令XMLの取得を試みています...");
        const xml = lawInfo && await storedLoader.loadLawXMLByInfo(lawInfo);
        if (!xml) throw null;

        onMessage("法令XMLをパースしています...");
        await util.wait(30);
        return toLawData({
            source: "stored",
            xml,
            lawPath: lawInfo.Path,
        });
    } catch {
        //
    }

    try {
        onMessage("e-Gov 法令APIから法令XMLを取得しています...");
        const elawsLawData = await fetchLawData(lawnum);

        let pict: Map<string, Blob> | null = null;
        if (elawsLawData.imageData) {
            onMessage("画像情報を読み込んでいます...");
            pict = new Map();
            const zip = new JSZip(elawsLawData.imageData);
            for (const relPath in zip.files) {
                pict.set(
                    path.join("./pict", relPath),
                    await zip.files[relPath].async("blob"),
                );
            }
        }

        onMessage("法令XMLをパースしています...");
        await util.wait(30);
        return toLawData({
            source: "elaws",
            xml: elawsLawData.xml,
            pict,
        });

    } catch (error) {
        return {
            ok: false,
            error,
        };
    }
};
