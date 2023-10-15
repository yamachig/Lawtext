// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import WINR from "why-is-node-running";

import * as yargs from "yargs";
import update from "../src/update";

const DEFAULT_MAX_DIFF_LENGTH = 40;

if (typeof require !== "undefined" && require.main === module) {
    process.on("unhandledRejection", (listener) => {
        throw listener;
    });

    const argv = yargs
        .usage("$0 [args]")
        .command(

            "$0 [target] [range]",

            "update law data",

            (_yargs => _yargs
                .option("force", {
                    alias: "f",
                    type: "boolean",
                    default: false,
                })
                .option("retry", {
                    alias: "r",
                    type: "boolean",
                    default: false,
                })
                .option("dryRun", {
                    alias: "d",
                    type: "boolean",
                    default: false,
                })
                .option("noParallel", {
                    alias: "np",
                    type: "boolean",
                    default: false,
                })
                .option("maxDiffLength", {
                    type: "number",
                    default: DEFAULT_MAX_DIFF_LENGTH,
                })
                .option("before", {
                    alias: "b",
                    type: "string",
                    coerce: s => s === undefined ? s : new Date(s),
                    default: undefined as Date | undefined,
                })
            ),

            async _argv => {
                await update({
                    ...{
                        lawID: process.env.FILTER_LAW_ID,
                        notificationEndpoint: process.env.NOTIFICATION_ENDPOINT,
                    },
                    ..._argv,
                });
                // setTimeout(WINR, 1000);
            },

        )
        .demandCommand()
        .help()
        .argv;
    void argv;
}
