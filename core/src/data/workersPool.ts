import type { URL } from "url";
import type { WorkerOptions } from "worker_threads";
import { Worker } from "worker_threads";
import { range } from "../util";


export class WorkersPool<TInput, TResult> {
    protected promises: Map<number, Promise<[workerIndex: number, itemIndex: number, input: TInput, result: TResult]>> = new Map();

    protected constructor(
        public workersCount: number,
        public fileName: string | URL,
        public workerOptions: WorkerOptions | undefined,
        public workers: Map<number, Worker>,
    ) { }

    public static async initialize<TInput, TResult>(
        workersCount: number,
        fileName: string | URL,
        workerOptions?: WorkerOptions,
    ): Promise<WorkersPool<TInput, TResult>> {
        const workers = new Map(await Promise.all(
            Array.from(range(0, workersCount))
                .map(workerIndex => new Promise<[number, Worker]>((resolve, reject) => {
                    const worker = new Worker(fileName, workerOptions);
                    worker.once("error", reject);
                    worker.once("exit", (code) => {
                        if (code !== 0) reject(new Error("Worker stopped with error"));
                    });
                    worker.once("message", msg => {
                        if (!msg.ready) console.error(`[${new Date().toISOString()}] Unknown message from worker: ${JSON.stringify(msg)}`);
                        resolve([workerIndex, worker]);
                    });
                })),
        ));

        for (const worker of workers.values()) {
            worker.once("error", err => { throw err; });
            worker.once("exit", (code) => {
                if (code !== 0) throw new Error("Worker stopped with error");
            });
        }

        return new WorkersPool(workersCount, fileName, workerOptions, workers);
    }

    public async *run(items: AsyncIterable<TInput>): AsyncIterable<[itemIndex: number, input: TInput, result: TResult]> {
        let currentItemIndex = 0;
        for await (const item of items) {
            const itemIndex = currentItemIndex;
            if (this.promises.size >= this.workersCount) {
                const [workerIndex, itemIndex, item, result] = await Promise.race(this.promises.values());
                yield [itemIndex, item, result];
                this.promises.delete(workerIndex);
            }
            const [workerIndex, worker] = Array.from(this.workers.entries())
                .filter(([workerIndex]) => !this.promises.has(workerIndex))[0];
            const promise = new Promise<[workerIndex: number, itemIndex: number, input: TInput, result: TResult]>((resolve) => {
                worker.postMessage(item);
                worker.once("message", msg => {
                    resolve([workerIndex, itemIndex, item, msg]);
                });
            });
            this.promises.set(workerIndex, promise);
            currentItemIndex++;
        }

        while (this.promises.size > 0) {
            const [workerIndex, itemIndex, item, result] = await Promise.race(this.promises.values());
            yield [itemIndex, item, result];
            this.promises.delete(workerIndex);
        }
    }

    public unref() {
        for (const worker of Object.values(this.workers)) worker.unref();
    }
}
