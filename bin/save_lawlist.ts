import * as dataPaths from "@coresrc/db/data_paths";
import yargs from "yargs";
import { ProgressBar } from "@coresrc/term_util";
import { saveList } from "@coresrc/db/save_lawlist";

const main = async (): Promise<void> => {

    const args = yargs.options({
        "data-dir": { type: "string", demandOption: true, alias: "d" },
    }).argv;

    const lawdataDir = dataPaths.getLawdataPath(args["data-dir"]);
    const listJsonPath = dataPaths.getListJsonPath(args["data-dir"]);

    const bar = new ProgressBar();
    const progress = bar.progress.bind(bar);

    bar.start(1, 0);
    await saveList(lawdataDir, listJsonPath, progress);
    bar.stop();
};

if (typeof require !== "undefined" && require.main === module) {
    process.on("unhandledRejection", (e: Error) => {
        console.error(e);
        console.error(e.stack);
        process.exit(1);
    });
    main().catch(e => { throw e; });
}


