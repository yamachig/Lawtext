import { appdxItemTags, articleGroupTags, paragraphItemTags, supplProvisionAppdxItemTags } from "../../law/std";
import { sentenceChildrenToString } from "../../parser/cst/rules/$sentenceChildren";
import { sentencesArrayToString } from "../../parser/cst/rules/$sentencesArray";
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

interface BaseLineOptions<TType extends LineType> {
    type: TType,
    range: [start: number, end: number] | null,
    lineEndText: string,
}

abstract class BaseLine<TType extends LineType = LineType> {
    public type: TType;
    public range: [start: number, end: number] | null;
    public lineEndText: string;
    public constructor(
        options: BaseLineOptions<TType>,
    ) {
        this.type = options.type;
        this.range = options.range;
        this.lineEndText = options.lineEndText;
    }
    public text(): string {
        return this.rangeTexts().map(([, t]) => t).join("");
    }
    public abstract rangeTexts(): [range: [start: number, end: number] | null, text:string, description: string][];
    public lineEndTextRange(): [start: number, end: number] | null {
        if (!this.range) return null;
        return [this.range[1] - this.lineEndText.length, this.range[1]];
    }
}

type IndentsLineOptions<TType extends LineType> = BaseLineOptions<TType> & {
    indentTexts: string[],
}

abstract class IndentsLine<TType extends LineType = LineType> extends BaseLine<TType> {
    public indentTexts: string[];
    public constructor(
        options: IndentsLineOptions<TType>,
    ) {
        super(options);
        this.indentTexts = options.indentTexts;
    }
    public indentRangeTexts() {
        const ret: ReturnType<BaseLine["rangeTexts"]> = [];
        let lastEnd = this.range ? this.range[0] : NaN;
        for (let i = 0; i < this.indentTexts.length; i++) {
            ret.push([
                (!isNaN(lastEnd)) ? [lastEnd, lastEnd + this.indentTexts[i].length] : null,
                this.indentTexts[i],
                "Indent",
            ]);
            lastEnd += this.indentTexts[i].length;
        }
        return ret;
    }
    public get indentsEndPos() {
        const indentRangeTexts = this.indentRangeTexts();
        const pos = (
            indentRangeTexts.length > 0
                ? indentRangeTexts[indentRangeTexts.length - 1][0]?.[1]
                : null
        ) ?? (this.range && this.range[0]) ?? null;
        return pos;
    }
}

type WithControlsLineOptions<TType extends LineType> = IndentsLineOptions<TType> & {
    controls: Controls,
}

abstract class WithControlsLine<TType extends LineType = LineType> extends IndentsLine<TType> {
    public controls: Controls;
    public constructor(
        options: WithControlsLineOptions<TType>,
    ) {
        super(options);
        this.controls = options.controls;
    }
    public controlsRangeTexts() {
        const ret: ReturnType<BaseLine["rangeTexts"]> = [];
        for (const control of this.controls) {
            ret.push([control.controlRange, control.control, "Control"]);
            ret.push([control.trailingSpaceRange, control.trailingSpace, "ControlTrailingSpace"]);
        }
        return ret;
    }
    public get controlsEndPos() {
        const pos = (
            this.controls.length > 0
                ? this.controls[this.controls.length - 1].trailingSpaceRange?.[1]
                : null
        ) ?? this.indentsEndPos;
        return pos;
    }
}

type BlankLineOptions = Omit<BaseLineOptions<never>, "type">;

export class BlankLine extends BaseLine<LineType.BNK> {
    public constructor(
        options: BlankLineOptions,
    ) {
        super({ ...options, type: LineType.BNK });
    }
    public rangeTexts() {
        return [[this.lineEndTextRange(), this.lineEndText, "LineEnd"]] as ReturnType<BaseLine["rangeTexts"]>;
    }
}

type TOCHeadLineOptions = Omit<IndentsLineOptions<never>, "type"> & {
    title: string;
};

export class TOCHeadLine extends IndentsLine<LineType.TOC> {
    public title: string;
    public constructor(
        options: TOCHeadLineOptions,
    ) {
        super({ ...options, type: LineType.TOC });
        this.title = options.title;
    }
    public get titleRange(): [number, number] | null {
        if (!this.range) return null;
        const lastEnd = this.range[0] + this.indentTexts.map(t => t.length).reduce((a, b) => a + b, 0);
        return [
            lastEnd,
            lastEnd + this.title.length,
        ];
    }
    public rangeTexts() {
        const ret: ReturnType<BaseLine["rangeTexts"]> = [];
        ret.push(...this.indentRangeTexts());
        ret.push([this.titleRange, this.title, "Title"]);
        ret.push([this.lineEndTextRange(), this.lineEndText, "LineEnd"]);
        return ret;
    }
}

type ArticleGroupHeadLineOptions = Omit<WithControlsLineOptions<never>, "type"> & {
    mainTag: (typeof articleGroupTags)[number],
    sentenceChildren: SentenceChildEL[],
};

export class ArticleGroupHeadLine extends WithControlsLine<LineType.ARG> {
    public mainTag: (typeof articleGroupTags)[number];
    public title: SentenceChildEL[];
    public constructor(
        options: ArticleGroupHeadLineOptions,
    ) {
        super({ ...options, type: LineType.ARG });
        this.mainTag = options.mainTag;
        this.title = options.sentenceChildren;
    }
    public get titleRange(): [number, number] | null {
        if (this.title.length > 0) {
            return rangeOfELs(this.title);
        } else {
            const pos = this.controlsEndPos;
            return (pos !== null) ? [pos, pos] : null;
        }
    }
    public rangeTexts() {
        const ret: ReturnType<BaseLine["rangeTexts"]> = [];
        ret.push(...this.indentRangeTexts());
        ret.push(...this.controlsRangeTexts());
        ret.push([this.titleRange, sentenceChildrenToString(this.title), "Title"]);
        ret.push([this.lineEndTextRange(), this.lineEndText, "LineEnd"]);
        return ret;
    }
}

type AppdxItemHeadLineOptions = Omit<WithControlsLineOptions<never>, "type"> & {
    mainTag: (typeof appdxItemTags)[number],
    title: SentenceChildEL[],
    relatedArticleNum: SentenceChildEL[],
};

export class AppdxItemHeadLine extends WithControlsLine<LineType.APP> {
    public mainTag: (typeof appdxItemTags)[number];
    public title: SentenceChildEL[];
    public relatedArticleNum: SentenceChildEL[];
    public constructor(
        options: AppdxItemHeadLineOptions,
    ) {
        super({ ...options, type: LineType.APP });
        this.mainTag = options.mainTag;
        this.title = options.title;
        this.relatedArticleNum = options.relatedArticleNum;
    }
    public get titleRange(): [number, number] | null {
        if (this.title.length > 0) {
            return rangeOfELs(this.title);
        } else {
            const pos = this.controlsEndPos;
            return (pos !== null) ? [pos, pos] : null;
        }
    }
    public get relatedArticleNumRange(): [number, number] | null {
        if (this.relatedArticleNum.length > 0) {
            return rangeOfELs(this.relatedArticleNum);
        } else {
            const base = this.titleRange;
            if (!base) return null;
            return [base[1], base[1]];
        }
    }
    public rangeTexts() {
        const ret: ReturnType<BaseLine["rangeTexts"]> = [];
        ret.push(...this.indentRangeTexts());
        ret.push(...this.controlsRangeTexts());
        ret.push([this.titleRange, sentenceChildrenToString(this.title), "Title"]);
        ret.push([this.relatedArticleNumRange, sentenceChildrenToString(this.relatedArticleNum), "RelatedArticleNum"]);
        ret.push([this.lineEndTextRange(), this.lineEndText, "LineEnd"]);
        return ret;
    }
}

type SupplProvisionHeadLineOptions = Omit<WithControlsLineOptions<never>, "type"> & {
    title: string;
    titleRange: [number, number] | null;
    openParen: string;
    amendLawNum: string;
    closeParen: string;
    extractText: string;
};

export class SupplProvisionHeadLine extends WithControlsLine<LineType.SPR> {
    public title: string;
    public titleRange: [number, number] | null;
    public openParen: string;
    public amendLawNum: string;
    public closeParen: string;
    public extractText: string;
    public constructor(
        options: SupplProvisionHeadLineOptions,
    ) {
        super({ ...options, type: LineType.SPR });
        this.title = options.title;
        this.titleRange = options.titleRange;
        this.openParen = options.openParen;
        this.amendLawNum = options.amendLawNum;
        this.closeParen = options.closeParen;
        this.extractText = options.extractText;
    }
    public get openParenRange(): [number, number] | null {
        const base = this.titleRange;
        if (!base) return null;
        return [base[1], base[1] + this.openParen.length];
    }
    public get amendLawNumRange(): [number, number] | null {
        const base = this.openParenRange;
        if (!base) return null;
        return [base[1], base[1] + this.amendLawNum.length];
    }
    public get closeParenRange(): [number, number] | null {
        const base = this.amendLawNumRange;
        if (!base) return null;
        return [base[1], base[1] + this.closeParen.length];
    }
    public get extractTextRange(): [number, number] | null {
        const base = this.closeParenRange;
        if (!base) return null;
        return [base[1], base[1] + this.extractText.length];
    }
    public rangeTexts() {
        const ret: ReturnType<BaseLine["rangeTexts"]> = [];
        ret.push(...this.indentRangeTexts());
        ret.push(...this.controlsRangeTexts());
        ret.push([this.titleRange, this.title, "Title"]);
        ret.push([this.openParenRange, this.openParen, "OpenParen"]);
        ret.push([this.amendLawNumRange, this.amendLawNum, "AmendLawNum"]);
        ret.push([this.closeParenRange, this.closeParen, "CloseParen"]);
        ret.push([this.extractTextRange, this.extractText, "ExtractText"]);
        ret.push([this.lineEndTextRange(), this.lineEndText, "LineEnd"]);
        return ret;
    }
}

type SupplProvisionAppdxItemHeadLineOptions = Omit<WithControlsLineOptions<never>, "type"> & {
    mainTag: (typeof supplProvisionAppdxItemTags)[number],
    title: SentenceChildEL[],
    relatedArticleNum: SentenceChildEL[],
};

export class SupplProvisionAppdxItemHeadLine extends WithControlsLine<LineType.SPA> {
    public mainTag: (typeof supplProvisionAppdxItemTags)[number];
    public title: SentenceChildEL[];
    public relatedArticleNum: SentenceChildEL[];
    public constructor(
        options: SupplProvisionAppdxItemHeadLineOptions,
    ) {
        super({ ...options, type: LineType.SPA });
        this.mainTag = options.mainTag;
        this.title = options.title;
        this.relatedArticleNum = options.relatedArticleNum;
    }
    public get titleRange(): [number, number] | null {
        if (this.title.length > 0) {
            return rangeOfELs(this.title);
        } else {
            const pos = this.controlsEndPos;
            return (pos !== null) ? [pos, pos] : null;
        }
    }
    public get relatedArticleNumRange(): [number, number] | null {
        if (this.relatedArticleNum.length > 0) {
            return rangeOfELs(this.relatedArticleNum);
        } else {
            const base = this.titleRange;
            if (!base) return null;
            return [base[1], base[1]];
        }
    }
    public rangeTexts() {
        const ret: ReturnType<BaseLine["rangeTexts"]> = [];
        ret.push(...this.indentRangeTexts());
        ret.push(...this.controlsRangeTexts());
        ret.push([this.titleRange, sentenceChildrenToString(this.title), "Title"]);
        ret.push([this.relatedArticleNumRange, sentenceChildrenToString(this.relatedArticleNum), "RelatedArticleNum"]);
        ret.push([this.lineEndTextRange(), this.lineEndText, "LineEnd"]);
        return ret;
    }
}

type ArticleLineOptions = Omit<IndentsLineOptions<never>, "type"> & {
    title: string,
    midSpace: string,
    sentencesArray: SentencesArray,
};

export class ArticleLine extends IndentsLine<LineType.ART> {
    public title: string;
    public midSpace: string;
    public sentencesArray: SentencesArray;
    public constructor(
        options: ArticleLineOptions,
    ) {
        super({ ...options, type: LineType.ART });
        this.title = options.title;
        this.midSpace = options.midSpace;
        this.sentencesArray = options.sentencesArray;
    }
    public get titleRange(): [number, number] | null {
        const pos = this.indentsEndPos;
        return (pos !== null) ? [pos, pos + this.title.length] : null;
    }
    public get midSpaceRange(): [number, number] | null {
        const base = this.titleRange;
        if (!base) return null;
        return [base[1], base[1] + this.midSpace.length];
    }
    public get sentencesArrayRange(): [number, number] | null {
        if (this.sentencesArray.length > 0) {
            const sentences = this.sentencesArray.flat().map(ss => ss.sentences).flat();
            return rangeOfELs(sentences);
        } else {
            const base = this.midSpaceRange;
            if (!base) return null;
            return [base[1], base[1]];
        }
    }
    public rangeTexts() {
        const ret: ReturnType<BaseLine["rangeTexts"]> = [];
        ret.push(...this.indentRangeTexts());
        ret.push([this.titleRange, this.title, "Title"]);
        ret.push([this.midSpaceRange, this.midSpace, "MidSpace"]);
        ret.push([this.sentencesArrayRange, sentencesArrayToString(this.sentencesArray), "SentencesArray"]);
        ret.push([this.lineEndTextRange(), this.lineEndText, "LineEnd"]);
        return ret;
    }
}

type ParagraphItemLineOptions<TTag extends (typeof paragraphItemTags)[number] | null> = Omit<WithControlsLineOptions<never>, "type"> & {
    mainTag: TTag,
    controls: Controls,
    title: string,
    midSpace: string,
    sentencesArray: SentencesArray,
};

export class ParagraphItemLine<TTag extends (typeof paragraphItemTags)[number] | null = (typeof paragraphItemTags)[number] | null> extends WithControlsLine<LineType.PIT> {
    public mainTag: TTag;
    public controls: Controls;
    public title: string;
    public midSpace: string;
    public sentencesArray: SentencesArray;
    public constructor(
        options: ParagraphItemLineOptions<TTag>,
    ) {
        super({ ...options, type: LineType.PIT });
        this.mainTag = options.mainTag;
        this.controls = options.controls;
        this.title = options.title;
        this.midSpace = options.midSpace;
        this.sentencesArray = options.sentencesArray;
    }
    public get titleRange(): [number, number] | null {
        const pos = this.controlsEndPos;
        return (pos !== null) ? [pos, pos + this.title.length] : null;
    }
    public get midSpaceRange(): [number, number] | null {
        const base = this.titleRange;
        if (!base) return null;
        return [base[1], base[1] + this.midSpace.length];
    }
    public get sentencesArrayRange(): [number, number] | null {
        if (this.sentencesArray.length > 0) {
            const sentences = this.sentencesArray.flat().map(ss => ss.sentences).flat();
            return rangeOfELs(sentences);
        } else {
            const base = this.midSpaceRange;
            if (!base) return null;
            return [base[1], base[1]];
        }
    }
    public rangeTexts() {
        const ret: ReturnType<BaseLine["rangeTexts"]> = [];
        ret.push(...this.indentRangeTexts());
        ret.push(...this.controlsRangeTexts());
        ret.push([this.titleRange, this.title, "Title"]);
        ret.push([this.midSpaceRange, this.midSpace, "MidSpace"]);
        ret.push([this.sentencesArrayRange, sentencesArrayToString(this.sentencesArray), "SentencesArray"]);
        ret.push([this.lineEndTextRange(), this.lineEndText, "LineEnd"]);
        return ret;
    }
    public withTag<TNewTag extends(typeof paragraphItemTags)[number] | null>(tag: TNewTag): ParagraphItemLine<TNewTag> {
        return new ParagraphItemLine(
            { ...this, mainTag: tag },
        );
    }
}

type TableColumnLineOptions = Omit<IndentsLineOptions<never>, "type"> & {
    firstColumnIndicator: "*" | "",
    midIndicatorsSpace: string,
    columnIndicator: "-" | "*",
    midSpace: string,
    attrEntries: AttrEntries,
    multilineIndicator: "|" | "",
    sentencesArray: SentencesArray,
};

export class TableColumnLine extends IndentsLine<LineType.TBL> {
    public firstColumnIndicator: "*" | "";
    public midIndicatorsSpace: string;
    public columnIndicator: "-" | "*";
    public midSpace: string;
    public attrEntries: AttrEntries;
    public multilineIndicator: "|" | "";
    public sentencesArray: SentencesArray;
    public constructor(
        options: TableColumnLineOptions,
    ) {
        super({ ...options, type: LineType.TBL });
        this.firstColumnIndicator = options.firstColumnIndicator;
        this.midIndicatorsSpace = options.midIndicatorsSpace;
        this.columnIndicator = options.columnIndicator;
        this.midSpace = options.midSpace;
        this.attrEntries = options.attrEntries;
        this.multilineIndicator = options.multilineIndicator;
        this.sentencesArray = options.sentencesArray;
    }
    public get firstColumnIndicatorRange(): [number, number] | null {
        const pos = this.indentsEndPos;
        return (pos !== null) ? [pos, pos + this.firstColumnIndicator.length] : null;
    }
    public get midIndicatorsSpaceRange(): [number, number] | null {
        const base = this.firstColumnIndicatorRange;
        if (!base) return null;
        return [base[1], base[1] + this.midIndicatorsSpace.length];
    }
    public get columnIndicatorRange(): [number, number] | null {
        const base = this.midIndicatorsSpaceRange;
        if (!base) return null;
        return [base[1], base[1] + this.columnIndicator.length];
    }
    public get midSpaceRange(): [number, number] | null {
        const base = this.columnIndicatorRange;
        if (!base) return null;
        return [base[1], base[1] + this.midSpace.length];
    }
    public attrEntriesRangeTexts() {
        const ret: ReturnType<BaseLine["rangeTexts"]> = [];
        for (const attrEntry of this.attrEntries) {
            ret.push([
                attrEntry.entryRange,
                attrEntry.entryText,
                "AttrEntry",
            ]);
            ret.push([
                attrEntry.trailingSpaceRange,
                attrEntry.trailingSpace,
                "AttrEntryTrailingSpace",
            ]);
        }
        return ret;
    }
    public get multilineIndicatorRange(): [number, number] | null {
        const attrEntriesRanges = this.attrEntriesRangeTexts().map(r => r[0]);
        const base = (
            attrEntriesRanges.length > 0
                ? attrEntriesRanges[attrEntriesRanges.length - 1]
                : this.midSpaceRange
        ) ?? null;
        if (!base) return null;
        return [base[1], base[1] + this.multilineIndicator.length];
    }
    public get sentencesArrayRange(): [number, number] | null {
        if (this.sentencesArray.length > 0) {
            const sentences = this.sentencesArray.flat().map(ss => ss.sentences).flat();
            return rangeOfELs(sentences);
        } else {
            const base = this.multilineIndicatorRange;
            if (!base) return null;
            return [base[1], base[1]];
        }
    }
    public rangeTexts() {
        const ret: ReturnType<BaseLine["rangeTexts"]> = [];
        ret.push(...this.indentRangeTexts());
        ret.push([this.firstColumnIndicatorRange, this.firstColumnIndicator, "FirstColumnIndicator"]);
        ret.push([this.midIndicatorsSpaceRange, this.midIndicatorsSpace, "MidIndicatorsSpace"]);
        ret.push([this.columnIndicatorRange, this.columnIndicator, "ColumnIndicator"]);
        ret.push([this.midSpaceRange, this.midSpace, "MidSpace"]);
        ret.push(...this.attrEntriesRangeTexts());
        ret.push([this.multilineIndicatorRange, this.multilineIndicator, "MultilineIndicator"]);
        ret.push([this.sentencesArrayRange, sentencesArrayToString(this.sentencesArray), "SentencesArray"]);
        ret.push([this.lineEndTextRange(), this.lineEndText, "LineEnd"]);
        return ret;
    }
}

type OtherLineOptions = Omit<WithControlsLineOptions<never>, "type"> & {
    sentencesArray: SentencesArray,
};

export class OtherLine extends WithControlsLine<LineType.OTH> {
    public sentencesArray: SentencesArray;
    public constructor(
        options: OtherLineOptions,
    ) {
        super({ ...options, type: LineType.OTH });
        this.sentencesArray = options.sentencesArray;
    }
    public get sentencesArrayRange(): [number, number] | null {
        if (this.sentencesArray.length > 0) {
            const sentences = this.sentencesArray.flat().map(ss => ss.sentences).flat();
            return rangeOfELs(sentences);
        } else {
            const pos = this.controlsEndPos;
            return (pos !== null) ? [pos, pos] : null;
        }
    }
    public rangeTexts() {
        const ret: ReturnType<BaseLine["rangeTexts"]> = [];
        ret.push(...this.indentRangeTexts());
        ret.push(...this.controlsRangeTexts());
        ret.push([this.sentencesArrayRange, sentencesArrayToString(this.sentencesArray), "SentencesArray"]);
        ret.push([this.lineEndTextRange(), this.lineEndText, "LineEnd"]);
        return ret;
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

