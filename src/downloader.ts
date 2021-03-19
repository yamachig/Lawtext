import * as JSZip from "jszip"
import * as path from "path"
import { DOMParser, XMLSerializer } from "xmldom"
import { decodeBase64, range, ResolvedType } from "./util"
import { once } from "events";
import { Readable } from "stream";
const fetch: typeof window.fetch = ((global as any).window && window.fetch) || require("node-fetch");
const domParser = new DOMParser();
const xmlSerializer = new XMLSerializer();
import * as xpath from "xpath"

export const xp1 = <T extends xpath.SelectedValue = Element>(node: Node, expression: string) => xpath.select1(expression, node) as T | undefined;

export const xps = <T extends xpath.SelectedValue = Element>(node: Node, expression: string) => xpath.select(expression, node) as T[];


const lawlistsURL = "https://elaws.e-gov.go.jp/api/1/lawlists/1";
const lawdataURL = "https://elaws.e-gov.go.jp/api/1/lawdata/";

export const fetchElaws = async (url: string, retry=3) => {
    if (retry <= 0) {
        throw Error("fetchElaws(): Failed after retries");
    }
    const response = await fetch(url, {
        mode: "cors",
    });
    if (!response.ok) throw Error(response.statusText);
    const text = await response.text();    
    const doc = domParser.parseFromString(text, "text/xml") as XMLDocument;
    const elCode = xp1(doc, "/DataRoot/Result/Code");
    if(!elCode) {
        console.log("remaining retries: " + (retry - 1));
        return await fetchElaws(url, retry - 1);
    }
    if (elCode.textContent !== "0") {
        const msg = xp1(doc, "/DataRoot/Result/Message")?.textContent;
        console.log("request URL: " + url)
        throw Error(msg ?? "fetchElaws(): Unknown Error in XML\nrequest URL");
    }
    const ret = xp1(doc, "/DataRoot/ApplData");
    if (!ret) {
        console.log("request URL: " + url)
        throw Error("fetchElaws(): ApplData element not exist");
    }
    return ret;
}

export class LawNameListInfo {
    constructor(
        public LawId: string,
        public LawName: string,
        public LawNo: string,
        public PromulgationDate: string,
    ) { }
    public get Path() {
        return this.LawId;
    }
    public get XmlZipName() {
        return `${this.LawId}.xml.zip`;
    }
    public get XmlName() {
        return `${this.LawId}.xml`;
    }
}

export const getLawNameList = async () => {
    const elApplData = await fetchElaws(lawlistsURL);
    const lawNameList:LawNameListInfo[] = [];
    for (const el of xps(elApplData, "LawNameListInfo")) {
        lawNameList.push(new LawNameListInfo(
            xp1(el, "LawId")?.textContent ?? "",
            xp1(el, "LawName")?.textContent ?? "",
            xp1(el, "LawNo")?.textContent ?? "",
            xp1(el, "PromulgationDate")?.textContent ?? "",
        ));
    }
    return lawNameList;
}

export const getLawData = async (lawID: string) => {
    const elApplData = await fetchElaws(lawdataURL + lawID);
    if (!elApplData) {
        throw Error("getLawData(): fetchElaws failed");
    }
    const law = xp1(elApplData, "LawFullText/Law");
    if (!law) {
        throw Error("getLawData(): Law element not exist");
    }
    const doc = law.ownerDocument.implementation.createDocument("", "", null);
    doc.appendChild(doc.createProcessingInstruction('xml', 'version="1.0" encoding="UTF-8"'));
    doc.appendChild(doc.createTextNode("\n"));
    doc.appendChild(law);
    const elImageData = xp1(elApplData, "ImageData");
    const imageData = elImageData ? decodeBase64(elImageData.innerHTML) : null;
    return {
        lawID,
        law,
        xml: xmlSerializer.serializeToString(doc),
        imageData,
    };
}
export type LawData = ResolvedType<ReturnType<typeof getLawData>>;

export const download = async <
    S extends boolean = false,
    T extends boolean = false,
    U extends boolean = false,
    >(
        { full, withoutPict, list }: Partial<{ full: S, withoutPict: T, list: U }>,
        onProgress: (ratio: number, message: string) => void = () => undefined,
):
    Promise<(
        (S extends true ? { full: ArrayBuffer } : {}) &
        (T extends true ? { withoutPict: ArrayBuffer } : {}) &
        (U extends true ? { list: string } : {})
    )> => {

    const progress = (() => {
        let currentRatio = 0;
        let currentMessage = "";
        return (ratio?: number, message?: string) => {
            currentRatio = ratio || currentRatio;
            currentMessage = message || currentMessage;
            onProgress(currentRatio, currentMessage);
        };
    })();

    progress(0, "開始しました");


    const destZipFull = new JSZip();
    const destZipWithoutPict = new JSZip();
    const lawInfos = new LawInfos();

    const processLawData = async (lawData: LawData) => {
        const lawInfo = LawInfo.fromLawData(lawData);
        lawInfos.add(lawInfo);

        const xmlZip = new JSZip();
        xmlZip.file(lawInfo.XmlName, lawData.xml);
        const xmlZipData = await xmlZip.generateAsync({
            type: "arraybuffer",
            compression: "DEFLATE",
            compressionOptions: {
                level: 9
            }
        });
        if (full) {
            destZipFull.file(path.join(lawInfo.Path, lawInfo.XmlZipName), xmlZipData);
        }
        if (withoutPict) {
            destZipWithoutPict.file(path.join(lawInfo.Path, lawInfo.XmlZipName), xmlZipData);
        }

        if (full && lawData.imageData) {
            destZipFull.file(path.join(lawInfo.Path, `${lawData.lawID}_pict.zip`), lawData.imageData);
        }
    };
    
    progress(undefined, `法令の一覧を取得しています`);

    const lawNameList = await getLawNameList();
    
    progress(undefined, `法令データをダウンロードしています`);
    let progressTotal = lawNameList.length + 3;
    let progressNow = 0;
    let processingDownloadedFile: Promise<void> | null = null;
    for (const lawNameListInfo of lawNameList) {
        progress(undefined, `${lawNameListInfo.LawNo}：${lawNameListInfo.LawName}`);
        const lawData = await getLawData(lawNameListInfo.LawId);
        await processingDownloadedFile;
        processingDownloadedFile = processLawData(lawData);
        progressNow++;
        progress(progressNow / progressTotal);
    }
    await processingDownloadedFile;

    progress(undefined, `相互参照を分析しています`);
    lawInfos.setReferences();

    progressNow++;
    progress(progressNow / progressTotal);

    progress(undefined, `リストを出力しています`);
    const lawlist = lawInfos.getList();
    const listJson = JSON.stringify(lawlist);
    if (full) destZipFull.file("list.json", listJson);
    if (withoutPict) destZipWithoutPict.file("list.json", listJson);

    progressNow++;
    progress(progressNow / progressTotal);

    progress(undefined, `Zipファイルを出力しています`);

    const zipOptions: JSZip.JSZipGeneratorOptions<"arraybuffer"> = {
        type: "arraybuffer",
        compression: "DEFLATE",
        compressionOptions: {
            level: 9
        },
    };

    const ret: Partial<{ full: ArrayBuffer, withoutPict: ArrayBuffer, list: string }> = {
        ...(full ? { full: await destZipFull.generateAsync(zipOptions) } : {}),
        ...(withoutPict ? { withoutPict: await destZipWithoutPict.generateAsync(zipOptions) } : {}),
        ...(list ? { list: listJson, } : {}),
    };

    progress(1);

    return ret as any;
}

export const reLawnum = /(?:(?:明治|大正|昭和|平成|令和)[元〇一二三四五六七八九十]+年(?:(?:\S+?第[〇一二三四五六七八九十百千]+号|人事院規則[―〇一二三四五六七八九]+)|[一二三四五六七八九十]+月[一二三四五六七八九十]+日内閣総理大臣決定|憲法)|明治三十二年勅令|大正十二年内務省・鉄道省令|昭和五年逓信省・鉄道省令|昭和九年逓信省・農林省令|人事院規則一〇―一五)/g;

export class LawInfo {

    constructor(
        public LawNum: string = "",
        public LawTitle: string = "",
        public Path: string = "",
        public XmlZipName: string = "",
        public XmlName: string = "",
        public ReferencingLawNums: Set<string> = new Set(),
        public ReferencedLawNums: Set<string> = new Set(),
    ) { }

    public static fromLawData(lawData: LawData) {
        const elLawNm = lawData.law.getElementsByTagName("LawNum")[0];
        const elLawBody = lawData.law.getElementsByTagName("LawBody")[0];
        const elLawTitle = elLawBody.getElementsByTagName("LawTitle")[0];

        const lawInfo = new LawInfo();
        lawInfo.LawNum = (elLawNm.textContent || "").trim();
        for (const m of lawData.xml.match(reLawnum) || []) lawInfo.ReferencingLawNums.add(m);
        lawInfo.LawTitle = (elLawTitle.textContent || "").trim();
        
        const lawNameListInfo = new LawNameListInfo(
            lawData.lawID,
            lawInfo.LawTitle,
            lawInfo.LawNum,
            "",
        );

        lawInfo.Path = lawNameListInfo.Path;
        lawInfo.XmlZipName = lawNameListInfo.XmlZipName;
        lawInfo.XmlName = lawNameListInfo.XmlName;

        return lawInfo;
    }

    public static fromXml(lawID: string, xml: string) {
        const law = domParser.parseFromString(xml, "text/xml").getElementsByTagName("Law")[0];
        return LawInfo.fromLawData({lawID, law, xml, imageData: null});
    }
}

export class LawInfos {
    constructor(
        protected lawInfos: LawInfo[] = [],
        protected lawInfoMap: Map<string, LawInfo> = new Map(),
    ) { }

    public add(lawInfo: LawInfo) {
        this.lawInfos.push(lawInfo);
        this.lawInfoMap.set(lawInfo.LawNum, lawInfo);
    }

    public setReferences() {
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

    public getList() {
        return this.lawInfos.map(lawinfo => [
            lawinfo.LawNum,
            Array.from(lawinfo.ReferencingLawNums),
            Array.from(lawinfo.ReferencedLawNums),
            lawinfo.LawTitle,
            lawinfo.Path,
            lawinfo.XmlZipName,
        ]);
    }
}
