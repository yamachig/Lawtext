import { sentenceChildrenToString } from "../../parser/cst/rules/$sentenceChildren";
import { rangeOfELs } from "../el";
import { AttrEntries, SentencesArray, Controls, SentenceChildEL } from "./inline";

export enum LineType {
    BNK = "BNK",
    TOC = "TOC",
    ARG = "ARG",
    APP = "APP",
    SPR = "SPR",
    SPA = "SPA",
    ART = "ART",
    PIT = "PIT",
    TBL = "TBL",
    OTH = "OTH",
}

abstract class BaseLine<TType extends LineType = LineType> {
    public constructor(
        public type: TType,
        public range: [start: number, end: number] | null,
        public lineEndText: string,
    ) { }
    public abstract text(): string;
}

abstract class IndentsLine<TType extends LineType = LineType> extends BaseLine<TType> {
    public constructor(
        type: TType,
        range: [start: number, end: number] | null,
        public indentDepth: number,
        public indentTexts: string[],
        lineEndText: string,
    ) {
        super(type, range, lineEndText);
    }
    public abstract contentText(): string;
    public text(): string {
        return [...this.indentTexts, this.contentText(), this.lineEndText].join("");
    }
    public get indentRanges(): [number, number][] | null {
        if (!this.range) return null;
        const ret: [number, number][] = [];
        let lastEnd = this.range[0];
        for (let i = 0; i < this.indentDepth; i++) {
            ret.push([lastEnd, lastEnd + this.indentTexts[i].length]);
            lastEnd += this.indentTexts[i].length;
        }
        return ret;
    }
}

export class BlankLine extends BaseLine<LineType.BNK> {
    public constructor(
        range: [start: number, end: number] | null,
        lineEndText: string,
    ) {
        super(LineType.BNK, range, lineEndText);
    }
    public text(): string {
        return this.lineEndText;
    }
}

export class TOCHeadLine extends IndentsLine<LineType.TOC> {
    public constructor(
        range: [start: number, end: number] | null,
        indentDepth: number,
        indentTexts: string[],
        public _contentText: string,
        lineEndText: string,
    ) {
        super(LineType.TOC, range, indentDepth, indentTexts, lineEndText);
    }
    public contentText(): string {
        return this._contentText;
    }
    public get contentRange(): [number, number] | null {
        if (!this.range) return null;
        const lastEnd = this.range[0] + this.indentTexts.map(t => t.length).reduce((a, b) => a + b, 0);
        return [
            lastEnd,
            lastEnd + this._contentText.length,
        ];
    }
}

export class ArticleGroupHeadLine extends IndentsLine<LineType.ARG> {
    public constructor(
        range: [start: number, end: number] | null,
        indentDepth: number,
        indentTexts: string[],
        public mainTag: "Part" | "Chapter" | "Section" | "Subsection" | "Division",
        // public num: string,
        // public midSpace: string,
        public sentenceChildren: SentenceChildEL[],
        lineEndText: string,
    ) {
        super(LineType.ARG, range, indentDepth, indentTexts, lineEndText);
    }
    public contentText(): string {
        return [
            // this.num,
            // this.midSpace,
            ...sentenceChildrenToString(this.sentenceChildren),
        ].join("");
    }
    public get contentRange(): [number, number] | null {
        return rangeOfELs(this.sentenceChildren);
    }
}

export class AppdxItemHeadLine extends IndentsLine<LineType.APP> {
    public constructor(
        range: [start: number, end: number] | null,
        indentDepth: number,
        indentTexts: string[],
        public mainTag: "Appdx" | "AppdxTable" | "AppdxStyle" | "AppdxFormat" | "AppdxFig" | "AppdxNote",
        public controls: Controls,
        public sentenceChildren: SentenceChildEL[],
        lineEndText: string,
    ) {
        super(LineType.APP, range, indentDepth, indentTexts, lineEndText);
    }
    public contentText(): string {
        return [
            ...this.controls.map(c => c.control + c.trailingSpace),
            sentenceChildrenToString(this.sentenceChildren),
        ].join("");
    }
    public get controlsRange(): [number, number] | null {
        let start = null as number | null;
        let end = null as number | null;
        for (const control of this.controls) {
            if (control.controlRange && control.trailingSpaceRange) {
                start = Math.min(control.controlRange[0], start ?? control.controlRange[0]);
                end = Math.max(control.trailingSpaceRange[1], end ?? control.trailingSpaceRange[1]);
            }
        }
        return (start !== null && end !== null) ? [start, end] : null;
    }
    public get sentenceChildrenRange(): [number, number] | null {
        return rangeOfELs(this.sentenceChildren);
    }
}

export class SupplProvisionHeadLine extends IndentsLine<LineType.SPR> {
    public constructor(
        range: [start: number, end: number] | null,
        indentDepth: number,
        indentTexts: string[],
        public head: string,
        public openParen: string,
        public amendLawNum: string,
        public closeParen: string,
        public extractText: string,
        lineEndText: string,
    ) {
        super(LineType.SPR, range, indentDepth, indentTexts, lineEndText);
    }
    public contentText(): string {
        return [
            this.head,
            this.openParen,
            this.amendLawNum,
            this.closeParen,
            this.extractText,
        ].join("");
    }
    public get openParenRange(): [number, number] | null {
        return this.range ? [this.range[0], this.range[0] + this.openParen.length] : null;
    }
    public get amendLawNumRange(): [number, number] | null {
        if (!this.range) return null;
        const start = this.range[0] + this.openParen.length;
        return [start, start + this.amendLawNum.length];
    }
    public get closeParenRange(): [number, number] | null {
        if (!this.range) return null;
        const start = this.range[0] + this.openParen.length + this.amendLawNum.length;
        return [start, start + this.closeParen.length];
    }
    public get extractTextRange(): [number, number] | null {
        if (!this.range) return null;
        const start = this.range[0] + this.openParen.length + this.amendLawNum.length + this.closeParen.length;
        return [start, start + this.extractText.length];
    }
}

export class SupplProvisionAppdxItemHeadLine extends IndentsLine<LineType.SPA> {
    public constructor(
        range: [start: number, end: number] | null,
        indentDepth: number,
        indentTexts: string[],
        public mainTag: "SupplProvisionAppdx" | "SupplProvisionAppdxTable" | "SupplProvisionAppdxStyle",
        public controls: Controls,
        public sentenceChildren: SentenceChildEL[],
        lineEndText: string,
    ) {
        super(LineType.SPA, range, indentDepth, indentTexts, lineEndText);
    }
    public contentText(): string {
        return [
            ...this.controls.map(c => c.control + c.trailingSpace),
            ...sentenceChildrenToString(this.sentenceChildren),
        ].join("");
    }
    public get controlsRange(): [number, number] | null {
        let start = null as number | null;
        let end = null as number | null;
        for (const control of this.controls) {
            if (control.controlRange && control.trailingSpaceRange) {
                start = Math.min(control.controlRange[0], start ?? control.controlRange[0]);
                end = Math.max(control.trailingSpaceRange[1], end ?? control.trailingSpaceRange[1]);
            }
        }
        return (start !== null && end !== null) ? [start, end] : null;
    }
    public get sentenceChildrenRange(): [number, number] | null {
        return rangeOfELs(this.sentenceChildren);
    }
}

export class ArticleLine extends IndentsLine<LineType.ART> {
    public constructor(
        range: [start: number, end: number] | null,
        indentDepth: number,
        indentTexts: string[],
        public title: string,
        public midSpace: string,
        public sentencesArray: SentencesArray,
        lineEndText: string,
    ) {
        super(LineType.ART, range, indentDepth, indentTexts, lineEndText);
    }
    public contentText(): string {
        return [
            this.title,
            this.midSpace,
            ...this.sentencesArray.map(c => [
                c.leadingSpace,
                ...c.attrEntries.map(a => a.text + a.trailingSpace),
                ...c.sentences.map(s => sentenceChildrenToString(s.children)),
            ]).flat(),
        ].join("");
    }
    public get titleRange(): [number, number] | null {
        return this.range ? [this.range[0], this.range[0] + this.title.length] : null;
    }
    public get midSpaceRange(): [number, number] | null {
        if (!this.range) return null;
        const start = this.range[0] + this.title.length;
        return [start, start + this.midSpace.length];
    }
    public get sentencesArrayRange(): [number, number] | null {
        let start = null as number | null;
        let end = null as number | null;
        for (const sentences of this.sentencesArray) {
            for (const sentence of sentences.sentences) {
                if (sentence.range) {
                    start = Math.min(sentence.range[0], start ?? sentence.range[0]);
                    end = Math.max(sentence.range[1], end ?? sentence.range[1]);
                }
            }
        }
        return (start !== null && end !== null) ? [start, end] : null;
    }
}

export class ParagraphItemLine extends IndentsLine<LineType.PIT> {
    public constructor(
        range: [start: number, end: number] | null,
        indentDepth: number,
        indentTexts: string[],
        public title: string,
        public midSpace: string,
        public sentencesArray: SentencesArray,
        lineEndText: string,
    ) {
        super(LineType.PIT, range, indentDepth, indentTexts, lineEndText);
    }
    public contentText(): string {
        return [
            this.title,
            this.midSpace,
            ...this.sentencesArray.map(c => [
                c.leadingSpace,
                ...c.attrEntries.map(a => a.text + a.trailingSpace),
                ...c.sentences.map(s => sentenceChildrenToString(s.children)),
            ]).flat(),
        ].join("");
    }
    public get titleRange(): [number, number] | null {
        return this.range ? [this.range[0], this.range[0] + this.title.length] : null;
    }
    public get midSpaceRange(): [number, number] | null {
        if (!this.range) return null;
        const start = this.range[0] + this.title.length;
        return [start, start + this.midSpace.length];
    }
    public get sentencesArrayRange(): [number, number] | null {
        let start = null as number | null;
        let end = null as number | null;
        for (const sentences of this.sentencesArray) {
            for (const sentence of sentences.sentences) {
                if (sentence.range) {
                    start = Math.min(sentence.range[0], start ?? sentence.range[0]);
                    end = Math.max(sentence.range[1], end ?? sentence.range[1]);
                }
            }
        }
        return (start !== null && end !== null) ? [start, end] : null;
    }
}

export class TableColumnLine extends IndentsLine<LineType.TBL> {
    public constructor(
        range: [start: number, end: number] | null,
        indentDepth: number,
        indentTexts: string[],
        public firstColumnIndicator: "*" | "",
        public midIndicatorsSpace: string,
        public columnIndicator: "-" | "*",
        public midSpace: string,
        public attrEntries: AttrEntries,
        public sentencesArray: SentencesArray,
        lineEndText: string,
    ) {
        super(LineType.TBL, range, indentDepth, indentTexts, lineEndText);
    }
    public contentText(): string {
        return [
            this.firstColumnIndicator,
            this.midIndicatorsSpace,
            this.columnIndicator,
            this.midSpace,
            ...this.attrEntries.map(e => e.text + e.trailingSpace),
            ...this.sentencesArray.map(c => [
                c.leadingSpace,
                ...c.attrEntries.map(a => a.text + a.trailingSpace),
                ...c.sentences.map(s => sentenceChildrenToString(s.children)),
            ]).flat(),
        ].join("");
    }
    public get firstColumnIndicatorRange(): [number, number] | null {
        if (!this.range) return null;
        const start = this.range[0] + this.indentTexts.map(s => s.length).reduce((a, b) => a + b, 0);
        return this.range ? [start, start + this.firstColumnIndicator.length] : null;
    }
    public get midIndicatorsSpaceRange(): [number, number] | null {
        if (!this.range) return null;
        const start = this.range[0] + this.indentTexts.map(s => s.length).reduce((a, b) => a + b, 0) + this.firstColumnIndicator.length;
        return [start, start + this.midIndicatorsSpace.length];
    }
    public get columnIndicatorRange(): [number, number] | null {
        if (!this.range) return null;
        const start = this.range[0] + this.indentTexts.map(s => s.length).reduce((a, b) => a + b, 0) + this.firstColumnIndicator.length + this.midIndicatorsSpace.length;
        return [start, start + this.columnIndicator.length];
    }
    public get midSpaceRange(): [number, number] | null {
        if (!this.range) return null;
        const start = this.range[0] + this.indentTexts.map(s => s.length).reduce((a, b) => a + b, 0) + this.firstColumnIndicator.length + this.midIndicatorsSpace.length + this.columnIndicator.length;
        return [start, start + this.midSpace.length];
    }
    public get attrEntriesRange(): [number, number] | null {
        let start = null as number | null;
        let end = null as number | null;
        for (const attrEntry of this.attrEntries) {
            if (attrEntry.entryRange && attrEntry.trailingSpaceRange) {
                start = Math.min(attrEntry.entryRange[0], start ?? attrEntry.entryRange[0]);
                end = Math.max(attrEntry.trailingSpaceRange[1], end ?? attrEntry.trailingSpaceRange[1]);
            }
        }
        return (start !== null && end !== null) ? [start, end] : null;
    }
}

export class OtherLine extends IndentsLine<LineType.OTH> {
    public constructor(
        range: [start: number, end: number] | null,
        indentDepth: number,
        indentTexts: string[],
        public controls: Controls,
        public sentencesArray: SentencesArray,
        lineEndText: string,
    ) {
        super(LineType.OTH, range, indentDepth, indentTexts, lineEndText);
    }
    public contentText(): string {
        return [
            ...this.controls.map(c => c.control + c.trailingSpace),
            ...this.sentencesArray.map(c => [
                c.leadingSpace,
                ...c.attrEntries.map(a => a.text + a.trailingSpace),
                ...c.sentences.map(s => sentenceChildrenToString(s.children)),
            ]).flat(),
        ].join("");
    }
    public get controlsRange(): [number, number] | null {
        let start = null as number | null;
        let end = null as number | null;
        for (const control of this.controls) {
            if (control.controlRange && control.trailingSpaceRange) {
                start = Math.min(control.controlRange[0], start ?? control.controlRange[0]);
                end = Math.max(control.trailingSpaceRange[1], end ?? control.trailingSpaceRange[1]);
            }
        }
        return (start !== null && end !== null) ? [start, end] : null;
    }
    public get sentencesArrayRange(): [number, number] | null {
        let start = null as number | null;
        let end = null as number | null;
        for (const sentences of this.sentencesArray) {
            for (const sentence of sentences.sentences) {
                if (sentence.range) {
                    start = Math.min(sentence.range[0], start ?? sentence.range[0]);
                    end = Math.max(sentence.range[1], end ?? sentence.range[1]);
                }
            }
        }
        return (start !== null && end !== null) ? [start, end] : null;
    }
}

export type Line =
    | BlankLine
    | TOCHeadLine
    | ArticleGroupHeadLine
    | AppdxItemHeadLine
    | SupplProvisionHeadLine
    | SupplProvisionAppdxItemHeadLine
    | ArticleLine
    | ParagraphItemLine
    | TableColumnLine
    | OtherLine
    ;

