// import formatXML from "xml-formatter";
import { FSStoredLoader } from "lawtext/dist/src/data/loaders/FSStoredLoader.js";
import type { BaseLawInfo } from "lawtext/dist/src/data/lawinfo.js";
import { connect } from "../connection.ts";
import config from "../config.ts";
import { isMainThread, workerData, parentPort } from "worker_threads";
import { update } from "./update.ts";


const run = async (): Promise<void> => {
    const db = await connect(config.MONGODB_URI);
    const loader = new FSStoredLoader(config.DATA_PATH);
    const maxDiffLength = workerData.maxDiffLength as number;

    parentPort?.on("message", async (msg) => {
        const lawInfo = msg.lawInfo as BaseLawInfo;
        try {
            await update(lawInfo, maxDiffLength, db, loader);
        } catch (e) {
            parentPort?.postMessage({
                error: true,
                message: {
                    message: (e as Error).message ?? "",
                    name: (e as Error).name ?? "",
                    stack: (e as Error).stack ?? "",
                },
                lawInfo,
            });
            return;
        }
        parentPort?.postMessage({ finished: true });
    });

    parentPort?.postMessage({ ready: true });
};

if (!isMainThread) run();

