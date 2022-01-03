import { EL } from "../el";
import { AttrEntries, Columns, Controls } from "./inline";

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
        public lineEndText: string,
    ) { }
    public abstract text(): string;
}

abstract class IndentsLine<TType extends LineType = LineType> extends BaseLine<TType> {
    public constructor(
        type: TType,
        public indentDepth: number,
        public indentTexts: string[],
        lineEndText: string,
    ) {
        super(type, lineEndText);
    }
    public abstract contentText(): string;
    public text(): string {
        return [...this.indentTexts, this.contentText(), this.lineEndText].join("");
    }
}

export class BlankLine extends BaseLine<LineType.BNK> {
    public constructor(
        lineEndText: string,
    ) {
        super(LineType.BNK, lineEndText);
    }
    public text(): string {
        return this.lineEndText;
    }
}

export class TOCHeadLine extends IndentsLine<LineType.TOC> {
    public constructor(
        indentDepth: number,
        indentTexts: string[],
        public _contentText: string,
        lineEndText: string,
    ) {
        super(LineType.TOC, indentDepth, indentTexts, lineEndText);
    }
    public contentText(): string {
        return this._contentText;
    }
}

export class ArticleGroupHeadLine extends IndentsLine<LineType.ARG> {
    public constructor(
        indentDepth: number,
        indentTexts: string[],
        public mainTag: "Part" | "Chapter" | "Section" | "Subsection" | "Division",
        public num: string,
        public midSpace: string,
        public inline: EL[],
        lineEndText: string,
    ) {
        super(LineType.ARG, indentDepth, indentTexts, lineEndText);
    }
    public contentText(): string {
        return [
            this.num,
            this.midSpace,
            ...this.inline.map(el => el.text),
        ].join("");
    }
}

export class AppdxItemHeadLine extends IndentsLine<LineType.APP> {
    public constructor(
        indentDepth: number,
        indentTexts: string[],
        public mainTag: "Appdx" | "AppdxTable" | "AppdxStyle" | "AppdxFormat" | "AppdxFig" | "AppdxNote",
        public controls: Controls,
        public inline: EL[],
        lineEndText: string,
    ) {
        super(LineType.APP, indentDepth, indentTexts, lineEndText);
    }
    public contentText(): string {
        return [
            ...this.controls.map(c => c.control + c.trailingSpace),
            ...this.inline.map(el => el.text),
        ].join("");
    }
}

export class SupplProvisionHeadLine extends IndentsLine<LineType.SPR> {
    public constructor(
        indentDepth: number,
        indentTexts: string[],
        public head: string,
        public openParen: string,
        public amendLawNum: string,
        public closeParen: string,
        public extractText: string,
        lineEndText: string,
    ) {
        super(LineType.SPR, indentDepth, indentTexts, lineEndText);
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
        indentDepth: number,
        indentTexts: string[],
        public mainTag: "SupplProvisionAppdx" | "SupplProvisionAppdxTable" | "SupplProvisionAppdxStyle",
        public controls: Controls,
        public inline: EL[],
        lineEndText: string,
    ) {
        super(LineType.SPA, indentDepth, indentTexts, lineEndText);
    }
    public contentText(): string {
        return [
            ...this.controls.map(c => c.control + c.trailingSpace),
            ...this.inline.map(el => el.text),
        ].join("");
    }
}

export class ArticleLine extends IndentsLine<LineType.ART> {
    public constructor(
        indentDepth: number,
        indentTexts: string[],
        public title: string,
        public midSpace: string,
        public columns: Columns,
        lineEndText: string,
    ) {
        super(LineType.ART, indentDepth, indentTexts, lineEndText);
    }
    public contentText(): string {
        return [
            this.title,
            this.midSpace,
            ...this.columns.map(c => [
                c.leadingSpace,
                ...c.attrEntries.map(a => a.text + a.trailingSpace),
                ...c.sentences.map(s => s.text),
            ]).flat(),
        ].join("");
    }
}

export class ParagraphItemLine extends IndentsLine<LineType.PIT> {
    public constructor(
        indentDepth: number,
        indentTexts: string[],
        public title: string,
        public midSpace: string,
        public columns: Columns,
        lineEndText: string,
    ) {
        super(LineType.PIT, indentDepth, indentTexts, lineEndText);
    }
    public contentText(): string {
        return [
            this.title,
            this.midSpace,
            ...this.columns.map(c => [
                c.leadingSpace,
                ...c.attrEntries.map(a => a.text + a.trailingSpace),
                ...c.sentences.map(s => s.text),
            ]).flat(),
        ].join("");
    }
}

export class TableColumnLine extends IndentsLine<LineType.TBL> {
    public constructor(
        indentDepth: number,
        indentTexts: string[],
        public firstColumnIndicator: "*" | "",
        public midIndicatorsSpace: string,
        public columnIndicator: "-",
        public midSpace: string,
        public attrEntries: AttrEntries,
        public columns: Columns,
        lineEndText: string,
    ) {
        super(LineType.TBL, indentDepth, indentTexts, lineEndText);
    }
    public contentText(): string {
        return [
            this.firstColumnIndicator,
            this.midIndicatorsSpace,
            this.columnIndicator,
            this.midSpace,
            ...this.attrEntries.map(e => e.text + e.trailingSpace),
            ...this.columns.map(c => [
                c.leadingSpace,
                ...c.attrEntries.map(a => a.text + a.trailingSpace),
                ...c.sentences.map(s => s.text),
            ]).flat(),
        ].join("");
    }
}

export class OtherLine extends IndentsLine<LineType.OTH> {
    public constructor(
        indentDepth: number,
        indentTexts: string[],
        public controls: Controls,
        public columns: Columns,
        lineEndText: string,
    ) {
        super(LineType.OTH, indentDepth, indentTexts, lineEndText);
    }
    public contentText(): string {
        return [
            ...this.controls.map(c => c.control + c.trailingSpace),
            ...this.columns.map(c => [
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

