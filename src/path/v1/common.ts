import { LawIDStruct } from "../../law/lawID";
import { articlesContainerTags, toplevelContainerTags } from "../../node/container";
import * as std from "../../law/std";

// e.g. `405AC0000000088`, `405AC0000000088_20240401_504AC0100000052`
export interface PathFragmentLaw {
    type: "LAW",
    text: string,
    lawIDStruct: LawIDStruct,
    revision: {
        date: string,
        lawIDStruct: LawIDStruct,
    } | null,
}

// e.g. `sp`, `AppdxTable=1`, `AppdxTable[Num="1"]`
export interface PathFragmentTopLevel {
    type: "TOPLEVEL",
    text: string,
    tag: (typeof toplevelContainerTags)[number],
    num: string | null,
    attr: {
        key: string,
        value: string,
    }[],
}

export const topLevelAlias = {
    "sp": "SupplProvision" as const,
    ...(Object.fromEntries(toplevelContainerTags.map(s => [s, s])) as {[K in typeof toplevelContainerTags[number]]: K}),
};


// e.g. `Section=1`, `Section[Num="1"]`
export interface PathFragmentArticlesContainer {
    type: "ARTICLES",
    text: string,
    tag: (typeof articlesContainerTags)[number],
    num: string | null,
    attr: {
        key: string,
        value: string,
    }[],
}


// e.g. `a=1`, `Article=1`, `Article[Num="1"]`
export interface PathFragmentSentencesContainer {
    type: "SENTENCES",
    text: string,
    tag: "Article" | (typeof std.paragraphItemTags)[number],
    num: string | null,
    attr: {
        key: string,
        value: string,
    }[],
}

export const sentencesContainerAlias = {
    "a": "Article" as const,
    "p": "Paragraph" as const,
    "i": "Item" as const,
    "si1": "Subitem1" as const,
    "si2": "Subitem2" as const,
    "si3": "Subitem3" as const,
    "si4": "Subitem4" as const,
    "si5": "Subitem5" as const,
    "si6": "Subitem6" as const,
    "si7": "Subitem7" as const,
    "si8": "Subitem8" as const,
    "si9": "Subitem9" as const,
    "si10": "Subitem10" as const,
    "Article": "Article" as const,
    ...(Object.fromEntries(std.paragraphItemTags.map(s => [s, s])) as {[K in typeof std.paragraphItemTags[number]]: K}),
};


export type PathFragment = PathFragmentLaw | PathFragmentTopLevel | PathFragmentArticlesContainer | PathFragmentSentencesContainer;
