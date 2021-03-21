import * as JSZip from "jszip"
import * as path from "path"
import { fetchLawData, fetchLawNameList, LawData } from "../elaws_api";
import { LawInfo, LawInfos } from "./lawlist";

export const downloadZipByApi = async <
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

    const lawNameList = await fetchLawNameList();
    
    progress(undefined, `法令データをダウンロードしています`);
    let progressTotal = lawNameList.length + 3;
    let progressNow = 0;
    let processingDownloadedFile: Promise<void> | null = null;
    for (const lawNameListInfo of lawNameList) {
        progress(undefined, `${lawNameListInfo.LawNo}：${lawNameListInfo.LawName}`);
        const lawData = await fetchLawData(lawNameListInfo.LawId);
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

