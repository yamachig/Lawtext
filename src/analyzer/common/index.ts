import { ContainerType } from "../../node/container";
import * as std from "../../law/std";

export const rootContainerTags = ["Law"] as const;

export const toplevelContainerTags = ["EnactStatement", "MainProvision", ...std.appdxItemTags] as const;

export const articleContainerTags = std.articleGroupTags;

export const spanContainerTags = [
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
    ...spanContainerTags,
] as const;

export const getContainerType = (tag: string): ContainerType => {
    if ((rootContainerTags as readonly string[]).indexOf(tag) >= 0) return ContainerType.ROOT;
    else if ((toplevelContainerTags as readonly string[]).indexOf(tag) >= 0) return ContainerType.TOPLEVEL;
    else if ((articleContainerTags as readonly string[]).indexOf(tag) >= 0) return ContainerType.ARTICLES;
    else if ((spanContainerTags as readonly string[]).indexOf(tag) >= 0) return ContainerType.SPANS;
    else return ContainerType.SPANS;
};

export const ignoreAnalysisTag = [
    "LawNum",
    "LawTitle",
    "TOC",
    "ArticleTitle",
    ...std.paragraphItemTitleTags,
    "SupplProvision",
] as const;
