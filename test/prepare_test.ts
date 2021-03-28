
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { download, saveList } from "@coresrc/data/save_fs";
import { ProgressBar } from "@coresrc/term_util";
import { FSStoredLoader } from "@coresrc/data/loaders/FSStoredLoader";

export const prepare = async (loader: FSStoredLoader): Promise<void> => {
    const bar = new ProgressBar();
    const progress = bar.progress.bind(bar);

    if (!(await promisify(fs.exists)(loader.lawdataPath))) {
        console.log(`Preparing lawdata into ${loader.lawdataPath} ...`);

        bar.start(1, 0);
        await download(loader, progress);
        bar.stop();
    }

    if (!(await promisify(fs.exists)(loader.listJsonPath))) {
        console.log(`Preparing list json into ${loader.listJsonPath} ...`);

        bar.start(1, 0);
        await saveList(loader, progress);
        bar.stop();
    }
};


if (typeof require !== "undefined" && require.main === module) {
    process.on("unhandledRejection", e => {
        console.dir(e);
        process.exit(1);
    });
    const loader = new FSStoredLoader(path.join(__dirname, "../data"));
    prepare(loader).catch(e => { throw e; });
}
