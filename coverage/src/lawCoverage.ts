import type * as lawDiff from "lawtext/dist/src/diff/lawDiff";
import type { BaseLawInfo } from "lawtext/dist/src/data/lawinfo";

export enum Era {
    Meiji = "Meiji",
    Taisho = "Taisho",
    Showa = "Showa",
    Heisei = "Heisei",
}

export enum LawType {
    Constitution = "Constitution",
    Act = "Act",
    CabinetOrder = "CabinetOrder",
    ImperialOrder = "ImperialOrder",
    MinisterialOrdinance = "MinisterialOrdinance",
    Rule = "Rule",
    Misc = "Misc",
}

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

export const toSortString = (sort: [key:SortKey, direction:SortDirection][]) => {
    return sort.map(s => `${s[1] === SortDirection.Desc ? "-" : ""}${s[0]}`).join(",");
};

export const fromSortStirng = (sortString: string) => {
    return sortString.split(",").map(s => {
        if (s.startsWith("-")) {
            return [s.slice(1), SortDirection.Desc] as [key:SortKey, direction:SortDirection];
        } else {
            return [s, SortDirection.Asc] as [key:SortKey, direction:SortDirection];
        }
    });
};


export enum OriginalLawStatus {
    Fail = "Fail",
    Success = "Success",
    Null = "Null",
}

export enum RenderedHTMLStatus {
    Fail = "Fail",
    Success = "Success",
    Null = "Null",
}

export enum RenderedDocxStatus {
    Fail = "Fail",
    Success = "Success",
    Null = "Null",
}

export enum RenderedLawtextStatus {
    Fail = "Fail",
    Success = "Success",
    Null = "Null",
}

export enum ParsedLawStatus {
    Fail = "Fail",
    Error = "Error",
    Success = "Success",
    Null = "Null",
}

export enum LawDiffStatus {
    Fail = "Fail",
    Error = "Error",
    Warning = "Warning",
    NoProblem = "NoProblem",
    Null = "Null",
}

export interface LawCoverageCounts {
    OriginalLawStatus: Record<OriginalLawStatus, number>;
    RenderedHTMLStatus: Record<RenderedHTMLStatus, number>;
    RenderedDocxStatus: Record<RenderedDocxStatus, number>;
    RenderedLawtextStatus: Record<RenderedLawtextStatus, number>;
    ParsedLawStatus: Record<ParsedLawStatus, number>;
    LawDiffStatus: Record<LawDiffStatus, number>;
}

export interface LawCoverage extends BaseLawInfo {
    updateDate: Date,

    Era: Era | null;
    Year: number | null;
    LawType: LawType | null;
    Num: string | null;

    originalLaw: {
        ok: {
            requiredms: Map<string, number>,
        } | null,
        info: Record<string, unknown>,
    } | null,

    renderedHTML: {
        ok: {
            requiredms: Map<string, number>,
        } | null,
        info: Record<string, unknown>,
    } | null,

    renderedDocx: {
        ok: {
            requiredms: Map<string, number>,
        } | null,
        info: Record<string, unknown>,
    } | null,

    renderedLawtext: {
        ok: {
            requiredms: Map<string, number>,
        } | null,
        info: Record<string, unknown>,
    } | null,

    parsedLaw: {
        ok: {
            requiredms: Map<string, number>,
        } | null,
        hasError: boolean,
        info: Record<string, unknown>,
    } | null,

    lawDiff: {
        ok: {
            mostSeriousStatus: lawDiff.ProblemStatus,
            result: {
                items: lawDiff.LawDiffResultItemData[],
                totalCount: number,
            },
            requiredms: Map<string, number>,
        } | null,
        info: Record<string, unknown>,
    } | null,
}
