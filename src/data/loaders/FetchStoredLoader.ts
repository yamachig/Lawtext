import iconv from "iconv-lite";
import { csvTextToLawInfos, jsonTextToLawInfos, LawInfosStruct, LawXMLStruct, Loader } from "./common";
import { BaseLawInfo } from "../lawinfo";
import * as data_paths from "../paths";
import path from "path";
import { fetch as nodeFetch } from "../../util/node-fetch";
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

export class StoredLawXML extends LawXMLStruct {
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
        const res = await fetch(url, { method: "HEAD" });
        if (!res.ok) return null;
        return { url, type: res.headers.get("Content-Type") ?? "" };
    }
    public async getPictBlob(src: string): Promise<{buf: ArrayBuffer, type: string} | null> {
        const url = path.join(this.lawdataPath, this.lawInfo.Path, src);
        const res = await fetch(url);
        if (!res.ok) return null;
        const blob = await res.blob();
        return { buf: await blob.arrayBuffer(), type: res.headers.get("Content-Type") ?? "" };
    }

}


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

    public async loadLawXMLStructByInfo(lawInfo: BaseLawInfo): Promise<StoredLawXML> {
        const filepath = path.join(this.lawdataPath, lawInfo.Path, lawInfo.XmlName);
        const text = await fetchText(filepath);
        if (text === null) throw new Error("Text cannot be fetched");
        return new StoredLawXML(this.lawdataPath, lawInfo, text);
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

export default FetchStoredLoader;
