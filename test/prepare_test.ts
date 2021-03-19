import { Bar, Presets } from "cli-progress";
import * as fs from "fs";
import { outputFile } from "fs-extra";
import * as JSZip from "jszip";
import * as path from "path";
import { promisify } from "util";
import { getLawData, getLawNameList, LawInfo, LawInfos, LawNameListInfo, LawData } from "../src/downloader";

let called = false;

let lawdataPath = path.join(__dirname, "lawdata");
export const setLawdataPath = (p: string) => {
    lawdataPath = p;
}

export const prepare = async () => {
    if (called) return;
    called = true;

    const listJsonPath = path.join(lawdataPath, "list.json");
    if (await promisify(fs.exists)(listJsonPath)) return;

    console.log(`Preparing lawdata into ${lawdataPath}...`);    
    
    console.log(`Loading laws list...`);   

    const lawNameList = await getLawNameList();
    
    console.log(`Preparing ${lawNameList.length} law data...`);

    const bar = new Bar({
        format: "[{bar}] {percentage}% | {message}"
    }, Presets.rect);
    const progress = (ratio?: number, message?: string) => {
        const payload = message ? { message: message.length > 30 ? message.slice(0, 30) + " ..." : message } : undefined;
        if (ratio) {
            bar.update(ratio, payload);
        } else if(payload) {
            bar.update(payload);
        }
    };
    bar.start(1, 0);

    const lawInfos = new LawInfos();

    const processLawData = async (lawData: LawData, xmlZipPath: string) => {
        const lawInfo = LawInfo.fromLawData(lawData);
        lawInfos.add(lawInfo);

        const xmlZip = new JSZip();
        xmlZip.file(lawInfo.XmlName, lawData.xml);
        const xmlZipData = await xmlZip.generateAsync({
            type: "uint8array",
            compression: "DEFLATE",
            compressionOptions: {
                level: 9
            }
        });
        await outputFile(xmlZipPath, xmlZipData);
    };

    const processExistingLawData = async (lawNameListInfo: LawNameListInfo, xmlZipPath: string) => {
        const file = await promisify(fs.readFile)(xmlZipPath);
        const xmlZip = await JSZip.loadAsync(file);
        const xml = await xmlZip.file(/.*\.xml/)[0].async("text");
        const lawInfo = LawInfo.fromXml(lawNameListInfo.LawId, xml);
        lawInfos.add(lawInfo);
    };

    let processingDownloadedFile: Promise<void> | null = null;
    for (const [i, lawNameListInfo] of lawNameList.entries()) {
        progress(i / lawNameList.length);
        progress(undefined, `${lawNameListInfo.LawNo}：${lawNameListInfo.LawName}`);
        const xmlZipPath = path.join(lawdataPath, lawNameListInfo.Path, lawNameListInfo.XmlZipName);
        if (await promisify(fs.exists)(xmlZipPath)) {
            await processingDownloadedFile;
            processingDownloadedFile = processExistingLawData(lawNameListInfo, xmlZipPath);
        } else {
            const lawData = await getLawData(lawNameListInfo.LawId);
            await processingDownloadedFile;
            processingDownloadedFile = processLawData(lawData, xmlZipPath);
        }
    }
    await processingDownloadedFile;
    progress(1);
    bar.stop();

    console.log(`Analyzing references...`);
    lawInfos.setReferences();

    console.log(`Emitting list...`);
    const lawlist = lawInfos.getList();
    const listJson = JSON.stringify(lawlist);
    await outputFile(listJsonPath, listJson);
}

export interface LawListInfo {
    LawNum: string;
    ReferencingLawNums: string[];
    ReferencedLawNums: string[];
    LawTitle: string;
    Path: string;
    XmlZipName: string;
}

type LawListItem = [string, string[], string[], string, string, string]

const lawListByLawnum: { [index: string]: LawListInfo } = {};
const lawList: LawListInfo[] = [];
let lawListReady = false;

export const ensureList = async () => {
    if (!lawListReady) {
        const json = require("./lawdata/list.json") as LawListItem[];
        for (const [
            LawNum,
            ReferencingLawNums,
            ReferencedLawNums,
            LawTitle,
            Path,
            XmlZipName,
        ] of json) {
            const obj = {
                LawNum,
                ReferencingLawNums,
                ReferencedLawNums,
                LawTitle,
                Path,
                XmlZipName,
            };
            lawList.push(obj);
            lawListByLawnum[obj.LawNum] = obj;
        }
        console.error(`### loaded ${lawList.length} laws`);
        lawListReady = true;
    }
}

export const getLawList = async (): Promise<[LawListInfo[], { [index: string]: LawListInfo }]> => {
    await ensureList();
    return [lawList, lawListByLawnum];
}

export const getLawXml = async (lawNum: string) => {
    const [/**/, listByLawnum] = await getLawList();
    const lawInfo = listByLawnum[lawNum];
    const zipFilename = path.join(lawdataPath, lawInfo.Path, lawInfo.XmlZipName);
    const file = await promisify(fs.readFile)(zipFilename);
    const xmlZip = await JSZip.loadAsync(file);
    const xml = await xmlZip.file(/.*\.xml/)[0].async("text");
    return xml;
}

if (typeof require !== "undefined" && require.main === module) {
    process.on('unhandledRejection', e => {
        console.dir(e);
        process.exit(1);
    });
    prepare().catch(e => { throw e });
}
