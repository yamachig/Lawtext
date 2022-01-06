import { sentenceChildrenToString } from "../../parser/cst/rules/$sentenceChildren";
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
            ...this.sentenceChildren.map(el => el.text),
        ].join("");
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
            ...this.sentenceChildren.map(el => el.text),
        ].join("");
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
                ...c.sentences.map(s => s.text),
            ]).flat(),
        ].join("");
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
                ...c.sentences.map(s => s.text),
            ]).flat(),
        ].join("");
    }
}

export class TableColumnLine extends IndentsLine<LineType.TBL> {
    public constructor(
        range: [start: number, end: number] | null,
        indentDepth: number,
        indentTexts: string[],
        public firstColumnIndicator: "*" | "",
        public midIndicatorsSpace: string,
        public columnIndicator: "-",
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
                ...c.sentences.map(s => s.text),
            ]).flat(),
        ].join("");
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
                ...c.sentences.map(s => s.text),
            ]).flat(),
        ].join("");
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

