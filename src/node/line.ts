import * as std from "src/law/std";

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
    CTL = "CTL",
    OTH = "OTH",
}

interface BaseLine {
    type: LineType;
    text: string;
}

interface IndentLine extends BaseLine {
    indentDepth: number;
    indentTexts: string[];
    contentText: string;
    lineEndText: string;
}

export interface BlankLine extends BaseLine {
    type: LineType.BNK;
}

export interface TOCHeadLine extends IndentLine {
    type: LineType.TOC;
    content:
        | std.TOC
        ;
}

export interface ArticleGroupHeadLine extends IndentLine {
    type: LineType.ARG;
    content:
        | std.Part
        | std.Chapter
        | std.Section
        | std.Subsection
        | std.Division
        ;
}

export interface AppdxItemHeadLine extends IndentLine {
    type: LineType.APP;
    content:
        | std.Appdx
        | std.AppdxTable
        | std.AppdxStyle
        | std.AppdxFormat
        | std.AppdxFig
        | std.AppdxNote
        ;
}

export interface SupplProvisionHeadLine extends IndentLine {
    type: LineType.SPR;
    content:
        | std.SupplProvision
        | std.SupplProvisionAppdx
        | std.SupplProvisionAppdxTable
        | std.SupplProvisionAppdxStyle
        ;
}

export interface SupplProvisionAppdxItemHeadLine extends IndentLine {
    type: LineType.SPA;
    content:
        | std.SupplProvisionAppdx
        | std.SupplProvisionAppdxTable
        | std.SupplProvisionAppdxStyle
        ;
}

export interface ArticleLine extends IndentLine {
    type: LineType.ART;
    content: std.Article;
}

export interface ParagraphItemLine extends IndentLine {
    type: LineType.PIT;
    content:
        | std.Paragraph
        | std.Item
        | std.Subitem1
        | std.Subitem2
        | std.Subitem3
        | std.Subitem4
        | std.Subitem5
        | std.Subitem6
        | std.Subitem7
        | std.Subitem8
        | std.Subitem9
        | std.Subitem10
        ;
}

export interface TableColumnLine extends IndentLine {
    type: LineType.TBL;
    content: std.TableColumn;
}

export interface ControlLine extends IndentLine {
    type: LineType.CTL;
}

export interface OtherLine extends IndentLine {
    type: LineType.OTH;
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
    | ControlLine
    | OtherLine
    ;

