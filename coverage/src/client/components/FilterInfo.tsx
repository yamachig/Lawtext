import type { LawCoverage } from "../../lawCoverage";
import { ProblemStatus } from "lawtext/dist/src/diff/lawDiff";
import { assertNever } from "lawtext/dist/src/util";


export enum SortKey {
    ID = "ID",
    LawNum = "LawNum",
    LawType = "LawType",
    RenderedHTMLStatus = "RenderedHTMLStatus",
    RenderedDocxStatus = "RenderedDocxStatus",
    RenderedLawtextStatus = "RenderedLawtextStatus",
    ParsedLawStatus = "ParsedLawStatus",
    LawDiffStatus = "LawDiffStatus",
}

export enum SortDirection {
    Asc = "Asc",
    Desc = "Desc",
}

export enum OriginalLawStatus {
    Fail = "Fail",
    Success = "Success",
    Null = "Null",
}

export const getOriginalLawStatus = (lawCoverage: LawCoverage): OriginalLawStatus => {
    if (!lawCoverage.originalLaw) return OriginalLawStatus.Null;
    else if (!lawCoverage.originalLaw.ok) return OriginalLawStatus.Fail;
    else return OriginalLawStatus.Success;
};

export enum RenderedHTMLStatus {
    Fail = "Fail",
    Success = "Success",
    Null = "Null",
}

export const getRenderedHTMLStatus = (lawCoverage: LawCoverage): RenderedHTMLStatus => {
    if (!lawCoverage.renderedHTML) return RenderedHTMLStatus.Null;
    else if (!lawCoverage.renderedHTML.ok) return RenderedHTMLStatus.Fail;
    else return RenderedHTMLStatus.Success;
};

export enum RenderedDocxStatus {
    Fail = "Fail",
    Success = "Success",
    Null = "Null",
}

export const getRenderedDocxStatus = (lawCoverage: LawCoverage): RenderedDocxStatus => {
    if (!lawCoverage.renderedDocx) return RenderedDocxStatus.Null;
    else if (!lawCoverage.renderedDocx.ok) return RenderedDocxStatus.Fail;
    else return RenderedDocxStatus.Success;
};

export enum RenderedLawtextStatus {
    Fail = "Fail",
    Success = "Success",
    Null = "Null",
}

export const getRenderedLawtextStatus = (lawCoverage: LawCoverage): RenderedLawtextStatus => {
    if (!lawCoverage.renderedLawtext) return RenderedLawtextStatus.Null;
    else if (!lawCoverage.renderedLawtext.ok) return RenderedLawtextStatus.Fail;
    else return RenderedLawtextStatus.Success;
};

export enum ParsedLawStatus {
    Fail = "Fail",
    Error = "Error",
    Success = "Success",
    Null = "Null",
}

export const getParsedLawStatus = (lawCoverage: LawCoverage): ParsedLawStatus => {
    if (!lawCoverage.parsedLaw) return ParsedLawStatus.Null;
    else if (!lawCoverage.parsedLaw.ok) return ParsedLawStatus.Fail;
    else if (lawCoverage.parsedLaw.hasError) return ParsedLawStatus.Error;
    else return ParsedLawStatus.Success;
};

export enum LawDiffStatus {
    Fail = "Fail",
    Error = "Error",
    Warning = "Warning",
    NoProblem = "NoProblem",
    Null = "Null",
}

export const getLawDiffStatus = (lawCoverage: LawCoverage): LawDiffStatus => {
    if (!lawCoverage.lawDiff) return LawDiffStatus.Null;
    else if (!lawCoverage.lawDiff.ok) return LawDiffStatus.Fail;
    else {
        switch (lawCoverage.lawDiff.ok.mostSeriousStatus) {
        case ProblemStatus.Error: return LawDiffStatus.Error;
        case ProblemStatus.Warning: return LawDiffStatus.Warning;
        case ProblemStatus.NoProblem: return LawDiffStatus.NoProblem;
        default: throw assertNever(lawCoverage.lawDiff.ok.mostSeriousStatus);
        }
    }
};

// export interface Filter {
//     lawType: Set<LawType>,
//     originalLawStatus: Set<OriginalLawStatus>,
//     renderedLawtextStatus: Set<RenderedLawtextStatus>,
//     parsedLawStatus: Set<ParsedLawStatus>,
//     lawDiffStatus: Set<LawDiffStatus>,
// }

// const pass = (lawCoverage: LawCoverage, filter: Filter) => {
//     return (
//         lawCoverage.LawType &&
//         filter.lawType.has(lawCoverage.LawType) &&
//         filter.originalLawStatus.has(getOriginalLawStatus(lawCoverage)) &&
//         filter.renderedLawtextStatus.has(getRenderedLawtextStatus(lawCoverage)) &&
//         filter.parsedLawStatus.has(getParsedLawStatus(lawCoverage)) &&
//         filter.lawDiffStatus.has(getLawDiffStatus(lawCoverage))
//     );
// };

// export const filtered = (lawCoverages: LawCoverage[], filter: Filter): LawCoverage[] => {
//     return lawCoverages.filter(lawCoverage => pass(lawCoverage, filter));
// };

export interface FilterInfo {
    from: number,
    to: number,
    sort: Array<[SortKey, SortDirection]>,
    // filter: Filter,
}

export const filterInfoEqual = (a: FilterInfo, b: FilterInfo) => {
    return (
        a.from === b.from
        && a.to === b.to
        && a.sort.length === b.sort.length
        && a.sort.every(([aKey, aDir], i) => aKey === b.sort[i][0] && aDir === b.sort[i][1])
    );
};
