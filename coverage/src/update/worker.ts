// import formatXML from "xml-formatter";
import { FSStoredLoader } from "lawtext/dist/src/data/loaders/FSStoredLoader";
import { BaseLawInfo } from "lawtext/dist/src/data/lawinfo";
import { connect } from "../connection";
import config from "../config";
import { isMainThread, workerData, parentPort } from "worker_threads";
import { update } from "./update";


const run = async (): Promise<void> => {
    const db = await connect(config.MONGODB_URI);
    const loader = new FSStoredLoader(config.DATA_PATH);
    const maxDiffLength = workerData.maxDiffLength as number;

    parentPort?.on("message", async (msg) => {
        const lawInfo = msg.lawInfo as BaseLawInfo;
        try {
            await update(lawInfo, maxDiffLength, db, loader);
        } catch (e) {
            parentPort?.postMessage({ error: true, message: e, lawInfo });
            return;
        }
        parentPort?.postMessage({ finished: true });
    });

    parentPort?.postMessage({ ready: true });
};

if (!isMainThread) run();

