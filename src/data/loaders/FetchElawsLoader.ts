import { LawInfosStruct, lawInfosToByLawnum, Loader } from "./common";
import { BaseLawInfo, LawInfo } from "../lawinfo";
import { fetchLawNameList, fetchLawData } from "@coresrc/elaws_api";

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
        const lawInfosByLawnum = lawInfosToByLawnum(lawInfos);
        return { lawInfos, lawInfosByLawnum };
    }

    public async loadBaseLawInfosFromCSV(): Promise<BaseLawInfo[]> {
        return fetchBaseLawInfosFromElaws();
    }

    public async loadLawXMLByInfo(lawInfo: BaseLawInfo): Promise<string> {
        const lawData = await fetchLawData(lawInfo.LawID);
        return lawData.xml;
    }

}
