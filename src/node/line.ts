import * as std from "src/law/std";
import { EL } from "./el";

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

interface IndentsLine extends BaseLine {
    indentDepth: number;
    indentTexts: string[];
    contentText: string;
    lineEndText: string;
}

export interface BlankLine extends BaseLine {
    type: LineType.BNK;
}

export interface TOCHeadLine extends IndentsLine {
    type: LineType.TOC;
    content:
        | std.TOC
        ;
}

export interface ArticleGroupHeadLine extends IndentsLine {
    type: LineType.ARG;
    content:
        | std.Part
        | std.Chapter
        | std.Section
        | std.Subsection
        | std.Division
        ;
}

export interface AppdxItemHeadLine extends IndentsLine {
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

export interface SupplProvisionHeadLine extends IndentsLine {
    type: LineType.SPR;
    content: std.SupplProvision
        ;
}

export interface SupplProvisionAppdxItemHeadLine extends IndentsLine {
    type: LineType.SPA;
    content:
        | std.SupplProvisionAppdx
        | std.SupplProvisionAppdxTable
        | std.SupplProvisionAppdxStyle
        ;
}

export interface ArticleLine extends IndentsLine {
    type: LineType.ART;
    content: std.Article;
}

export interface ParagraphItemLine extends IndentsLine {
    type: LineType.PIT;
    contentHead: string;
    contentTail: EL[];
}

export interface TableColumnLine extends IndentsLine {
    type: LineType.TBL;
    content: std.TableColumn;
    isFirstColumn: boolean;
}

export interface ControlLine extends IndentsLine {
    type: LineType.CTL;
}

export interface OtherLine extends IndentsLine {
    type: LineType.OTH;
    content: EL[];
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

