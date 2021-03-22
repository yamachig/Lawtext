import { promisify } from "util";
import path from "path";
import { LawData } from "../elaws_api";
import { reLawnum } from "../util";
import * as dataPaths from "./data_paths";
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
const DOMParser: typeof window.DOMParser = (global["window"] && window.DOMParser) || require("xmldom").DOMParser;
const domParser = new DOMParser();


export type LawInfoListItem = [
    LawID: string,
    LawNum: string,
    LawTitle: string,
    Path: string,
    XmlName: string,
    ReferencingLawNums: string[],
    ReferencedLawNums: string[],
]
export class LawInfo {
    public ReferencingLawNums: Set<string> = new Set();
    public ReferencedLawNums: Set<string> = new Set();
    public constructor(
        public LawID: string,
        public LawNum: string,
        public LawTitle: string,
        public Path: string,
        public XmlName: string,
    ) {}

    public toTuple(): LawInfoListItem {
        return [
            this.LawID,
            this.LawNum,
            this.LawTitle,
            this.Path,
            this.XmlName,
            Array.from(this.ReferencingLawNums),
            Array.from(this.ReferencedLawNums),
        ];
    }

    public static fromTuple(tuple: LawInfoListItem): LawInfo {
        const [
            LawID,
            LawNum,
            LawTitle,
            Path,
            XmlName,
            ReferencingLawNums,
            ReferencedLawNums,
        ] = tuple;

        const lawInfo = new LawInfo(
            LawID,
            LawNum,
            LawTitle,
            Path,
            XmlName,
        );
        for (const v of ReferencingLawNums) lawInfo.ReferencingLawNums.add(v);
        for (const v of ReferencedLawNums) lawInfo.ReferencedLawNums.add(v);

        return lawInfo;
    }

    public static fromLawData(lawData: LawData, Path: string, XmlName: string): LawInfo {

        const lawInfo = new LawInfo(
            lawData.lawID,
            (lawData.law.getElementsByTagName("LawNum").item(0)?.textContent || "").trim(),
            (lawData.law.getElementsByTagName("LawBody").item(0)?.getElementsByTagName("LawTitle").item(0)?.textContent || "").trim(),
            Path,
            XmlName,
        );
        // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
        for (const m of lawData.xml.match(new RegExp(reLawnum, "g")) || []) {
            if (m !== lawInfo.LawNum) lawInfo.ReferencingLawNums.add(m);
        }

        return lawInfo;
    }

    public static fromXml(lawID: string, xml: string, Path: string, XmlName: string): LawInfo {
        const law = domParser.parseFromString(xml, "text/xml").getElementsByTagName("Law")[0];
        const lawData = new LawData(lawID, law, null, xml);
        return LawInfo.fromLawData(lawData, Path, XmlName);
    }
}

export class LawInfos {
    protected lawInfos: LawInfo[] = [];
    protected lawInfoMap: Map<string, LawInfo> = new Map<string, LawInfo>();

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

    public getList(): LawInfoListItem[] {
        return this.lawInfos.map(lawinfo => lawinfo.toTuple());
    }
}

export const makeList = async (
    lawIdXmls: AsyncIterable<{lawID: string, xml: string, Path: string, XmlName: string}>,
    totalCount: number,
    onProgress: (ratio: number, message: string) => void = () => undefined,
): Promise<LawInfoListItem[]> => {

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
    for await (const { lawID, xml, Path, XmlName } of lawIdXmls) {
        const lawInfo = LawInfo.fromXml(lawID, xml, Path, XmlName);
        lawInfos.add(lawInfo);
        currentLength++;
        progress(currentLength / totalCount, `${lawInfo.LawNum}：${lawInfo.LawTitle}`);
    }
    lawInfos.setReferences();
    progress(1);

    return lawInfos.getList();
};

export const saveList = async (
    lawdataDir: string, listJsonPath: string,
    onProgress: (ratio: number, message: string) => void = () => undefined,
): Promise<void> => {
    const fs = await import("fs");

    const progress = (() => {
        let currentRatio = 0;
        let currentMessage = "";
        return (ratio?: number, message?: string) => {
            currentRatio = ratio || currentRatio;
            currentMessage = message || currentMessage;
            onProgress(currentRatio, currentMessage);
        };
    })();

    console.log("\nListing up XMLs...");
    const dirs = (await promisify(fs.readdir)(lawdataDir, { withFileTypes: true })).filter(p => p.isDirectory()).map(p => path.join(lawdataDir, p.name));
    const files: string[] = [];
    for (const dir of dirs) {
        files.push(...(await promisify(fs.readdir)(dir, { withFileTypes: true })).filter(p => p.isFile() && /\.xml$/.exec(p.name)).map(p => path.join(dir, p.name)));
    }

    console.log(`Processing ${files.length} XMLs...`);

    async function* lawIdXmls(files: string[]) {
        for (const file of files) {
            const lawID = /^[A-Za-z0-9]+/.exec(path.basename(file))?.[0] ?? "";
            const xml = await promisify(fs.readFile)(file, { encoding: "utf-8" });
            const Path = path.basename(path.dirname(file));
            const XmlName = path.basename(file);
            yield { lawID, xml, Path, XmlName };
        }
    }

    const list = await makeList(lawIdXmls(files), files.length, progress);
    await promisify(fs.writeFile)(listJsonPath, JSON.stringify(list), { encoding: "utf-8" });
};

const lawListByLawnum: { [index: string]: LawInfo } = {};
const lawList: LawInfo[] = [];
let lawListReady = false;

export const ensureList = async (dataPath: string): Promise<void> => {
    const listJsonPath = dataPaths.getListJsonPath(dataPath);
    if (!lawListReady) {
        const json = (await require(listJsonPath)) as LawInfoListItem[];
        for (const item of json) {
            const lawInfo = LawInfo.fromTuple(item);
            lawList.push(lawInfo);
            lawListByLawnum[lawInfo.LawNum] = lawInfo;
        }
        console.error(`### loaded ${lawList.length} laws`);
        lawListReady = true;
    }
};

export const getLawList = async (dataPath: string): Promise<[LawInfo[], { [index: string]: LawInfo }]> => {
    await ensureList(dataPath);
    return [lawList, lawListByLawnum];
};

export const getLawXml = async (dataPath: string, lawNum: string): Promise<string> => {
    const fs = await import("fs");
    const [/**/, listByLawnum] = await getLawList(dataPath);
    const lawInfo = listByLawnum[lawNum];
    const lawdataPath = dataPaths.getLawdataPath(dataPath);
    const filename = path.join(lawdataPath, lawInfo.Path, lawInfo.XmlName);
    const xml = await promisify(fs.readFile)(filename, { encoding: "utf-8" });
    return xml;
};

const main = async (): Promise<void> => {
    const yargs = await import("yargs");
    const { ProgressBar } = await import("../term_util");

    const args = yargs.options({
        "data-dir": { type: "string", demandOption: true, alias: "d" },
    }).argv;

    const lawdataDir = dataPaths.getLawdataPath(args["data-dir"]);
    const listJsonPath = dataPaths.getListJsonPath(args["data-dir"]);

    const bar = new ProgressBar();
    const progress = bar.progress.bind(bar);

    bar.start(1, 0);
    await saveList(lawdataDir, listJsonPath, progress);
    bar.stop();
};

if (typeof require !== "undefined" && require.main === module) {
    process.on("unhandledRejection", (e: Error) => {
        console.error(e);
        console.error(e.stack);
        process.exit(1);
    });
    main().catch(e => { throw e; });
}


