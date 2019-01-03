import * as JSZip from "jszip"
import * as path from "path"
import { DOMParser } from "xmldom"
import { range } from "./util"
const fetch = ((global as any).window && window.fetch) || require("node-fetch");


export const FILENAMES = [
    ...range(104, 145 + 1),
    ...range(201, 215 + 1),
    ...range(301, 364 + 1),
    ...range(401, 430 + 1),
    // ...range(430, 430 + 1),
].map((v) => `${v}.zip`);

export const download = async <
    S extends boolean=false,
    T extends boolean=false,
    U extends boolean=false,
    >(
        { full, withoutPict, list }: Partial<{ full: S, withoutPict: T, list: U }>,
        filenames: string[] = FILENAMES,
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

    const progressTotal = filenames.length + 3;
    let progressNow = 0;

    const destZipFull = new JSZip();
    const destZipWithoutPict = new JSZip();
    const lawInfos = new LawInfos();

    let processingDownloadedFile: Promise<void> | null = null;

    const processDownloadedFile = async (srcZip: JSZip) => {

        const items: Array<[string, JSZip.JSZipObject]> = [];
        srcZip.forEach((relativePath, file) => {
            items.push([relativePath, file]);
        });

        for (const [relativePath, file] of items) {
            const isPict = /^[^/]+\/[^/]+\/pict\/.*$/.test(relativePath);

            if (file.dir) {
                if (full) {
                    destZipFull.folder(relativePath);
                }
                if (withoutPict && !isPict) {
                    destZipWithoutPict.folder(relativePath);
                }

            } else {
                if (/^[^/]+\/[^/]+\/[^/]+.xml$/.test(relativePath)) {
                    const xml = await file.async("text");
                    const lawinfo = lawInfos.addFromXml(xml, relativePath);
                    progress(undefined, `${lawinfo.LawNum}：${lawinfo.LawTitle}`);
                }

                if (full || (withoutPict && !isPict)) {
                    const innerZip = new JSZip();
                    const innerData = await file.async("arraybuffer");
                    innerZip.file(path.basename(file.name), innerData);
                    const innerZipData = await innerZip.generateAsync({
                        type: "arraybuffer",
                        compression: "DEFLATE",
                        compressionOptions: {
                            level: 9
                        }
                    });

                    if (full) {
                        destZipFull.file(relativePath + ".zip", innerZipData);
                    }
                    if (withoutPict && !isPict) {
                        destZipWithoutPict.file(relativePath + ".zip", innerZipData);
                    }
                }
            }
        }

        progressNow++;
        progress(progressNow / progressTotal);
    };

    const errorFilenames: Array<[string, string]> = [];

    for (const filename of filenames) {
        try {
            const response = await fetch(`http://elaws.e-gov.go.jp/download/${filename}`, {
                mode: "cors",
            });
            const zipData = await response.arrayBuffer();
            const srcZip = await JSZip.loadAsync(zipData);
            await processingDownloadedFile;
            processingDownloadedFile = processDownloadedFile(srcZip);
        } catch (e) {
            errorFilenames.push([filename, e.message]);
            console.dir(e);
        }
    }

    await processingDownloadedFile;

    progress(undefined, `相互参照を分析しています`);
    lawInfos.setReferences();

    progressNow++;
    progress(progressNow / progressTotal);

    progress(undefined, `リストを出力しています`);
    const lawlist = lawInfos.getList;
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

    for (const [filename, message] of errorFilenames) {
        console.error(`読み込めませんでした：`);
        console.error(`  ${filename}`);
        console.error(`  ${message}`);
    }

    progress(1);

    return ret as any;
}

export const reLawnum = /(?:(?:明治|大正|昭和|平成)[元〇一二三四五六七八九十]+年(?:(?:\S+?第[〇一二三四五六七八九十百千]+号|人事院規則[―〇一二三四五六七八九]+)|[一二三四五六七八九十]+月[一二三四五六七八九十]+日内閣総理大臣決定|憲法)|明治三十二年勅令|大正十二年内務省・鉄道省令|昭和五年逓信省・鉄道省令|昭和九年逓信省・農林省令|人事院規則一〇―一五)/g;
const domParser = new DOMParser();

export class LawInfo {

    constructor(
        public LawNum: string = "",
        public LawTitle: string = "",
        public Path: string = "",
        public XmlZipName: string = "",
        public ReferencingLawNums: Set<string> = new Set(),
        public ReferencedLawNums: Set<string> = new Set(),
    ) { }

    public static fromXml(xml: string, xmlPath: string) {
        const lawInfo = new LawInfo();

        const law = domParser.parseFromString(xml, "text/xml");
        const elLawNm = law.getElementsByTagName("LawNum")[0];
        const elLawBody = law.getElementsByTagName("LawBody")[0];
        const elLawTitle = elLawBody.getElementsByTagName("LawTitle")[0];

        lawInfo.LawNum = (elLawNm.textContent || "").trim();
        for (const m of xml.match(reLawnum) || []) lawInfo.ReferencingLawNums.add(m);
        lawInfo.LawTitle = (elLawTitle.textContent || "").trim();
        lawInfo.Path = path.dirname(xmlPath);
        lawInfo.XmlZipName = `${path.basename(xmlPath)}.zip`;

        return lawInfo;
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

    public addFromXml(xml: string, xmlPath: string) {
        const lawInfo = LawInfo.fromXml(xml, xmlPath)
        this.add(lawInfo);
        return lawInfo;
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
