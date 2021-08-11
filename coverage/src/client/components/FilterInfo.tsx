import { Era, LawCoverage, LawType } from "../../lawCoverage";
import { ProblemStatus } from "@coresrc/diff/law_diff";
import { assertNever } from "@coresrc/util";


export enum SortKey {
    ID = "ID",
    LawNum = "LawNum",
    LawType = "LawType",
    RenderedLawtextStatus = "RenderedLawtextStatus",
    ParsedLawStatus = "ParsedLawStatus",
    LawDiffStatus = "LawDiffStatus",
}

export enum SortDirection {
    Asc = "Asc",
    Desc = "Desc",
}

const eraToNumber = (era: Era) => {
    switch (era) {
    case Era.Meiji: return 1;
    case Era.Taisho: return 2;
    case Era.Showa: return 3;
    case Era.Heisei: return 4;
    }
};

const lawTypeToNumber = (lawType: LawType) => {
    switch (lawType) {
    case LawType.Constitution: return 1;
    case LawType.Act: return 2;
    case LawType.CabinetOrder: return 3;
    case LawType.ImperialOrder: return 4;
    case LawType.MinisterialOrdinance: return 4;
    case LawType.Rule: return 4;
    case LawType.Misc: return 4;
    default: throw assertNever(lawType);
    }
};

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

const renderedLawtextStatusToNumber = (lawCoverage: LawCoverage) => {
    if (!lawCoverage.renderedLawtext) return 2;
    else if (!lawCoverage.renderedLawtext.ok) return 0;
    else return 1;
};

export enum ParsedLawStatus {
    Fail = "Fail",
    Success = "Success",
    Null = "Null",
}

export const getParsedLawStatus = (lawCoverage: LawCoverage): ParsedLawStatus => {
    if (!lawCoverage.parsedLaw) return ParsedLawStatus.Null;
    else if (!lawCoverage.parsedLaw.ok) return ParsedLawStatus.Fail;
    else return ParsedLawStatus.Success;
};

const parsedLawStatusToNumber = (lawCoverage: LawCoverage) => {
    if (!lawCoverage.parsedLaw) return 2;
    else if (!lawCoverage.parsedLaw.ok) return 0;
    else return 1;
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

const lawDiffStatusToNumber = (lawCoverage: LawCoverage) => {
    if (!lawCoverage.lawDiff) return 4;
    else if (!lawCoverage.lawDiff.ok) return 0;
    else {
        switch (lawCoverage.lawDiff.ok.mostSeriousStatus) {
        case ProblemStatus.Error: return 1;
        case ProblemStatus.Warning: return 2;
        case ProblemStatus.NoProblem: return 3;
        default: throw assertNever(lawCoverage.lawDiff.ok.mostSeriousStatus);
        }
    }
};

const _compare1 = (a: LawCoverage, b: LawCoverage, sortKey: SortKey) => {
    if (sortKey === SortKey.ID) {
        if (a.LawID < b.LawID) {
            return -1;
        } else if (a.LawID > b.LawID) {
            return 1;
        } else {
            return 0;
        }
    } else if (sortKey === SortKey.LawNum) {
        const [aEra, bEra] = [a, b].map(lawCoverage => lawCoverage.Era ? eraToNumber(lawCoverage.Era) : 0);
        if (aEra !== bEra) {
            return aEra - bEra;
        } else if (a.Year !== b.Year) {
            return (a.Year ?? 0) - (b.Year ?? 0);
        } else {
            const [aLawType, bLawType] = [a, b].map(lawCoverage => lawCoverage.LawType ? lawTypeToNumber(lawCoverage.LawType) : 0);
            if (aLawType !== bLawType) {
                return aLawType - bLawType;
            } else if ((a.Num ?? 0) < (b.Num ?? 0)) {
                return -1;
            } else if ((a.Num ?? 0) > (b.Num ?? 0)) {
                return 1;
            } else if (a.LawNum < b.LawNum) {
                return -1;
            } else if (a.LawNum > b.LawNum) {
                return 1;
            } else {
                return 0;
            }
        }
    } else if (sortKey === SortKey.LawType) {
        const [aLawType, bLawType] = [a, b].map(lawCoverage => lawCoverage.LawType ? lawTypeToNumber(lawCoverage.LawType) : 0);
        return aLawType - bLawType;
    } else if (sortKey === SortKey.RenderedLawtextStatus) {
        const [aN, bN] = [a, b].map(renderedLawtextStatusToNumber);
        return aN - bN;
    } else if (sortKey === SortKey.ParsedLawStatus) {
        const [aN, bN] = [a, b].map(parsedLawStatusToNumber);
        return aN - bN;
    } else if (sortKey === SortKey.LawDiffStatus) {
        const [aN, bN] = [a, b].map(lawDiffStatusToNumber);
        return aN - bN;
    } else {
        throw assertNever(sortKey);
    }
};

const _compare0 = (a: LawCoverage, b: LawCoverage, [sortKey, sortDirection]: [SortKey, SortDirection]) => {
    const ret = _compare1(a, b, sortKey);
    if (sortDirection === SortDirection.Asc) {
        return ret;
    } else if (sortDirection === SortDirection.Desc) {
        return -ret;
    } else {
        throw assertNever(sortDirection);
    }
};

const compare = (a: LawCoverage, b: LawCoverage, sort: Array<[SortKey, SortDirection]>) => {
    for (const sortKey of sort) {
        const cmp = _compare0(a, b, sortKey);
        if (cmp !== 0) return cmp;
    }
    return 0;
};

export const sorted = (lawCoverages: LawCoverage[], sort: Array<[SortKey, SortDirection]>): LawCoverage[] => {
    const ret = [...lawCoverages];
    ret.sort((a, b) => compare(a, b, sort));
    return ret;
};

export interface Filter {
    lawType: Set<LawType>,
    originalLawStatus: Set<OriginalLawStatus>,
    renderedLawtextStatus: Set<RenderedLawtextStatus>,
    parsedLawStatus: Set<ParsedLawStatus>,
    lawDiffStatus: Set<LawDiffStatus>,
}

const pass = (lawCoverage: LawCoverage, filter: Filter) => {
    return (
        lawCoverage.LawType &&
        filter.lawType.has(lawCoverage.LawType) &&
        filter.originalLawStatus.has(getOriginalLawStatus(lawCoverage)) &&
        filter.renderedLawtextStatus.has(getRenderedLawtextStatus(lawCoverage)) &&
        filter.parsedLawStatus.has(getParsedLawStatus(lawCoverage)) &&
        filter.lawDiffStatus.has(getLawDiffStatus(lawCoverage))
    );
};

export const filtered = (lawCoverages: LawCoverage[], filter: Filter): LawCoverage[] => {
    return lawCoverages.filter(lawCoverage => pass(lawCoverage, filter));
};

export interface FilterInfo {
    sort: Array<[SortKey, SortDirection]>,
    filter: Filter,
}
