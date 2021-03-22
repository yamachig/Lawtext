import JSZip from "jszip";
import * as path from "path";
import { fetchLawData, fetchLawNameList } from "../elaws_api";
import { LawInfo, LawInfos } from "./lawlist";

export const composeZipByApi = async <
    S extends boolean = false,
    T extends boolean = false,
    U extends boolean = false,
>(
    { full, withoutPict, list }: Partial<{ full: S, withoutPict: T, list: U }>,
    onProgress: (ratio: number, message: string) => void = () => undefined,
):
    Promise<(
        (S extends true ? { full: ArrayBuffer } : Record<string, never>) &
        (T extends true ? { withoutPict: ArrayBuffer } : Record<string, never>) &
        (U extends true ? { list: string } : Record<string, never>)
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

    progress(undefined, "法令の一覧を取得しています");

    const lawNameList = await fetchLawNameList();

    progress(undefined, "法令データをダウンロードしています");
    const progressTotal = lawNameList.length + 3;
    let progressNow = 0;
    for (const lawNameListInfo of lawNameList) {
        progress(undefined, `${lawNameListInfo.LawNo}：${lawNameListInfo.LawName}`);
        const lawData = await fetchLawData(lawNameListInfo.LawId);

        const lawInfo = LawInfo.fromLawData(lawData, lawData.lawID, `${lawData.lawID}.xml`);
        lawInfos.add(lawInfo);

        if (full) {
            destZipFull.file(path.join(lawInfo.Path, lawInfo.XmlName), lawData.xml);
        }
        if (withoutPict) {
            destZipWithoutPict.file(path.join(lawInfo.Path, lawInfo.XmlName), lawData.xml);
        }

        if (full && lawData.imageData) {
            destZipFull.file(path.join(lawInfo.Path, `${lawData.lawID}_pict.zip`), lawData.imageData);
        }

        progressNow++;
        progress(progressNow / progressTotal);
    }

    progress(undefined, "相互参照を分析しています");
    lawInfos.setReferences();

    progressNow++;
    progress(progressNow / progressTotal);

    progress(undefined, "リストを出力しています");
    const lawlist = lawInfos.getList();
    const listJson = JSON.stringify(lawlist);
    if (full) destZipFull.file("list.json", listJson);
    if (withoutPict) destZipWithoutPict.file("list.json", listJson);

    progressNow++;
    progress(progressNow / progressTotal);

    progress(undefined, "Zipファイルを出力しています");

    const zipOptions: JSZip.JSZipGeneratorOptions<"arraybuffer"> = {
        type: "arraybuffer",
        compression: "DEFLATE",
        compressionOptions: {
            level: 9,
        },
    };

    const ret = {
        ...(full ? { full: await destZipFull.generateAsync(zipOptions) } : {}),
        ...(withoutPict ? { withoutPict: await destZipWithoutPict.generateAsync(zipOptions) } : {}),
        ...(list ? { list: listJson } : {}),
    } as (
        (S extends true ? { full: ArrayBuffer } : Record<string, never>) &
        (T extends true ? { withoutPict: ArrayBuffer } : Record<string, never>) &
        (U extends true ? { list: string } : Record<string, never>)
    );

    progress(1);

    return ret;
};

