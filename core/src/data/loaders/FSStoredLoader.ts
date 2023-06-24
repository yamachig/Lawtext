import iconv from "iconv-lite";
import { csvTextToLawInfos, jsonTextToLawInfos, LawInfosStruct, LawXMLStruct, Loader } from "./common";
import { BaseLawInfo } from "../lawinfo";
import * as data_paths from "../paths";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { pictMimeDict } from "../../util";

const readText = async (textPath: string) => {
    try {
        const text = await promisify(fs.readFile)(textPath, { encoding: "utf-8" });
        return text;
    } catch (e) {
        console.log(e);
        return null;
    }
};

const readSjisText = async (textPath: string) => {
    try {
        const buf = await promisify(fs.readFile)(textPath);
        return iconv.decode(Buffer.from(buf), "Shift_JIS");
    } catch (e) {
        console.log(e);
        return null;
    }
};

export class FSStoredLawXML extends LawXMLStruct {
    constructor(
        public lawdataPath: string,
        public lawInfo: BaseLawInfo,
        private _xml: string,
    ) {
        super();
    }
    public get xml(): string {
        return this._xml;
    }
    public async getPictFileOrBlobURL(src: string): Promise<{url: string, type: string} | null> {
        const url = path.join(this.lawdataPath, this.lawInfo.Path, src);
        // const res = await fetch(url, { method: "HEAD" });
        // if (!res.ok) return null;
        const ext = path.extname(src) as keyof typeof pictMimeDict;
        const type = ext in pictMimeDict ? pictMimeDict[ext] : "application/octet-stream";
        return { url, type };
    }
    public async getPictBlob(src: string): Promise<{buf: ArrayBuffer, type: string} | null> {
        const _url = await this.getPictFileOrBlobURL(src);
        if (!_url) return null;
        const { url, type } = _url;
        const buf = await promisify(fs.readFile)(url);
        if (!buf) return null;
        return { buf, type };
    }

}

export class FSStoredLoader extends Loader {

    public constructor(
        public dataPath: string,
    ) {
        super();
    }

    public get listJsonPath(): string { return data_paths.getListJsonPath(this.dataPath); }
    public get listCSVPath(): string { return data_paths.getListCSVPath(this.dataPath); }
    public get lawdataPath(): string { return data_paths.getLawdataPath(this.dataPath); }

    public async loadLawInfosStruct(): Promise<LawInfosStruct> {
        const text = await readText(this.listJsonPath);
        if (text === null) throw new Error(`Text cannot be fetched: ${this.listJsonPath}`);
        return jsonTextToLawInfos(text);
    }

    public async loadBaseLawInfosFromCSV(): Promise<BaseLawInfo[]> {
        const text = await readSjisText(this.listCSVPath);
        if (text === null) throw new Error(`Text cannot be fetched: ${this.listCSVPath}`);
        return csvTextToLawInfos(text);
    }

    public getXmlPath(lawInfo: BaseLawInfo): string {
        return path.join(this.lawdataPath, lawInfo.Path, lawInfo.XmlName);
    }

    public async loadLawXMLStructByInfo(lawInfo: BaseLawInfo): Promise<FSStoredLawXML> {
        const filepath = this.getXmlPath(lawInfo);
        const text = await readText(filepath);
        if (text === null) throw new Error(`Text cannot be fetched: ${filepath}`);
        return new FSStoredLawXML(this.lawdataPath, lawInfo, text);
    }

    public async listCSVExists(): Promise<boolean> {
        return promisify(fs.exists)(this.listCSVPath);
    }

    public async listJsonExists(): Promise<boolean> {
        return promisify(fs.exists)(this.listJsonPath);
    }
}

export default FSStoredLoader;
