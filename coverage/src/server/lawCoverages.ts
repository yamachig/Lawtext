import { LawCoverage, LawCoverageCounts, SortDirection, SortKey } from "../lawCoverage";
import { ConnectionInfo } from "../connection";
import mongoose from "mongoose";
import { sortedLawCoverages } from "./sort";
import { countLawCoverages } from "./count";

export class LawCoveragesManager {
    public constructor(
        public db: ConnectionInfo,
    ) {
        this.db.lawCoverage.watch().once("change", async () => {
            await this.closeCursor();
            this.lawCoveragesCache = null;
            this.countsCache = null;
            console.log(`[${new Date().toISOString()}] LawCoveragesManager.slice() change detected: cursor closed and cache cleared.`);
        });
    }

    protected sort: [key:SortKey, direction:SortDirection][] = [];
    protected lawCoveragesCursor: mongoose.Cursor | null = null;
    protected lawCoveragesCache: LawCoverage[] | null = null;

    protected countsCache: LawCoverageCounts | null = null;

    public async closeCursor() {
        if (this.lawCoveragesCursor) {
            await this.lawCoveragesCursor.close();
            this.lawCoveragesCursor = null;
        }
    }

    public async slice(start: number, end: number, sort: [key:SortKey, direction:SortDirection][]): Promise<LawCoverage[]> {
        if (
            this.lawCoveragesCache === null
            || this.sort.length !== sort.length
            || !this.sort.every(([key, direction], i) => key === sort[i][0] && direction === sort[i][1])
        ) {
            await this.closeCursor();
            this.sort = sort;
            this.lawCoveragesCursor = await sortedLawCoverages(this.db, sort);
            console.log(`[${new Date().toISOString()}] LawCoveragesManager.slice() initialized: start=${start}, end=${end}, sort=${JSON.stringify(sort)}`);
            this.lawCoveragesCache = [];
        }

        while (this.lawCoveragesCursor && this.lawCoveragesCache.length < Math.max(start + 1, end)) {
            const startTime = new Date();
            const next = await this.lawCoveragesCursor.next();
            const endTime = new Date();
            console.log(`[${new Date().toISOString()}] LawCoveragesManager.slice() fetched: time=${endTime.getTime() - startTime.getTime()}`);
            if (next) {
                this.lawCoveragesCache.push(next);
            } else {
                await this.closeCursor();
            }
        }

        return this.lawCoveragesCache.slice(start, end);
    }

    public async counts() {
        if (this.countsCache === null) {
            this.countsCache = await countLawCoverages(this.db);
        }
        return this.countsCache;
    }
}
