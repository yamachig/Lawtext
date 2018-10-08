import * as JSZip from "jszip"
import * as fs from "fs"
import { outputFile } from "fs-extra"
import * as path from "path"
import { download } from "../src/downloader"
import { promisify } from "util";
import { Bar, Presets } from "cli-progress"

let called = false;

const lawdataPath = path.join(__dirname, "lawdata");

export async function prepare() {
    if (called) return;
    called = true;

    if (await promisify(fs.exists)(lawdataPath)) return;

    console.log(`Preparing lawdata into ${lawdataPath}...`);

    const bar = new Bar({
        format: "[{bar}] {percentage}% | {message}"
    }, Presets.rect);
    bar.start(1, 0);
    const data = (await download({ withoutPict: true }, (ratio, message) => {
        bar.update(
            ratio,
            { message: message.length > 30 ? message.slice(0, 30) + " ..." : message },
        );
    })).withoutPict;
    bar.stop();

    const zipFile = await JSZip.loadAsync(data);
    const items: [string, JSZip.JSZipObject][] = [];
    zipFile.forEach((relativePath, file) => {
        items.push([relativePath, file]);
    });
    for (const [relativePath, file] of items) {
        if (file.dir) continue;
        const buf = await file.async("arraybuffer");
        var destPath = path.join(lawdataPath, relativePath);
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

const listByLawnum: { [index: string]: LawListInfo } = {};
const list: LawListInfo[] = [];
var _listReady = false;

export async function ensureList() {
    if (!_listReady) {
        const json = require("./lawdata/list.json") as LawListItem[];
        for (let [
            LawNum,
            ReferencingLawNums,
            ReferencedLawNums,
            LawTitle,
            Path,
            XmlZipName,
        ] of json) {
            let obj = {
                LawNum: LawNum,
                ReferencingLawNums: ReferencingLawNums,
                ReferencedLawNums: ReferencedLawNums,
                LawTitle: LawTitle,
                Path: Path,
                XmlZipName: XmlZipName,
            };
            list.push(obj);
            listByLawnum[obj.LawNum] = obj;
        }
        console.error(`### loaded ${list.length} laws`);
        _listReady = true;
    }
}

export async function getLawList(): Promise<[LawListInfo[], { [index: string]: LawListInfo }]> {
    await ensureList();
    return [list, listByLawnum];
}

export async function getLawXml(lawNum: string) {
    const [/**/, listByLawnum] = await getLawList();
    const lawInfo = listByLawnum[lawNum];
    const zipFilename = path.join(lawdataPath, lawInfo.Path, lawInfo.XmlZipName);
    const file = await promisify(fs.readFile)(zipFilename);
    const xmlZip = await JSZip.loadAsync(file);
    const xml = await xmlZip.file(/.*\.xml/)[0].async("text");
    return xml;
}

if (typeof require !== "undefined" && require.main === module) {
    prepare();
}
