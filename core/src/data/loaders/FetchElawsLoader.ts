import type { LawInfosStruct } from "./common.ts";
import { LawXMLStruct } from "./common.ts";
import { lawInfosToByLawnumAndID, Loader } from "./common.ts";
import type { BaseLawInfo } from "../lawinfo.ts";
import { LawInfo } from "../lawinfo.ts";
import * as elawsApi from "../../elawsOpenapi/index.ts";
import { unzip } from "../../util/zip.ts";
import path from "path";
import { decodeBase64, pictMimeDict } from "../../util/index.ts";

const fetchBaseLawInfosFromElaws = async (): Promise<BaseLawInfo[]> => {
    const lawNameList = (await elawsApi.getLaws({
        throwOnError: true,
        query: {
            limit: 99999,
            omit_current_revision_info: true,
            response_format: "json",
        },
    })).data.laws ?? [];
    return lawNameList
        ?.map(item => {
            const baseLawInfo: BaseLawInfo = {
                LawID: item.law_info?.law_id ?? "",
                LawNum: item.law_info?.law_num ?? "",
                LawTitle: item.revision_info?.law_title ?? "",
                Enforced: true,
                Path: item.law_info?.law_id ?? "",
                XmlName: `${item.law_info?.law_id ?? ""}.xml`,
            };
            return baseLawInfo;
        });
};

export class ElawsLawData extends LawXMLStruct {
    constructor(
        public readonly lawID: string,
        public readonly imageData: Uint8Array | null,
        public readonly xml: string,
    ) {
        super();
    }
    private _pict: Map<string, {buf: ArrayBuffer, type: string}> | null = null;
    public async getPictFileOrBlobURL(src: string): Promise<{url: string, type: string} | null> {
        const _buf = await this.getPictBlob(src);
        if (!_buf) return null;
        const { buf, type } = _buf;
        const url = `data:${type};base64,${btoa(new Uint8Array(buf).reduce((s, c) => s + String.fromCharCode(c), ""))}`;
        // this.blobURLs.push(url);
        return { url, type };
    }
    public async ensurePict(): Promise<Map<string, {buf: ArrayBuffer, type: string}> | null> {
        if (!this.imageData) return null;
        if (!this._pict) {
            this._pict = new Map();
            const zipData = await unzip(this.imageData);
            for (const relPath in zipData) {
                const buf = zipData[relPath];
                const ext = path.extname(relPath) as keyof typeof pictMimeDict;
                const type = ext in pictMimeDict ? pictMimeDict[ext] : "application/octet-stream";
                // const blob = new Blob([buf], { type });
                this._pict.set(
                    `./${relPath}`,
                    {
                        buf: (
                            buf.buffer instanceof ArrayBuffer
                                ? buf.buffer
                                : new Uint8Array(buf).buffer
                        ),
                        type,
                    },
                );
            }
        }
        return this._pict;
    }
    public async getPictBlob(src: string): Promise<{buf: ArrayBuffer, type: string} | null> {
        return (await this.ensurePict())?.get(src) ?? null;
    }
}

export const fetchLawData = async (lawIDOrLawNum: string): Promise<ElawsLawData> => {
    const responseData = (await elawsApi.getLawData({
        throwOnError: true,
        path: {
            law_id_or_num_or_revision_id: lawIDOrLawNum,
        },
        query: {
            include_attached_file_content: true,
            response_format: "json",
            law_full_text_format: "xml",
        },
    })).data;

    const xml = new TextDecoder().decode(decodeBase64((responseData.law_full_text as string) ?? ""));

    const imageDataBase64 = responseData.attached_files_info?.image_data;
    const imageData = (imageDataBase64) ? decodeBase64(imageDataBase64) : null;

    return new ElawsLawData(
        responseData.law_info?.law_id ?? "",
        imageData,
        xml,
    );
};

export class FetchElawsLoader extends Loader {

    public async loadLawInfosStruct(): Promise<LawInfosStruct> {
        const baseLawInfos = await fetchBaseLawInfosFromElaws();
        const lawInfos = baseLawInfos.map(LawInfo.fromBaseLawInfo);
        const [lawInfosByLawnum, lawInfosByLawID] = lawInfosToByLawnumAndID(lawInfos);
        return { lawInfos, lawInfosByLawnum, lawInfosByLawID };
    }

    public async loadBaseLawInfosFromCSV(): Promise<BaseLawInfo[]> {
        return fetchBaseLawInfosFromElaws();
    }

    public async loadLawXMLStructByInfo(lawInfoOrLawIDOrLawNum: BaseLawInfo | string): Promise<LawXMLStruct> {
        const LawIDOrLawNum = (
            typeof lawInfoOrLawIDOrLawNum === "string"
                ? lawInfoOrLawIDOrLawNum
                : lawInfoOrLawIDOrLawNum.LawID
        );
        return fetchLawData(LawIDOrLawNum);
    }

}

export default FetchElawsLoader;
