import { ContainerType } from "../../node/container";
import * as std from "../../law/std";

export const rootContainerTags = ["Law"] as const;

export const toplevelContainerTags = ["EnactStatement", "MainProvision", ...std.appdxItemTags] as const;

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

export const ignoreAnalysisTag = [
    "QuoteStruct",
    "NewProvision",
    "SupplProvision",
    // "LawNum",
    // "LawTitle",
    // "TOC",
    // "ArticleTitle",
    // ...std.paragraphItemTitleTags,
    // "SupplProvision",
] as const;
