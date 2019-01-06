import { Bar, Presets } from "cli-progress";
import * as fs from "fs";
import { outputFile } from "fs-extra";
import * as JSZip from "jszip";
import * as path from "path";
import { promisify } from "util";
import { download } from "../src/downloader";

let called = false;

const lawdataPath = path.join(__dirname, "lawdata");

export const prepare = async () => {
    if (called) return;
    called = true;

    if (await promisify(fs.exists)(lawdataPath)) return;

    console.log(`Preparing lawdata into ${lawdataPath}...`);

    const bar = new Bar({
        format: "[{bar}] {percentage}% | {message}"
    }, Presets.rect);
    bar.start(1, 0);
    const data = (await download({ withoutPict: true }, undefined, (ratio, message) => {
        bar.update(
            ratio,
            { message: message.length > 30 ? message.slice(0, 30) + " ..." : message },
        );
    })).withoutPict;
    bar.stop();

    const zipFile = await JSZip.loadAsync(data);
    const items: Array<[string, JSZip.JSZipObject]> = [];
    zipFile.forEach((relativePath, file) => {
        items.push([relativePath, file]);
    });
    for (const [relativePath, file] of items) {
        if (file.dir) continue;
        const buf = await file.async("arraybuffer");
        const destPath = path.join(lawdataPath, relativePath);
        await outputFile(destPath, new Buffer(buf));
    }

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
    prepare();
}
