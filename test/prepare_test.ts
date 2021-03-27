
import fs from "fs";
import path from "path";
import { promisify } from "util";
import * as data_paths from "@coresrc/data/paths";
import { download, saveList } from "@coresrc/data/save_fs";
import { ProgressBar } from "@coresrc/term_util";
import { TextFetcher } from "./data/lawlist";
import iconv from "iconv-lite";

export const textFetcher: TextFetcher = async (textPath: string) => {
    try {
        const text = await promisify(fs.readFile)(textPath, { encoding: "utf-8" });
        return text;
    } catch (e) {
        console.log(e);
        return null;
    }
};

export const sjisTextFetcher: TextFetcher = async (textPath: string) => {
    try {
        const buf = await promisify(fs.readFile)(textPath);
        return iconv.decode(Buffer.from(buf), "Shift_JIS");
    } catch (e) {
        console.log(e);
        return null;
    }
};

let called = false;

let dataPath = path.join(__dirname, "../data");
export const setDataPath = (p: string): void => {
    dataPath = p;
};
export const getDataPath = (): string => {
    return dataPath;
};

export const prepare = async (): Promise<void> => {
    if (called) return;
    called = true;

    const listJsonPath = data_paths.getListJsonPath(dataPath);
    const lawdataPath = data_paths.getLawdataPath(dataPath);

    const bar = new ProgressBar();
    const progress = bar.progress.bind(bar);

    if (!(await promisify(fs.exists)(lawdataPath))) {
        console.log(`Preparing lawdata into ${lawdataPath} ...`);

        bar.start(1, 0);
        await download(dataPath, progress);
        bar.stop();
    }

    if (!(await promisify(fs.exists)(listJsonPath))) {
        console.log(`Preparing list json into ${listJsonPath} ...`);

        bar.start(1, 0);
        await saveList(dataPath, listJsonPath, progress, textFetcher, sjisTextFetcher);
        bar.stop();
    }
};


if (typeof require !== "undefined" && require.main === module) {
    process.on("unhandledRejection", e => {
        console.dir(e);
        process.exit(1);
    });
    prepare().catch(e => { throw e; });
}
