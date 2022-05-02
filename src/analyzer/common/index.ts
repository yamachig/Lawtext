import { ContainerType } from "../../node/container";
import * as std from "../../law/std";
import { EL } from "../../node/el";

export const rootContainerTags = ["Law"] as const;

export const toplevelContainerTags = ["EnactStatement", "MainProvision", "SupplProvision", ...std.appdxItemTags] as const;

export const articleContainerTags = std.articleGroupTags;

export const sentencesContainerTags = [
    "Article",
    ...std.paragraphItemTags,
    "Table",
    "TableRow",
    "TableColumn",
    "Sentence",
] as const;

export const containerTags = [
    ...rootContainerTags,
    ...toplevelContainerTags,
    ...articleContainerTags,
    ...sentencesContainerTags,
] as const;

export const getContainerType = (tag: string): ContainerType => {
    if ((rootContainerTags as readonly string[]).indexOf(tag) >= 0) return ContainerType.ROOT;
    else if ((toplevelContainerTags as readonly string[]).indexOf(tag) >= 0) return ContainerType.TOPLEVEL;
    else if ((articleContainerTags as readonly string[]).indexOf(tag) >= 0) return ContainerType.ARTICLES;
    else if ((sentencesContainerTags as readonly string[]).indexOf(tag) >= 0) return ContainerType.SENTENCES;
    else return ContainerType.SENTENCES;
};

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

