import * as law_diff from "lawtext/dist/src/diff/law_diff";
import { BaseLawInfo } from "lawtext/dist/src/data/lawinfo";

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

export interface LawCoverage extends BaseLawInfo {
    updateDate: Date,

    Era: Era | null;
    Year: number | null;
    LawType: LawType | null;
    Num: number | null;

    originalLaw: {
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
        info: Record<string, unknown>,
    } | null,
    lawDiff: {
        ok: {
            mostSeriousStatus: law_diff.ProblemStatus,
            result: {
                items: law_diff.LawDiffResultItemData[],
                totalCount: number,
            },
            requiredms: Map<string, number>,
        } | null,
        info: Record<string, unknown>,
    } | null,
}
