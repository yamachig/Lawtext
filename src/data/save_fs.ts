import Zip from "node-stream-zip";
import path from "path";
import { allXMLZipURL } from "../elaws_api";
import os from "os";
import fs from "fs";
import fetch from "node-fetch";
import fsExtra from "fs-extra";
import { promisify } from "util";
import { makeList } from "@coresrc/data/lawlist";

export const download = async (
    lawdataPath: string,
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
    const contentLength = Number(res.headers.get("Content-Length"));
    const totalBytesStr = contentLength.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    console.log(`Total ${totalBytesStr} bytes`);
    await new Promise(r => res.body.once("readable", r));

    let currentLength = 0;
    for await (const chunk of res.body) {
        if (!chunk) break;
        tempZipStream.write(chunk);
        currentLength += chunk.length;
        const currentBytesStr = currentLength.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        progress(currentLength / contentLength, `${currentBytesStr} / ${totalBytesStr} bytes`);
    }

    tempZipStream.close();
    progress(1);

    console.log("\nExtracting zip file...");

    progress(0, "");
    await promisify(fsExtra.ensureDir)(lawdataPath);
    currentLength = 0;
    const zip = new Zip.async({ file: tempZip });
    zip.on("extract", (entry) => {
        currentLength += entry.compressedSize;
        progress(currentLength / contentLength, entry.name);
    });
    await zip.extract(null, lawdataPath);
    await zip.close();
    progress(1);
};

export const saveList = async (
    lawdataDir: string, listJsonPath: string,
    onProgress: (ratio: number, message: string) => void = () => undefined,
): Promise<void> => {

    const progress = (() => {
        let currentRatio = 0;
        let currentMessage = "";
        return (ratio?: number, message?: string) => {
            currentRatio = ratio || currentRatio;
            currentMessage = message || currentMessage;
            onProgress(currentRatio, currentMessage);
        };
    })();

    console.log("\nListing up XMLs...");
    const dirs = (await promisify(fs.readdir)(lawdataDir, { withFileTypes: true })).filter(p => p.isDirectory()).map(p => path.join(lawdataDir, p.name));
    const files: string[] = [];
    for (const dir of dirs) {
        files.push(...(await promisify(fs.readdir)(dir, { withFileTypes: true })).filter(p => p.isFile() && /\.xml$/.exec(p.name)).map(p => path.join(dir, p.name)));
    }

    console.log(`Processing ${files.length} XMLs...`);

    async function* lawIdXmls(files: string[]) {
        for (const file of files) {
            const lawID = /^[A-Za-z0-9]+/.exec(path.basename(file))?.[0] ?? "";
            const xml = await promisify(fs.readFile)(file, { encoding: "utf-8" });
            const Path = path.basename(path.dirname(file));
            const XmlName = path.basename(file);
            yield { lawID, xml, Path, XmlName };
        }
    }

    const list = await makeList(lawIdXmls(files), files.length, progress);
    await promisify(fs.writeFile)(listJsonPath, JSON.stringify(list), { encoding: "utf-8" });
};
