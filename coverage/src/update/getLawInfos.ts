// import formatXML from "xml-formatter";
// import * as law_diff from "lawtext/dist/src/diff/law_diff";
import type { Loader } from "lawtext/dist/src/data/loaders/common";
import type mongoose from "mongoose";
import type { LawInfo } from "lawtext/dist/src/data/lawinfo";
import type { LawCoverage } from "../lawCoverage";
import type { ConnectionInfo } from "../connection";
import type { UpdateArgs } from "./args";


export const getToUpdateLawIDsOnDB = async (args: UpdateArgs, db: ConnectionInfo) => {

    const andConditions: mongoose.FilterQuery<LawCoverage>[] = [];

    if (args.before) {
        andConditions.push({ updateDate: { $lt: args.before } });
    }

    if (args.force) {
        //
    } else {
        const orConditions: mongoose.FilterQuery<LawCoverage>[] = [
            { originalLaw: null },
            { "originalLaw.ok": { $ne: null }, renderedHTML: null },
            { "originalLaw.ok": { $ne: null }, renderedDocx: null },
            { "originalLaw.ok": { $ne: null }, renderedLawtext: null },
            { "renderedLawtext.ok": { $ne: null }, parsedLaw: null },
            { "parsedLaw.ok": { $ne: null }, lawDiff: null },
        ];
        if (args.retry) {
            orConditions.push(
                { "originalLaw.ok": null },
                { "renderedHTML.ok": null },
                { "renderedDocx.ok": null },
                { "renderedLawtext.ok": null },
                // { "renderedLawtext.ok.mostSeriousStatus": law_diff.ProblemStatus.Error },
                { "parsedLaw.ok": null },
                { "lawDiff.ok": null },
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

export const getToProcessLawInfos = async (args: UpdateArgs, db: ConnectionInfo, loader: Loader) => {

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
