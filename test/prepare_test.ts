
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { saveList } from "@src/db/lawlist";
import * as dataPaths from "@src/db/data_paths";
import { download } from "@src/db/download";
import { ProgressBar } from "@src/term_util";

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

    const listJsonPath = dataPaths.getListJsonPath(dataPath);
    const lawdataPath = dataPaths.getLawdataPath(dataPath);

    const bar = new ProgressBar();
    const progress = bar.progress.bind(bar);

    if (!(await promisify(fs.exists)(lawdataPath))) {
        console.log(`Preparing lawdata into ${lawdataPath} ...`);

        bar.start(1, 0);
        await download(lawdataPath, progress);
        bar.stop();
    }

    if (!(await promisify(fs.exists)(listJsonPath))) {
        console.log(`Preparing list json into ${listJsonPath} ...`);

        bar.start(1, 0);
        await saveList(lawdataPath, listJsonPath, progress);
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
