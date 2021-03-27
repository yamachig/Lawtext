import { LawData } from "../elaws_api";
import { reLawnum } from "../util";
import * as data_paths from "./paths";
import path from "path";
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
const DOMParser: typeof window.DOMParser = (global["window"] && window.DOMParser) || require("xmldom").DOMParser;
const domParser = new DOMParser();


export type LawInfoListItem = [
    LawID: string,
    LawNum: string,
    LawTitle: string,
    Enforced: boolean,
    Path: string,
    XmlName: string,
    ReferencingLawNums: string[],
    ReferencedLawNums: string[],
]

export interface BaseLawInfo {
    LawID: string,
    LawNum: string,
    LawTitle: string,
    Enforced: boolean,
    Path: string,
    XmlName: string,
}
export class LawInfo implements BaseLawInfo {
    public ReferencingLawNums: Set<string> = new Set();
    public ReferencedLawNums: Set<string> = new Set();
    public constructor(
        public LawID: string,
        public LawNum: string,
        public LawTitle: string,
        public Enforced: boolean,
        public Path: string,
        public XmlName: string,
    ) {}

    public toTuple(): LawInfoListItem {
        return [
            this.LawID,
            this.LawNum,
            this.LawTitle,
            this.Enforced,
            this.Path,
            this.XmlName,
            Array.from(this.ReferencingLawNums),
            Array.from(this.ReferencedLawNums),
        ];
    }

    public static fromBaseLawInfo(baseLawInfo: BaseLawInfo): LawInfo {
        const {
            LawID,
            LawNum,
            LawTitle,
            Enforced,
            Path,
            XmlName,
        } = baseLawInfo;

        const lawInfo = new LawInfo(
            LawID,
            LawNum,
            LawTitle,
            Enforced,
            Path,
            XmlName,
        );

        return lawInfo;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public static getHeader() {
        return [
            "LawID",
            "LawNum",
            "LawTitle",
            "Enforced",
            "Path",
            "XmlName",
            "ReferencingLawNums",
            "ReferencedLawNums",
        ] as const;
    }

    public static fromTuple(tuple: LawInfoListItem): LawInfo {
        const [
            LawID,
            LawNum,
            LawTitle,
            Enforced,
            Path,
            XmlName,
            ReferencingLawNums,
            ReferencedLawNums,
        ] = tuple;

        const lawInfo = new LawInfo(
            LawID,
            LawNum,
            LawTitle,
            Enforced,
            Path,
            XmlName,
        );
        for (const v of ReferencingLawNums) lawInfo.ReferencingLawNums.add(v);
        for (const v of ReferencedLawNums) lawInfo.ReferencedLawNums.add(v);

        return lawInfo;
    }

    public static fromLawData(lawData: LawData, Path: string, XmlName: string, Enforced: boolean): LawInfo {

        const lawInfo = new LawInfo(
            lawData.lawID,
            (lawData.law.getElementsByTagName("LawNum").item(0)?.textContent || "").trim(),
            (lawData.law.getElementsByTagName("LawBody").item(0)?.getElementsByTagName("LawTitle").item(0)?.textContent || "").trim(),
            Enforced,
            Path,
            XmlName,
        );
        // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
        for (const m of lawData.xml.match(new RegExp(reLawnum, "g")) || []) {
            if (m !== lawInfo.LawNum) lawInfo.ReferencingLawNums.add(m);
        }

        return lawInfo;
    }

    public static fromXml(lawID: string, xml: string, Path: string, XmlName: string, Enforced: boolean): LawInfo {
        const law = domParser.parseFromString(xml, "text/xml").getElementsByTagName("Law")[0];
        const lawData = new LawData(lawID, law, null, xml);
        return LawInfo.fromLawData(lawData, Path, XmlName, Enforced);
    }
}

export interface LawList {
    header: ReturnType<typeof LawInfo["getHeader"]>,
    body: LawInfoListItem[],
}

export class LawInfos {
    protected lawInfos: LawInfo[] = [];
    protected lawInfoMap: Map<string, LawInfo[]> = new Map<string, LawInfo[]>();

    public add(lawInfo: LawInfo): void {
        this.lawInfos.push(lawInfo);
        if (!this.lawInfoMap.has(lawInfo.LawNum)) this.lawInfoMap.set(lawInfo.LawNum, []);
        this.lawInfoMap.get(lawInfo.LawNum)?.push(lawInfo);
    }

    public setReferences(): void {
        for (const referencingLawInfo of this.lawInfos) {
            for (const lawnum of Array.from(referencingLawInfo.ReferencingLawNums)) {
                const referencedLawInfos = this.lawInfoMap.get(lawnum);
                if (referencedLawInfos) {
                    for (const referencedLawInfo of referencedLawInfos) {
                        referencedLawInfo.ReferencedLawNums.add(referencingLawInfo.LawNum);
                    }
                } else {
                    referencingLawInfo.ReferencingLawNums.delete(lawnum);
                }
            }
        }
    }

    public getList(): LawList {
        return {
            header: LawInfo.getHeader(),
            body: this.lawInfos.map(lawinfo => lawinfo.toTuple()),
        };
    }
}

export const makeList = async (
    lawIdXmls: AsyncIterable<{lawID: string, xml: string, Path: string, XmlName: string, Enforced: boolean}>,
    totalCount: number,
    onProgress: (ratio: number, message: string) => void = () => undefined,
): Promise<LawList> => {

    const progress = (() => {
        let currentRatio = 0;
        let currentMessage = "";
        return (ratio?: number, message?: string) => {
            currentRatio = ratio || currentRatio;
            currentMessage = message || currentMessage;
            onProgress(currentRatio, currentMessage);
        };
    })();

    let currentLength = 0;
    progress(0, "");
    const lawInfos = new LawInfos();
    for await (const { lawID, xml, Path, XmlName, Enforced } of lawIdXmls) {
        const lawInfo = LawInfo.fromXml(lawID, xml, Path, XmlName, Enforced);
        lawInfos.add(lawInfo);
        currentLength++;
        progress(currentLength / totalCount, `${lawInfo.LawNum}：${lawInfo.LawTitle}`);
    }
    progress(undefined, "Analyzing references...");
    lawInfos.setReferences();
    progress(1);
    progress(undefined, "Generating list...");

    return lawInfos.getList();
};

const lawListByLawnum: { [index: string]: LawInfo[] } = {};
const lawList: LawInfo[] = [];
let lawListReady = false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type TextFetcher = (textPath: string) => Promise<string | null>;

export const ensureList = async (dataPath: string, textFetcher: TextFetcher): Promise<void> => {
    if (!lawListReady) {
        const listJsonPath = data_paths.getListJsonPath(dataPath);
        const text = await textFetcher(listJsonPath);
        if (text === null) return;
        try {
            const json = JSON.parse(text) as LawList;
            for (const [i, h] of LawInfo.getHeader().entries()) {
                if (json.header[i] !== h) throw new Error("List header mismatch");
            }
            for (const item of json.body) {
                const lawInfo = LawInfo.fromTuple(item);
                lawList.push(lawInfo);
                if (!(lawInfo.LawNum in lawListByLawnum)) lawListByLawnum[lawInfo.LawNum] = [];
                lawListByLawnum[lawInfo.LawNum].push(lawInfo);
            }
            console.log(`### loaded ${lawList.length} laws`);
            lawListReady = true;
        } catch (e) {
            console.log(e);
        }
    }
};

export const getLawList = async (dataPath: string, textFetcher: TextFetcher): Promise<[lawList: LawInfo[], lawListByLawnum: { [index: string]: LawInfo[] }]> => {
    await ensureList(dataPath, textFetcher);
    return [lawList, lawListByLawnum];
};

export const getLawXmlByInfo = async (dataPath: string, lawInfo: BaseLawInfo, textFetcher: TextFetcher): Promise<string | null> => {
    const lawdataPath = data_paths.getLawdataPath(dataPath);
    const filepath = path.join(lawdataPath, lawInfo.Path, lawInfo.XmlName);
    const xml = await textFetcher(filepath);
    return xml;
};

export const getLawXml = async (dataPath: string, lawNum: string, textFetcher: TextFetcher): Promise<string | null> => {
    const [/**/, listByLawnum] = await getLawList(dataPath, textFetcher);
    if (!(lawNum in listByLawnum)) return null;
    const lawInfos = listByLawnum[lawNum];
    if (lawInfos.length > 1) console.warn(`getLawXml: ${lawInfos.length} items match for lawNum "${lawNum}".`);
    for (const lawInfo of lawInfos) {
        if (lawInfo.Enforced) {
            return getLawXmlByInfo(dataPath, lawInfo, textFetcher);
        }
    }
    return getLawXmlByInfo(dataPath, lawInfos[0], textFetcher);
};

export const getLawCSVList = async (dataPath: string, textFetcher: TextFetcher): Promise<BaseLawInfo[] | null> => {
    const listCSVPath = data_paths.getListCSVPath(dataPath);
    const csv = await getCSVList(listCSVPath, textFetcher);
    if (csv === null) return null;
    return csv.map(row => {
        const longID = /lawid=(\w+)/.exec(row["本文URL"])?.[1] ?? "";
        const lawInfo: BaseLawInfo = {
            LawID: row["法令ID"],
            LawNum: row["法令番号"],
            LawTitle: row["法令名"],
            Enforced: row["未施行"] === "",
            Path: longID,
            XmlName: `${longID}.xml`,
        };
        return lawInfo;
    });
};

const parseCSV = (origText: string) => {
    const text = origText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimRight() + "\n";
    const lines: string[][] = [];
    let line: string[] = [];
    let inQuote = false;
    let startPos = 0;
    let i = 0;
    while (i < text.length) {
        if (inQuote) {
            if (text[i] === "\"") {
                if (text[i + 1] === "," || text[i + 1] === "\n") {
                    line.push(text.slice(startPos, i));
                    i = i + 2;
                    inQuote = false;
                    startPos = i;
                } else {
                    console.error(`No comma after quote end (pos ${i + 1})`);
                    console.error(text.slice(i - 20, i + 20));
                    inQuote = false;
                    i++;
                }
            } else {
                i++;
            }
        } else {
            if (text[i] === "\"") {
                if (i === startPos) {
                    inQuote = true;
                    i++;
                } else {
                    console.error(`Irregular quote start (pos ${i + 1})`);
                    console.error(text.slice(i - 20, i + 20));
                    inQuote = true;
                    i++;
                }
            } else if (text[i] === ",") {
                line.push(text.slice(startPos, i));
                i++;
                startPos = i;
            } else if (text[i] === "\n") {
                line.push(text.slice(startPos, i));
                lines.push(line);
                line = [];
                i++;
                startPos = i;
            } else {
                i++;
            }
        }
    }
    return lines;
};

export const getCSVList = async (csvPath: string, textFetcher: TextFetcher): Promise<Record<string, string>[] | null> => {
    const text = await textFetcher(csvPath);
    if (text === null) return null;
    // const [headerStr, ...rowStrs] = text.split(/\r?\n/);
    const [header, ...rows] = parseCSV(text);
    // const header = headerStr.split(",");
    const rowItems = rows.map((row, rowI) => {
        // const row = rowStr.split(",");
        if (row.length !== header.length) {
            console.error(`Column mismatch: row ${rowI + 1}`);
        }
        const ret: Record<string, string> = {};
        for (const [i, h] of header.entries()) {
            ret[h] = i < row.length ? row[i] : "";
        }
        return ret;
    });
    return rowItems;
};
