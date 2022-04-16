import { LawData } from "@appsrc/lawdata/common";
import { FigDataInfo } from "lawtext/dist/src/renderer/rules/html";
import { storedLoader } from "./loaders";
import path from "path";

export interface GetFigDataInfoWithLawDataOptions {
    lawData: LawData,
    src: string,
    forceSync?: boolean,
}

export const getFigDataInfoWithLawData = (options: GetFigDataInfoWithLawDataOptions) => {
    const { lawData, src, forceSync } = options;

    const cleaners: (() => unknown)[] = [];
    const cleaner = () => {
        for (const cleaner of cleaners) cleaner();
    };
    if (lawData.source === "elaws" && lawData.pict) {
        const blob = lawData.pict.get(src);
        if (blob) {
            const url = URL.createObjectURL(blob);
            cleaners.push(() => URL.revokeObjectURL(url));
            return { figData: { url, type: blob.type }, cleaner };
        } else {
            return null;
        }
    } else if (lawData.source === "stored") {
        if (forceSync) return null;
        const url = path.join(storedLoader.lawdataPath, lawData.lawPath, src);
        return new Promise<FigDataInfo | null>((resolve) => {
            (async () => {
                const res = await fetch(url, { method: "HEAD" });
                if (!res.ok) return null;
                return { figData: { url, type: res.headers.get("Content-Type") ?? "" }, cleaner };
            })().then(resolve);
        });
    } else {
        return null;
    }
};

export default getFigDataInfoWithLawData;
