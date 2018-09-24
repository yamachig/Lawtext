import { EL } from "./util"

export interface __EL extends EL {
    isControl: true
}

export interface StdEL extends EL {
    isControl: false
}

export interface Law extends StdEL {
    tag: "Law"
    attr: {
        Era: "Meiji" | "Taisho" | "Showa" | "Heisei",
        Year: string,
        Num: string,
        PromulgateMonth?: string,
        PromulgateDay?: string,
        LawType: "Constitution" | "Act" | "CabinetOrder" | "ImperialOrder" | "MinisterialOrdinance" | "Rule" | "Misc",
        Lang: "ja" | "en",
    }
    children: (LawNum | LawBody)[]
}

export function isLaw(obj: EL): obj is Law {
    return obj.tag === "Law";
}

export interface LawNum extends StdEL {
    tag: "LawNum"
    children: [__EL | string]
}

export function isLawNum(obj: EL): obj is LawNum {
    return obj.tag === "LawNum";
}

export interface LawBody extends StdEL {
    tag: "LawBody"
    attr: {
        Subject?: string,
    }
    children: (LawTitle | EnactStatement | TOC | Preamble | MainProvision | SupplProvision | AppdxTable | AppdxNote | AppdxStyle | Appdx | AppdxFig | AppdxFormat)[]
}

export function isLawBody(obj: EL): obj is LawBody {
    return obj.tag === "LawBody";
}

export interface LawTitle extends StdEL {
    tag: "LawTitle"
    attr: {
        Kana?: string,
        Abbrev?: string,
        AbbrevKana?: string,
    }
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isLawTitle(obj: EL): obj is LawTitle {
    return obj.tag === "LawTitle";
}

export interface EnactStatement extends StdEL {
    tag: "EnactStatement"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isEnactStatement(obj: EL): obj is EnactStatement {
    return obj.tag === "EnactStatement";
}

export interface TOC extends StdEL {
    tag: "TOC"
    attr: {}
    children: (TOCLabel | TOCPreambleLabel | TOCPart | TOCChapter | TOCSection | TOCArticle | TOCSupplProvision | TOCAppdxTableLabel)[]
}

export function isTOC(obj: EL): obj is TOC {
    return obj.tag === "TOC";
}

export interface TOCLabel extends StdEL {
    tag: "TOCLabel"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isTOCLabel(obj: EL): obj is TOCLabel {
    return obj.tag === "TOCLabel";
}

export interface TOCPreambleLabel extends StdEL {
    tag: "TOCPreambleLabel"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isTOCPreambleLabel(obj: EL): obj is TOCPreambleLabel {
    return obj.tag === "TOCPreambleLabel";
}

export interface TOCPart extends StdEL {
    tag: "TOCPart"
    attr: {
        Num: string,
        Delete?: string,
    }
    children: (PartTitle | ArticleRange | TOCChapter)[]
}

export function isTOCPart(obj: EL): obj is TOCPart {
    return obj.tag === "TOCPart";
}

export interface TOCChapter extends StdEL {
    tag: "TOCChapter"
    attr: {
        Num: string,
        Delete?: string,
    }
    children: (ChapterTitle | ArticleRange | TOCSection)[]
}

export function isTOCChapter(obj: EL): obj is TOCChapter {
    return obj.tag === "TOCChapter";
}

export interface TOCSection extends StdEL {
    tag: "TOCSection"
    attr: {
        Num: string,
        Delete?: string,
    }
    children: (SectionTitle | ArticleRange | TOCSubsection | TOCDivision)[]
}

export function isTOCSection(obj: EL): obj is TOCSection {
    return obj.tag === "TOCSection";
}

export interface TOCSubsection extends StdEL {
    tag: "TOCSubsection"
    attr: {
        Num: string,
        Delete?: string,
    }
    children: (SubsectionTitle | ArticleRange | TOCDivision)[]
}

export function isTOCSubsection(obj: EL): obj is TOCSubsection {
    return obj.tag === "TOCSubsection";
}

export interface TOCDivision extends StdEL {
    tag: "TOCDivision"
    attr: {
        Num: string,
        Delete?: string,
    }
    children: (DivisionTitle | ArticleRange)[]
}

export function isTOCDivision(obj: EL): obj is TOCDivision {
    return obj.tag === "TOCDivision";
}

export interface TOCArticle extends StdEL {
    tag: "TOCArticle"
    attr: {
        Num: string,
        Delete?: string,
    }
    children: (ArticleTitle | ArticleCaption)[]
}

export function isTOCArticle(obj: EL): obj is TOCArticle {
    return obj.tag === "TOCArticle";
}

export interface TOCSupplProvision extends StdEL {
    tag: "TOCSupplProvision"
    attr: {}
    children: (SupplProvisionLabel | ArticleRange | TOCArticle | TOCChapter)[]
}

export function isTOCSupplProvision(obj: EL): obj is TOCSupplProvision {
    return obj.tag === "TOCSupplProvision";
}

export interface TOCAppdxTableLabel extends StdEL {
    tag: "TOCAppdxTableLabel"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isTOCAppdxTableLabel(obj: EL): obj is TOCAppdxTableLabel {
    return obj.tag === "TOCAppdxTableLabel";
}

export interface ArticleRange extends StdEL {
    tag: "ArticleRange"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isArticleRange(obj: EL): obj is ArticleRange {
    return obj.tag === "ArticleRange";
}

export interface Preamble extends StdEL {
    tag: "Preamble"
    attr: {}
    children: (Paragraph)[]
}

export function isPreamble(obj: EL): obj is Preamble {
    return obj.tag === "Preamble";
}

export interface MainProvision extends StdEL {
    tag: "MainProvision"
    attr: {
        Extract?: string,
    }
    children: (Part | Chapter | Section | Article | Paragraph)[]
}

export function isMainProvision(obj: EL): obj is MainProvision {
    return obj.tag === "MainProvision";
}

export interface Part extends StdEL {
    tag: "Part"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: (PartTitle | Article | Chapter)[]
}

export function isPart(obj: EL): obj is Part {
    return obj.tag === "Part";
}

export interface PartTitle extends StdEL {
    tag: "PartTitle"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isPartTitle(obj: EL): obj is PartTitle {
    return obj.tag === "PartTitle";
}

export interface Chapter extends StdEL {
    tag: "Chapter"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: (ChapterTitle | Article | Section)[]
}

export function isChapter(obj: EL): obj is Chapter {
    return obj.tag === "Chapter";
}

export interface ChapterTitle extends StdEL {
    tag: "ChapterTitle"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isChapterTitle(obj: EL): obj is ChapterTitle {
    return obj.tag === "ChapterTitle";
}

export interface Section extends StdEL {
    tag: "Section"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: (SectionTitle | Article | Subsection | Division)[]
}

export function isSection(obj: EL): obj is Section {
    return obj.tag === "Section";
}

export interface SectionTitle extends StdEL {
    tag: "SectionTitle"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isSectionTitle(obj: EL): obj is SectionTitle {
    return obj.tag === "SectionTitle";
}

export interface Subsection extends StdEL {
    tag: "Subsection"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: (SubsectionTitle | Article | Division)[]
}

export function isSubsection(obj: EL): obj is Subsection {
    return obj.tag === "Subsection";
}

export interface SubsectionTitle extends StdEL {
    tag: "SubsectionTitle"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isSubsectionTitle(obj: EL): obj is SubsectionTitle {
    return obj.tag === "SubsectionTitle";
}

export interface Division extends StdEL {
    tag: "Division"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: (DivisionTitle | Article)[]
}

export function isDivision(obj: EL): obj is Division {
    return obj.tag === "Division";
}

export interface DivisionTitle extends StdEL {
    tag: "DivisionTitle"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isDivisionTitle(obj: EL): obj is DivisionTitle {
    return obj.tag === "DivisionTitle";
}

export interface Article extends StdEL {
    tag: "Article"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: (ArticleCaption | ArticleTitle | Paragraph | SupplNote)[]
}

export function isArticle(obj: EL): obj is Article {
    return obj.tag === "Article";
}

export interface ArticleTitle extends StdEL {
    tag: "ArticleTitle"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isArticleTitle(obj: EL): obj is ArticleTitle {
    return obj.tag === "ArticleTitle";
}

export interface ArticleCaption extends StdEL {
    tag: "ArticleCaption"
    attr: {
        CommonCaption?: string,
    }
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isArticleCaption(obj: EL): obj is ArticleCaption {
    return obj.tag === "ArticleCaption";
}

export interface Paragraph extends StdEL {
    tag: "Paragraph"
    attr: {
        Num: string,
        OldStyle?: string,
        Hide?: string,
    }
    children: (ParagraphCaption | ParagraphNum | ParagraphSentence | AmendProvision | Class | TableStruct | FigStruct | StyleStruct | Item | List)[]
}

export function isParagraph(obj: EL): obj is Paragraph {
    return obj.tag === "Paragraph";
}

export interface ParagraphCaption extends StdEL {
    tag: "ParagraphCaption"
    attr: {
        CommonCaption?: string,
    }
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isParagraphCaption(obj: EL): obj is ParagraphCaption {
    return obj.tag === "ParagraphCaption";
}

export interface ParagraphNum extends StdEL {
    tag: "ParagraphNum"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isParagraphNum(obj: EL): obj is ParagraphNum {
    return obj.tag === "ParagraphNum";
}

export interface ParagraphSentence extends StdEL {
    tag: "ParagraphSentence"
    attr: {}
    children: (Sentence)[]
}

export function isParagraphSentence(obj: EL): obj is ParagraphSentence {
    return obj.tag === "ParagraphSentence";
}

export interface SupplNote extends StdEL {
    tag: "SupplNote"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isSupplNote(obj: EL): obj is SupplNote {
    return obj.tag === "SupplNote";
}

export interface AmendProvision extends StdEL {
    tag: "AmendProvision"
    attr: {}
    children: (AmendProvisionSentence | NewProvision)[]
}

export function isAmendProvision(obj: EL): obj is AmendProvision {
    return obj.tag === "AmendProvision";
}

export interface AmendProvisionSentence extends StdEL {
    tag: "AmendProvisionSentence"
    attr: {}
    children: (Sentence)[]
}

export function isAmendProvisionSentence(obj: EL): obj is AmendProvisionSentence {
    return obj.tag === "AmendProvisionSentence";
}

export interface NewProvision extends StdEL {
    tag: "NewProvision"
    attr: {}
    children: (LawTitle | Preamble | TOC | Part | PartTitle | Chapter | ChapterTitle | Section | SectionTitle | Subsection | SubsectionTitle | Division | DivisionTitle | Article | SupplNote | Paragraph | Item | Subitem1 | Subitem2 | Subitem3 | Subitem4 | Subitem5 | Subitem6 | Subitem7 | Subitem8 | Subitem9 | Subitem10 | List | Sentence | AmendProvision | AppdxTable | AppdxNote | AppdxStyle | Appdx | AppdxFig | AppdxFormat | SupplProvisionAppdxStyle | SupplProvisionAppdxTable | SupplProvisionAppdx | TableStruct | TableRow | TableColumn | FigStruct | NoteStruct | StyleStruct | FormatStruct | Remarks | LawBody)[]
}

export function isNewProvision(obj: EL): obj is NewProvision {
    return obj.tag === "NewProvision";
}

export interface Class extends StdEL {
    tag: "Class"
    attr: {
        Num: string,
    }
    children: (ClassTitle | ClassSentence | Item)[]
}

export function isClass(obj: EL): obj is Class {
    return obj.tag === "Class";
}

export interface ClassTitle extends StdEL {
    tag: "ClassTitle"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isClassTitle(obj: EL): obj is ClassTitle {
    return obj.tag === "ClassTitle";
}

export interface ClassSentence extends StdEL {
    tag: "ClassSentence"
    attr: {}
    children: (Sentence | Column | Table)[]
}

export function isClassSentence(obj: EL): obj is ClassSentence {
    return obj.tag === "ClassSentence";
}

export interface Item extends StdEL {
    tag: "Item"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: (ItemTitle | ItemSentence | Subitem1 | TableStruct | FigStruct | StyleStruct | List)[]
}

export function isItem(obj: EL): obj is Item {
    return obj.tag === "Item";
}

export interface ItemTitle extends StdEL {
    tag: "ItemTitle"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isItemTitle(obj: EL): obj is ItemTitle {
    return obj.tag === "ItemTitle";
}

export interface ItemSentence extends StdEL {
    tag: "ItemSentence"
    attr: {}
    children: (Sentence | Column | Table)[]
}

export function isItemSentence(obj: EL): obj is ItemSentence {
    return obj.tag === "ItemSentence";
}

export interface Subitem1 extends StdEL {
    tag: "Subitem1"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: (Subitem1Title | Subitem1Sentence | Subitem2 | TableStruct | FigStruct | StyleStruct | List)[]
}

export function isSubitem1(obj: EL): obj is Subitem1 {
    return obj.tag === "Subitem1";
}

export interface Subitem1Title extends StdEL {
    tag: "Subitem1Title"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isSubitem1Title(obj: EL): obj is Subitem1Title {
    return obj.tag === "Subitem1Title";
}

export interface Subitem1Sentence extends StdEL {
    tag: "Subitem1Sentence"
    attr: {}
    children: (Sentence | Column | Table)[]
}

export function isSubitem1Sentence(obj: EL): obj is Subitem1Sentence {
    return obj.tag === "Subitem1Sentence";
}

export interface Subitem2 extends StdEL {
    tag: "Subitem2"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: (Subitem2Title | Subitem2Sentence | Subitem3 | TableStruct | FigStruct | StyleStruct | List)[]
}

export function isSubitem2(obj: EL): obj is Subitem2 {
    return obj.tag === "Subitem2";
}

export interface Subitem2Title extends StdEL {
    tag: "Subitem2Title"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isSubitem2Title(obj: EL): obj is Subitem2Title {
    return obj.tag === "Subitem2Title";
}

export interface Subitem2Sentence extends StdEL {
    tag: "Subitem2Sentence"
    attr: {}
    children: (Sentence | Column | Table)[]
}

export function isSubitem2Sentence(obj: EL): obj is Subitem2Sentence {
    return obj.tag === "Subitem2Sentence";
}

export interface Subitem3 extends StdEL {
    tag: "Subitem3"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: (Subitem3Title | Subitem3Sentence | Subitem4 | TableStruct | FigStruct | StyleStruct | List)[]
}

export function isSubitem3(obj: EL): obj is Subitem3 {
    return obj.tag === "Subitem3";
}

export interface Subitem3Title extends StdEL {
    tag: "Subitem3Title"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isSubitem3Title(obj: EL): obj is Subitem3Title {
    return obj.tag === "Subitem3Title";
}

export interface Subitem3Sentence extends StdEL {
    tag: "Subitem3Sentence"
    attr: {}
    children: (Sentence | Column | Table)[]
}

export function isSubitem3Sentence(obj: EL): obj is Subitem3Sentence {
    return obj.tag === "Subitem3Sentence";
}

export interface Subitem4 extends StdEL {
    tag: "Subitem4"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: (Subitem4Title | Subitem4Sentence | Subitem5 | TableStruct | FigStruct | StyleStruct | List)[]
}

export function isSubitem4(obj: EL): obj is Subitem4 {
    return obj.tag === "Subitem4";
}

export interface Subitem4Title extends StdEL {
    tag: "Subitem4Title"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isSubitem4Title(obj: EL): obj is Subitem4Title {
    return obj.tag === "Subitem4Title";
}

export interface Subitem4Sentence extends StdEL {
    tag: "Subitem4Sentence"
    attr: {}
    children: (Sentence | Column | Table)[]
}

export function isSubitem4Sentence(obj: EL): obj is Subitem4Sentence {
    return obj.tag === "Subitem4Sentence";
}

export interface Subitem5 extends StdEL {
    tag: "Subitem5"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: (Subitem5Title | Subitem5Sentence | Subitem6 | TableStruct | FigStruct | StyleStruct | List)[]
}

export function isSubitem5(obj: EL): obj is Subitem5 {
    return obj.tag === "Subitem5";
}

export interface Subitem5Title extends StdEL {
    tag: "Subitem5Title"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isSubitem5Title(obj: EL): obj is Subitem5Title {
    return obj.tag === "Subitem5Title";
}

export interface Subitem5Sentence extends StdEL {
    tag: "Subitem5Sentence"
    attr: {}
    children: (Sentence | Column | Table)[]
}

export function isSubitem5Sentence(obj: EL): obj is Subitem5Sentence {
    return obj.tag === "Subitem5Sentence";
}

export interface Subitem6 extends StdEL {
    tag: "Subitem6"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: (Subitem6Title | Subitem6Sentence | Subitem7 | TableStruct | FigStruct | StyleStruct | List)[]
}

export function isSubitem6(obj: EL): obj is Subitem6 {
    return obj.tag === "Subitem6";
}

export interface Subitem6Title extends StdEL {
    tag: "Subitem6Title"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isSubitem6Title(obj: EL): obj is Subitem6Title {
    return obj.tag === "Subitem6Title";
}

export interface Subitem6Sentence extends StdEL {
    tag: "Subitem6Sentence"
    attr: {}
    children: (Sentence | Column | Table)[]
}

export function isSubitem6Sentence(obj: EL): obj is Subitem6Sentence {
    return obj.tag === "Subitem6Sentence";
}

export interface Subitem7 extends StdEL {
    tag: "Subitem7"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: (Subitem7Title | Subitem7Sentence | Subitem8 | TableStruct | FigStruct | StyleStruct | List)[]
}

export function isSubitem7(obj: EL): obj is Subitem7 {
    return obj.tag === "Subitem7";
}

export interface Subitem7Title extends StdEL {
    tag: "Subitem7Title"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isSubitem7Title(obj: EL): obj is Subitem7Title {
    return obj.tag === "Subitem7Title";
}

export interface Subitem7Sentence extends StdEL {
    tag: "Subitem7Sentence"
    attr: {}
    children: (Sentence | Column | Table)[]
}

export function isSubitem7Sentence(obj: EL): obj is Subitem7Sentence {
    return obj.tag === "Subitem7Sentence";
}

export interface Subitem8 extends StdEL {
    tag: "Subitem8"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: (Subitem8Title | Subitem8Sentence | Subitem9 | TableStruct | FigStruct | StyleStruct | List)[]
}

export function isSubitem8(obj: EL): obj is Subitem8 {
    return obj.tag === "Subitem8";
}

export interface Subitem8Title extends StdEL {
    tag: "Subitem8Title"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isSubitem8Title(obj: EL): obj is Subitem8Title {
    return obj.tag === "Subitem8Title";
}

export interface Subitem8Sentence extends StdEL {
    tag: "Subitem8Sentence"
    attr: {}
    children: (Sentence | Column | Table)[]
}

export function isSubitem8Sentence(obj: EL): obj is Subitem8Sentence {
    return obj.tag === "Subitem8Sentence";
}

export interface Subitem9 extends StdEL {
    tag: "Subitem9"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: (Subitem9Title | Subitem9Sentence | Subitem10 | TableStruct | FigStruct | StyleStruct | List)[]
}

export function isSubitem9(obj: EL): obj is Subitem9 {
    return obj.tag === "Subitem9";
}

export interface Subitem9Title extends StdEL {
    tag: "Subitem9Title"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isSubitem9Title(obj: EL): obj is Subitem9Title {
    return obj.tag === "Subitem9Title";
}

export interface Subitem9Sentence extends StdEL {
    tag: "Subitem9Sentence"
    attr: {}
    children: (Sentence | Column | Table)[]
}

export function isSubitem9Sentence(obj: EL): obj is Subitem9Sentence {
    return obj.tag === "Subitem9Sentence";
}

export interface Subitem10 extends StdEL {
    tag: "Subitem10"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: (Subitem10Title | Subitem10Sentence | TableStruct | FigStruct | StyleStruct | List)[]
}

export function isSubitem10(obj: EL): obj is Subitem10 {
    return obj.tag === "Subitem10";
}

export interface Subitem10Title extends StdEL {
    tag: "Subitem10Title"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isSubitem10Title(obj: EL): obj is Subitem10Title {
    return obj.tag === "Subitem10Title";
}

export interface Subitem10Sentence extends StdEL {
    tag: "Subitem10Sentence"
    attr: {}
    children: (Sentence | Column | Table)[]
}

export function isSubitem10Sentence(obj: EL): obj is Subitem10Sentence {
    return obj.tag === "Subitem10Sentence";
}

export interface Sentence extends StdEL {
    tag: "Sentence"
    attr: {
        Num?: string,
        Function?: "main" | "proviso",
        Indent?: "Paragraph" | "Item" | "Subitem1" | "Subitem2" | "Subitem3" | "Subitem4" | "Subitem5" | "Subitem6" | "Subitem7" | "Subitem8" | "Subitem9" | "Subitem10",
        WritingMode?: "vertical" | "horizontal",
    }
    children: (Line | QuoteStruct | ArithFormula | Ruby | Sup | Sub | string | __EL)[]
}

export function isSentence(obj: EL): obj is Sentence {
    return obj.tag === "Sentence";
}

export interface Column extends StdEL {
    tag: "Column"
    attr: {
        Num?: string,
        LineBreak?: string,
        Align?: "left" | "center" | "right" | "justify",
    }
    children: (Sentence)[]
}

export function isColumn(obj: EL): obj is Column {
    return obj.tag === "Column";
}

export interface SupplProvision extends StdEL {
    tag: "SupplProvision"
    attr: {
        Type?: "New" | "Amend",
        AmendLawNum?: string,
        Extract?: string,
    }
    children: (SupplProvisionLabel | Chapter | Article | Paragraph | SupplProvisionAppdxTable | SupplProvisionAppdxStyle | SupplProvisionAppdx)[]
}

export function isSupplProvision(obj: EL): obj is SupplProvision {
    return obj.tag === "SupplProvision";
}

export interface SupplProvisionLabel extends StdEL {
    tag: "SupplProvisionLabel"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isSupplProvisionLabel(obj: EL): obj is SupplProvisionLabel {
    return obj.tag === "SupplProvisionLabel";
}

export interface SupplProvisionAppdxTable extends StdEL {
    tag: "SupplProvisionAppdxTable"
    attr: {
        Num?: string,
    }
    children: (SupplProvisionAppdxTableTitle | RelatedArticleNum | TableStruct)[]
}

export function isSupplProvisionAppdxTable(obj: EL): obj is SupplProvisionAppdxTable {
    return obj.tag === "SupplProvisionAppdxTable";
}

export interface SupplProvisionAppdxTableTitle extends StdEL {
    tag: "SupplProvisionAppdxTableTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isSupplProvisionAppdxTableTitle(obj: EL): obj is SupplProvisionAppdxTableTitle {
    return obj.tag === "SupplProvisionAppdxTableTitle";
}

export interface SupplProvisionAppdxStyle extends StdEL {
    tag: "SupplProvisionAppdxStyle"
    attr: {
        Num?: string,
    }
    children: (SupplProvisionAppdxStyleTitle | RelatedArticleNum | StyleStruct)[]
}

export function isSupplProvisionAppdxStyle(obj: EL): obj is SupplProvisionAppdxStyle {
    return obj.tag === "SupplProvisionAppdxStyle";
}

export interface SupplProvisionAppdxStyleTitle extends StdEL {
    tag: "SupplProvisionAppdxStyleTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isSupplProvisionAppdxStyleTitle(obj: EL): obj is SupplProvisionAppdxStyleTitle {
    return obj.tag === "SupplProvisionAppdxStyleTitle";
}

export interface SupplProvisionAppdx extends StdEL {
    tag: "SupplProvisionAppdx"
    attr: {
        Num?: string,
    }
    children: (ArithFormulaNum | RelatedArticleNum | ArithFormula)[]
}

export function isSupplProvisionAppdx(obj: EL): obj is SupplProvisionAppdx {
    return obj.tag === "SupplProvisionAppdx";
}

export interface AppdxTable extends StdEL {
    tag: "AppdxTable"
    attr: {
        Num?: string,
    }
    children: (AppdxTableTitle | RelatedArticleNum | TableStruct | Item | Remarks)[]
}

export function isAppdxTable(obj: EL): obj is AppdxTable {
    return obj.tag === "AppdxTable";
}

export interface AppdxTableTitle extends StdEL {
    tag: "AppdxTableTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isAppdxTableTitle(obj: EL): obj is AppdxTableTitle {
    return obj.tag === "AppdxTableTitle";
}

export interface AppdxNote extends StdEL {
    tag: "AppdxNote"
    attr: {
        Num?: string,
    }
    children: (AppdxNoteTitle | RelatedArticleNum | NoteStruct | FigStruct | TableStruct | Remarks)[]
}

export function isAppdxNote(obj: EL): obj is AppdxNote {
    return obj.tag === "AppdxNote";
}

export interface AppdxNoteTitle extends StdEL {
    tag: "AppdxNoteTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isAppdxNoteTitle(obj: EL): obj is AppdxNoteTitle {
    return obj.tag === "AppdxNoteTitle";
}

export interface AppdxStyle extends StdEL {
    tag: "AppdxStyle"
    attr: {
        Num?: string,
    }
    children: (AppdxStyleTitle | RelatedArticleNum | StyleStruct | Remarks)[]
}

export function isAppdxStyle(obj: EL): obj is AppdxStyle {
    return obj.tag === "AppdxStyle";
}

export interface AppdxStyleTitle extends StdEL {
    tag: "AppdxStyleTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isAppdxStyleTitle(obj: EL): obj is AppdxStyleTitle {
    return obj.tag === "AppdxStyleTitle";
}

export interface AppdxFormat extends StdEL {
    tag: "AppdxFormat"
    attr: {
        Num?: string,
    }
    children: (AppdxFormatTitle | RelatedArticleNum | FormatStruct | Remarks)[]
}

export function isAppdxFormat(obj: EL): obj is AppdxFormat {
    return obj.tag === "AppdxFormat";
}

export interface AppdxFormatTitle extends StdEL {
    tag: "AppdxFormatTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isAppdxFormatTitle(obj: EL): obj is AppdxFormatTitle {
    return obj.tag === "AppdxFormatTitle";
}

export interface Appdx extends StdEL {
    tag: "Appdx"
    attr: {}
    children: (ArithFormulaNum | RelatedArticleNum | ArithFormula | Remarks)[]
}

export function isAppdx(obj: EL): obj is Appdx {
    return obj.tag === "Appdx";
}

export interface ArithFormulaNum extends StdEL {
    tag: "ArithFormulaNum"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isArithFormulaNum(obj: EL): obj is ArithFormulaNum {
    return obj.tag === "ArithFormulaNum";
}

export interface ArithFormula extends StdEL {
    tag: "ArithFormula"
    attr: {
        Num?: string,
    }
    children: never[]
}

export function isArithFormula(obj: EL): obj is ArithFormula {
    return obj.tag === "ArithFormula";
}

export interface AppdxFig extends StdEL {
    tag: "AppdxFig"
    attr: {
        Num?: string,
    }
    children: (AppdxFigTitle | RelatedArticleNum | FigStruct | TableStruct)[]
}

export function isAppdxFig(obj: EL): obj is AppdxFig {
    return obj.tag === "AppdxFig";
}

export interface AppdxFigTitle extends StdEL {
    tag: "AppdxFigTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isAppdxFigTitle(obj: EL): obj is AppdxFigTitle {
    return obj.tag === "AppdxFigTitle";
}

export interface TableStruct extends StdEL {
    tag: "TableStruct"
    attr: {}
    children: (TableStructTitle | Remarks | Table)[]
}

export function isTableStruct(obj: EL): obj is TableStruct {
    return obj.tag === "TableStruct";
}

export interface TableStructTitle extends StdEL {
    tag: "TableStructTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isTableStructTitle(obj: EL): obj is TableStructTitle {
    return obj.tag === "TableStructTitle";
}

export interface Table extends StdEL {
    tag: "Table"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: (TableHeaderRow | TableRow)[]
}

export function isTable(obj: EL): obj is Table {
    return obj.tag === "Table";
}

export interface TableRow extends StdEL {
    tag: "TableRow"
    attr: {}
    children: (TableColumn)[]
}

export function isTableRow(obj: EL): obj is TableRow {
    return obj.tag === "TableRow";
}

export interface TableHeaderRow extends StdEL {
    tag: "TableHeaderRow"
    attr: {}
    children: (TableHeaderColumn)[]
}

export function isTableHeaderRow(obj: EL): obj is TableHeaderRow {
    return obj.tag === "TableHeaderRow";
}

export interface TableHeaderColumn extends StdEL {
    tag: "TableHeaderColumn"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isTableHeaderColumn(obj: EL): obj is TableHeaderColumn {
    return obj.tag === "TableHeaderColumn";
}

export interface TableColumn extends StdEL {
    tag: "TableColumn"
    attr: {
        BorderTop?: "solid" | "none" | "dotted" | "double",
        BorderBottom?: "solid" | "none" | "dotted" | "double",
        BorderLeft?: "solid" | "none" | "dotted" | "double",
        BorderRight?: "solid" | "none" | "dotted" | "double",
        rowspan?: string,
        colspan?: string,
        Align?: "left" | "center" | "right" | "justify",
        Valign?: "top" | "middle" | "bottom",
    }
    children: (Part | Chapter | Section | Subsection | Division | Article | Paragraph | Item | Subitem1 | Subitem2 | Subitem3 | Subitem4 | Subitem5 | Subitem6 | Subitem7 | Subitem8 | Subitem9 | Subitem10 | FigStruct | Remarks | Sentence | Column)[]
}

export function isTableColumn(obj: EL): obj is TableColumn {
    return obj.tag === "TableColumn";
}

export interface FigStruct extends StdEL {
    tag: "FigStruct"
    attr: {}
    children: (FigStructTitle | Remarks | Fig)[]
}

export function isFigStruct(obj: EL): obj is FigStruct {
    return obj.tag === "FigStruct";
}

export interface FigStructTitle extends StdEL {
    tag: "FigStructTitle"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isFigStructTitle(obj: EL): obj is FigStructTitle {
    return obj.tag === "FigStructTitle";
}

export interface Fig extends StdEL {
    tag: "Fig"
    attr: {
        src: string,
    }
    children: never[]
}

export function isFig(obj: EL): obj is Fig {
    return obj.tag === "Fig";
}

export interface NoteStruct extends StdEL {
    tag: "NoteStruct"
    attr: {}
    children: (NoteStructTitle | Remarks | Note)[]
}

export function isNoteStruct(obj: EL): obj is NoteStruct {
    return obj.tag === "NoteStruct";
}

export interface NoteStructTitle extends StdEL {
    tag: "NoteStructTitle"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isNoteStructTitle(obj: EL): obj is NoteStructTitle {
    return obj.tag === "NoteStructTitle";
}

export interface Note extends StdEL {
    tag: "Note"
    children: [EL | string]
}

export function isNote(obj: EL): obj is Note {
    return obj.tag === "Note";
}

export interface StyleStruct extends StdEL {
    tag: "StyleStruct"
    attr: {}
    children: (StyleStructTitle | Remarks | Style)[]
}

export function isStyleStruct(obj: EL): obj is StyleStruct {
    return obj.tag === "StyleStruct";
}

export interface StyleStructTitle extends StdEL {
    tag: "StyleStructTitle"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isStyleStructTitle(obj: EL): obj is StyleStructTitle {
    return obj.tag === "StyleStructTitle";
}

export interface Style extends StdEL {
    tag: "Style"
    children: [EL | string]
}

export function isStyle(obj: EL): obj is Style {
    return obj.tag === "Style";
}

export interface FormatStruct extends StdEL {
    tag: "FormatStruct"
    attr: {}
    children: (FormatStructTitle | Remarks | Format)[]
}

export function isFormatStruct(obj: EL): obj is FormatStruct {
    return obj.tag === "FormatStruct";
}

export interface FormatStructTitle extends StdEL {
    tag: "FormatStructTitle"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isFormatStructTitle(obj: EL): obj is FormatStructTitle {
    return obj.tag === "FormatStructTitle";
}

export interface Format extends StdEL {
    tag: "Format"
    children: [EL | string]
}

export function isFormat(obj: EL): obj is Format {
    return obj.tag === "Format";
}

export interface RelatedArticleNum extends StdEL {
    tag: "RelatedArticleNum"
    attr: {}
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isRelatedArticleNum(obj: EL): obj is RelatedArticleNum {
    return obj.tag === "RelatedArticleNum";
}

export interface Remarks extends StdEL {
    tag: "Remarks"
    attr: {}
    children: (RemarksLabel | Item | Sentence)[]
}

export function isRemarks(obj: EL): obj is Remarks {
    return obj.tag === "Remarks";
}

export interface RemarksLabel extends StdEL {
    tag: "RemarksLabel"
    attr: {
        LineBreak?: string,
    }
    children: (Line | Ruby | Sup | Sub | string | __EL)[]
}

export function isRemarksLabel(obj: EL): obj is RemarksLabel {
    return obj.tag === "RemarksLabel";
}

export interface List extends StdEL {
    tag: "List"
    attr: {}
    children: (ListSentence | Sublist1)[]
}

export function isList(obj: EL): obj is List {
    return obj.tag === "List";
}

export interface ListSentence extends StdEL {
    tag: "ListSentence"
    attr: {}
    children: (Sentence | Column)[]
}

export function isListSentence(obj: EL): obj is ListSentence {
    return obj.tag === "ListSentence";
}

export interface Sublist1 extends StdEL {
    tag: "Sublist1"
    attr: {}
    children: (Sublist1Sentence | Sublist2)[]
}

export function isSublist1(obj: EL): obj is Sublist1 {
    return obj.tag === "Sublist1";
}

export interface Sublist1Sentence extends StdEL {
    tag: "Sublist1Sentence"
    attr: {}
    children: (Sentence | Column)[]
}

export function isSublist1Sentence(obj: EL): obj is Sublist1Sentence {
    return obj.tag === "Sublist1Sentence";
}

export interface Sublist2 extends StdEL {
    tag: "Sublist2"
    attr: {}
    children: (Sublist2Sentence | Sublist3)[]
}

export function isSublist2(obj: EL): obj is Sublist2 {
    return obj.tag === "Sublist2";
}

export interface Sublist2Sentence extends StdEL {
    tag: "Sublist2Sentence"
    attr: {}
    children: (Sentence | Column)[]
}

export function isSublist2Sentence(obj: EL): obj is Sublist2Sentence {
    return obj.tag === "Sublist2Sentence";
}

export interface Sublist3 extends StdEL {
    tag: "Sublist3"
    children: [Sublist3Sentence]
}

export function isSublist3(obj: EL): obj is Sublist3 {
    return obj.tag === "Sublist3";
}

export interface Sublist3Sentence extends StdEL {
    tag: "Sublist3Sentence"
    attr: {}
    children: (Sentence | Column)[]
}

export function isSublist3Sentence(obj: EL): obj is Sublist3Sentence {
    return obj.tag === "Sublist3Sentence";
}

export interface QuoteStruct extends StdEL {
    tag: "QuoteStruct"
    children: [EL | string]
}

export function isQuoteStruct(obj: EL): obj is QuoteStruct {
    return obj.tag === "QuoteStruct";
}

export interface Ruby extends StdEL {
    tag: "Ruby"
    attr: {}
    children: (Rt | string | __EL)[]
}

export function isRuby(obj: EL): obj is Ruby {
    return obj.tag === "Ruby";
}

export interface Rt extends StdEL {
    tag: "Rt"
    children: [__EL | string]
}

export function isRt(obj: EL): obj is Rt {
    return obj.tag === "Rt";
}

export interface Line extends StdEL {
    tag: "Line"
    attr: {
        Style?: "dotted" | "double" | "none" | "solid",
    }
    children: (QuoteStruct | ArithFormula | Ruby | Sup | Sub | string | __EL)[]
}

export function isLine(obj: EL): obj is Line {
    return obj.tag === "Line";
}

export interface Sup extends StdEL {
    tag: "Sup"
    children: [__EL | string]
}

export function isSup(obj: EL): obj is Sup {
    return obj.tag === "Sup";
}

export interface Sub extends StdEL {
    tag: "Sub"
    children: [__EL | string]
}

export function isSub(obj: EL): obj is Sub {
    return obj.tag === "Sub";
}

