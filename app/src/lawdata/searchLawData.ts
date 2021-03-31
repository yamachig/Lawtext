import { LawInfo } from "@coresrc/data/lawinfo";
import { getTempLaw } from "../actions/temp_law";
import { fetchLawData } from "@coresrc/elaws_api";
import JSZip from "jszip";
import path from "path";
import { ElawsLawDataProps, LawDataResult, StoredLawDataProps, TempXMLLawDataProps, TempLawtextLawDataProps, toLawData } from "./common";
import { storedLoader } from "./loaders";
import { searchLawnum } from "./searchLawNum";


export const searchLawData = async (lawSearchKey: string): Promise<LawDataResult<TempXMLLawDataProps | TempLawtextLawDataProps | StoredLawDataProps | ElawsLawDataProps>> => {
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
    const lawnum = await searchLawnum(lawSearchKey);
    if (!lawnum) {
        return {
            ok: false,
            error: new Error(`「${lawSearchKey}」を検索しましたが、見つかりませんでした。`),
        };
    }
    return getLawDataByNum(lawnum);
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
