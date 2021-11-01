import iconv from "iconv-lite";
import { csvTextToLawInfos, jsonTextToLawInfos, LawInfosStruct, Loader } from "./common";
import { BaseLawInfo } from "../lawinfo";
import * as data_paths from "../paths";
import path from "path";
const nodeFetch:
    (typeof import("node-fetch/@types/index"))["default"]
= (
    (...args) =>
        import("node-fetch")
            .then(
                ({ default: fetch }) =>
                    (fetch)(...args),
            )
);
const fetch: typeof window.fetch = (global["window"] && window.fetch) || nodeFetch;

const fetchText = async (textPath: string) => {
    try {
        const res = await fetch(textPath);
        if (!res.ok) {
            console.log(res.statusText);
            return null;
        }
        return await res.text();
    } catch (e) {
        console.log(e);
        return null;
    }
};

const fetchSjisText = async (textPath: string) => {
    try {
        const res = await fetch(textPath);
        if (!res.ok) {
            console.log(res.statusText);
            return null;
        }
        const buf = await res.arrayBuffer();
        return iconv.decode(Buffer.from(buf), "Shift_JIS");
    } catch (e) {
        console.log(e);
        return null;
    }
};

export class FetchStoredLoader extends Loader {

    public constructor(
        public dataPath: string,
    ) {
        super();
    }

    public get listJsonPath(): string { return data_paths.getListJsonPath(this.dataPath); }
    public get listCSVPath(): string { return data_paths.getListCSVPath(this.dataPath); }
    public get lawdataPath(): string { return data_paths.getLawdataPath(this.dataPath); }

    public async loadLawInfosStruct(): Promise<LawInfosStruct> {
        const text = await fetchText(this.listJsonPath);
        if (text === null) throw new Error("Text cannot be fetched");
        return jsonTextToLawInfos(text);
    }

    public async loadBaseLawInfosFromCSV(): Promise<BaseLawInfo[]> {
        const text = await fetchSjisText(this.listCSVPath);
        if (text === null) throw new Error("Text cannot be fetched");
        return csvTextToLawInfos(text);
    }

    public async loadLawXMLByInfo(lawInfo: BaseLawInfo): Promise<string> {
        const filepath = path.join(this.lawdataPath, lawInfo.Path, lawInfo.XmlName);
        const text = await fetchText(filepath);
        if (text === null) throw new Error("Text cannot be fetched");
        return text;
    }

    public async listCSVExists(): Promise<boolean> {
        try {
            const res = await fetch(this.listCSVPath, { method: "HEAD" });
            return res.ok;
        } catch (e) {
            return false;
        }
    }

    public async listJsonExists(): Promise<boolean> {
        try {
            const res = await fetch(this.listJsonPath, { method: "HEAD" });
            return res.ok;
        } catch (e) {
            return false;
        }
    }
}
