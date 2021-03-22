
import * as dataPaths from "@coresrc/db/data_paths";
import yargs from "yargs";
import { ProgressBar } from "@coresrc/term_util";
import { download } from "@coresrc/db/download";

const main = async (): Promise<void> => {
    const bar = new ProgressBar();
    const progress = bar.progress.bind(bar);

    const args = yargs.options({
        "data-dir": { type: "string", demandOption: true, alias: "d" },
    }).argv;

    bar.start(1, 0);
    await download(dataPaths.getLawdataPath(args["data-dir"]), progress);
    bar.stop();
};

if (typeof require !== "undefined" && require.main === module) {
    process.on("unhandledRejection", e => {
        console.dir(e);
        process.exit(1);
    });
    main().catch(e => { throw e; });
}

