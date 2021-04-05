import iconv from "iconv-lite";
import { csvTextToLawInfos, jsonTextToLawInfos, LawInfosStruct, Loader } from "./common";
import { BaseLawInfo } from "../lawinfo";
import * as data_paths from "../paths";
import { promisify } from "util";
import fs from "fs";
import path from "path";

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

    public async loadLawXMLByInfo(lawInfo: BaseLawInfo): Promise<string> {
        const filepath = this.getXmlPath(lawInfo);
        const text = await readText(filepath);
        if (text === null) throw new Error(`Text cannot be fetched: ${filepath}`);
        return text;
    }

    public async listCSVExists(): Promise<boolean> {
        return promisify(fs.exists)(this.listCSVPath);
    }

    public async listJsonExists(): Promise<boolean> {
        return promisify(fs.exists)(this.listJsonPath);
    }
}
