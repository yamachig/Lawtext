// import formatXML from "xml-formatter";
import * as law_diff from "lawtext/dist/src/diff/law_diff";
import { Loader } from "lawtext/dist/src/data/loaders/common";
import mongoose from "mongoose";
import { LawInfo } from "lawtext/dist/src/data/lawinfo";
import { LawCoverage } from "../lawCoverage";
import { ConnectionInfo } from "../connection";
import { UpdateArgs } from "./args";


export const getToUpdateLawIDsOnDB = async (args: UpdateArgs, db: ConnectionInfo) => {

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
