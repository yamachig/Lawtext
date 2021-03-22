
import * as dataPaths from "@coresrc/data/paths";
import yargs from "yargs";
import { ProgressBar } from "@coresrc/term_util";
import * as save_fs from "@coresrc/data/save_fs";

const bar = new ProgressBar();
const progress = bar.progress.bind(bar);

const download = async (dataDir: string): Promise<void> => {
    const lawdataDir = dataPaths.getLawdataPath(dataDir);
    await save_fs.download(lawdataDir, progress);
};

const saveList = async (dataDir: string): Promise<void> => {
    const lawdataDir = dataPaths.getLawdataPath(dataDir);
    const listJsonPath = dataPaths.getListJsonPath(dataDir);
    await save_fs.saveList(lawdataDir, listJsonPath, progress);
};

const main = async (): Promise<void> => {

    const args = yargs
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

