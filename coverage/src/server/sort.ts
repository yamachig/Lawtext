import { Era, LawType, SortDirection, SortKey } from "../lawCoverage";
import { ProblemStatus } from "lawtext/dist/src/diff/law_diff";
import { ConnectionInfo } from "../connection";


export const forSortAgg = {
    Era: {
        $switch: {
            branches: [
                { case: { $eq: ["$Era", Era.Meiji] }, then: 1 },
                { case: { $eq: ["$Era", Era.Taisho] }, then: 2 },
                { case: { $eq: ["$Era", Era.Showa] }, then: 3 },
                { case: { $eq: ["$Era", Era.Heisei] }, then: 4 },
            ],
            default: 0,
        },
    },
    Year: { $ifNull: ["$Year", 0] },
    LawType: {
        $switch: {
            branches: [
                { case: { $eq: ["$LawType", LawType.Constitution] }, then: 1 },
                { case: { $eq: ["$LawType", LawType.Act] }, then: 2 },
                { case: { $eq: ["$LawType", LawType.CabinetOrder] }, then: 3 },
                { case: { $eq: ["$LawType", LawType.ImperialOrder] }, then: 4 },
                { case: { $eq: ["$LawType", LawType.MinisterialOrdinance] }, then: 4 },
                { case: { $eq: ["$LawType", LawType.Rule] }, then: 4 },
                { case: { $eq: ["$LawType", LawType.Misc] }, then: 4 },
            ],
            default: 0,
        },
    },
    Num: { $ifNull: ["$Num", 0] },
    RenderedHTMLStatus: {
        $switch: {
            branches: [
                { case: { $not: "$renderedHTML" }, then: 2 },
                { case: { $not: "$renderedHTML.ok" }, then: 0 },
            ],
            default: 1,
        },
    },
    RenderedDocxStatus: {
        $switch: {
            branches: [
                { case: { $not: "$renderedDocx" }, then: 2 },
                { case: { $not: "$renderedDocx.ok" }, then: 0 },
            ],
            default: 1,
        },
    },
    RenderedLawtextStatus: {
        $switch: {
            branches: [
                { case: { $not: "$renderedLawtext" }, then: 2 },
                { case: { $not: "$renderedLawtext.ok" }, then: 0 },
            ],
            default: 1,
        },
    },
    ParsedLawStatus: {
        $switch: {
            branches: [
                { case: { $not: "$parsedLaw" }, then: 3 },
                { case: { $not: "$parsedLaw.hasError" }, then: 2 },
                { case: { $not: "$parsedLaw.ok" }, then: 0 },
            ],
            default: 1,
        },
    },
    LawDiffStatus: {
        $switch: {
            branches: [
                { case: { $not: "$lawDiff" }, then: 4 },
                { case: { $not: "$lawDiff.ok" }, then: 0 },
                { case: { $eq: ["$lawDiff.ok.mostSeriousStatus", ProblemStatus.Error] }, then: 1 },
                { case: { $eq: ["$lawDiff.ok.mostSeriousStatus", ProblemStatus.Warning] }, then: 2 },
                { case: { $eq: ["$lawDiff.ok.mostSeriousStatus", ProblemStatus.NoProblem] }, then: 3 },
            ],
            default: 1,
        },
    },
};

export const transformSort = (sort: [key:SortKey, direction:SortDirection][]) => {
    const sortObj: Record<string, number> = {};
    for (const [key, direction] of sort) {
        switch (key) {
        case SortKey.ID:
            sortObj["LawID"] = direction === SortDirection.Asc ? 1 : -1;
            break;
        case SortKey.LawNum:
            sortObj["forSort.Era"] = direction === SortDirection.Asc ? 1 : -1;
            sortObj["forSort.Year"] = direction === SortDirection.Asc ? 1 : -1;
            sortObj["forSort.LawType"] = sortObj["forSort.LawType"] ?? (direction === SortDirection.Asc ? 1 : -1);
            sortObj["forSort.Num"] = direction === SortDirection.Asc ? 1 : -1;
            sortObj["forSort.LawNum"] = direction === SortDirection.Asc ? 1 : -1;
            break;
        case SortKey.LawType:
            sortObj["forSort.LawType"] = direction === SortDirection.Asc ? 1 : -1;
            break;
        case SortKey.RenderedHTMLStatus:
            sortObj["forSort.RenderedHTMLStatus"] = direction === SortDirection.Asc ? 1 : -1;
            break;
        case SortKey.RenderedDocxStatus:
            sortObj["forSort.RenderedDocxStatus"] = direction === SortDirection.Asc ? 1 : -1;
            break;
        case SortKey.RenderedLawtextStatus:
            sortObj["forSort.RenderedLawtextStatus"] = direction === SortDirection.Asc ? 1 : -1;
            break;
        case SortKey.ParsedLawStatus:
            sortObj["forSort.ParsedLawStatus"] = direction === SortDirection.Asc ? 1 : -1;
            break;
        case SortKey.LawDiffStatus:
            sortObj["forSort.LawDiffStatus"] = direction === SortDirection.Asc ? 1 : -1;
            break;
        }
    }
    return sortObj;
};

export const sortedLawCoverages = async (db: ConnectionInfo, sort: [key:SortKey, direction:SortDirection][]) => {
    return db.lawCoverage
        .aggregate([
            {
                $addFields: {
                    forSort: forSortAgg,
                },
            },
            {
                $project: {
                    forSort: true,
                    LawID: true,
                    LawNum: true,
                    LawTitle: true,
                    // Enforced: true,
                    // Path: true,
                    // XmlName: true,
                    // Era: true,
                    // Year: true,
                    // LawType: true,
                    // Num: true,
                    // updateDate: true,
                    "originalLaw.ok": { $cond: [{ $eq: ["$originalLaw.ok", null] }, null, true] },
                    "renderedHTML.ok": { $cond: [{ $eq: ["$renderedHTML.ok", null] }, null, true] },
                    "renderedDocx.ok": { $cond: [{ $eq: ["$renderedDocx.ok", null] }, null, true] },
                    "renderedLawtext.ok": { $cond: [{ $eq: ["$renderedLawtext.ok", null] }, null, true] },
                    "parsedLaw.ok": { $cond: [{ $eq: ["$parsedLaw.ok", null] }, null, true] },
                    "parsedLaw.hasError": true,
                    "lawDiff.ok.requiredms": true,
                    "lawDiff.ok.mostSeriousStatus": true,
                },
            },
            {
                $sort: {
                    ...transformSort(sort),
                    "_id": 1,
                },
            },
        ])
        .cursor();
};
