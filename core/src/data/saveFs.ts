import Zip from "node-stream-zip";
import path from "path";
import { allXMLZipURL } from "../elawsApi";
import os from "os";
import fs from "fs";
import { fetch } from "../util/node-fetch";
import fsExtra from "fs-extra";
import { promisify } from "util";
import type { FSStoredLoader } from "./loaders/FSStoredLoader";

export const download = async (
    loader: FSStoredLoader,
    onProgress: (ratio: number, message: string) => void = () => undefined,
): Promise<void> => {

    const progress = (() => {
        let currentRatio = 0;
        let currentMessage = "";
        return (ratio?: number, message?: string) => {
            currentRatio = ratio ?? currentRatio;
            currentMessage = message ?? currentMessage;
            onProgress(currentRatio, currentMessage);
        };
    })();

    const tempDir = path.join(os.tmpdir(), "lawtext_core_db_download");
    await promisify(fsExtra.ensureDir)(tempDir);
    const tempZip = path.join(tempDir, "lawdata.zip");
    const tempZipStream = fs.createWriteStream(tempZip);

    progress(0, "");

    console.log(`\nTemporary dir: ${tempDir}`);
    console.log(`Downloading ${allXMLZipURL}`);
    const res = await fetch(
        allXMLZipURL,
    );
    if (!res.ok) throw new Error(res.statusText);
    const body = res.body as NodeJS.ReadableStream | null;
    if (body === null) throw new Error("response body is null");
    const contentLength = Number(res.headers.get("Content-Length"));
    const totalBytesStr = contentLength.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    console.log(`Total ${totalBytesStr} bytes`);
    await new Promise(r => body.once("readable", r));

    let currentLength = 0;
    for await (const chunk of body) {
        if (!chunk) break;
        tempZipStream.write(chunk);
        currentLength += chunk.length;
        const currentBytesStr = currentLength.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        progress(currentLength / contentLength, `${currentBytesStr} / ${totalBytesStr} bytes`);
    }

    tempZipStream.close();
    progress(1);

    const zip = new Zip.async({ file: tempZip });
    const entriesCount = await zip.entriesCount;

    console.log(`\nExtracting zip file with ${entriesCount} entries...`);

    progress(0, "");
    await promisify(fsExtra.ensureDir)(loader.lawdataPath);
    currentLength = 0;

    zip.on("extract", (entry) => {
        currentLength += entry.compressedSize;
        progress(currentLength / contentLength, entry.name);
    });
    await zip.extract(null, loader.lawdataPath);
    await zip.close();
    progress(1);
};

export const saveList = async (
    loader: FSStoredLoader,
    onProgress: (ratio: number, message: string) => void = () => undefined,
): Promise<void> => {

    const progress = (() => {
        let currentRatio = 0;
        let currentMessage = "";
        return (ratio?: number, message?: string) => {
            currentRatio = ratio ?? currentRatio;
            currentMessage = message ?? currentMessage;
            onProgress(currentRatio, currentMessage);
        };
    })();

    console.log("Loading CSV...");
    const infos = await loader.loadBaseLawInfosFromCSV();

    if (infos === null) {
        console.error("CSV list cannot be fetched.");
        return;
    }

    console.log(`\nProcessing ${infos.length} XMLs...`);

    const list = await loader.makeLawListFromBaseLawInfos(infos, progress);
    console.log("\nWriting JSON...");
    await promisify(fs.writeFile)(loader.listJsonPath, JSON.stringify(list), { encoding: "utf-8" });
};
