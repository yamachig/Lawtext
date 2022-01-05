import * as std from "../../law/std";

export interface Control {
    control: string,
    trailingSpace: string,
}

export type Controls = Control[];

export interface AttrEntry {
    text: string,
    entry: [name: string, value: string],
    trailingSpace: string,
}

export type AttrEntries = AttrEntry[];

export interface Sentences {
    leadingSpace: string,
    attrEntries: AttrEntries,
    sentences: std.Sentence[],
}

export type SentencesArray = Sentences[];
