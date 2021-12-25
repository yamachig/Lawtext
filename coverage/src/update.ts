// import formatXML from "xml-formatter";
import * as law_diff from "lawtext/dist/src/diff/law_diff";
import { FSStoredLoader } from "lawtext/dist/src/data/loaders/FSStoredLoader";
import { Loader } from "lawtext/dist/src/data/loaders/common";
import mongoose from "mongoose";
import { Bar, Presets } from "cli-progress";
import { BaseLawInfo, LawInfo } from "lawtext/dist/src/data/lawinfo";
import { fetch } from "./node-fetch";
import { LawCoverage } from "./lawCoverage";
import { connect, ConnectionInfo } from "./connection";
import config from "./config";
import { Worker } from "worker_threads";
import { range } from "lawtext/dist/src/util";

class ProgressBar {
    public bar: Bar;
    public constructor() {
        this.bar = new Bar(
            {
                format: "[{bar}] {percentage}% | {message}",
            }, Presets.rect,
        );
    }
    public progress(current?: number, message?: string): void {
        const payload = { message: (typeof message !== "string") ? "" : message.length > 30 ? message.slice(0, 30) + " ..." : message };
        if (current) {
            this.bar.update(current, payload);
        } else if (payload) {
            this.bar.update(payload);
        }
    }
    public start(total: number, startValue: number): void {
        this.bar.start(total, startValue, { message: "" });
    }
    public stop(): void {
        this.bar.stop();
    }
}
const bar = new ProgressBar();
export const progress = bar.progress.bind(bar);


const getToUpdateLawIDsOnDB = async (args: UpdateArgs, db: ConnectionInfo) => {

    const andConditions: mongoose.FilterQuery<LawCoverage>[] = [];

    if (args.before) {
        andConditions.push({ updateDate: { $lt: args.before } });
    }

    if (args.force) {
        //
    } else {
        const orConditions: mongoose.FilterQuery<LawCoverage>[] = [
            { originalLaw: undefined },
            { "originalLaw.ok": { $ne: undefined }, renderedLawtext: undefined },
            { "renderedLawtext.ok": { $ne: undefined }, parsedLaw: undefined },
            { "parsedLaw.ok": { $ne: undefined }, lawDiff: undefined },
        ];
        if (args.retry) {
            orConditions.push(
                { "originalLaw.ok": undefined },
                { "renderedLawtext.ok": undefined },
                { "renderedLawtext.ok.mostSeriousStatus": law_diff.ProblemStatus.Error },
                { "parsedLaw.ok": undefined },
                { "lawDiff.ok": undefined },
            );
        }
        andConditions.push({ $or: orConditions });
    }

    const lawIDs = await db.lawCoverage
        .find({ ...(andConditions.length > 0 ? { $and: andConditions } : {}) })
        .select("LawID")
        .then(res => res.map(lc => lc.LawID));

    return lawIDs;
};

const getToProcessLawInfos = async (args: UpdateArgs, db: ConnectionInfo, loader: Loader) => {

    const { lawInfos: allLawInfosBeforeFilter } = await loader.cacheLawListStruct();

    const allLawInfos =
        allLawInfosBeforeFilter
            .filter(lawInfo => args.lawID ? new RegExp(args.lawID).test(lawInfo.LawID) : true);

    const allLawIDsInListWithDup =
        allLawInfos
            .map(li => li.LawID);
    const allLawIDsInListSet = new Set(allLawIDsInListWithDup);
    const allLawIDsInList = Array.from(allLawIDsInListSet);

    const toUpdateLawIDsInDB = await getToUpdateLawIDsOnDB(args, db);
    const toUpdateLawIDsInDBInList =
        toUpdateLawIDsInDB
            .filter(lawID => allLawIDsInListSet.has(lawID));

    const allLawIDsInDB =
        await db.lawCoverage
            .find()
            .select("LawID")
            .then(res => res.map(lc => lc.LawID));
    const allLawIDsInDBSet = new Set(allLawIDsInDB);

    const lawIDsNotInDB =
        allLawIDsInList
            .filter(lawID => !allLawIDsInDBSet.has(lawID));
    const lawIDsNotInList =
        allLawIDsInDB
            .filter(lawID => !allLawIDsInListSet.has(lawID));

    const lawIDsToProcessSet = new Set([...toUpdateLawIDsInDBInList, ...lawIDsNotInDB]);
    const lawIDsToProcess = Array.from(lawIDsToProcessSet);
    const lawInfos: LawInfo[] = [];
    for (const lawID of lawIDsToProcess) {
        const lawInfo = await loader.getLawInfoByLawID(lawID);
        if (lawInfo) lawInfos.push(lawInfo);
    }

    console.log("Number of laws to be processed:");
    console.log(`    now in list     : ${allLawIDsInListSet.size.toString().padStart(5, " ")}`);
    console.log(`      - duplicated  : ${(allLawIDsInListWithDup.length - allLawIDsInList.length).toString().padStart(5, " ")}`);
    console.log(`      - to process  : ${lawInfos.length.toString().padStart(5, " ")}`);
    console.log(`        - add to DB : ${lawIDsNotInDB.length.toString().padStart(5, " ")}`);
    console.log(`        - update DB : ${toUpdateLawIDsInDBInList.length.toString().padStart(5, " ")}`);
    console.log(`    now in DB       : ${allLawIDsInDB.length.toString().padStart(5, " ")}`);
    console.log(`      - not in list : ${lawIDsNotInList.length.toString().padStart(5, " ")}`);

    return lawInfos;
};

const updateParallel = async (args: UpdateArgs, lawInfos: LawInfo[], workers_count: number) => {
    console.log(`Initializing ${workers_count} workers...`);

    const workers: Map<number, Worker> = new Map(await Promise.all(Array.from(range(0, workers_count)).map(workerIndex => new Promise<[number, Worker]>((resolve, reject) => {
        const worker = new Worker(__dirname + "/update-worker", { workerData: { maxDiffLength: args.maxDiffLength } });
        worker.once("error", reject);
        worker.once("exit", (code) => {
            if (code !== 0) reject(new Error("Worker stopped with error"));
        });
        worker.once("message", msg => {
            if (!msg.ready) console.error(`Unknown message from worker: ${JSON.stringify(msg)}`);
            resolve([workerIndex, worker]);
        });
    }))));

    console.log("Initializing workers completed.");

    for (const worker of workers.values()) {
        worker.once("error", err => { throw err; });
        worker.once("exit", (code) => {
            if (code !== 0) throw new Error("Worker stopped with error");
        });
    }

    const runWorkerPromises: Map<number, Promise<number>> = new Map();

    const runWorker = (worker: Worker, lawInfo: BaseLawInfo) => new Promise<void>((resolve) => {
        worker.postMessage({ lawInfo });
        worker.once("message", msg => {
            if (!msg.finished) console.error(`Unknown message from worker: ${JSON.stringify(msg)}`);
            resolve();
        });
    });

    bar.start(lawInfos.length, 0);
    let progressCount = 0;

    for (const lawInfo of lawInfos) {
        if (runWorkerPromises.size >= workers_count) {
            const workerIndex = await Promise.race(runWorkerPromises.values());
            runWorkerPromises.delete(workerIndex);
        }
        const [workerIndex, worker] = Array.from(workers.entries())
            .filter(([workerIndex]) => !runWorkerPromises.has(workerIndex))[0];
        const promise = runWorker(worker, lawInfo).then(() => {
            progressCount++;
            bar.progress(progressCount, `${lawInfo.LawID} on #${workerIndex}`);
            return workerIndex;
        });
        runWorkerPromises.set(workerIndex, promise);
    }

    await Promise.all(runWorkerPromises.values());
    for (const worker of workers.values()) worker.unref();

    bar.progress(lawInfos.length);
    bar.stop();
};

const updateSerial = async (args: UpdateArgs, lawInfos: LawInfo[], db: ConnectionInfo, loader: Loader) => {
    const updateWorker = await import("./update-worker");

    bar.start(lawInfos.length, 0);
    let progressCount = 0;

    for (const lawInfo of lawInfos) {
        await updateWorker.update(lawInfo, args.maxDiffLength, db, loader);
        progressCount++;
        bar.progress(progressCount, `${lawInfo.LawID}`);
    }

    bar.progress(lawInfos.length);
    bar.stop();
};

const update = async (args: UpdateArgs, db: ConnectionInfo, loader: Loader) => {

    const lawInfos = await getToProcessLawInfos(args, db, loader);

    if (lawInfos.length === 0 || args.dryRun) return;

    const workers_count = parseInt(process.env.WORKERS_COUNT || "1");
    const minimum_parallel_count = parseInt(process.env.MINIMUM_PARALLEL_COUNT || "0");

    if (workers_count > 1 && lawInfos.length >= minimum_parallel_count) {
        console.log(`Running in parallel with ${workers_count} workers...`);
        await updateParallel(args, lawInfos, workers_count);
    } else {
        console.log("Running in serial...");
        await updateSerial(args, lawInfos, db, loader);
    }

};

const notify = async (endpoint: string, title: string, message: string) => {

    await fetch(
        endpoint,
        {
            method: "POST",
            body: JSON.stringify({ value1: title, value2: message }),
            headers: {
                "Content-Type": "application/json",
            },
        },
    );

};

interface UpdateArgs {
    force: boolean,
    retry: boolean,
    dryRun: boolean,
    maxDiffLength: number,
    before?: Date,
    lawID?: string,
    notificationEndpoint?: string,
}

export const main = async (args: UpdateArgs): Promise<void> => {
    const db = await connect(config.MONGODB_URI);
    const loader = new FSStoredLoader(config.DATA_PATH);

    console.log(`Start updating law coverage at ${new Date().toISOString()}...`);
    console.dir(args);

    if (args.notificationEndpoint) {
        console.log("It will notify your ifttt when it finished.");
    }
    await update(args, db, loader);
    if (args.notificationEndpoint) {
        await notify(
            args.notificationEndpoint,
            "updating finished!",
            `"${process.argv.join(" ")}" has just been finished.`,
        );
    }

    await db.connection.close();
};

export default main;

