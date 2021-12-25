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

    Era?: Era;
    Year?: number;
    LawType?: LawType;
    Num?: number;

    originalLaw?: {
        ok?: {
            requiredms: Map<string, number>,
        },
        info: Record<string, unknown>,
    },
    renderedLawtext?: {
        ok?: {
            requiredms: Map<string, number>,
        },
        info: Record<string, unknown>,
    },
    parsedLaw?: {
        ok?: {
            requiredms: Map<string, number>,
        },
        info: Record<string, unknown>,
    },
    lawDiff?: {
        ok?: {
            mostSeriousStatus: law_diff.ProblemStatus,
            result: {
                items: law_diff.LawDiffResultItemData[],
                totalCount: number,
            },
            requiredms: Map<string, number>,
        },
        info: Record<string, unknown>,
    },
}
