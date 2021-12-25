// import formatXML from "xml-formatter";
import { DOMParser } from "@xmldom/xmldom";
import * as law_diff from "@coresrc/diff/law_diff";
import * as parser_wrapper from "@coresrc/parser_wrapper";
import { render as renderLawtext } from "@coresrc/renderers/lawtext";
import { FSStoredLoader } from "@coresrc/data/loaders/FSStoredLoader";
import { Loader } from "@coresrc/data/loaders/common";
import { EL, parseLawNum, xmlToJson } from "@coresrc/util";
import mongoose from "mongoose";
import { Bar, Presets } from "cli-progress";
import { LawInfo } from "@coresrc/data/lawinfo";
import { fetch } from "./node-fetch";
import { Era, LawCoverage, LawType } from "./lawCoverage";
import { connect, ConnectionInfo } from "./connection";
import config from "./config";
import { Law } from "./std_law";

const domParser = new DOMParser();

class ProgressBar {
    public bar: Bar;
    public constructor() {
        this.bar = new Bar(
            {
                format: "[{bar}] {percentage}% | {message}",
            }, Presets.rect,
        );
    }
    public progress(ratio?: number, message?: string): void {
        const payload = { message: (typeof message !== "string") ? "" : message.length > 30 ? message.slice(0, 30) + " ..." : message };
        if (ratio) {
            this.bar.update(ratio, payload);
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


class Lap {
    date: Date;
    constructor() {
        this.date = new Date();
    }
    lapms() {
        const now = new Date();
        const ms = now.getTime() - this.date.getTime();
        this.date = now;
        return ms;
    }
}


const getOriginalLaw = async (lawInfo: LawInfo, loader: Loader): Promise<{
    origEL?: EL,
    origXML?: string,
    lawNumStruct?: {
        Era: Era | null,
        Year: number | null,
        LawType: LawType | null,
        Num: number | null,
    },
    originalLaw: Required<LawCoverage>["originalLaw"],
}> => {
    try {
        const requiredms = new Map<string, number>();
        const lap = new Lap();

        const origXML = await loader.loadLawXMLByInfo(lawInfo);
        requiredms.set("loadXML", lap.lapms());

        const origEL = xmlToJson(origXML) as Law;
        requiredms.set("xmlToJson", lap.lapms());

        const Year = Number(origEL.attr.Year);
        const Num = Number(origEL.attr.Num);

        return {
            origEL,
            origXML,
            lawNumStruct: {
                Era: origEL.attr.Era as Era,
                Year: Number.isNaN(Year) ? null : Year,
                Num: Number.isNaN(Num) ? null : Num,
                LawType: origEL.attr.LawType as LawType,
            },
            originalLaw: {
                ok: {
                    requiredms,
                },
                info: {},
            },
        };
    } catch (e) {
        return {
            originalLaw: {
                info: { error: (e as Error).stack },
            },
        };
    }
};


const getRenderedLawtext = async (origEL: EL): Promise<{
    lawtext?: string,
    renderedLawtext: Required<LawCoverage>["renderedLawtext"],
}> => {
    try {
        const requiredms = new Map<string, number>();
        const lap = new Lap();

        const lawtext = renderLawtext(origEL);
        requiredms.set("renderLawtext", lap.lapms());

        return {
            lawtext,
            renderedLawtext: {
                ok: {
                    requiredms,
                },
                info: {},
            },
        };
    } catch (e) {
        return {
            renderedLawtext: {
                info: { error: (e as Error).stack },
            },
        };
    }
};


const getParsedLaw = async (lawtext: string): Promise<{
    parsedEL?: EL,
    parsedXML?: string,
    parsedLaw: Required<LawCoverage>["parsedLaw"],
}> => {
    try {
        const requiredms = new Map<string, number>();
        const lap = new Lap();

        const parsedEL = parser_wrapper.parse(lawtext);
        requiredms.set("parseLawtext", lap.lapms());

        parser_wrapper.analyze(parsedEL);
        requiredms.set("analyze", lap.lapms());

        const parsedXML = parsedEL.outerXML(false);
        requiredms.set("parsedELToXML", lap.lapms());

        return {
            parsedEL,
            parsedXML,
            parsedLaw: {
                ok: {
                    requiredms,
                },
                info: {},
            },
        };
    } catch (e) {
        return {
            parsedLaw: {
                info: { error: (e as Error).stack },
            },
        };
    }
};


const getLawDiff = async (origXML: string, origEL: EL, parsedXML: string, parsedEL: EL, max_diff_length: number): Promise<{
    lawDiff: Required<LawCoverage>["lawDiff"],
}> => {
    try {
        const requiredms = new Map<string, number>();
        const lap = new Lap();

        const origJson = origEL.json(false);
        requiredms.set("origELToJson", lap.lapms());

        const parsedJson = parsedEL.json(false);
        requiredms.set("parsedELToJson", lap.lapms());

        const d = law_diff.lawDiff(origJson, parsedJson, law_diff.LawDiffMode.NoProblemAsNoDiff);
        requiredms.set("lawDiff", lap.lapms());

        const origDOM = domParser.parseFromString(origXML);
        requiredms.set("parseLawtext", lap.lapms());

        const parsedDOM = domParser.parseFromString(parsedXML);
        requiredms.set("parseLawtext", lap.lapms());

        const diffData = law_diff.makeDiffData(d, origDOM, parsedDOM);
        requiredms.set("parseLawtext", lap.lapms());

        let slicedDiffData = diffData;

        if (diffData.length > max_diff_length) {
            const iSerious = Math.max(diffData.findIndex(diff => diff.mostSeriousStatus === d.mostSeriousStatus), 0);
            const iStart = Math.min(iSerious, diffData.length - max_diff_length);
            slicedDiffData = diffData.slice(iStart, iStart + max_diff_length);
        }

        return {
            lawDiff: {
                ok: {
                    mostSeriousStatus: d.mostSeriousStatus,
                    result: {
                        items: slicedDiffData,
                        totalCount: diffData.length,
                    },
                    requiredms,
                },
                info: {},
            },
        };
    } catch (e) {
        return {
            lawDiff: {
                info: { error: (e as Error).stack },
            },
        };
    }
};


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

const update = async (args: UpdateArgs, db: ConnectionInfo, loader: Loader) => {

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

    if (lawInfos.length === 0 || args.dryRun) return;

    bar.start(lawInfos.length, 0);
    for (const [i, lawInfo] of lawInfos.entries()) {
        bar.progress(i, lawInfo.LawID);

        const updateDate = new Date();

        const { origEL, origXML, lawNumStruct: lawNumStructFromXML, originalLaw } = await getOriginalLaw(lawInfo, loader);

        const { lawtext, renderedLawtext } = origEL
            ? await getRenderedLawtext(origEL)
            : { lawtext: undefined, renderedLawtext: undefined };

        const { parsedEL, parsedXML, parsedLaw } = lawtext
            ? await getParsedLaw(lawtext)
            : { parsedEL: undefined, parsedXML: undefined, parsedLaw: undefined };

        const { lawDiff } = (origXML && origEL && parsedXML && parsedEL)
            ? await getLawDiff(origXML, origEL, parsedXML, parsedEL, args.maxDiffLength)
            : { lawDiff: undefined };

        const lawNumStruct = lawNumStructFromXML ?? parseLawNum(lawInfo.LawNum);

        const doc: LawCoverage = {
            ...lawInfo.toBaseLawInfo(),
            Era: (lawNumStruct.Era ?? undefined) as Era | undefined,
            Year: lawNumStruct.Year ?? undefined,
            LawType: (lawNumStruct.LawType ?? undefined) as LawType | undefined,
            Num: lawNumStruct.Num ?? undefined,
            updateDate,
            originalLaw,
            renderedLawtext,
            parsedLaw,
            lawDiff,
        };

        await db.lawCoverage.updateOne(
            { LawID: lawInfo.LawID },
            doc,
            {
                upsert: true,
            },
        );
    }
    bar.progress(lawInfos.length);
    bar.stop();

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

    db.connection.close();
};

export default main;

