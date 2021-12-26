
import yargs from "yargs";
import { ProgressBar } from "../src/term_util";
import * as save_fs from "../src/data/save_fs";
import { FSStoredLoader } from "../src/data/loaders/FSStoredLoader";

const bar = new ProgressBar();
const progress = bar.progress.bind(bar);

const download = async (dataDir: string): Promise<void> => {
    const loader = new FSStoredLoader(dataDir);
    await save_fs.download(loader, progress);
};

const saveList = async (dataDir: string): Promise<void> => {
    const loader = new FSStoredLoader(dataDir);
    await save_fs.saveList(loader, progress);
};

const main = async (): Promise<void> => {

    const args = await yargs
        .option("mode", {
            type: "string",
            choices: ["all", "download", "save-list"],
            demandOption: false,
            default: "all",
            alias: "m",
        })
        .option("data-dir", {
            type: "string",
            demandOption: true,
            alias: "d",
        })
        .argv;

    if (args.mode === "download" || args.mode === "all") {
        bar.start(1, 0);
        await download(args["data-dir"]);
        bar.stop();
    }
    if (args.mode === "save-list" || args.mode === "all") {
        bar.start(1, 0);
        await saveList(args["data-dir"]);
        bar.stop();
    }
};

if (typeof require !== "undefined" && require.main === module) {
    process.on("unhandledRejection", e => {
        console.dir(e);
        process.exit(1);
    });
    main().catch(e => { throw e; });
}

