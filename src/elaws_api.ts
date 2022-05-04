import JSZip from "jszip";
import path from "path";
import { LawXMLStruct } from "./data/loaders/common";
import { decodeBase64, pictMimeDict } from "./util";
import { fetch as nodeFetch } from "./util/node-fetch";
const fetch: typeof window.fetch = (global["fetch"]) || (global["window"] && window.fetch) || nodeFetch;
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
const DOMParser: typeof window.DOMParser = (global["window"] && window.DOMParser) || require("@xmldom/xmldom").DOMParser;
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
const XMLSerializer: typeof window.XMLSerializer = (global["window"] && window.XMLSerializer) || require("@xmldom/xmldom").XMLSerializer;
const domParser = new DOMParser();
const xmlSerializer = new XMLSerializer();
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
// const Blob: typeof window.Blob = (global["window"] && window.Blob) || require("buffer").Blob;

export const lawlistsURL = "https://elaws.e-gov.go.jp/api/1/lawlists/1";
export const lawdataURL = "https://elaws.e-gov.go.jp/api/1/lawdata/";
export const articlesURL = "https://elaws.e-gov.go.jp/api/1/articles/";
export const allXMLZipURL = "https://elaws.e-gov.go.jp/download?file_section=1&only_xml_flag=true";

export const fetchElaws = async (url: string, retry = 5): Promise<Element> => {
    if (retry <= 0) {
        throw Error("fetchElaws(): Failed after retries");
    }

    let text: string;
    try {
        const response = await fetch(url, {
            mode: "cors",
        });
        if (!response.ok) throw Error(response.statusText);
        text = await response.text();
    } catch (e) {
        console.error(e);
        console.error("request URL: " + url);
        console.error(`remaining retries: ${retry - 1}`);
        return fetchElaws(url, retry - 1);
    }

    const doc = domParser.parseFromString(text, "text/xml") as XMLDocument;
    const elResult = doc.getElementsByTagName("DataRoot").item(0)?.getElementsByTagName("Result").item(0);
    const elCode = elResult?.getElementsByTagName("Code").item(0);
    if (!elCode) {
        console.log("request URL: " + url);
        console.log(`remaining retries: ${retry - 1}`);
        await new Promise(r => setTimeout(r, 1000));
        return await fetchElaws(url, retry - 1);
    }
    if (elCode.textContent !== "0") {
        const msg = elResult?.getElementsByTagName("Message").item(0)?.textContent;
        console.log("request URL: " + url);
        throw Error(msg ?? "fetchElaws(): Unknown Error in XML\nrequest URL");
    }
    const ret = doc.getElementsByTagName("DataRoot").item(0)?.getElementsByTagName("ApplData").item(0);
    if (!ret) {
        console.log("request URL: " + url);
        throw Error("fetchElaws(): ApplData element not exist");
    }
    return ret;
};

export class LawNameListInfo {
    constructor(
        public LawId: string,
        public LawName: string,
        public LawNo: string,
        public PromulgationDate: string,
    ) { }
}

export const fetchLawNameList = async (): Promise<LawNameListInfo[]> => {
    const elApplData = await fetchElaws(lawlistsURL);
    const lawNameList: LawNameListInfo[] = [];
    for (const el of Array.from(elApplData.getElementsByTagName("LawNameListInfo"))) {
        lawNameList.push(new LawNameListInfo(
            el.getElementsByTagName("LawId").item(0)?.textContent ?? "",
            el.getElementsByTagName("LawName").item(0)?.textContent ?? "",
            el.getElementsByTagName("LawNo").item(0)?.textContent ?? "",
            el.getElementsByTagName("PromulgationDate").item(0)?.textContent ?? "",
        ));
    }
    return lawNameList;
};


export class ElawsLawData extends LawXMLStruct {
    constructor(
        public readonly lawID: string,
        public readonly law: Element,
        public readonly imageData: Uint8Array | null,
        private _xml: string | null = null,
    ) {
        super();
    }
    // private blobURLs: string[] = [];
    // public override clean() {
    // console.log(`Revoking ${this.blobURLs.length} blob URLs`);
    // while (this.blobURLs.length > 0) {
    //     const url = this.blobURLs.pop();
    //     if (url) URL.revokeObjectURL(url);
    // }
    // }
    private _pict: Map<string, {buf: ArrayBuffer, type: string}> | null = null;
    private getXml() {
        const doc = this.law.ownerDocument.implementation.createDocument("", "", null);
        doc.appendChild(doc.createProcessingInstruction("xml", "version=\"1.0\" encoding=\"UTF-8\""));
        doc.appendChild(this.law);
        return xmlSerializer.serializeToString(doc);
    }
    public get xml(): string {
        this._xml = this._xml === null ? this.getXml() : this._xml;
        return this._xml;
    }
    public async getPictFileOrBlobURL(src: string): Promise<{url: string, type: string} | null> {
        const _buf = await this.getPictBlob(src);
        if (!_buf) return null;
        const { buf, type } = _buf;
        const url = `data:${type};base64,${Buffer.from(buf).toString("base64")}`;
        // this.blobURLs.push(url);
        return { url, type };
    }
    public async ensurePict(): Promise<Map<string, {buf: ArrayBuffer, type: string}> | null> {
        if (!this.imageData) return null;
        if (!this._pict) {
            this._pict = new Map();
            const zip = await JSZip.loadAsync(this.imageData);
            for (const relPath in zip.files) {
                const buf = await zip.files[relPath].async("arraybuffer");
                const ext = path.extname(relPath) as keyof typeof pictMimeDict;
                const type = ext in pictMimeDict ? pictMimeDict[ext] : "application/octet-stream";
                // const blob = new Blob([buf], { type });
                this._pict.set(`./pict/${relPath}`, { buf, type });
            }
        }
        return this._pict;
    }
    public async getPictBlob(src: string): Promise<{buf: ArrayBuffer, type: string} | null> {
        return (await this.ensurePict())?.get(src) ?? null;
    }
}

export const fetchLawData = async (lawIDOrLawNum: string): Promise<ElawsLawData> => {
    const elApplData = await fetchElaws(lawdataURL + lawIDOrLawNum);
    if (!elApplData) {
        throw Error("fetchLawData(): fetchElaws failed");
    }

    const law = elApplData.getElementsByTagName("LawFullText").item(0)?.getElementsByTagName("Law").item(0);
    if (!law) {
        throw Error("fetchLawData(): Law element not exist");
    }

    const elImageData = elApplData.getElementsByTagName("ImageData").item(0);
    const imageData = (elImageData && elImageData.textContent) ? decodeBase64(elImageData.textContent) : null;

    return new ElawsLawData(
        elApplData.getElementsByTagName("LawId").item(0)?.textContent ?? "",
        law,
        imageData,
    );
};

export const fetchAllXMLZip = async (): Promise<ArrayBuffer> => {
    const response = await fetch(allXMLZipURL, {
        mode: "cors",
    });
    if (!response.ok) throw Error(response.statusText);
    return await response.arrayBuffer();
};

export const fetchPartialLaw = async (options: {lawNum: string, article?: string, paragraph?: string, appdxTable?: string}): Promise<string> => {
    const { lawNum, article, paragraph, appdxTable } = options;
    const elApplData = await fetchElaws(`${articlesURL};lawNum=${lawNum};article=${article ?? ""};paragraph=${paragraph ?? ""};apdxTable=${appdxTable ?? ""}`);
    if (!elApplData) {
        throw Error("fetchPartialLaw(): fetchElaws failed");
    }
    const lawContents = elApplData.getElementsByTagName("LawContents").item(0);
    const element = Array.from(lawContents?.childNodes ?? []).find(el => el.nodeType === 1);
    if (!element) {
        throw Error("fetchPartialLaw(): Target element not exist");
    }

    const xml = xmlSerializer.serializeToString(element);

    return xml;
};
