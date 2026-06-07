import yargs from "yargs/yargs";
import update from "../src/update/index.ts";

const DEFAULT_MAX_DIFF_LENGTH = 40;

if (import.meta.main) {
    process.on("unhandledRejection", (listener) => {
        throw listener;
    });

    (async () => {

        const argv = await yargs(process.argv.slice(2))
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
            .parseAsync();
        await update({
            ...{
                lawID: process.env.FILTER_LAW_ID,
                notificationEndpoint: process.env.NOTIFICATION_ENDPOINT,
            },
            ...argv,
        });
    })();
}
