// import formatXML from "xml-formatter";
import { FSStoredLoader } from "lawtext/dist/src/data/loaders/FSStoredLoader";
import type { Loader } from "lawtext/dist/src/data/loaders/common";
import { Bar, Presets } from "cli-progress";
import type { BaseLawInfo, LawInfo } from "lawtext/dist/src/data/lawinfo";
import { fetch } from "../node-fetch";
import type { ConnectionInfo } from "../connection";
import { connect } from "../connection";
import config from "../config";
import { Worker } from "worker_threads";
import { pick, range } from "lawtext/dist/src/util";
import type { UpdateArgs } from "./args";
import { getToProcessLawInfos } from "./getLawInfos";
import os from "os";
import prand from "pure-rand";

class ProgressBar {
    public bar: Bar;
    public constructor() {
        this.bar = new Bar(
            {
                format: "[{bar}] {percentage}% | ETR: {eta_formatted} | {message}",
                etaBuffer: 1000,
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


const updateParallel = async (args: UpdateArgs, lawInfos: LawInfo[], workers_count: number) => {
    console.log(`[${new Date().toISOString()}] Initializing ${workers_count} workers...`);

    const workers: Map<number, Worker> = new Map(await Promise.all(Array.from(range(0, workers_count)).map(workerIndex => new Promise<[number, Worker]>((resolve, reject) => {
        const worker = new Worker(__dirname + "/worker", { workerData: { maxDiffLength: args.maxDiffLength } });
        worker.once("error", reject);
        worker.once("exit", (code) => {
            if (code !== 0) reject(new Error("Worker stopped with error"));
        });
        worker.once("message", msg => {
            if (!msg.ready) console.error(`\n[${new Date().toISOString()}] Unknown message from worker: ${JSON.stringify(msg)}`);
            resolve([workerIndex, worker]);
        });
    }))));

    console.log(`[${new Date().toISOString()}] Initializing workers completed.`);

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
            if (msg.error) {
                console.error(`\n[${new Date().toISOString()}] Error in updateParallel.runWorker: ${JSON.stringify(msg, undefined, 2)}`);
                const stack = msg.message?.stack ?? undefined;
                if (typeof stack === "string") {
                    for (const l of stack.split("\n")) {
                        console.error(l);
                    }
                }
                resolve();
            } else {
                if (!msg.finished) console.error(`\n[${new Date().toISOString()}] Unknown message from worker: ${JSON.stringify(msg)}`);
                resolve();
            }
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

    console.log(`[${new Date().toISOString()}] Update completed.`);
};

const updateSerial = async (args: UpdateArgs, lawInfos: LawInfo[], db: ConnectionInfo, loader: Loader) => {
    const update = (await import("./update")).update;

    bar.start(lawInfos.length, 0);
    let progressCount = 0;

    for (const lawInfo of lawInfos) {
        try {
            await update(lawInfo, args.maxDiffLength, db, loader);
        } catch (e) {
            console.error(`[${new Date().toISOString()}] ### Error in updateSerial ###`);
            console.error(e);
        }
        progressCount++;
        bar.progress(progressCount, `${lawInfo.LawID}`);
    }

    bar.progress(lawInfos.length);
    bar.stop();
};

const update = async (args: UpdateArgs, db: ConnectionInfo, loader: Loader) => {

    const origLawInfos = await getToProcessLawInfos(args, db, loader);

    if (origLawInfos.length === 0) return;

    if (args.dryRun && origLawInfos.length <= 20) {
        for (const lawInfo of origLawInfos) {
            console.log(pick(lawInfo, "LawID", "LawNum", "LawTitle"));
        }
        return;
    }

    const randGen = prand.xoroshiro128plus(origLawInfos.length);
    const lawInfosWithRand = origLawInfos.map(l => [randGen.unsafeNext(), l] as const);
    lawInfosWithRand.sort((a, b) => a[0] - b[0]);
    const lawInfos = lawInfosWithRand.map(([, l]) => l);

    const workers_count = Math.min(
        parseInt(process.env.MAX_WORKERS ?? "8"),
        parseInt(process.env.WORKERS_COUNT ?? Math.ceil(os.cpus().length).toString()),
    );
    const minimum_parallel_count = parseInt(process.env.MINIMUM_PARALLEL_COUNT || "0");

    if ((!args.noParallel) && workers_count > 1 && lawInfos.length >= minimum_parallel_count) {
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


export const main = async (args: UpdateArgs): Promise<void> => {
    const db = await connect(config.MONGODB_URI);
    const loader = new FSStoredLoader(config.DATA_PATH);

    console.log(`[${new Date().toISOString()}] Start updating law coverage...`);
    console.dir(args);

    if (args.notificationEndpoint) {
        console.log("It will notify your ifttt when it finished.");
    }
    await update(args, db, loader);
    if (args.notificationEndpoint) {
        await notify(
            args.notificationEndpoint,
            "updating finished!",
            `[${new Date().toISOString()}] "${process.argv.join(" ")}" has just been finished.`,
        );
    }

    await db.connection.close();
};

export default main;

