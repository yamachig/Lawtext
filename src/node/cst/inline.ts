import * as std from "../../law/std";
import { Diff } from "../../util";

export class Control {
    public constructor(
        public control: string,
        public controlRange: [start: number, end: number] | null,
        public trailingSpace: string,
        public trailingSpaceRange: [start: number, end: number] | null,
    ) {}
}

export type Controls = Control[];

export class AttrEntry {
    public constructor(
        public text: string,
        public entry: [name: string, value: string],
        public entryRange: [start: number, end: number] | null,
        public trailingSpace: string,
        public trailingSpaceRange: [start: number, end: number] | null,
    ) {}
}

export type AttrEntries = AttrEntry[];

export class Sentences {
    public constructor(
        public leadingSpace: string,
        public leadingSpaceRange: [start: number, end: number] | null,
        public attrEntries: AttrEntries,
        public sentences: std.Sentence[],
    ) {}
}

export type SentencesArray = Sentences[];

export type SentenceChildEL = Diff<std.Sentence["children"][number], string>;
