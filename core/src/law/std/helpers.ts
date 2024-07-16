/* eslint-disable @stylistic/js/quote-props */
import type { EL } from "../../node/el";
import type * as std from "./stdEL";

export enum Era {
    Meiji = "Meiji",
    Taisho = "Taisho",
    Showa = "Showa",
    Heisei = "Heisei",
    Reiwa = "Reiwa",
}

export const eras = {
    "明治": Era.Meiji, "大正": Era.Taisho,
    "昭和": Era.Showa, "平成": Era.Heisei,
    "令和": Era.Reiwa,
} as const;

export const paragraphItemTags = [
    "Paragraph",
    "Item",
    "Subitem1",
    "Subitem2",
    "Subitem3",
    "Subitem4",
    "Subitem5",
    "Subitem6",
    "Subitem7",
    "Subitem8",
    "Subitem9",
    "Subitem10",
] as const;

export type ParagraphItem =
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

export const isParagraphItem = (el: EL | string): el is ParagraphItem =>
    typeof el !== "string" && (paragraphItemTags as readonly string[]).includes(el.tag);

export const paragraphItemTitleTags = [
    "ParagraphNum",
    "ItemTitle",
    "Subitem1Title",
    "Subitem2Title",
    "Subitem3Title",
    "Subitem4Title",
    "Subitem5Title",
    "Subitem6Title",
    "Subitem7Title",
    "Subitem8Title",
    "Subitem9Title",
    "Subitem10Title",
] as const;

export type ParagraphItemTitle =
    | std.ParagraphNum
    | std.ItemTitle
    | std.Subitem1Title
    | std.Subitem2Title
    | std.Subitem3Title
    | std.Subitem4Title
    | std.Subitem5Title
    | std.Subitem6Title
    | std.Subitem7Title
    | std.Subitem8Title
    | std.Subitem9Title
    | std.Subitem10Title
    ;

export const isParagraphItemTitle = (el: EL | string): el is ParagraphItemTitle =>
    typeof el !== "string" && (paragraphItemTitleTags as readonly string[]).includes(el.tag);

export const paragraphItemSentenceTags = [
    "ParagraphSentence",
    "ItemSentence",
    "Subitem1Sentence",
    "Subitem2Sentence",
    "Subitem3Sentence",
    "Subitem4Sentence",
    "Subitem5Sentence",
    "Subitem6Sentence",
    "Subitem7Sentence",
    "Subitem8Sentence",
    "Subitem9Sentence",
    "Subitem10Sentence",
] as const;

export type ParagraphItemSentence =
    | std.ParagraphSentence
    | std.ItemSentence
    | std.Subitem1Sentence
    | std.Subitem2Sentence
    | std.Subitem3Sentence
    | std.Subitem4Sentence
    | std.Subitem5Sentence
    | std.Subitem6Sentence
    | std.Subitem7Sentence
    | std.Subitem8Sentence
    | std.Subitem9Sentence
    | std.Subitem10Sentence
    ;

export const isParagraphItemSentence = (el: EL | string): el is ParagraphItemSentence =>
    typeof el !== "string" && (paragraphItemSentenceTags as readonly string[]).includes(el.tag);


export const listTags = ["List", "Sublist1", "Sublist2", "Sublist3"] as const;


export const typeCharsMap = {
    "法": "Law",
    "編": "Part", "章": "Chapter", "節": "Section", "款": "Subsection", "目": "Division",
    "条": "Article", "項": "Paragraph", "号": "Item",
    "則": "SupplProvision",
} as const;

export const articleGroupTypeChars = ["編", "章", "節", "款", "目"] as const;

export const articleGroupTags = [
    "Part",
    "Chapter",
    "Section",
    "Subsection",
    "Division",
] as const;

export type ArticleGroup =
    | std.Part
    | std.Chapter
    | std.Section
    | std.Subsection
    | std.Division
    ;

export const isArticleGroup = (el: EL | string): el is ArticleGroup =>
    typeof el !== "string" && (articleGroupTags as readonly string[]).includes(el.tag);

export const articleGroupTitleTags = [
    "PartTitle",
    "ChapterTitle",
    "SectionTitle",
    "SubsectionTitle",
    "DivisionTitle",
] as const;

export type ArticleGroupTitle =
    | std.PartTitle
    | std.ChapterTitle
    | std.SectionTitle
    | std.SubsectionTitle
    | std.DivisionTitle
    ;

export const isArticleGroupTitle = (el: EL | string): el is ArticleGroupTitle =>
    typeof el !== "string" && (articleGroupTitleTags as readonly string[]).includes(el.tag);

export const tocArticleGroupTags = [
    "TOCPart",
    "TOCChapter",
    "TOCSection",
    "TOCSubsection",
    "TOCDivision",
] as const;

export type TOCArticleGroup =
    | std.TOCPart
    | std.TOCChapter
    | std.TOCSection
    | std.TOCSubsection
    | std.TOCDivision
    ;

export const isTOCArticleGroup = (el: EL | string): el is TOCArticleGroup =>
    typeof el !== "string" && (tocArticleGroupTags as readonly string[]).includes(el.tag);

export const tocItemTags = [
    ...tocArticleGroupTags,
    "TOCPreambleLabel",
    "TOCArticle",
    "TOCSupplProvision",
    "TOCAppdxTableLabel",
] as const;

export type TOCItem =
    | TOCArticleGroup
    | std.TOCPreambleLabel
    | std.TOCArticle
    | std.TOCSupplProvision
    | std.TOCAppdxTableLabel
    ;

export const isTOCItem = (el: EL | string): el is TOCItem =>
    typeof el !== "string" && (tocItemTags as readonly string[]).includes(el.tag);

export const listOrSublistTags = [
    "List",
    "Sublist1",
    "Sublist2",
    "Sublist3",
] as const;

export type ListOrSublist =
    | std.List
    | std.Sublist1
    | std.Sublist2
    | std.Sublist3
    ;

export const isListOrSublist = (el: EL | string): el is ListOrSublist =>
    typeof el !== "string" && (listOrSublistTags as readonly string[]).includes(el.tag);

export const listOrSublistSentenceTags = [
    "ListSentence",
    "Sublist1Sentence",
    "Sublist2Sentence",
    "Sublist3Sentence",
] as const;

export type ListOrSublistSentence =
    | std.ListSentence
    | std.Sublist1Sentence
    | std.Sublist2Sentence
    | std.Sublist3Sentence
    ;

export const isListOrSublistSentence = (el: EL | string): el is ListOrSublistSentence =>
    typeof el !== "string" && (listOrSublistSentenceTags as readonly string[]).includes(el.tag);

export const noteLikeTags = [
    "Note",
    "Style",
    "Format",
] as const;

export type NoteLike =
    | std.Note
    | std.Style
    | std.Format
    ;

export const isNoteLike = (el: EL | string): el is NoteLike =>
    typeof el !== "string" && (noteLikeTags as readonly string[]).includes(el.tag);

export const noteLikeStructTags = [
    "NoteStruct",
    "StyleStruct",
    "FormatStruct",
] as const;

export type NoteLikeStruct =
    | std.NoteStruct
    | std.StyleStruct
    | std.FormatStruct
    ;

export const isNoteLikeStruct = (el: EL | string): el is NoteLikeStruct =>
    typeof el !== "string" && (noteLikeStructTags as readonly string[]).includes(el.tag);

export const noteLikeStructTitleTags = [
    "NoteStructTitle",
    "StyleStructTitle",
    "FormatStructTitle",
] as const;

export type NoteLikeStructTitle =
    | std.NoteStructTitle
    | std.StyleStructTitle
    | std.FormatStructTitle
    ;

export const isNoteLikeStructTitle = (el: EL | string): el is NoteLikeStructTitle =>
    typeof el !== "string" && (noteLikeStructTitleTags as readonly string[]).includes(el.tag);

export const appdxItemTags = [
    "AppdxFig",
    "AppdxStyle",
    "AppdxFormat",
    "AppdxTable",
    "AppdxNote",
    "Appdx",
] as const;

export type AppdxItem =
    | std.AppdxFig
    | std.AppdxStyle
    | std.AppdxFormat
    | std.AppdxTable
    | std.AppdxNote
    | std.Appdx
    ;

export const isAppdxItem = (el: EL | string): el is AppdxItem =>
    typeof el !== "string" && (appdxItemTags as readonly string[]).includes(el.tag);

export const appdxItemTitleTags = [
    "AppdxFigTitle",
    "AppdxStyleTitle",
    "AppdxFormatTitle",
    "AppdxTableTitle",
    "AppdxNoteTitle",
    "ArithFormulaNum",
] as const;

export type AppdxItemTitle =
        | std.AppdxFigTitle
        | std.AppdxStyleTitle
        | std.AppdxFormatTitle
        | std.AppdxTableTitle
        | std.AppdxNoteTitle
        | std.ArithFormulaNum
        ;

export const isAppdxItemTitle = (el: EL | string): el is AppdxItemTitle =>
    typeof el !== "string" && (appdxItemTitleTags as readonly string[]).includes(el.tag);

export const supplProvisionAppdxItemTags = [
    "SupplProvisionAppdxTable",
    "SupplProvisionAppdxStyle",
    "SupplProvisionAppdx",
] as const;

export type SupplProvisionAppdxItem =
    | std.SupplProvisionAppdxTable
    | std.SupplProvisionAppdxStyle
    | std.SupplProvisionAppdx
    ;

export const isSupplProvisionAppdxItem = (el: EL | string): el is SupplProvisionAppdxItem =>
    typeof el !== "string" && (supplProvisionAppdxItemTags as readonly string[]).includes(el.tag);

export const supplProvisionAppdxItemTitleTags = [
    "SupplProvisionAppdxTableTitle",
    "SupplProvisionAppdxStyleTitle",
    "ArithFormulaNum",
] as const;

export type SupplProvisionAppdxItemTitle =
        | std.SupplProvisionAppdxTableTitle
        | std.SupplProvisionAppdxStyleTitle
        | std.ArithFormulaNum
        ;

export const isSupplProvisionAppdxItemTitle = (el: EL | string): el is SupplProvisionAppdxItemTitle =>
    typeof el !== "string" && (supplProvisionAppdxItemTitleTags as readonly string[]).includes(el.tag);
