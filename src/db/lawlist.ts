import { LawData, LawNameListInfo } from "../elaws_api";
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
const DOMParser: typeof window.DOMParser = (global["window"] && window.DOMParser) || require("xmldom").DOMParser;
const domParser = new DOMParser();

export const reLawnum = /(?:(?:明治|大正|昭和|平成|令和)[元〇一二三四五六七八九十]+年(?:(?:\S+?第[〇一二三四五六七八九十百千]+号|人事院規則[―〇一二三四五六七八九]+)|[一二三四五六七八九十]+月[一二三四五六七八九十]+日内閣総理大臣決定|憲法)|明治三十二年勅令|大正十二年内務省・鉄道省令|昭和五年逓信省・鉄道省令|昭和九年逓信省・農林省令|人事院規則一〇―一五)/g;

export class LawInfo {

    constructor(
        public LawNum: string = "",
        public LawTitle: string = "",
        public Path: string = "",
        public XmlZipName: string = "",
        public XmlName: string = "",
        public ReferencingLawNums: Set<string> = new Set(),
        public ReferencedLawNums: Set<string> = new Set(),
    ) { }

    public static fromLawData(lawData: LawData): LawInfo {
        const elLawNm = lawData.law.getElementsByTagName("LawNum")[0];
        const elLawBody = lawData.law.getElementsByTagName("LawBody")[0];
        const elLawTitle = elLawBody.getElementsByTagName("LawTitle")[0];

        const lawInfo = new LawInfo();
        lawInfo.LawNum = (elLawNm.textContent || "").trim();
        for (const m of lawData.xml.match(reLawnum) || []) lawInfo.ReferencingLawNums.add(m);
        lawInfo.LawTitle = (elLawTitle.textContent || "").trim();
        
        const lawNameListInfo = new LawNameListInfo(
            lawData.lawID,
            lawInfo.LawTitle,
            lawInfo.LawNum,
            "",
        );

        lawInfo.Path = lawNameListInfo.Path;
        lawInfo.XmlZipName = lawNameListInfo.XmlZipName;
        lawInfo.XmlName = lawNameListInfo.XmlName;

        return lawInfo;
    }

    public static fromXml(lawID: string, xml: string): LawInfo {
        const law = domParser.parseFromString(xml, "text/xml").getElementsByTagName("Law")[0];
        const lawData = new LawData(lawID, "", law, null, xml);
        return LawInfo.fromLawData(lawData);
    }
}

export class LawInfos {
    constructor(
        protected lawInfos: LawInfo[] = [],
        protected lawInfoMap: Map<string, LawInfo> = new Map<string, LawInfo>(),
    ) { }

    public add(lawInfo: LawInfo): void {
        this.lawInfos.push(lawInfo);
        this.lawInfoMap.set(lawInfo.LawNum, lawInfo);
    }

    public setReferences(): void {
        for (const referencingLawInfo of this.lawInfos) {
            for (const lawnum of Array.from(referencingLawInfo.ReferencingLawNums)) {
                const referencedLawInfo = this.lawInfoMap.get(lawnum);
                if (referencedLawInfo) {
                    referencedLawInfo.ReferencedLawNums.add(referencingLawInfo.LawNum);
                } else {
                    referencingLawInfo.ReferencingLawNums.delete(lawnum);
                }
            }
        }
    }

    public getList(): (string | string[])[][] {
        return this.lawInfos.map(lawinfo => [
            lawinfo.LawNum,
            Array.from(lawinfo.ReferencingLawNums),
            Array.from(lawinfo.ReferencedLawNums),
            lawinfo.LawTitle,
            lawinfo.Path,
            lawinfo.XmlZipName,
        ]);
    }
}
