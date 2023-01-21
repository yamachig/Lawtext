import * as std from "../../law/std";
import { EL } from "../../node/el";

// export const ignoreAnalysisTags = [
//     "QuoteStruct",
//     "NewProvision",
//     // "LawNum",
//     // "LawTitle",
//     // "TOC",
//     // "ArticleTitle",
//     // ...std.paragraphItemTitleTags,
//     // "SupplProvision",
// ] as const;

// export type IgnoreAnalysis = (
//     | std.QuoteStruct
//     | std.NewProvision
//     | std.SupplProvision
// );

export const isIgnoreAnalysis = (el: EL | string) => {
    if (typeof el === "string") return false;
    else if (std.isQuoteStruct(el)) return true;
    else if (std.isNewProvision(el)) return true;
    else if (std.isSupplProvision(el) && el.attr.AmendLawNum) return true;
    else return false;
};

