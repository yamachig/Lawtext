import { BaseLawInfo, LawInfo, LawListGenerator, LawList } from "../lawinfo";

export interface LawInfosStruct {lawInfos: LawInfo[], lawInfosByLawnum: { [index: string]: LawInfo[] }}

export abstract class Loader {
    public abstract loadLawInfosStruct(): Promise<LawInfosStruct>;
    public abstract loadBaseLawInfosFromCSV(): Promise<BaseLawInfo[]>;
    public abstract loadLawXMLByInfo(info: BaseLawInfo): Promise<string>;

    protected _cache = {
        lawListStruct: null as LawInfosStruct | null,
    }

    public async cacheLawListStruct(): Promise<LawInfosStruct> {
        if (this._cache.lawListStruct === null) {
            console.info("### Loading law list into cache... ###");
            this._cache.lawListStruct = await this.loadLawInfosStruct();
            console.info(`### Loaded law list into cache (${this._cache.lawListStruct.lawInfos.length} items) ###`);
        }
        return this._cache.lawListStruct;
    }

    public async getLawInfoByLawNum(lawNum: string): Promise<LawInfo | null> {
        const { lawInfosByLawnum } = await this.cacheLawListStruct();
        if (!(lawNum in lawInfosByLawnum)) return null;
        const lawInfos = lawInfosByLawnum[lawNum];
        if (lawInfos.length > 1) console.warn(`getLawXml: ${lawInfos.length} items match for lawNum "${lawNum}".`);
        for (const lawInfo of lawInfos) {
            if (lawInfo.Enforced) {
                return lawInfo;
            }
        }
        return lawInfos[0];
    }

    public async makeLawListFromBaseLawInfos(
        baseLawInfos: BaseLawInfo[],
        onProgress: (ratio: number, message: string) => void = () => undefined,
    ): Promise<LawList> {

        const progress = (() => {
            let currentRatio = 0;
            let currentMessage = "";
            return (ratio?: number, message?: string) => {
                currentRatio = ratio ?? currentRatio;
                currentMessage = message ?? currentMessage;
                onProgress(currentRatio, currentMessage);
            };
        })();

        let currentLength = 0;
        progress(0, "");
        const generator = new LawListGenerator();
        for (const baseLawInfo of baseLawInfos) {
            progress(currentLength / baseLawInfos.length, `${baseLawInfo.LawNum}：${baseLawInfo.LawTitle}`);
            const xml = await this.loadLawXMLByInfo(baseLawInfo);
            if (xml === null) {
                console.error("XML cannot fetched", baseLawInfo);
                continue;
            }
            const lawInfo = LawInfo.fromBaseLawInfo(baseLawInfo);
            lawInfo.addReferencingLawNums(xml);
            generator.add(lawInfo);
            currentLength++;
        }
        progress(undefined, "Analyzing references...");
        generator.setReferences();
        progress(1);
        progress(undefined, "Generating list...");

        return generator.getList();
    }
}

export const jsonTextToLawInfos = (text: string): LawInfosStruct => {
    const json = JSON.parse(text) as LawList;
    for (const [i, h] of LawInfo.getHeader().entries()) {
        if (json.header[i] !== h) throw new Error("List header mismatch");
    }
    const lawInfos = json.body.map(LawInfo.fromTuple);
    const lawInfosByLawnum = lawInfosToByLawnum(lawInfos);
    return { lawInfos, lawInfosByLawnum };
};

export const lawInfosToByLawnum = (lawInfos: LawInfo[]): {
    [index: string]: LawInfo[];
} => {
    const lawInfosByLawnum: { [index: string]: LawInfo[] } = {};
    for (const lawInfo of lawInfos) {
        if (!(lawInfo.LawNum in lawInfosByLawnum)) lawInfosByLawnum[lawInfo.LawNum] = [];
        lawInfosByLawnum[lawInfo.LawNum].push(lawInfo);
    }
    return lawInfosByLawnum;
};


export const csvTextToLawInfos = (text: string): BaseLawInfo[] => {
    const csv = parseCSVList(text);
    if (csv === null) throw new Error("Text cannot be parsed");
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

const parseCSVList = (text: string): Record<string, string>[] | null => {
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
