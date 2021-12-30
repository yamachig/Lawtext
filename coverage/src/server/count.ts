import { ConnectionInfo } from "../connection";
import { ProblemStatus } from "lawtext/dist/src/diff/law_diff";
import { OriginalLawStatus, RenderedLawtextStatus, ParsedLawStatus, LawDiffStatus, LawCoverageCounts } from "../lawCoverage";


const forCountAgg = {
    OriginalLawStatus: {
        $switch: {
            branches: [
                { case: { $not: "$originalLaw" }, then: OriginalLawStatus.Null },
                { case: { $not: "$originalLaw.ok" }, then: OriginalLawStatus.Fail },
            ],
            default: OriginalLawStatus.Success,
        },
    },
    RenderedLawtextStatus: {
        $switch: {
            branches: [
                { case: { $not: "$renderedLawtext" }, then: RenderedLawtextStatus.Null },
                { case: { $not: "$renderedLawtext.ok" }, then: RenderedLawtextStatus.Fail },
            ],
            default: RenderedLawtextStatus.Success,
        },
    },
    ParsedLawStatus: {
        $switch: {
            branches: [
                { case: { $not: "$parsedLaw" }, then: ParsedLawStatus.Null },
                { case: { $not: "$parsedLaw.ok" }, then: ParsedLawStatus.Fail },
            ],
            default: ParsedLawStatus.Success,
        },
    },
    LawDiffStatus: {
        $switch: {
            branches: [
                { case: { $not: "$lawDiff" }, then: LawDiffStatus.Null },
                { case: { $not: "$lawDiff.ok" }, then: LawDiffStatus.Fail },
                { case: { $eq: ["$lawDiff.ok.mostSeriousStatus", ProblemStatus.Error] }, then: LawDiffStatus.Error },
                { case: { $eq: ["$lawDiff.ok.mostSeriousStatus", ProblemStatus.Warning] }, then: LawDiffStatus.Warning },
                { case: { $eq: ["$lawDiff.ok.mostSeriousStatus", ProblemStatus.NoProblem] }, then: LawDiffStatus.NoProblem },
            ],
            default: 1,
        },
    },
};

export const countLawCoverages = async (db: ConnectionInfo) => {
    const rawCounts = await db.lawCoverage
        .aggregate([
            {
                $addFields: {
                    forCount: forCountAgg,
                },
            },
            {
                $group: {
                    _id: {
                        OriginalLawStatus: "$forCount.OriginalLawStatus",
                        RenderedLawtextStatus: "$forCount.RenderedLawtextStatus",
                        ParsedLawStatus: "$forCount.ParsedLawStatus",
                        LawDiffStatus: "$forCount.LawDiffStatus",
                    },
                    count: { $sum: 1 },
                },
            },
        ]);

    const counts = {
        OriginalLawStatus: (
            Object.fromEntries(Object.values(OriginalLawStatus).map((status) => [status, 0]))
        ),
        RenderedLawtextStatus: (
            Object.fromEntries(Object.values(RenderedLawtextStatus).map((status) => [status, 0]))
        ),
        ParsedLawStatus: (
            Object.fromEntries(Object.values(ParsedLawStatus).map((status) => [status, 0]))
        ),
        LawDiffStatus: (
            Object.fromEntries(Object.values(LawDiffStatus).map((status) => [status, 0]))
        ),
    } as LawCoverageCounts;

    for (const count of rawCounts) {
        counts.OriginalLawStatus[count._id.OriginalLawStatus as OriginalLawStatus] += count.count;
        counts.RenderedLawtextStatus[count._id.RenderedLawtextStatus as RenderedLawtextStatus] += count.count;
        counts.ParsedLawStatus[count._id.ParsedLawStatus as ParsedLawStatus] += count.count;
        counts.LawDiffStatus[count._id.LawDiffStatus as LawDiffStatus] += count.count;
    }

    return counts;
};
