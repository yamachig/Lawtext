import type { LawInfosStruct } from "./common";
import { lawInfosToByLawnumAndID, Loader } from "./common";
import type { BaseLawInfo } from "../lawinfo";
import { LawInfo } from "../lawinfo";
import type { ElawsLawData } from "../../elawsApi";
import { fetchLawNameList, fetchLawData } from "../../elawsApi";

const fetchBaseLawInfosFromElaws = async (): Promise<BaseLawInfo[]> => {
    const lawNameList = await fetchLawNameList();
    return lawNameList.map(item => {
        const baseLawInfo: BaseLawInfo = {
            LawID: item.LawId,
            LawNum: item.LawNo,
            LawTitle: item.LawName,
            Enforced: true,
            Path: item.LawId,
            XmlName: `${item.LawId}.xml`,
        };
        return baseLawInfo;
    });
};

export class FetchElawsLoader extends Loader {

    public async loadLawInfosStruct(): Promise<LawInfosStruct> {
        const baseLawInfos = await fetchBaseLawInfosFromElaws();
        const lawInfos = baseLawInfos.map(LawInfo.fromBaseLawInfo);
        const [lawInfosByLawnum, lawInfosByLawID] = lawInfosToByLawnumAndID(lawInfos);
        return { lawInfos, lawInfosByLawnum, lawInfosByLawID };
    }

    public async loadBaseLawInfosFromCSV(): Promise<BaseLawInfo[]> {
        return fetchBaseLawInfosFromElaws();
    }

    public async loadLawXMLStructByInfo(lawInfoOrLawIDOrLawNum: BaseLawInfo | string): Promise<ElawsLawData> {
        return fetchLawData(typeof lawInfoOrLawIDOrLawNum === "string" ? lawInfoOrLawIDOrLawNum : lawInfoOrLawIDOrLawNum.LawID);
    }

}

export default FetchElawsLoader;
