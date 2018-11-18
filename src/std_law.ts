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
    children: Array<LawNum | LawBody>
}

export const isLaw = (obj: EL): obj is Law => {
    return obj.tag === "Law";
}

export interface LawNum extends StdEL {
    tag: "LawNum"
    children: Array<__EL | string>
}

export const isLawNum = (obj: EL): obj is LawNum => {
    return obj.tag === "LawNum";
}

export interface LawBody extends StdEL {
    tag: "LawBody"
    attr: {
        Subject?: string,
    }
    children: Array<LawTitle | EnactStatement | TOC | Preamble | MainProvision | SupplProvision | AppdxTable | AppdxNote | AppdxStyle | Appdx | AppdxFig | AppdxFormat>
}

export const isLawBody = (obj: EL): obj is LawBody => {
    return obj.tag === "LawBody";
}

export interface LawTitle extends StdEL {
    tag: "LawTitle"
    attr: {
        Kana?: string,
        Abbrev?: string,
        AbbrevKana?: string,
    }
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isLawTitle = (obj: EL): obj is LawTitle => {
    return obj.tag === "LawTitle";
}

export interface EnactStatement extends StdEL {
    tag: "EnactStatement"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isEnactStatement = (obj: EL): obj is EnactStatement => {
    return obj.tag === "EnactStatement";
}

export interface TOC extends StdEL {
    tag: "TOC"
    attr: {}
    children: Array<TOCLabel | TOCPreambleLabel | TOCPart | TOCChapter | TOCSection | TOCArticle | TOCSupplProvision | TOCAppdxTableLabel>
}

export const isTOC = (obj: EL): obj is TOC => {
    return obj.tag === "TOC";
}

export interface TOCLabel extends StdEL {
    tag: "TOCLabel"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isTOCLabel = (obj: EL): obj is TOCLabel => {
    return obj.tag === "TOCLabel";
}

export interface TOCPreambleLabel extends StdEL {
    tag: "TOCPreambleLabel"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isTOCPreambleLabel = (obj: EL): obj is TOCPreambleLabel => {
    return obj.tag === "TOCPreambleLabel";
}

export interface TOCPart extends StdEL {
    tag: "TOCPart"
    attr: {
        Num: string,
        Delete?: string,
    }
    children: Array<PartTitle | ArticleRange | TOCChapter>
}

export const isTOCPart = (obj: EL): obj is TOCPart => {
    return obj.tag === "TOCPart";
}

export interface TOCChapter extends StdEL {
    tag: "TOCChapter"
    attr: {
        Num: string,
        Delete?: string,
    }
    children: Array<ChapterTitle | ArticleRange | TOCSection>
}

export const isTOCChapter = (obj: EL): obj is TOCChapter => {
    return obj.tag === "TOCChapter";
}

export interface TOCSection extends StdEL {
    tag: "TOCSection"
    attr: {
        Num: string,
        Delete?: string,
    }
    children: Array<SectionTitle | ArticleRange | TOCSubsection | TOCDivision>
}

export const isTOCSection = (obj: EL): obj is TOCSection => {
    return obj.tag === "TOCSection";
}

export interface TOCSubsection extends StdEL {
    tag: "TOCSubsection"
    attr: {
        Num: string,
        Delete?: string,
    }
    children: Array<SubsectionTitle | ArticleRange | TOCDivision>
}

export const isTOCSubsection = (obj: EL): obj is TOCSubsection => {
    return obj.tag === "TOCSubsection";
}

export interface TOCDivision extends StdEL {
    tag: "TOCDivision"
    attr: {
        Num: string,
        Delete?: string,
    }
    children: Array<DivisionTitle | ArticleRange>
}

export const isTOCDivision = (obj: EL): obj is TOCDivision => {
    return obj.tag === "TOCDivision";
}

export interface TOCArticle extends StdEL {
    tag: "TOCArticle"
    attr: {
        Num: string,
        Delete?: string,
    }
    children: Array<ArticleTitle | ArticleCaption>
}

export const isTOCArticle = (obj: EL): obj is TOCArticle => {
    return obj.tag === "TOCArticle";
}

export interface TOCSupplProvision extends StdEL {
    tag: "TOCSupplProvision"
    attr: {}
    children: Array<SupplProvisionLabel | ArticleRange | TOCArticle | TOCChapter>
}

export const isTOCSupplProvision = (obj: EL): obj is TOCSupplProvision => {
    return obj.tag === "TOCSupplProvision";
}

export interface TOCAppdxTableLabel extends StdEL {
    tag: "TOCAppdxTableLabel"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isTOCAppdxTableLabel = (obj: EL): obj is TOCAppdxTableLabel => {
    return obj.tag === "TOCAppdxTableLabel";
}

export interface ArticleRange extends StdEL {
    tag: "ArticleRange"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isArticleRange = (obj: EL): obj is ArticleRange => {
    return obj.tag === "ArticleRange";
}

export interface Preamble extends StdEL {
    tag: "Preamble"
    attr: {}
    children: Paragraph[]
}

export const isPreamble = (obj: EL): obj is Preamble => {
    return obj.tag === "Preamble";
}

export interface MainProvision extends StdEL {
    tag: "MainProvision"
    attr: {
        Extract?: string,
    }
    children: Array<Part | Chapter | Section | Article | Paragraph>
}

export const isMainProvision = (obj: EL): obj is MainProvision => {
    return obj.tag === "MainProvision";
}

export interface Part extends StdEL {
    tag: "Part"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<PartTitle | Article | Chapter>
}

export const isPart = (obj: EL): obj is Part => {
    return obj.tag === "Part";
}

export interface PartTitle extends StdEL {
    tag: "PartTitle"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isPartTitle = (obj: EL): obj is PartTitle => {
    return obj.tag === "PartTitle";
}

export interface Chapter extends StdEL {
    tag: "Chapter"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<ChapterTitle | Article | Section>
}

export const isChapter = (obj: EL): obj is Chapter => {
    return obj.tag === "Chapter";
}

export interface ChapterTitle extends StdEL {
    tag: "ChapterTitle"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isChapterTitle = (obj: EL): obj is ChapterTitle => {
    return obj.tag === "ChapterTitle";
}

export interface Section extends StdEL {
    tag: "Section"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<SectionTitle | Article | Subsection | Division>
}

export const isSection = (obj: EL): obj is Section => {
    return obj.tag === "Section";
}

export interface SectionTitle extends StdEL {
    tag: "SectionTitle"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isSectionTitle = (obj: EL): obj is SectionTitle => {
    return obj.tag === "SectionTitle";
}

export interface Subsection extends StdEL {
    tag: "Subsection"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<SubsectionTitle | Article | Division>
}

export const isSubsection = (obj: EL): obj is Subsection => {
    return obj.tag === "Subsection";
}

export interface SubsectionTitle extends StdEL {
    tag: "SubsectionTitle"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isSubsectionTitle = (obj: EL): obj is SubsectionTitle => {
    return obj.tag === "SubsectionTitle";
}

export interface Division extends StdEL {
    tag: "Division"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<DivisionTitle | Article>
}

export const isDivision = (obj: EL): obj is Division => {
    return obj.tag === "Division";
}

export interface DivisionTitle extends StdEL {
    tag: "DivisionTitle"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isDivisionTitle = (obj: EL): obj is DivisionTitle => {
    return obj.tag === "DivisionTitle";
}

export interface Article extends StdEL {
    tag: "Article"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<ArticleCaption | ArticleTitle | Paragraph | SupplNote>
}

export const isArticle = (obj: EL): obj is Article => {
    return obj.tag === "Article";
}

export interface ArticleTitle extends StdEL {
    tag: "ArticleTitle"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isArticleTitle = (obj: EL): obj is ArticleTitle => {
    return obj.tag === "ArticleTitle";
}

export interface ArticleCaption extends StdEL {
    tag: "ArticleCaption"
    attr: {
        CommonCaption?: string,
    }
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isArticleCaption = (obj: EL): obj is ArticleCaption => {
    return obj.tag === "ArticleCaption";
}

export interface Paragraph extends StdEL {
    tag: "Paragraph"
    attr: {
        Num: string,
        OldStyle?: string,
        Hide?: string,
    }
    children: Array<ParagraphCaption | ParagraphNum | ParagraphSentence | AmendProvision | Class | TableStruct | FigStruct | StyleStruct | Item | List>
}

export const isParagraph = (obj: EL): obj is Paragraph => {
    return obj.tag === "Paragraph";
}

export interface ParagraphCaption extends StdEL {
    tag: "ParagraphCaption"
    attr: {
        CommonCaption?: string,
    }
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isParagraphCaption = (obj: EL): obj is ParagraphCaption => {
    return obj.tag === "ParagraphCaption";
}

export interface ParagraphNum extends StdEL {
    tag: "ParagraphNum"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isParagraphNum = (obj: EL): obj is ParagraphNum => {
    return obj.tag === "ParagraphNum";
}

export interface ParagraphSentence extends StdEL {
    tag: "ParagraphSentence"
    attr: {}
    children: Sentence[]
}

export const isParagraphSentence = (obj: EL): obj is ParagraphSentence => {
    return obj.tag === "ParagraphSentence";
}

export interface SupplNote extends StdEL {
    tag: "SupplNote"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isSupplNote = (obj: EL): obj is SupplNote => {
    return obj.tag === "SupplNote";
}

export interface AmendProvision extends StdEL {
    tag: "AmendProvision"
    attr: {}
    children: Array<AmendProvisionSentence | NewProvision>
}

export const isAmendProvision = (obj: EL): obj is AmendProvision => {
    return obj.tag === "AmendProvision";
}

export interface AmendProvisionSentence extends StdEL {
    tag: "AmendProvisionSentence"
    attr: {}
    children: Sentence[]
}

export const isAmendProvisionSentence = (obj: EL): obj is AmendProvisionSentence => {
    return obj.tag === "AmendProvisionSentence";
}

export interface NewProvision extends StdEL {
    tag: "NewProvision"
    attr: {}
    children: Array<LawTitle | Preamble | TOC | Part | PartTitle | Chapter | ChapterTitle | Section | SectionTitle | Subsection | SubsectionTitle | Division | DivisionTitle | Article | SupplNote | Paragraph | Item | Subitem1 | Subitem2 | Subitem3 | Subitem4 | Subitem5 | Subitem6 | Subitem7 | Subitem8 | Subitem9 | Subitem10 | List | Sentence | AmendProvision | AppdxTable | AppdxNote | AppdxStyle | Appdx | AppdxFig | AppdxFormat | SupplProvisionAppdxStyle | SupplProvisionAppdxTable | SupplProvisionAppdx | TableStruct | TableRow | TableColumn | FigStruct | NoteStruct | StyleStruct | FormatStruct | Remarks | LawBody>
}

export const isNewProvision = (obj: EL): obj is NewProvision => {
    return obj.tag === "NewProvision";
}

export interface Class extends StdEL {
    tag: "Class"
    attr: {
        Num: string,
    }
    children: Array<ClassTitle | ClassSentence | Item>
}

export const isClass = (obj: EL): obj is Class => {
    return obj.tag === "Class";
}

export interface ClassTitle extends StdEL {
    tag: "ClassTitle"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isClassTitle = (obj: EL): obj is ClassTitle => {
    return obj.tag === "ClassTitle";
}

export interface ClassSentence extends StdEL {
    tag: "ClassSentence"
    attr: {}
    children: Array<Sentence | Column | Table>
}

export const isClassSentence = (obj: EL): obj is ClassSentence => {
    return obj.tag === "ClassSentence";
}

export interface Item extends StdEL {
    tag: "Item"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<ItemTitle | ItemSentence | Subitem1 | TableStruct | FigStruct | StyleStruct | List>
}

export const isItem = (obj: EL): obj is Item => {
    return obj.tag === "Item";
}

export interface ItemTitle extends StdEL {
    tag: "ItemTitle"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isItemTitle = (obj: EL): obj is ItemTitle => {
    return obj.tag === "ItemTitle";
}

export interface ItemSentence extends StdEL {
    tag: "ItemSentence"
    attr: {}
    children: Array<Sentence | Column | Table>
}

export const isItemSentence = (obj: EL): obj is ItemSentence => {
    return obj.tag === "ItemSentence";
}

export interface Subitem1 extends StdEL {
    tag: "Subitem1"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<Subitem1Title | Subitem1Sentence | Subitem2 | TableStruct | FigStruct | StyleStruct | List>
}

export const isSubitem1 = (obj: EL): obj is Subitem1 => {
    return obj.tag === "Subitem1";
}

export interface Subitem1Title extends StdEL {
    tag: "Subitem1Title"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isSubitem1Title = (obj: EL): obj is Subitem1Title => {
    return obj.tag === "Subitem1Title";
}

export interface Subitem1Sentence extends StdEL {
    tag: "Subitem1Sentence"
    attr: {}
    children: Array<Sentence | Column | Table>
}

export const isSubitem1Sentence = (obj: EL): obj is Subitem1Sentence => {
    return obj.tag === "Subitem1Sentence";
}

export interface Subitem2 extends StdEL {
    tag: "Subitem2"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<Subitem2Title | Subitem2Sentence | Subitem3 | TableStruct | FigStruct | StyleStruct | List>
}

export const isSubitem2 = (obj: EL): obj is Subitem2 => {
    return obj.tag === "Subitem2";
}

export interface Subitem2Title extends StdEL {
    tag: "Subitem2Title"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isSubitem2Title = (obj: EL): obj is Subitem2Title => {
    return obj.tag === "Subitem2Title";
}

export interface Subitem2Sentence extends StdEL {
    tag: "Subitem2Sentence"
    attr: {}
    children: Array<Sentence | Column | Table>
}

export const isSubitem2Sentence = (obj: EL): obj is Subitem2Sentence => {
    return obj.tag === "Subitem2Sentence";
}

export interface Subitem3 extends StdEL {
    tag: "Subitem3"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<Subitem3Title | Subitem3Sentence | Subitem4 | TableStruct | FigStruct | StyleStruct | List>
}

export const isSubitem3 = (obj: EL): obj is Subitem3 => {
    return obj.tag === "Subitem3";
}

export interface Subitem3Title extends StdEL {
    tag: "Subitem3Title"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isSubitem3Title = (obj: EL): obj is Subitem3Title => {
    return obj.tag === "Subitem3Title";
}

export interface Subitem3Sentence extends StdEL {
    tag: "Subitem3Sentence"
    attr: {}
    children: Array<Sentence | Column | Table>
}

export const isSubitem3Sentence = (obj: EL): obj is Subitem3Sentence => {
    return obj.tag === "Subitem3Sentence";
}

export interface Subitem4 extends StdEL {
    tag: "Subitem4"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<Subitem4Title | Subitem4Sentence | Subitem5 | TableStruct | FigStruct | StyleStruct | List>
}

export const isSubitem4 = (obj: EL): obj is Subitem4 => {
    return obj.tag === "Subitem4";
}

export interface Subitem4Title extends StdEL {
    tag: "Subitem4Title"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isSubitem4Title = (obj: EL): obj is Subitem4Title => {
    return obj.tag === "Subitem4Title";
}

export interface Subitem4Sentence extends StdEL {
    tag: "Subitem4Sentence"
    attr: {}
    children: Array<Sentence | Column | Table>
}

export const isSubitem4Sentence = (obj: EL): obj is Subitem4Sentence => {
    return obj.tag === "Subitem4Sentence";
}

export interface Subitem5 extends StdEL {
    tag: "Subitem5"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<Subitem5Title | Subitem5Sentence | Subitem6 | TableStruct | FigStruct | StyleStruct | List>
}

export const isSubitem5 = (obj: EL): obj is Subitem5 => {
    return obj.tag === "Subitem5";
}

export interface Subitem5Title extends StdEL {
    tag: "Subitem5Title"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isSubitem5Title = (obj: EL): obj is Subitem5Title => {
    return obj.tag === "Subitem5Title";
}

export interface Subitem5Sentence extends StdEL {
    tag: "Subitem5Sentence"
    attr: {}
    children: Array<Sentence | Column | Table>
}

export const isSubitem5Sentence = (obj: EL): obj is Subitem5Sentence => {
    return obj.tag === "Subitem5Sentence";
}

export interface Subitem6 extends StdEL {
    tag: "Subitem6"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<Subitem6Title | Subitem6Sentence | Subitem7 | TableStruct | FigStruct | StyleStruct | List>
}

export const isSubitem6 = (obj: EL): obj is Subitem6 => {
    return obj.tag === "Subitem6";
}

export interface Subitem6Title extends StdEL {
    tag: "Subitem6Title"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isSubitem6Title = (obj: EL): obj is Subitem6Title => {
    return obj.tag === "Subitem6Title";
}

export interface Subitem6Sentence extends StdEL {
    tag: "Subitem6Sentence"
    attr: {}
    children: Array<Sentence | Column | Table>
}

export const isSubitem6Sentence = (obj: EL): obj is Subitem6Sentence => {
    return obj.tag === "Subitem6Sentence";
}

export interface Subitem7 extends StdEL {
    tag: "Subitem7"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<Subitem7Title | Subitem7Sentence | Subitem8 | TableStruct | FigStruct | StyleStruct | List>
}

export const isSubitem7 = (obj: EL): obj is Subitem7 => {
    return obj.tag === "Subitem7";
}

export interface Subitem7Title extends StdEL {
    tag: "Subitem7Title"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isSubitem7Title = (obj: EL): obj is Subitem7Title => {
    return obj.tag === "Subitem7Title";
}

export interface Subitem7Sentence extends StdEL {
    tag: "Subitem7Sentence"
    attr: {}
    children: Array<Sentence | Column | Table>
}

export const isSubitem7Sentence = (obj: EL): obj is Subitem7Sentence => {
    return obj.tag === "Subitem7Sentence";
}

export interface Subitem8 extends StdEL {
    tag: "Subitem8"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<Subitem8Title | Subitem8Sentence | Subitem9 | TableStruct | FigStruct | StyleStruct | List>
}

export const isSubitem8 = (obj: EL): obj is Subitem8 => {
    return obj.tag === "Subitem8";
}

export interface Subitem8Title extends StdEL {
    tag: "Subitem8Title"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isSubitem8Title = (obj: EL): obj is Subitem8Title => {
    return obj.tag === "Subitem8Title";
}

export interface Subitem8Sentence extends StdEL {
    tag: "Subitem8Sentence"
    attr: {}
    children: Array<Sentence | Column | Table>
}

export const isSubitem8Sentence = (obj: EL): obj is Subitem8Sentence => {
    return obj.tag === "Subitem8Sentence";
}

export interface Subitem9 extends StdEL {
    tag: "Subitem9"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<Subitem9Title | Subitem9Sentence | Subitem10 | TableStruct | FigStruct | StyleStruct | List>
}

export const isSubitem9 = (obj: EL): obj is Subitem9 => {
    return obj.tag === "Subitem9";
}

export interface Subitem9Title extends StdEL {
    tag: "Subitem9Title"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isSubitem9Title = (obj: EL): obj is Subitem9Title => {
    return obj.tag === "Subitem9Title";
}

export interface Subitem9Sentence extends StdEL {
    tag: "Subitem9Sentence"
    attr: {}
    children: Array<Sentence | Column | Table>
}

export const isSubitem9Sentence = (obj: EL): obj is Subitem9Sentence => {
    return obj.tag === "Subitem9Sentence";
}

export interface Subitem10 extends StdEL {
    tag: "Subitem10"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<Subitem10Title | Subitem10Sentence | TableStruct | FigStruct | StyleStruct | List>
}

export const isSubitem10 = (obj: EL): obj is Subitem10 => {
    return obj.tag === "Subitem10";
}

export interface Subitem10Title extends StdEL {
    tag: "Subitem10Title"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isSubitem10Title = (obj: EL): obj is Subitem10Title => {
    return obj.tag === "Subitem10Title";
}

export interface Subitem10Sentence extends StdEL {
    tag: "Subitem10Sentence"
    attr: {}
    children: Array<Sentence | Column | Table>
}

export const isSubitem10Sentence = (obj: EL): obj is Subitem10Sentence => {
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
    children: Array<Line | QuoteStruct | ArithFormula | Ruby | Sup | Sub | string | __EL>
}

export const isSentence = (obj: EL): obj is Sentence => {
    return obj.tag === "Sentence";
}

export interface Column extends StdEL {
    tag: "Column"
    attr: {
        Num?: string,
        LineBreak?: string,
        Align?: "left" | "center" | "right" | "justify",
    }
    children: Sentence[]
}

export const isColumn = (obj: EL): obj is Column => {
    return obj.tag === "Column";
}

export interface SupplProvision extends StdEL {
    tag: "SupplProvision"
    attr: {
        Type?: "New" | "Amend",
        AmendLawNum?: string,
        Extract?: string,
    }
    children: Array<SupplProvisionLabel | Chapter | Article | Paragraph | SupplProvisionAppdxTable | SupplProvisionAppdxStyle | SupplProvisionAppdx>
}

export const isSupplProvision = (obj: EL): obj is SupplProvision => {
    return obj.tag === "SupplProvision";
}

export interface SupplProvisionLabel extends StdEL {
    tag: "SupplProvisionLabel"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isSupplProvisionLabel = (obj: EL): obj is SupplProvisionLabel => {
    return obj.tag === "SupplProvisionLabel";
}

export interface SupplProvisionAppdxTable extends StdEL {
    tag: "SupplProvisionAppdxTable"
    attr: {
        Num?: string,
    }
    children: Array<SupplProvisionAppdxTableTitle | RelatedArticleNum | TableStruct>
}

export const isSupplProvisionAppdxTable = (obj: EL): obj is SupplProvisionAppdxTable => {
    return obj.tag === "SupplProvisionAppdxTable";
}

export interface SupplProvisionAppdxTableTitle extends StdEL {
    tag: "SupplProvisionAppdxTableTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isSupplProvisionAppdxTableTitle = (obj: EL): obj is SupplProvisionAppdxTableTitle => {
    return obj.tag === "SupplProvisionAppdxTableTitle";
}

export interface SupplProvisionAppdxStyle extends StdEL {
    tag: "SupplProvisionAppdxStyle"
    attr: {
        Num?: string,
    }
    children: Array<SupplProvisionAppdxStyleTitle | RelatedArticleNum | StyleStruct>
}

export const isSupplProvisionAppdxStyle = (obj: EL): obj is SupplProvisionAppdxStyle => {
    return obj.tag === "SupplProvisionAppdxStyle";
}

export interface SupplProvisionAppdxStyleTitle extends StdEL {
    tag: "SupplProvisionAppdxStyleTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isSupplProvisionAppdxStyleTitle = (obj: EL): obj is SupplProvisionAppdxStyleTitle => {
    return obj.tag === "SupplProvisionAppdxStyleTitle";
}

export interface SupplProvisionAppdx extends StdEL {
    tag: "SupplProvisionAppdx"
    attr: {
        Num?: string,
    }
    children: Array<ArithFormulaNum | RelatedArticleNum | ArithFormula>
}

export const isSupplProvisionAppdx = (obj: EL): obj is SupplProvisionAppdx => {
    return obj.tag === "SupplProvisionAppdx";
}

export interface AppdxTable extends StdEL {
    tag: "AppdxTable"
    attr: {
        Num?: string,
    }
    children: Array<AppdxTableTitle | RelatedArticleNum | TableStruct | Item | Remarks>
}

export const isAppdxTable = (obj: EL): obj is AppdxTable => {
    return obj.tag === "AppdxTable";
}

export interface AppdxTableTitle extends StdEL {
    tag: "AppdxTableTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isAppdxTableTitle = (obj: EL): obj is AppdxTableTitle => {
    return obj.tag === "AppdxTableTitle";
}

export interface AppdxNote extends StdEL {
    tag: "AppdxNote"
    attr: {
        Num?: string,
    }
    children: Array<AppdxNoteTitle | RelatedArticleNum | NoteStruct | FigStruct | TableStruct | Remarks>
}

export const isAppdxNote = (obj: EL): obj is AppdxNote => {
    return obj.tag === "AppdxNote";
}

export interface AppdxNoteTitle extends StdEL {
    tag: "AppdxNoteTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isAppdxNoteTitle = (obj: EL): obj is AppdxNoteTitle => {
    return obj.tag === "AppdxNoteTitle";
}

export interface AppdxStyle extends StdEL {
    tag: "AppdxStyle"
    attr: {
        Num?: string,
    }
    children: Array<AppdxStyleTitle | RelatedArticleNum | StyleStruct | Remarks>
}

export const isAppdxStyle = (obj: EL): obj is AppdxStyle => {
    return obj.tag === "AppdxStyle";
}

export interface AppdxStyleTitle extends StdEL {
    tag: "AppdxStyleTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isAppdxStyleTitle = (obj: EL): obj is AppdxStyleTitle => {
    return obj.tag === "AppdxStyleTitle";
}

export interface AppdxFormat extends StdEL {
    tag: "AppdxFormat"
    attr: {
        Num?: string,
    }
    children: Array<AppdxFormatTitle | RelatedArticleNum | FormatStruct | Remarks>
}

export const isAppdxFormat = (obj: EL): obj is AppdxFormat => {
    return obj.tag === "AppdxFormat";
}

export interface AppdxFormatTitle extends StdEL {
    tag: "AppdxFormatTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isAppdxFormatTitle = (obj: EL): obj is AppdxFormatTitle => {
    return obj.tag === "AppdxFormatTitle";
}

export interface Appdx extends StdEL {
    tag: "Appdx"
    attr: {}
    children: Array<ArithFormulaNum | RelatedArticleNum | ArithFormula | Remarks>
}

export const isAppdx = (obj: EL): obj is Appdx => {
    return obj.tag === "Appdx";
}

export interface ArithFormulaNum extends StdEL {
    tag: "ArithFormulaNum"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isArithFormulaNum = (obj: EL): obj is ArithFormulaNum => {
    return obj.tag === "ArithFormulaNum";
}

export interface ArithFormula extends StdEL {
    tag: "ArithFormula"
    attr: {
        Num?: string,
    }
    children: Array<string | EL>
}

export const isArithFormula = (obj: EL): obj is ArithFormula => {
    return obj.tag === "ArithFormula";
}

export interface AppdxFig extends StdEL {
    tag: "AppdxFig"
    attr: {
        Num?: string,
    }
    children: Array<AppdxFigTitle | RelatedArticleNum | FigStruct | TableStruct>
}

export const isAppdxFig = (obj: EL): obj is AppdxFig => {
    return obj.tag === "AppdxFig";
}

export interface AppdxFigTitle extends StdEL {
    tag: "AppdxFigTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isAppdxFigTitle = (obj: EL): obj is AppdxFigTitle => {
    return obj.tag === "AppdxFigTitle";
}

export interface TableStruct extends StdEL {
    tag: "TableStruct"
    attr: {}
    children: Array<TableStructTitle | Remarks | Table>
}

export const isTableStruct = (obj: EL): obj is TableStruct => {
    return obj.tag === "TableStruct";
}

export interface TableStructTitle extends StdEL {
    tag: "TableStructTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isTableStructTitle = (obj: EL): obj is TableStructTitle => {
    return obj.tag === "TableStructTitle";
}

export interface Table extends StdEL {
    tag: "Table"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<TableHeaderRow | TableRow>
}

export const isTable = (obj: EL): obj is Table => {
    return obj.tag === "Table";
}

export interface TableRow extends StdEL {
    tag: "TableRow"
    attr: {}
    children: TableColumn[]
}

export const isTableRow = (obj: EL): obj is TableRow => {
    return obj.tag === "TableRow";
}

export interface TableHeaderRow extends StdEL {
    tag: "TableHeaderRow"
    attr: {}
    children: TableHeaderColumn[]
}

export const isTableHeaderRow = (obj: EL): obj is TableHeaderRow => {
    return obj.tag === "TableHeaderRow";
}

export interface TableHeaderColumn extends StdEL {
    tag: "TableHeaderColumn"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isTableHeaderColumn = (obj: EL): obj is TableHeaderColumn => {
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
    children: Array<Part | Chapter | Section | Subsection | Division | Article | Paragraph | Item | Subitem1 | Subitem2 | Subitem3 | Subitem4 | Subitem5 | Subitem6 | Subitem7 | Subitem8 | Subitem9 | Subitem10 | FigStruct | Remarks | Sentence | Column>
}

export const isTableColumn = (obj: EL): obj is TableColumn => {
    return obj.tag === "TableColumn";
}

export interface FigStruct extends StdEL {
    tag: "FigStruct"
    attr: {}
    children: Array<FigStructTitle | Remarks | Fig>
}

export const isFigStruct = (obj: EL): obj is FigStruct => {
    return obj.tag === "FigStruct";
}

export interface FigStructTitle extends StdEL {
    tag: "FigStructTitle"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isFigStructTitle = (obj: EL): obj is FigStructTitle => {
    return obj.tag === "FigStructTitle";
}

export interface Fig extends StdEL {
    tag: "Fig"
    attr: {
        src: string,
    }
    children: never[]
}

export const isFig = (obj: EL): obj is Fig => {
    return obj.tag === "Fig";
}

export interface NoteStruct extends StdEL {
    tag: "NoteStruct"
    attr: {}
    children: Array<NoteStructTitle | Remarks | Note>
}

export const isNoteStruct = (obj: EL): obj is NoteStruct => {
    return obj.tag === "NoteStruct";
}

export interface NoteStructTitle extends StdEL {
    tag: "NoteStructTitle"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isNoteStructTitle = (obj: EL): obj is NoteStructTitle => {
    return obj.tag === "NoteStructTitle";
}

export interface Note extends StdEL {
    tag: "Note"
    children: Array<EL | string>
}

export const isNote = (obj: EL): obj is Note => {
    return obj.tag === "Note";
}

export interface StyleStruct extends StdEL {
    tag: "StyleStruct"
    attr: {}
    children: Array<StyleStructTitle | Remarks | Style>
}

export const isStyleStruct = (obj: EL): obj is StyleStruct => {
    return obj.tag === "StyleStruct";
}

export interface StyleStructTitle extends StdEL {
    tag: "StyleStructTitle"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isStyleStructTitle = (obj: EL): obj is StyleStructTitle => {
    return obj.tag === "StyleStructTitle";
}

export interface Style extends StdEL {
    tag: "Style"
    children: Array<EL | string>
}

export const isStyle = (obj: EL): obj is Style => {
    return obj.tag === "Style";
}

export interface FormatStruct extends StdEL {
    tag: "FormatStruct"
    attr: {}
    children: Array<FormatStructTitle | Remarks | Format>
}

export const isFormatStruct = (obj: EL): obj is FormatStruct => {
    return obj.tag === "FormatStruct";
}

export interface FormatStructTitle extends StdEL {
    tag: "FormatStructTitle"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isFormatStructTitle = (obj: EL): obj is FormatStructTitle => {
    return obj.tag === "FormatStructTitle";
}

export interface Format extends StdEL {
    tag: "Format"
    children: Array<EL | string>
}

export const isFormat = (obj: EL): obj is Format => {
    return obj.tag === "Format";
}

export interface RelatedArticleNum extends StdEL {
    tag: "RelatedArticleNum"
    attr: {}
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isRelatedArticleNum = (obj: EL): obj is RelatedArticleNum => {
    return obj.tag === "RelatedArticleNum";
}

export interface Remarks extends StdEL {
    tag: "Remarks"
    attr: {}
    children: Array<RemarksLabel | Item | Sentence>
}

export const isRemarks = (obj: EL): obj is Remarks => {
    return obj.tag === "Remarks";
}

export interface RemarksLabel extends StdEL {
    tag: "RemarksLabel"
    attr: {
        LineBreak?: string,
    }
    children: Array<Line | Ruby | Sup | Sub | string | __EL>
}

export const isRemarksLabel = (obj: EL): obj is RemarksLabel => {
    return obj.tag === "RemarksLabel";
}

export interface List extends StdEL {
    tag: "List"
    attr: {}
    children: Array<ListSentence | Sublist1>
}

export const isList = (obj: EL): obj is List => {
    return obj.tag === "List";
}

export interface ListSentence extends StdEL {
    tag: "ListSentence"
    attr: {}
    children: Array<Sentence | Column>
}

export const isListSentence = (obj: EL): obj is ListSentence => {
    return obj.tag === "ListSentence";
}

export interface Sublist1 extends StdEL {
    tag: "Sublist1"
    attr: {}
    children: Array<Sublist1Sentence | Sublist2>
}

export const isSublist1 = (obj: EL): obj is Sublist1 => {
    return obj.tag === "Sublist1";
}

export interface Sublist1Sentence extends StdEL {
    tag: "Sublist1Sentence"
    attr: {}
    children: Array<Sentence | Column>
}

export const isSublist1Sentence = (obj: EL): obj is Sublist1Sentence => {
    return obj.tag === "Sublist1Sentence";
}

export interface Sublist2 extends StdEL {
    tag: "Sublist2"
    attr: {}
    children: Array<Sublist2Sentence | Sublist3>
}

export const isSublist2 = (obj: EL): obj is Sublist2 => {
    return obj.tag === "Sublist2";
}

export interface Sublist2Sentence extends StdEL {
    tag: "Sublist2Sentence"
    attr: {}
    children: Array<Sentence | Column>
}

export const isSublist2Sentence = (obj: EL): obj is Sublist2Sentence => {
    return obj.tag === "Sublist2Sentence";
}

export interface Sublist3 extends StdEL {
    tag: "Sublist3"
    children: Sublist3Sentence[]
}

export const isSublist3 = (obj: EL): obj is Sublist3 => {
    return obj.tag === "Sublist3";
}

export interface Sublist3Sentence extends StdEL {
    tag: "Sublist3Sentence"
    attr: {}
    children: Array<Sentence | Column>
}

export const isSublist3Sentence = (obj: EL): obj is Sublist3Sentence => {
    return obj.tag === "Sublist3Sentence";
}

export interface QuoteStruct extends StdEL {
    tag: "QuoteStruct"
    children: Array<EL | string>
}

export const isQuoteStruct = (obj: EL): obj is QuoteStruct => {
    return obj.tag === "QuoteStruct";
}

export interface Ruby extends StdEL {
    tag: "Ruby"
    attr: {}
    children: Array<Rt | string | __EL>
}

export const isRuby = (obj: EL): obj is Ruby => {
    return obj.tag === "Ruby";
}

export interface Rt extends StdEL {
    tag: "Rt"
    children: Array<__EL | string>
}

export const isRt = (obj: EL): obj is Rt => {
    return obj.tag === "Rt";
}

export interface Line extends StdEL {
    tag: "Line"
    attr: {
        Style?: "dotted" | "double" | "none" | "solid",
    }
    children: Array<QuoteStruct | ArithFormula | Ruby | Sup | Sub | string | __EL>
}

export const isLine = (obj: EL): obj is Line => {
    return obj.tag === "Line";
}

export interface Sup extends StdEL {
    tag: "Sup"
    children: Array<__EL | string>
}

export const isSup = (obj: EL): obj is Sup => {
    return obj.tag === "Sup";
}

export interface Sub extends StdEL {
    tag: "Sub"
    children: Array<__EL | string>
}

export const isSub = (obj: EL): obj is Sub => {
    return obj.tag === "Sub";
}

