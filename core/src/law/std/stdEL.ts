import { EL } from "../../node/el";
import { Diff } from "../../util";

/**
 * StdEL: a special type of [JsonEL](../../node/el/jsonEL.ts) that complies with the [Standard Law XML Schema](https://elaws.e-gov.go.jp/file/XMLSchemaForJapaneseLaw_v3.xsd).
 */
export type StdEL =
    | Law
    | LawNum
    | LawBody
    | LawTitle
    | EnactStatement
    | TOC
    | TOCLabel
    | TOCPreambleLabel
    | TOCPart
    | TOCChapter
    | TOCSection
    | TOCSubsection
    | TOCDivision
    | TOCArticle
    | TOCSupplProvision
    | TOCAppdxTableLabel
    | ArticleRange
    | Preamble
    | MainProvision
    | Part
    | PartTitle
    | Chapter
    | ChapterTitle
    | Section
    | SectionTitle
    | Subsection
    | SubsectionTitle
    | Division
    | DivisionTitle
    | Article
    | ArticleTitle
    | ArticleCaption
    | Paragraph
    | ParagraphCaption
    | ParagraphNum
    | ParagraphSentence
    | SupplNote
    | AmendProvision
    | AmendProvisionSentence
    | NewProvision
    | Class
    | ClassTitle
    | ClassSentence
    | Item
    | ItemTitle
    | ItemSentence
    | Subitem1
    | Subitem1Title
    | Subitem1Sentence
    | Subitem2
    | Subitem2Title
    | Subitem2Sentence
    | Subitem3
    | Subitem3Title
    | Subitem3Sentence
    | Subitem4
    | Subitem4Title
    | Subitem4Sentence
    | Subitem5
    | Subitem5Title
    | Subitem5Sentence
    | Subitem6
    | Subitem6Title
    | Subitem6Sentence
    | Subitem7
    | Subitem7Title
    | Subitem7Sentence
    | Subitem8
    | Subitem8Title
    | Subitem8Sentence
    | Subitem9
    | Subitem9Title
    | Subitem9Sentence
    | Subitem10
    | Subitem10Title
    | Subitem10Sentence
    | Sentence
    | Column
    | SupplProvision
    | SupplProvisionLabel
    | SupplProvisionAppdxTable
    | SupplProvisionAppdxTableTitle
    | SupplProvisionAppdxStyle
    | SupplProvisionAppdxStyleTitle
    | SupplProvisionAppdx
    | AppdxTable
    | AppdxTableTitle
    | AppdxNote
    | AppdxNoteTitle
    | AppdxStyle
    | AppdxStyleTitle
    | AppdxFormat
    | AppdxFormatTitle
    | Appdx
    | ArithFormulaNum
    | ArithFormula
    | AppdxFig
    | AppdxFigTitle
    | TableStruct
    | TableStructTitle
    | Table
    | TableRow
    | TableHeaderRow
    | TableHeaderColumn
    | TableColumn
    | FigStruct
    | FigStructTitle
    | Fig
    | NoteStruct
    | NoteStructTitle
    | Note
    | StyleStruct
    | StyleStructTitle
    | Style
    | FormatStruct
    | FormatStructTitle
    | Format
    | RelatedArticleNum
    | Remarks
    | RemarksLabel
    | List
    | ListSentence
    | Sublist1
    | Sublist1Sentence
    | Sublist2
    | Sublist2Sentence
    | Sublist3
    | Sublist3Sentence
    | QuoteStruct
    | Ruby
    | Rt
    | Line
    | Sup
    | Sub
    ;

export interface __EL extends EL {
    isControl: true
}

export const isControl = (obj: EL | string): obj is __EL => {
    return (typeof obj !== "string") && obj.isControl;
};

export interface _StdEL extends EL {
    isControl: false
}

export interface Law extends _StdEL {
    tag: "Law"
    attr: {
        Era: "Meiji" | "Taisho" | "Showa" | "Heisei" | "Reiwa",
        Year: string,
        Num: string,
        PromulgateMonth?: string,
        PromulgateDay?: string,
        LawType: "Constitution" | "Act" | "CabinetOrder" | "ImperialOrder" | "MinisterialOrdinance" | "Rule" | "Misc",
        Lang: "ja" | "en",
    }
    children: Array<(LawNum | LawBody)>
}

export const isLaw = (obj: EL | string): obj is Law => {
    return (typeof obj !== "string") && (obj.tag === "Law");
};

const defaultAttrOfLaw = {
} as const;

export interface LawNum extends _StdEL {
    tag: "LawNum"
    children: Array<__EL | string>
}

export const isLawNum = (obj: EL | string): obj is LawNum => {
    return (typeof obj !== "string") && (obj.tag === "LawNum");
};

const defaultAttrOfLawNum = {
} as const;

export interface LawBody extends _StdEL {
    tag: "LawBody"
    attr: {
        Subject?: string,
    }
    children: Array<(LawTitle | EnactStatement | TOC | Preamble | MainProvision | SupplProvision | AppdxTable | AppdxNote | AppdxStyle | Appdx | AppdxFig | AppdxFormat)>
}

export const isLawBody = (obj: EL | string): obj is LawBody => {
    return (typeof obj !== "string") && (obj.tag === "LawBody");
};

const defaultAttrOfLawBody = {
} as const;

export interface LawTitle extends _StdEL {
    tag: "LawTitle"
    attr: {
        Kana?: string,
        Abbrev?: string,
        AbbrevKana?: string,
    }
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isLawTitle = (obj: EL | string): obj is LawTitle => {
    return (typeof obj !== "string") && (obj.tag === "LawTitle");
};

const defaultAttrOfLawTitle = {
} as const;

export interface EnactStatement extends _StdEL {
    tag: "EnactStatement"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isEnactStatement = (obj: EL | string): obj is EnactStatement => {
    return (typeof obj !== "string") && (obj.tag === "EnactStatement");
};

const defaultAttrOfEnactStatement = {} as const;

export interface TOC extends _StdEL {
    tag: "TOC"
    attr: Record<string, never>
    children: Array<(TOCLabel | TOCPreambleLabel | TOCPart | TOCChapter | TOCSection | TOCArticle | TOCSupplProvision | TOCAppdxTableLabel)>
}

export const isTOC = (obj: EL | string): obj is TOC => {
    return (typeof obj !== "string") && (obj.tag === "TOC");
};

const defaultAttrOfTOC = {} as const;

export interface TOCLabel extends _StdEL {
    tag: "TOCLabel"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isTOCLabel = (obj: EL | string): obj is TOCLabel => {
    return (typeof obj !== "string") && (obj.tag === "TOCLabel");
};

const defaultAttrOfTOCLabel = {} as const;

export interface TOCPreambleLabel extends _StdEL {
    tag: "TOCPreambleLabel"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isTOCPreambleLabel = (obj: EL | string): obj is TOCPreambleLabel => {
    return (typeof obj !== "string") && (obj.tag === "TOCPreambleLabel");
};

const defaultAttrOfTOCPreambleLabel = {} as const;

export interface TOCPart extends _StdEL {
    tag: "TOCPart"
    attr: {
        Num: string,
        Delete?: string,
    }
    children: Array<(PartTitle | ArticleRange | TOCChapter)>
}

export const isTOCPart = (obj: EL | string): obj is TOCPart => {
    return (typeof obj !== "string") && (obj.tag === "TOCPart");
};

const defaultAttrOfTOCPart = {
    Delete: "false",
} as const;

export interface TOCChapter extends _StdEL {
    tag: "TOCChapter"
    attr: {
        Num: string,
        Delete?: string,
    }
    children: Array<(ChapterTitle | ArticleRange | TOCSection)>
}

export const isTOCChapter = (obj: EL | string): obj is TOCChapter => {
    return (typeof obj !== "string") && (obj.tag === "TOCChapter");
};

const defaultAttrOfTOCChapter = {
    Delete: "false",
} as const;

export interface TOCSection extends _StdEL {
    tag: "TOCSection"
    attr: {
        Num: string,
        Delete?: string,
    }
    children: Array<(SectionTitle | ArticleRange | TOCSubsection | TOCDivision)>
}

export const isTOCSection = (obj: EL | string): obj is TOCSection => {
    return (typeof obj !== "string") && (obj.tag === "TOCSection");
};

const defaultAttrOfTOCSection = {
    Delete: "false",
} as const;

export interface TOCSubsection extends _StdEL {
    tag: "TOCSubsection"
    attr: {
        Num: string,
        Delete?: string,
    }
    children: Array<(SubsectionTitle | ArticleRange | TOCDivision)>
}

export const isTOCSubsection = (obj: EL | string): obj is TOCSubsection => {
    return (typeof obj !== "string") && (obj.tag === "TOCSubsection");
};

const defaultAttrOfTOCSubsection = {
    Delete: "false",
} as const;

export interface TOCDivision extends _StdEL {
    tag: "TOCDivision"
    attr: {
        Num: string,
        Delete?: string,
    }
    children: Array<(DivisionTitle | ArticleRange)>
}

export const isTOCDivision = (obj: EL | string): obj is TOCDivision => {
    return (typeof obj !== "string") && (obj.tag === "TOCDivision");
};

const defaultAttrOfTOCDivision = {
    Delete: "false",
} as const;

export interface TOCArticle extends _StdEL {
    tag: "TOCArticle"
    attr: {
        Num: string,
        Delete?: string,
    }
    children: Array<(ArticleTitle | ArticleCaption)>
}

export const isTOCArticle = (obj: EL | string): obj is TOCArticle => {
    return (typeof obj !== "string") && (obj.tag === "TOCArticle");
};

const defaultAttrOfTOCArticle = {
    Delete: "false",
} as const;

export interface TOCSupplProvision extends _StdEL {
    tag: "TOCSupplProvision"
    attr: Record<string, never>
    children: Array<(SupplProvisionLabel | ArticleRange | TOCArticle | TOCChapter)>
}

export const isTOCSupplProvision = (obj: EL | string): obj is TOCSupplProvision => {
    return (typeof obj !== "string") && (obj.tag === "TOCSupplProvision");
};

const defaultAttrOfTOCSupplProvision = {} as const;

export interface TOCAppdxTableLabel extends _StdEL {
    tag: "TOCAppdxTableLabel"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isTOCAppdxTableLabel = (obj: EL | string): obj is TOCAppdxTableLabel => {
    return (typeof obj !== "string") && (obj.tag === "TOCAppdxTableLabel");
};

const defaultAttrOfTOCAppdxTableLabel = {} as const;

export interface ArticleRange extends _StdEL {
    tag: "ArticleRange"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isArticleRange = (obj: EL | string): obj is ArticleRange => {
    return (typeof obj !== "string") && (obj.tag === "ArticleRange");
};

const defaultAttrOfArticleRange = {} as const;

export interface Preamble extends _StdEL {
    tag: "Preamble"
    attr: Record<string, never>
    children: Array<(Paragraph)>
}

export const isPreamble = (obj: EL | string): obj is Preamble => {
    return (typeof obj !== "string") && (obj.tag === "Preamble");
};

const defaultAttrOfPreamble = {} as const;

export interface MainProvision extends _StdEL {
    tag: "MainProvision"
    attr: {
        Extract?: string,
    }
    children: Array<(Part | Chapter | Section | Article | Paragraph)>
}

export const isMainProvision = (obj: EL | string): obj is MainProvision => {
    return (typeof obj !== "string") && (obj.tag === "MainProvision");
};

const defaultAttrOfMainProvision = {
} as const;

export interface Part extends _StdEL {
    tag: "Part"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<(PartTitle | Article | Chapter)>
}

export const isPart = (obj: EL | string): obj is Part => {
    return (typeof obj !== "string") && (obj.tag === "Part");
};

const defaultAttrOfPart = {
    Delete: "false",
    Hide: "false",
} as const;

export interface PartTitle extends _StdEL {
    tag: "PartTitle"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isPartTitle = (obj: EL | string): obj is PartTitle => {
    return (typeof obj !== "string") && (obj.tag === "PartTitle");
};

const defaultAttrOfPartTitle = {} as const;

export interface Chapter extends _StdEL {
    tag: "Chapter"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<(ChapterTitle | Article | Section)>
}

export const isChapter = (obj: EL | string): obj is Chapter => {
    return (typeof obj !== "string") && (obj.tag === "Chapter");
};

const defaultAttrOfChapter = {
    Delete: "false",
    Hide: "false",
} as const;

export interface ChapterTitle extends _StdEL {
    tag: "ChapterTitle"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isChapterTitle = (obj: EL | string): obj is ChapterTitle => {
    return (typeof obj !== "string") && (obj.tag === "ChapterTitle");
};

const defaultAttrOfChapterTitle = {} as const;

export interface Section extends _StdEL {
    tag: "Section"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<(SectionTitle | Article | Subsection | Division)>
}

export const isSection = (obj: EL | string): obj is Section => {
    return (typeof obj !== "string") && (obj.tag === "Section");
};

const defaultAttrOfSection = {
    Delete: "false",
    Hide: "false",
} as const;

export interface SectionTitle extends _StdEL {
    tag: "SectionTitle"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isSectionTitle = (obj: EL | string): obj is SectionTitle => {
    return (typeof obj !== "string") && (obj.tag === "SectionTitle");
};

const defaultAttrOfSectionTitle = {} as const;

export interface Subsection extends _StdEL {
    tag: "Subsection"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<(SubsectionTitle | Article | Division)>
}

export const isSubsection = (obj: EL | string): obj is Subsection => {
    return (typeof obj !== "string") && (obj.tag === "Subsection");
};

const defaultAttrOfSubsection = {
    Delete: "false",
    Hide: "false",
} as const;

export interface SubsectionTitle extends _StdEL {
    tag: "SubsectionTitle"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isSubsectionTitle = (obj: EL | string): obj is SubsectionTitle => {
    return (typeof obj !== "string") && (obj.tag === "SubsectionTitle");
};

const defaultAttrOfSubsectionTitle = {} as const;

export interface Division extends _StdEL {
    tag: "Division"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<(DivisionTitle | Article)>
}

export const isDivision = (obj: EL | string): obj is Division => {
    return (typeof obj !== "string") && (obj.tag === "Division");
};

const defaultAttrOfDivision = {
    Delete: "false",
    Hide: "false",
} as const;

export interface DivisionTitle extends _StdEL {
    tag: "DivisionTitle"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isDivisionTitle = (obj: EL | string): obj is DivisionTitle => {
    return (typeof obj !== "string") && (obj.tag === "DivisionTitle");
};

const defaultAttrOfDivisionTitle = {} as const;

export interface Article extends _StdEL {
    tag: "Article"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<(ArticleCaption | ArticleTitle | Paragraph | SupplNote)>
}

export const isArticle = (obj: EL | string): obj is Article => {
    return (typeof obj !== "string") && (obj.tag === "Article");
};

const defaultAttrOfArticle = {
    Delete: "false",
    Hide: "false",
} as const;

export interface ArticleTitle extends _StdEL {
    tag: "ArticleTitle"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isArticleTitle = (obj: EL | string): obj is ArticleTitle => {
    return (typeof obj !== "string") && (obj.tag === "ArticleTitle");
};

const defaultAttrOfArticleTitle = {} as const;

export interface ArticleCaption extends _StdEL {
    tag: "ArticleCaption"
    attr: {
        CommonCaption?: string,
    }
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isArticleCaption = (obj: EL | string): obj is ArticleCaption => {
    return (typeof obj !== "string") && (obj.tag === "ArticleCaption");
};

const defaultAttrOfArticleCaption = {
} as const;

export interface Paragraph extends _StdEL {
    tag: "Paragraph"
    attr: {
        Num: string,
        OldStyle?: string,
        OldNum?: string,
        Hide?: string,
    }
    children: Array<(ParagraphCaption | ParagraphNum | ParagraphSentence | AmendProvision | Class | TableStruct | FigStruct | StyleStruct | Item | List)>
}

export const isParagraph = (obj: EL | string): obj is Paragraph => {
    return (typeof obj !== "string") && (obj.tag === "Paragraph");
};

const defaultAttrOfParagraph = {
    OldStyle: "false",
    OldNum: "false",
    Hide: "false",
} as const;

export interface ParagraphCaption extends _StdEL {
    tag: "ParagraphCaption"
    attr: {
        CommonCaption?: string,
    }
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isParagraphCaption = (obj: EL | string): obj is ParagraphCaption => {
    return (typeof obj !== "string") && (obj.tag === "ParagraphCaption");
};

const defaultAttrOfParagraphCaption = {
} as const;

export interface ParagraphNum extends _StdEL {
    tag: "ParagraphNum"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isParagraphNum = (obj: EL | string): obj is ParagraphNum => {
    return (typeof obj !== "string") && (obj.tag === "ParagraphNum");
};

const defaultAttrOfParagraphNum = {} as const;

export interface ParagraphSentence extends _StdEL {
    tag: "ParagraphSentence"
    attr: Record<string, never>
    children: Array<(Sentence)>
}

export const isParagraphSentence = (obj: EL | string): obj is ParagraphSentence => {
    return (typeof obj !== "string") && (obj.tag === "ParagraphSentence");
};

const defaultAttrOfParagraphSentence = {} as const;

export interface SupplNote extends _StdEL {
    tag: "SupplNote"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isSupplNote = (obj: EL | string): obj is SupplNote => {
    return (typeof obj !== "string") && (obj.tag === "SupplNote");
};

const defaultAttrOfSupplNote = {} as const;

export interface AmendProvision extends _StdEL {
    tag: "AmendProvision"
    attr: Record<string, never>
    children: Array<(AmendProvisionSentence | NewProvision)>
}

export const isAmendProvision = (obj: EL | string): obj is AmendProvision => {
    return (typeof obj !== "string") && (obj.tag === "AmendProvision");
};

const defaultAttrOfAmendProvision = {} as const;

export interface AmendProvisionSentence extends _StdEL {
    tag: "AmendProvisionSentence"
    attr: Record<string, never>
    children: Array<(Sentence)>
}

export const isAmendProvisionSentence = (obj: EL | string): obj is AmendProvisionSentence => {
    return (typeof obj !== "string") && (obj.tag === "AmendProvisionSentence");
};

const defaultAttrOfAmendProvisionSentence = {} as const;

export interface NewProvision extends _StdEL {
    tag: "NewProvision"
    attr: Record<string, never>
    children: Array<(LawTitle | Preamble | TOC | Part | PartTitle | Chapter | ChapterTitle | Section | SectionTitle | Subsection | SubsectionTitle | Division | DivisionTitle | Article | SupplNote | Paragraph | Item | Subitem1 | Subitem2 | Subitem3 | Subitem4 | Subitem5 | Subitem6 | Subitem7 | Subitem8 | Subitem9 | Subitem10 | List | Sentence | AmendProvision | AppdxTable | AppdxNote | AppdxStyle | Appdx | AppdxFig | AppdxFormat | SupplProvisionAppdxStyle | SupplProvisionAppdxTable | SupplProvisionAppdx | TableStruct | TableRow | TableColumn | FigStruct | NoteStruct | StyleStruct | FormatStruct | Remarks | LawBody)>
}

export const isNewProvision = (obj: EL | string): obj is NewProvision => {
    return (typeof obj !== "string") && (obj.tag === "NewProvision");
};

const defaultAttrOfNewProvision = {} as const;

export interface Class extends _StdEL {
    tag: "Class"
    attr: {
        Num: string,
    }
    children: Array<(ClassTitle | ClassSentence | Item)>
}

export const isClass = (obj: EL | string): obj is Class => {
    return (typeof obj !== "string") && (obj.tag === "Class");
};

const defaultAttrOfClass = {
} as const;

export interface ClassTitle extends _StdEL {
    tag: "ClassTitle"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isClassTitle = (obj: EL | string): obj is ClassTitle => {
    return (typeof obj !== "string") && (obj.tag === "ClassTitle");
};

const defaultAttrOfClassTitle = {} as const;

export interface ClassSentence extends _StdEL {
    tag: "ClassSentence"
    attr: Record<string, never>
    children: Array<(Sentence | Column | Table)>
}

export const isClassSentence = (obj: EL | string): obj is ClassSentence => {
    return (typeof obj !== "string") && (obj.tag === "ClassSentence");
};

const defaultAttrOfClassSentence = {} as const;

export interface Item extends _StdEL {
    tag: "Item"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<(ItemTitle | ItemSentence | Subitem1 | TableStruct | FigStruct | StyleStruct | List)>
}

export const isItem = (obj: EL | string): obj is Item => {
    return (typeof obj !== "string") && (obj.tag === "Item");
};

const defaultAttrOfItem = {
    Delete: "false",
    Hide: "false",
} as const;

export interface ItemTitle extends _StdEL {
    tag: "ItemTitle"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isItemTitle = (obj: EL | string): obj is ItemTitle => {
    return (typeof obj !== "string") && (obj.tag === "ItemTitle");
};

const defaultAttrOfItemTitle = {} as const;

export interface ItemSentence extends _StdEL {
    tag: "ItemSentence"
    attr: Record<string, never>
    children: Array<(Sentence | Column | Table)>
}

export const isItemSentence = (obj: EL | string): obj is ItemSentence => {
    return (typeof obj !== "string") && (obj.tag === "ItemSentence");
};

const defaultAttrOfItemSentence = {} as const;

export interface Subitem1 extends _StdEL {
    tag: "Subitem1"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<(Subitem1Title | Subitem1Sentence | Subitem2 | TableStruct | FigStruct | StyleStruct | List)>
}

export const isSubitem1 = (obj: EL | string): obj is Subitem1 => {
    return (typeof obj !== "string") && (obj.tag === "Subitem1");
};

const defaultAttrOfSubitem1 = {
    Delete: "false",
    Hide: "false",
} as const;

export interface Subitem1Title extends _StdEL {
    tag: "Subitem1Title"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isSubitem1Title = (obj: EL | string): obj is Subitem1Title => {
    return (typeof obj !== "string") && (obj.tag === "Subitem1Title");
};

const defaultAttrOfSubitem1Title = {} as const;

export interface Subitem1Sentence extends _StdEL {
    tag: "Subitem1Sentence"
    attr: Record<string, never>
    children: Array<(Sentence | Column | Table)>
}

export const isSubitem1Sentence = (obj: EL | string): obj is Subitem1Sentence => {
    return (typeof obj !== "string") && (obj.tag === "Subitem1Sentence");
};

const defaultAttrOfSubitem1Sentence = {} as const;

export interface Subitem2 extends _StdEL {
    tag: "Subitem2"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<(Subitem2Title | Subitem2Sentence | Subitem3 | TableStruct | FigStruct | StyleStruct | List)>
}

export const isSubitem2 = (obj: EL | string): obj is Subitem2 => {
    return (typeof obj !== "string") && (obj.tag === "Subitem2");
};

const defaultAttrOfSubitem2 = {
    Delete: "false",
    Hide: "false",
} as const;

export interface Subitem2Title extends _StdEL {
    tag: "Subitem2Title"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isSubitem2Title = (obj: EL | string): obj is Subitem2Title => {
    return (typeof obj !== "string") && (obj.tag === "Subitem2Title");
};

const defaultAttrOfSubitem2Title = {} as const;

export interface Subitem2Sentence extends _StdEL {
    tag: "Subitem2Sentence"
    attr: Record<string, never>
    children: Array<(Sentence | Column | Table)>
}

export const isSubitem2Sentence = (obj: EL | string): obj is Subitem2Sentence => {
    return (typeof obj !== "string") && (obj.tag === "Subitem2Sentence");
};

const defaultAttrOfSubitem2Sentence = {} as const;

export interface Subitem3 extends _StdEL {
    tag: "Subitem3"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<(Subitem3Title | Subitem3Sentence | Subitem4 | TableStruct | FigStruct | StyleStruct | List)>
}

export const isSubitem3 = (obj: EL | string): obj is Subitem3 => {
    return (typeof obj !== "string") && (obj.tag === "Subitem3");
};

const defaultAttrOfSubitem3 = {
    Delete: "false",
    Hide: "false",
} as const;

export interface Subitem3Title extends _StdEL {
    tag: "Subitem3Title"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isSubitem3Title = (obj: EL | string): obj is Subitem3Title => {
    return (typeof obj !== "string") && (obj.tag === "Subitem3Title");
};

const defaultAttrOfSubitem3Title = {} as const;

export interface Subitem3Sentence extends _StdEL {
    tag: "Subitem3Sentence"
    attr: Record<string, never>
    children: Array<(Sentence | Column | Table)>
}

export const isSubitem3Sentence = (obj: EL | string): obj is Subitem3Sentence => {
    return (typeof obj !== "string") && (obj.tag === "Subitem3Sentence");
};

const defaultAttrOfSubitem3Sentence = {} as const;

export interface Subitem4 extends _StdEL {
    tag: "Subitem4"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<(Subitem4Title | Subitem4Sentence | Subitem5 | TableStruct | FigStruct | StyleStruct | List)>
}

export const isSubitem4 = (obj: EL | string): obj is Subitem4 => {
    return (typeof obj !== "string") && (obj.tag === "Subitem4");
};

const defaultAttrOfSubitem4 = {
    Delete: "false",
    Hide: "false",
} as const;

export interface Subitem4Title extends _StdEL {
    tag: "Subitem4Title"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isSubitem4Title = (obj: EL | string): obj is Subitem4Title => {
    return (typeof obj !== "string") && (obj.tag === "Subitem4Title");
};

const defaultAttrOfSubitem4Title = {} as const;

export interface Subitem4Sentence extends _StdEL {
    tag: "Subitem4Sentence"
    attr: Record<string, never>
    children: Array<(Sentence | Column | Table)>
}

export const isSubitem4Sentence = (obj: EL | string): obj is Subitem4Sentence => {
    return (typeof obj !== "string") && (obj.tag === "Subitem4Sentence");
};

const defaultAttrOfSubitem4Sentence = {} as const;

export interface Subitem5 extends _StdEL {
    tag: "Subitem5"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<(Subitem5Title | Subitem5Sentence | Subitem6 | TableStruct | FigStruct | StyleStruct | List)>
}

export const isSubitem5 = (obj: EL | string): obj is Subitem5 => {
    return (typeof obj !== "string") && (obj.tag === "Subitem5");
};

const defaultAttrOfSubitem5 = {
    Delete: "false",
    Hide: "false",
} as const;

export interface Subitem5Title extends _StdEL {
    tag: "Subitem5Title"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isSubitem5Title = (obj: EL | string): obj is Subitem5Title => {
    return (typeof obj !== "string") && (obj.tag === "Subitem5Title");
};

const defaultAttrOfSubitem5Title = {} as const;

export interface Subitem5Sentence extends _StdEL {
    tag: "Subitem5Sentence"
    attr: Record<string, never>
    children: Array<(Sentence | Column | Table)>
}

export const isSubitem5Sentence = (obj: EL | string): obj is Subitem5Sentence => {
    return (typeof obj !== "string") && (obj.tag === "Subitem5Sentence");
};

const defaultAttrOfSubitem5Sentence = {} as const;

export interface Subitem6 extends _StdEL {
    tag: "Subitem6"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<(Subitem6Title | Subitem6Sentence | Subitem7 | TableStruct | FigStruct | StyleStruct | List)>
}

export const isSubitem6 = (obj: EL | string): obj is Subitem6 => {
    return (typeof obj !== "string") && (obj.tag === "Subitem6");
};

const defaultAttrOfSubitem6 = {
    Delete: "false",
    Hide: "false",
} as const;

export interface Subitem6Title extends _StdEL {
    tag: "Subitem6Title"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isSubitem6Title = (obj: EL | string): obj is Subitem6Title => {
    return (typeof obj !== "string") && (obj.tag === "Subitem6Title");
};

const defaultAttrOfSubitem6Title = {} as const;

export interface Subitem6Sentence extends _StdEL {
    tag: "Subitem6Sentence"
    attr: Record<string, never>
    children: Array<(Sentence | Column | Table)>
}

export const isSubitem6Sentence = (obj: EL | string): obj is Subitem6Sentence => {
    return (typeof obj !== "string") && (obj.tag === "Subitem6Sentence");
};

const defaultAttrOfSubitem6Sentence = {} as const;

export interface Subitem7 extends _StdEL {
    tag: "Subitem7"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<(Subitem7Title | Subitem7Sentence | Subitem8 | TableStruct | FigStruct | StyleStruct | List)>
}

export const isSubitem7 = (obj: EL | string): obj is Subitem7 => {
    return (typeof obj !== "string") && (obj.tag === "Subitem7");
};

const defaultAttrOfSubitem7 = {
    Delete: "false",
    Hide: "false",
} as const;

export interface Subitem7Title extends _StdEL {
    tag: "Subitem7Title"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isSubitem7Title = (obj: EL | string): obj is Subitem7Title => {
    return (typeof obj !== "string") && (obj.tag === "Subitem7Title");
};

const defaultAttrOfSubitem7Title = {} as const;

export interface Subitem7Sentence extends _StdEL {
    tag: "Subitem7Sentence"
    attr: Record<string, never>
    children: Array<(Sentence | Column | Table)>
}

export const isSubitem7Sentence = (obj: EL | string): obj is Subitem7Sentence => {
    return (typeof obj !== "string") && (obj.tag === "Subitem7Sentence");
};

const defaultAttrOfSubitem7Sentence = {} as const;

export interface Subitem8 extends _StdEL {
    tag: "Subitem8"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<(Subitem8Title | Subitem8Sentence | Subitem9 | TableStruct | FigStruct | StyleStruct | List)>
}

export const isSubitem8 = (obj: EL | string): obj is Subitem8 => {
    return (typeof obj !== "string") && (obj.tag === "Subitem8");
};

const defaultAttrOfSubitem8 = {
    Delete: "false",
    Hide: "false",
} as const;

export interface Subitem8Title extends _StdEL {
    tag: "Subitem8Title"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isSubitem8Title = (obj: EL | string): obj is Subitem8Title => {
    return (typeof obj !== "string") && (obj.tag === "Subitem8Title");
};

const defaultAttrOfSubitem8Title = {} as const;

export interface Subitem8Sentence extends _StdEL {
    tag: "Subitem8Sentence"
    attr: Record<string, never>
    children: Array<(Sentence | Column | Table)>
}

export const isSubitem8Sentence = (obj: EL | string): obj is Subitem8Sentence => {
    return (typeof obj !== "string") && (obj.tag === "Subitem8Sentence");
};

const defaultAttrOfSubitem8Sentence = {} as const;

export interface Subitem9 extends _StdEL {
    tag: "Subitem9"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<(Subitem9Title | Subitem9Sentence | Subitem10 | TableStruct | FigStruct | StyleStruct | List)>
}

export const isSubitem9 = (obj: EL | string): obj is Subitem9 => {
    return (typeof obj !== "string") && (obj.tag === "Subitem9");
};

const defaultAttrOfSubitem9 = {
    Delete: "false",
    Hide: "false",
} as const;

export interface Subitem9Title extends _StdEL {
    tag: "Subitem9Title"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isSubitem9Title = (obj: EL | string): obj is Subitem9Title => {
    return (typeof obj !== "string") && (obj.tag === "Subitem9Title");
};

const defaultAttrOfSubitem9Title = {} as const;

export interface Subitem9Sentence extends _StdEL {
    tag: "Subitem9Sentence"
    attr: Record<string, never>
    children: Array<(Sentence | Column | Table)>
}

export const isSubitem9Sentence = (obj: EL | string): obj is Subitem9Sentence => {
    return (typeof obj !== "string") && (obj.tag === "Subitem9Sentence");
};

const defaultAttrOfSubitem9Sentence = {} as const;

export interface Subitem10 extends _StdEL {
    tag: "Subitem10"
    attr: {
        Num: string,
        Delete?: string,
        Hide?: string,
    }
    children: Array<(Subitem10Title | Subitem10Sentence | TableStruct | FigStruct | StyleStruct | List)>
}

export const isSubitem10 = (obj: EL | string): obj is Subitem10 => {
    return (typeof obj !== "string") && (obj.tag === "Subitem10");
};

const defaultAttrOfSubitem10 = {
    Delete: "false",
    Hide: "false",
} as const;

export interface Subitem10Title extends _StdEL {
    tag: "Subitem10Title"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isSubitem10Title = (obj: EL | string): obj is Subitem10Title => {
    return (typeof obj !== "string") && (obj.tag === "Subitem10Title");
};

const defaultAttrOfSubitem10Title = {} as const;

export interface Subitem10Sentence extends _StdEL {
    tag: "Subitem10Sentence"
    attr: Record<string, never>
    children: Array<(Sentence | Column | Table)>
}

export const isSubitem10Sentence = (obj: EL | string): obj is Subitem10Sentence => {
    return (typeof obj !== "string") && (obj.tag === "Subitem10Sentence");
};

const defaultAttrOfSubitem10Sentence = {} as const;

export interface Sentence extends _StdEL {
    tag: "Sentence"
    attr: {
        Num?: string,
        Function?: "main" | "proviso",
        Indent?: "Paragraph" | "Item" | "Subitem1" | "Subitem2" | "Subitem3" | "Subitem4" | "Subitem5" | "Subitem6" | "Subitem7" | "Subitem8" | "Subitem9" | "Subitem10",
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<(Line | QuoteStruct | ArithFormula | Ruby | Sup | Sub | string | __EL)>
}

export const isSentence = (obj: EL | string): obj is Sentence => {
    return (typeof obj !== "string") && (obj.tag === "Sentence");
};

const defaultAttrOfSentence = {
    WritingMode: "vertical",
} as const;

export interface Column extends _StdEL {
    tag: "Column"
    attr: {
        Num?: string,
        LineBreak?: string,
        Align?: "left" | "center" | "right" | "justify",
    }
    children: Array<(Sentence)>
}

export const isColumn = (obj: EL | string): obj is Column => {
    return (typeof obj !== "string") && (obj.tag === "Column");
};

const defaultAttrOfColumn = {
    LineBreak: "false",
} as const;

export interface SupplProvision extends _StdEL {
    tag: "SupplProvision"
    attr: {
        Type?: "New" | "Amend",
        AmendLawNum?: string,
        Extract?: string,
    }
    children: Array<(SupplProvisionLabel | Chapter | Article | Paragraph | SupplProvisionAppdxTable | SupplProvisionAppdxStyle | SupplProvisionAppdx)>
}

export const isSupplProvision = (obj: EL | string): obj is SupplProvision => {
    return (typeof obj !== "string") && (obj.tag === "SupplProvision");
};

const defaultAttrOfSupplProvision = {
} as const;

export interface SupplProvisionLabel extends _StdEL {
    tag: "SupplProvisionLabel"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isSupplProvisionLabel = (obj: EL | string): obj is SupplProvisionLabel => {
    return (typeof obj !== "string") && (obj.tag === "SupplProvisionLabel");
};

const defaultAttrOfSupplProvisionLabel = {} as const;

export interface SupplProvisionAppdxTable extends _StdEL {
    tag: "SupplProvisionAppdxTable"
    attr: {
        Num?: string,
    }
    children: Array<(SupplProvisionAppdxTableTitle | RelatedArticleNum | TableStruct)>
}

export const isSupplProvisionAppdxTable = (obj: EL | string): obj is SupplProvisionAppdxTable => {
    return (typeof obj !== "string") && (obj.tag === "SupplProvisionAppdxTable");
};

const defaultAttrOfSupplProvisionAppdxTable = {
} as const;

export interface SupplProvisionAppdxTableTitle extends _StdEL {
    tag: "SupplProvisionAppdxTableTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isSupplProvisionAppdxTableTitle = (obj: EL | string): obj is SupplProvisionAppdxTableTitle => {
    return (typeof obj !== "string") && (obj.tag === "SupplProvisionAppdxTableTitle");
};

const defaultAttrOfSupplProvisionAppdxTableTitle = {
    WritingMode: "vertical",
} as const;

export interface SupplProvisionAppdxStyle extends _StdEL {
    tag: "SupplProvisionAppdxStyle"
    attr: {
        Num?: string,
    }
    children: Array<(SupplProvisionAppdxStyleTitle | RelatedArticleNum | StyleStruct)>
}

export const isSupplProvisionAppdxStyle = (obj: EL | string): obj is SupplProvisionAppdxStyle => {
    return (typeof obj !== "string") && (obj.tag === "SupplProvisionAppdxStyle");
};

const defaultAttrOfSupplProvisionAppdxStyle = {
} as const;

export interface SupplProvisionAppdxStyleTitle extends _StdEL {
    tag: "SupplProvisionAppdxStyleTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isSupplProvisionAppdxStyleTitle = (obj: EL | string): obj is SupplProvisionAppdxStyleTitle => {
    return (typeof obj !== "string") && (obj.tag === "SupplProvisionAppdxStyleTitle");
};

const defaultAttrOfSupplProvisionAppdxStyleTitle = {
    WritingMode: "vertical",
} as const;

export interface SupplProvisionAppdx extends _StdEL {
    tag: "SupplProvisionAppdx"
    attr: {
        Num?: string,
    }
    children: Array<(ArithFormulaNum | RelatedArticleNum | ArithFormula)>
}

export const isSupplProvisionAppdx = (obj: EL | string): obj is SupplProvisionAppdx => {
    return (typeof obj !== "string") && (obj.tag === "SupplProvisionAppdx");
};

const defaultAttrOfSupplProvisionAppdx = {
} as const;

export interface AppdxTable extends _StdEL {
    tag: "AppdxTable"
    attr: {
        Num?: string,
    }
    children: Array<(AppdxTableTitle | RelatedArticleNum | TableStruct | Item | Remarks)>
}

export const isAppdxTable = (obj: EL | string): obj is AppdxTable => {
    return (typeof obj !== "string") && (obj.tag === "AppdxTable");
};

const defaultAttrOfAppdxTable = {
} as const;

export interface AppdxTableTitle extends _StdEL {
    tag: "AppdxTableTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isAppdxTableTitle = (obj: EL | string): obj is AppdxTableTitle => {
    return (typeof obj !== "string") && (obj.tag === "AppdxTableTitle");
};

const defaultAttrOfAppdxTableTitle = {
    WritingMode: "vertical",
} as const;

export interface AppdxNote extends _StdEL {
    tag: "AppdxNote"
    attr: {
        Num?: string,
    }
    children: Array<(AppdxNoteTitle | RelatedArticleNum | NoteStruct | FigStruct | TableStruct | Remarks)>
}

export const isAppdxNote = (obj: EL | string): obj is AppdxNote => {
    return (typeof obj !== "string") && (obj.tag === "AppdxNote");
};

const defaultAttrOfAppdxNote = {
} as const;

export interface AppdxNoteTitle extends _StdEL {
    tag: "AppdxNoteTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isAppdxNoteTitle = (obj: EL | string): obj is AppdxNoteTitle => {
    return (typeof obj !== "string") && (obj.tag === "AppdxNoteTitle");
};

const defaultAttrOfAppdxNoteTitle = {
    WritingMode: "vertical",
} as const;

export interface AppdxStyle extends _StdEL {
    tag: "AppdxStyle"
    attr: {
        Num?: string,
    }
    children: Array<(AppdxStyleTitle | RelatedArticleNum | StyleStruct | Remarks)>
}

export const isAppdxStyle = (obj: EL | string): obj is AppdxStyle => {
    return (typeof obj !== "string") && (obj.tag === "AppdxStyle");
};

const defaultAttrOfAppdxStyle = {
} as const;

export interface AppdxStyleTitle extends _StdEL {
    tag: "AppdxStyleTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isAppdxStyleTitle = (obj: EL | string): obj is AppdxStyleTitle => {
    return (typeof obj !== "string") && (obj.tag === "AppdxStyleTitle");
};

const defaultAttrOfAppdxStyleTitle = {
    WritingMode: "vertical",
} as const;

export interface AppdxFormat extends _StdEL {
    tag: "AppdxFormat"
    attr: {
        Num?: string,
    }
    children: Array<(AppdxFormatTitle | RelatedArticleNum | FormatStruct | Remarks)>
}

export const isAppdxFormat = (obj: EL | string): obj is AppdxFormat => {
    return (typeof obj !== "string") && (obj.tag === "AppdxFormat");
};

const defaultAttrOfAppdxFormat = {
} as const;

export interface AppdxFormatTitle extends _StdEL {
    tag: "AppdxFormatTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isAppdxFormatTitle = (obj: EL | string): obj is AppdxFormatTitle => {
    return (typeof obj !== "string") && (obj.tag === "AppdxFormatTitle");
};

const defaultAttrOfAppdxFormatTitle = {
    WritingMode: "vertical",
} as const;

export interface Appdx extends _StdEL {
    tag: "Appdx"
    attr: Record<string, never>
    children: Array<(ArithFormulaNum | RelatedArticleNum | ArithFormula | Remarks)>
}

export const isAppdx = (obj: EL | string): obj is Appdx => {
    return (typeof obj !== "string") && (obj.tag === "Appdx");
};

const defaultAttrOfAppdx = {} as const;

export interface ArithFormulaNum extends _StdEL {
    tag: "ArithFormulaNum"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isArithFormulaNum = (obj: EL | string): obj is ArithFormulaNum => {
    return (typeof obj !== "string") && (obj.tag === "ArithFormulaNum");
};

const defaultAttrOfArithFormulaNum = {} as const;

export interface ArithFormula extends _StdEL {
    tag: "ArithFormula"
    attr: {
        Num?: string,
    }
    children: Array<(string | StdEL | __EL)>
}

export const isArithFormula = (obj: EL | string): obj is ArithFormula => {
    return (typeof obj !== "string") && (obj.tag === "ArithFormula");
};

const defaultAttrOfArithFormula = {
} as const;

export interface AppdxFig extends _StdEL {
    tag: "AppdxFig"
    attr: {
        Num?: string,
    }
    children: Array<(AppdxFigTitle | RelatedArticleNum | FigStruct | TableStruct)>
}

export const isAppdxFig = (obj: EL | string): obj is AppdxFig => {
    return (typeof obj !== "string") && (obj.tag === "AppdxFig");
};

const defaultAttrOfAppdxFig = {
} as const;

export interface AppdxFigTitle extends _StdEL {
    tag: "AppdxFigTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isAppdxFigTitle = (obj: EL | string): obj is AppdxFigTitle => {
    return (typeof obj !== "string") && (obj.tag === "AppdxFigTitle");
};

const defaultAttrOfAppdxFigTitle = {
    WritingMode: "vertical",
} as const;

export interface TableStruct extends _StdEL {
    tag: "TableStruct"
    attr: Record<string, never>
    children: Array<(TableStructTitle | Remarks | Table)>
}

export const isTableStruct = (obj: EL | string): obj is TableStruct => {
    return (typeof obj !== "string") && (obj.tag === "TableStruct");
};

const defaultAttrOfTableStruct = {} as const;

export interface TableStructTitle extends _StdEL {
    tag: "TableStructTitle"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isTableStructTitle = (obj: EL | string): obj is TableStructTitle => {
    return (typeof obj !== "string") && (obj.tag === "TableStructTitle");
};

const defaultAttrOfTableStructTitle = {
    WritingMode: "vertical",
} as const;

export interface Table extends _StdEL {
    tag: "Table"
    attr: {
        WritingMode?: "vertical" | "horizontal",
    }
    children: Array<(TableHeaderRow | TableRow)>
}

export const isTable = (obj: EL | string): obj is Table => {
    return (typeof obj !== "string") && (obj.tag === "Table");
};

const defaultAttrOfTable = {
    WritingMode: "vertical",
} as const;

export interface TableRow extends _StdEL {
    tag: "TableRow"
    attr: Record<string, never>
    children: Array<(TableColumn)>
}

export const isTableRow = (obj: EL | string): obj is TableRow => {
    return (typeof obj !== "string") && (obj.tag === "TableRow");
};

const defaultAttrOfTableRow = {} as const;

export interface TableHeaderRow extends _StdEL {
    tag: "TableHeaderRow"
    attr: Record<string, never>
    children: Array<(TableHeaderColumn)>
}

export const isTableHeaderRow = (obj: EL | string): obj is TableHeaderRow => {
    return (typeof obj !== "string") && (obj.tag === "TableHeaderRow");
};

const defaultAttrOfTableHeaderRow = {} as const;

export interface TableHeaderColumn extends _StdEL {
    tag: "TableHeaderColumn"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isTableHeaderColumn = (obj: EL | string): obj is TableHeaderColumn => {
    return (typeof obj !== "string") && (obj.tag === "TableHeaderColumn");
};

const defaultAttrOfTableHeaderColumn = {} as const;

export interface TableColumn extends _StdEL {
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
    children: Array<(Part | Chapter | Section | Subsection | Division | Article | Paragraph | Item | Subitem1 | Subitem2 | Subitem3 | Subitem4 | Subitem5 | Subitem6 | Subitem7 | Subitem8 | Subitem9 | Subitem10 | FigStruct | Remarks | Sentence | Column)>
}

export const isTableColumn = (obj: EL | string): obj is TableColumn => {
    return (typeof obj !== "string") && (obj.tag === "TableColumn");
};

const defaultAttrOfTableColumn = {
    BorderTop: "solid",
    BorderBottom: "solid",
    BorderLeft: "solid",
    BorderRight: "solid",
} as const;

export interface FigStruct extends _StdEL {
    tag: "FigStruct"
    attr: Record<string, never>
    children: Array<(FigStructTitle | Remarks | Fig)>
}

export const isFigStruct = (obj: EL | string): obj is FigStruct => {
    return (typeof obj !== "string") && (obj.tag === "FigStruct");
};

const defaultAttrOfFigStruct = {} as const;

export interface FigStructTitle extends _StdEL {
    tag: "FigStructTitle"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isFigStructTitle = (obj: EL | string): obj is FigStructTitle => {
    return (typeof obj !== "string") && (obj.tag === "FigStructTitle");
};

const defaultAttrOfFigStructTitle = {} as const;

export interface Fig extends _StdEL {
    tag: "Fig"
    attr: {
        src: string,
    }
    children: never[]
}

export const isFig = (obj: EL | string): obj is Fig => {
    return (typeof obj !== "string") && (obj.tag === "Fig");
};

const defaultAttrOfFig = {
} as const;

export interface NoteStruct extends _StdEL {
    tag: "NoteStruct"
    attr: Record<string, never>
    children: Array<(NoteStructTitle | Remarks | Note)>
}

export const isNoteStruct = (obj: EL | string): obj is NoteStruct => {
    return (typeof obj !== "string") && (obj.tag === "NoteStruct");
};

const defaultAttrOfNoteStruct = {} as const;

export interface NoteStructTitle extends _StdEL {
    tag: "NoteStructTitle"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isNoteStructTitle = (obj: EL | string): obj is NoteStructTitle => {
    return (typeof obj !== "string") && (obj.tag === "NoteStructTitle");
};

const defaultAttrOfNoteStructTitle = {} as const;

export interface Note extends _StdEL {
    tag: "Note"
    children: Array<StdEL | __EL | string>
}

export const isNote = (obj: EL | string): obj is Note => {
    return (typeof obj !== "string") && (obj.tag === "Note");
};

const defaultAttrOfNote = {
} as const;

export interface StyleStruct extends _StdEL {
    tag: "StyleStruct"
    attr: Record<string, never>
    children: Array<(StyleStructTitle | Remarks | Style)>
}

export const isStyleStruct = (obj: EL | string): obj is StyleStruct => {
    return (typeof obj !== "string") && (obj.tag === "StyleStruct");
};

const defaultAttrOfStyleStruct = {} as const;

export interface StyleStructTitle extends _StdEL {
    tag: "StyleStructTitle"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isStyleStructTitle = (obj: EL | string): obj is StyleStructTitle => {
    return (typeof obj !== "string") && (obj.tag === "StyleStructTitle");
};

const defaultAttrOfStyleStructTitle = {} as const;

export interface Style extends _StdEL {
    tag: "Style"
    children: Array<StdEL | __EL | string>
}

export const isStyle = (obj: EL | string): obj is Style => {
    return (typeof obj !== "string") && (obj.tag === "Style");
};

const defaultAttrOfStyle = {
} as const;

export interface FormatStruct extends _StdEL {
    tag: "FormatStruct"
    attr: Record<string, never>
    children: Array<(FormatStructTitle | Remarks | Format)>
}

export const isFormatStruct = (obj: EL | string): obj is FormatStruct => {
    return (typeof obj !== "string") && (obj.tag === "FormatStruct");
};

const defaultAttrOfFormatStruct = {} as const;

export interface FormatStructTitle extends _StdEL {
    tag: "FormatStructTitle"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isFormatStructTitle = (obj: EL | string): obj is FormatStructTitle => {
    return (typeof obj !== "string") && (obj.tag === "FormatStructTitle");
};

const defaultAttrOfFormatStructTitle = {} as const;

export interface Format extends _StdEL {
    tag: "Format"
    children: Array<StdEL | __EL | string>
}

export const isFormat = (obj: EL | string): obj is Format => {
    return (typeof obj !== "string") && (obj.tag === "Format");
};

const defaultAttrOfFormat = {
} as const;

export interface RelatedArticleNum extends _StdEL {
    tag: "RelatedArticleNum"
    attr: Record<string, never>
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isRelatedArticleNum = (obj: EL | string): obj is RelatedArticleNum => {
    return (typeof obj !== "string") && (obj.tag === "RelatedArticleNum");
};

const defaultAttrOfRelatedArticleNum = {} as const;

export interface Remarks extends _StdEL {
    tag: "Remarks"
    attr: Record<string, never>
    children: Array<(RemarksLabel | Item | Sentence)>
}

export const isRemarks = (obj: EL | string): obj is Remarks => {
    return (typeof obj !== "string") && (obj.tag === "Remarks");
};

const defaultAttrOfRemarks = {} as const;

export interface RemarksLabel extends _StdEL {
    tag: "RemarksLabel"
    attr: {
        LineBreak?: string,
    }
    children: Array<(Line | Ruby | Sup | Sub | string | __EL)>
}

export const isRemarksLabel = (obj: EL | string): obj is RemarksLabel => {
    return (typeof obj !== "string") && (obj.tag === "RemarksLabel");
};

const defaultAttrOfRemarksLabel = {
    LineBreak: "false",
} as const;

export interface List extends _StdEL {
    tag: "List"
    attr: Record<string, never>
    children: Array<(ListSentence | Sublist1)>
}

export const isList = (obj: EL | string): obj is List => {
    return (typeof obj !== "string") && (obj.tag === "List");
};

const defaultAttrOfList = {} as const;

export interface ListSentence extends _StdEL {
    tag: "ListSentence"
    attr: Record<string, never>
    children: Array<(Sentence | Column)>
}

export const isListSentence = (obj: EL | string): obj is ListSentence => {
    return (typeof obj !== "string") && (obj.tag === "ListSentence");
};

const defaultAttrOfListSentence = {} as const;

export interface Sublist1 extends _StdEL {
    tag: "Sublist1"
    attr: Record<string, never>
    children: Array<(Sublist1Sentence | Sublist2)>
}

export const isSublist1 = (obj: EL | string): obj is Sublist1 => {
    return (typeof obj !== "string") && (obj.tag === "Sublist1");
};

const defaultAttrOfSublist1 = {} as const;

export interface Sublist1Sentence extends _StdEL {
    tag: "Sublist1Sentence"
    attr: Record<string, never>
    children: Array<(Sentence | Column)>
}

export const isSublist1Sentence = (obj: EL | string): obj is Sublist1Sentence => {
    return (typeof obj !== "string") && (obj.tag === "Sublist1Sentence");
};

const defaultAttrOfSublist1Sentence = {} as const;

export interface Sublist2 extends _StdEL {
    tag: "Sublist2"
    attr: Record<string, never>
    children: Array<(Sublist2Sentence | Sublist3)>
}

export const isSublist2 = (obj: EL | string): obj is Sublist2 => {
    return (typeof obj !== "string") && (obj.tag === "Sublist2");
};

const defaultAttrOfSublist2 = {} as const;

export interface Sublist2Sentence extends _StdEL {
    tag: "Sublist2Sentence"
    attr: Record<string, never>
    children: Array<(Sentence | Column)>
}

export const isSublist2Sentence = (obj: EL | string): obj is Sublist2Sentence => {
    return (typeof obj !== "string") && (obj.tag === "Sublist2Sentence");
};

const defaultAttrOfSublist2Sentence = {} as const;

export interface Sublist3 extends _StdEL {
    tag: "Sublist3"
    children: Array<Sublist3Sentence>
}

export const isSublist3 = (obj: EL | string): obj is Sublist3 => {
    return (typeof obj !== "string") && (obj.tag === "Sublist3");
};

const defaultAttrOfSublist3 = {
} as const;

export interface Sublist3Sentence extends _StdEL {
    tag: "Sublist3Sentence"
    attr: Record<string, never>
    children: Array<(Sentence | Column)>
}

export const isSublist3Sentence = (obj: EL | string): obj is Sublist3Sentence => {
    return (typeof obj !== "string") && (obj.tag === "Sublist3Sentence");
};

const defaultAttrOfSublist3Sentence = {} as const;

export interface QuoteStruct extends _StdEL {
    tag: "QuoteStruct"
    children: Array<StdEL | __EL | string>
}

export const isQuoteStruct = (obj: EL | string): obj is QuoteStruct => {
    return (typeof obj !== "string") && (obj.tag === "QuoteStruct");
};

const defaultAttrOfQuoteStruct = {
} as const;

export interface Ruby extends _StdEL {
    tag: "Ruby"
    attr: Record<string, never>
    children: Array<(Rt | string | __EL)>
}

export const isRuby = (obj: EL | string): obj is Ruby => {
    return (typeof obj !== "string") && (obj.tag === "Ruby");
};

const defaultAttrOfRuby = {} as const;

export interface Rt extends _StdEL {
    tag: "Rt"
    children: Array<__EL | string>
}

export const isRt = (obj: EL | string): obj is Rt => {
    return (typeof obj !== "string") && (obj.tag === "Rt");
};

const defaultAttrOfRt = {
} as const;

export interface Line extends _StdEL {
    tag: "Line"
    attr: {
        Style?: "dotted" | "double" | "none" | "solid",
    }
    children: Array<(QuoteStruct | ArithFormula | Ruby | Sup | Sub | string | __EL)>
}

export const isLine = (obj: EL | string): obj is Line => {
    return (typeof obj !== "string") && (obj.tag === "Line");
};

const defaultAttrOfLine = {
    Style: "solid",
} as const;

export interface Sup extends _StdEL {
    tag: "Sup"
    children: Array<__EL | string>
}

export const isSup = (obj: EL | string): obj is Sup => {
    return (typeof obj !== "string") && (obj.tag === "Sup");
};

const defaultAttrOfSup = {
} as const;

export interface Sub extends _StdEL {
    tag: "Sub"
    children: Array<__EL | string>
}

export const isSub = (obj: EL | string): obj is Sub => {
    return (typeof obj !== "string") && (obj.tag === "Sub");
};

const defaultAttrOfSub = {
} as const;

export type StdELType<TName extends string> =
    TName extends "Law" ? Law :
    TName extends "LawNum" ? LawNum :
    TName extends "LawBody" ? LawBody :
    TName extends "LawTitle" ? LawTitle :
    TName extends "EnactStatement" ? EnactStatement :
    TName extends "TOC" ? TOC :
    TName extends "TOCLabel" ? TOCLabel :
    TName extends "TOCPreambleLabel" ? TOCPreambleLabel :
    TName extends "TOCPart" ? TOCPart :
    TName extends "TOCChapter" ? TOCChapter :
    TName extends "TOCSection" ? TOCSection :
    TName extends "TOCSubsection" ? TOCSubsection :
    TName extends "TOCDivision" ? TOCDivision :
    TName extends "TOCArticle" ? TOCArticle :
    TName extends "TOCSupplProvision" ? TOCSupplProvision :
    TName extends "TOCAppdxTableLabel" ? TOCAppdxTableLabel :
    TName extends "ArticleRange" ? ArticleRange :
    TName extends "Preamble" ? Preamble :
    TName extends "MainProvision" ? MainProvision :
    TName extends "Part" ? Part :
    TName extends "PartTitle" ? PartTitle :
    TName extends "Chapter" ? Chapter :
    TName extends "ChapterTitle" ? ChapterTitle :
    TName extends "Section" ? Section :
    TName extends "SectionTitle" ? SectionTitle :
    TName extends "Subsection" ? Subsection :
    TName extends "SubsectionTitle" ? SubsectionTitle :
    TName extends "Division" ? Division :
    TName extends "DivisionTitle" ? DivisionTitle :
    TName extends "Article" ? Article :
    TName extends "ArticleTitle" ? ArticleTitle :
    TName extends "ArticleCaption" ? ArticleCaption :
    TName extends "Paragraph" ? Paragraph :
    TName extends "ParagraphCaption" ? ParagraphCaption :
    TName extends "ParagraphNum" ? ParagraphNum :
    TName extends "ParagraphSentence" ? ParagraphSentence :
    TName extends "SupplNote" ? SupplNote :
    TName extends "AmendProvision" ? AmendProvision :
    TName extends "AmendProvisionSentence" ? AmendProvisionSentence :
    TName extends "NewProvision" ? NewProvision :
    TName extends "Class" ? Class :
    TName extends "ClassTitle" ? ClassTitle :
    TName extends "ClassSentence" ? ClassSentence :
    TName extends "Item" ? Item :
    TName extends "ItemTitle" ? ItemTitle :
    TName extends "ItemSentence" ? ItemSentence :
    TName extends "Subitem1" ? Subitem1 :
    TName extends "Subitem1Title" ? Subitem1Title :
    TName extends "Subitem1Sentence" ? Subitem1Sentence :
    TName extends "Subitem2" ? Subitem2 :
    TName extends "Subitem2Title" ? Subitem2Title :
    TName extends "Subitem2Sentence" ? Subitem2Sentence :
    TName extends "Subitem3" ? Subitem3 :
    TName extends "Subitem3Title" ? Subitem3Title :
    TName extends "Subitem3Sentence" ? Subitem3Sentence :
    TName extends "Subitem4" ? Subitem4 :
    TName extends "Subitem4Title" ? Subitem4Title :
    TName extends "Subitem4Sentence" ? Subitem4Sentence :
    TName extends "Subitem5" ? Subitem5 :
    TName extends "Subitem5Title" ? Subitem5Title :
    TName extends "Subitem5Sentence" ? Subitem5Sentence :
    TName extends "Subitem6" ? Subitem6 :
    TName extends "Subitem6Title" ? Subitem6Title :
    TName extends "Subitem6Sentence" ? Subitem6Sentence :
    TName extends "Subitem7" ? Subitem7 :
    TName extends "Subitem7Title" ? Subitem7Title :
    TName extends "Subitem7Sentence" ? Subitem7Sentence :
    TName extends "Subitem8" ? Subitem8 :
    TName extends "Subitem8Title" ? Subitem8Title :
    TName extends "Subitem8Sentence" ? Subitem8Sentence :
    TName extends "Subitem9" ? Subitem9 :
    TName extends "Subitem9Title" ? Subitem9Title :
    TName extends "Subitem9Sentence" ? Subitem9Sentence :
    TName extends "Subitem10" ? Subitem10 :
    TName extends "Subitem10Title" ? Subitem10Title :
    TName extends "Subitem10Sentence" ? Subitem10Sentence :
    TName extends "Sentence" ? Sentence :
    TName extends "Column" ? Column :
    TName extends "SupplProvision" ? SupplProvision :
    TName extends "SupplProvisionLabel" ? SupplProvisionLabel :
    TName extends "SupplProvisionAppdxTable" ? SupplProvisionAppdxTable :
    TName extends "SupplProvisionAppdxTableTitle" ? SupplProvisionAppdxTableTitle :
    TName extends "SupplProvisionAppdxStyle" ? SupplProvisionAppdxStyle :
    TName extends "SupplProvisionAppdxStyleTitle" ? SupplProvisionAppdxStyleTitle :
    TName extends "SupplProvisionAppdx" ? SupplProvisionAppdx :
    TName extends "AppdxTable" ? AppdxTable :
    TName extends "AppdxTableTitle" ? AppdxTableTitle :
    TName extends "AppdxNote" ? AppdxNote :
    TName extends "AppdxNoteTitle" ? AppdxNoteTitle :
    TName extends "AppdxStyle" ? AppdxStyle :
    TName extends "AppdxStyleTitle" ? AppdxStyleTitle :
    TName extends "AppdxFormat" ? AppdxFormat :
    TName extends "AppdxFormatTitle" ? AppdxFormatTitle :
    TName extends "Appdx" ? Appdx :
    TName extends "ArithFormulaNum" ? ArithFormulaNum :
    TName extends "ArithFormula" ? ArithFormula :
    TName extends "AppdxFig" ? AppdxFig :
    TName extends "AppdxFigTitle" ? AppdxFigTitle :
    TName extends "TableStruct" ? TableStruct :
    TName extends "TableStructTitle" ? TableStructTitle :
    TName extends "Table" ? Table :
    TName extends "TableRow" ? TableRow :
    TName extends "TableHeaderRow" ? TableHeaderRow :
    TName extends "TableHeaderColumn" ? TableHeaderColumn :
    TName extends "TableColumn" ? TableColumn :
    TName extends "FigStruct" ? FigStruct :
    TName extends "FigStructTitle" ? FigStructTitle :
    TName extends "Fig" ? Fig :
    TName extends "NoteStruct" ? NoteStruct :
    TName extends "NoteStructTitle" ? NoteStructTitle :
    TName extends "Note" ? Note :
    TName extends "StyleStruct" ? StyleStruct :
    TName extends "StyleStructTitle" ? StyleStructTitle :
    TName extends "Style" ? Style :
    TName extends "FormatStruct" ? FormatStruct :
    TName extends "FormatStructTitle" ? FormatStructTitle :
    TName extends "Format" ? Format :
    TName extends "RelatedArticleNum" ? RelatedArticleNum :
    TName extends "Remarks" ? Remarks :
    TName extends "RemarksLabel" ? RemarksLabel :
    TName extends "List" ? List :
    TName extends "ListSentence" ? ListSentence :
    TName extends "Sublist1" ? Sublist1 :
    TName extends "Sublist1Sentence" ? Sublist1Sentence :
    TName extends "Sublist2" ? Sublist2 :
    TName extends "Sublist2Sentence" ? Sublist2Sentence :
    TName extends "Sublist3" ? Sublist3 :
    TName extends "Sublist3Sentence" ? Sublist3Sentence :
    TName extends "QuoteStruct" ? QuoteStruct :
    TName extends "Ruby" ? Ruby :
    TName extends "Rt" ? Rt :
    TName extends "Line" ? Line :
    TName extends "Sup" ? Sup :
    TName extends "Sub" ? Sub :
    never

export const stdELTags = [
    "Law",
    "LawNum",
    "LawBody",
    "LawTitle",
    "EnactStatement",
    "TOC",
    "TOCLabel",
    "TOCPreambleLabel",
    "TOCPart",
    "TOCChapter",
    "TOCSection",
    "TOCSubsection",
    "TOCDivision",
    "TOCArticle",
    "TOCSupplProvision",
    "TOCAppdxTableLabel",
    "ArticleRange",
    "Preamble",
    "MainProvision",
    "Part",
    "PartTitle",
    "Chapter",
    "ChapterTitle",
    "Section",
    "SectionTitle",
    "Subsection",
    "SubsectionTitle",
    "Division",
    "DivisionTitle",
    "Article",
    "ArticleTitle",
    "ArticleCaption",
    "Paragraph",
    "ParagraphCaption",
    "ParagraphNum",
    "ParagraphSentence",
    "SupplNote",
    "AmendProvision",
    "AmendProvisionSentence",
    "NewProvision",
    "Class",
    "ClassTitle",
    "ClassSentence",
    "Item",
    "ItemTitle",
    "ItemSentence",
    "Subitem1",
    "Subitem1Title",
    "Subitem1Sentence",
    "Subitem2",
    "Subitem2Title",
    "Subitem2Sentence",
    "Subitem3",
    "Subitem3Title",
    "Subitem3Sentence",
    "Subitem4",
    "Subitem4Title",
    "Subitem4Sentence",
    "Subitem5",
    "Subitem5Title",
    "Subitem5Sentence",
    "Subitem6",
    "Subitem6Title",
    "Subitem6Sentence",
    "Subitem7",
    "Subitem7Title",
    "Subitem7Sentence",
    "Subitem8",
    "Subitem8Title",
    "Subitem8Sentence",
    "Subitem9",
    "Subitem9Title",
    "Subitem9Sentence",
    "Subitem10",
    "Subitem10Title",
    "Subitem10Sentence",
    "Sentence",
    "Column",
    "SupplProvision",
    "SupplProvisionLabel",
    "SupplProvisionAppdxTable",
    "SupplProvisionAppdxTableTitle",
    "SupplProvisionAppdxStyle",
    "SupplProvisionAppdxStyleTitle",
    "SupplProvisionAppdx",
    "AppdxTable",
    "AppdxTableTitle",
    "AppdxNote",
    "AppdxNoteTitle",
    "AppdxStyle",
    "AppdxStyleTitle",
    "AppdxFormat",
    "AppdxFormatTitle",
    "Appdx",
    "ArithFormulaNum",
    "ArithFormula",
    "AppdxFig",
    "AppdxFigTitle",
    "TableStruct",
    "TableStructTitle",
    "Table",
    "TableRow",
    "TableHeaderRow",
    "TableHeaderColumn",
    "TableColumn",
    "FigStruct",
    "FigStructTitle",
    "Fig",
    "NoteStruct",
    "NoteStructTitle",
    "Note",
    "StyleStruct",
    "StyleStructTitle",
    "Style",
    "FormatStruct",
    "FormatStructTitle",
    "Format",
    "RelatedArticleNum",
    "Remarks",
    "RemarksLabel",
    "List",
    "ListSentence",
    "Sublist1",
    "Sublist1Sentence",
    "Sublist2",
    "Sublist2Sentence",
    "Sublist3",
    "Sublist3Sentence",
    "QuoteStruct",
    "Ruby",
    "Rt",
    "Line",
    "Sup",
    "Sub",
] as const;

export const defaultAttrs = {
    Law: defaultAttrOfLaw,
    LawNum: defaultAttrOfLawNum,
    LawBody: defaultAttrOfLawBody,
    LawTitle: defaultAttrOfLawTitle,
    EnactStatement: defaultAttrOfEnactStatement,
    TOC: defaultAttrOfTOC,
    TOCLabel: defaultAttrOfTOCLabel,
    TOCPreambleLabel: defaultAttrOfTOCPreambleLabel,
    TOCPart: defaultAttrOfTOCPart,
    TOCChapter: defaultAttrOfTOCChapter,
    TOCSection: defaultAttrOfTOCSection,
    TOCSubsection: defaultAttrOfTOCSubsection,
    TOCDivision: defaultAttrOfTOCDivision,
    TOCArticle: defaultAttrOfTOCArticle,
    TOCSupplProvision: defaultAttrOfTOCSupplProvision,
    TOCAppdxTableLabel: defaultAttrOfTOCAppdxTableLabel,
    ArticleRange: defaultAttrOfArticleRange,
    Preamble: defaultAttrOfPreamble,
    MainProvision: defaultAttrOfMainProvision,
    Part: defaultAttrOfPart,
    PartTitle: defaultAttrOfPartTitle,
    Chapter: defaultAttrOfChapter,
    ChapterTitle: defaultAttrOfChapterTitle,
    Section: defaultAttrOfSection,
    SectionTitle: defaultAttrOfSectionTitle,
    Subsection: defaultAttrOfSubsection,
    SubsectionTitle: defaultAttrOfSubsectionTitle,
    Division: defaultAttrOfDivision,
    DivisionTitle: defaultAttrOfDivisionTitle,
    Article: defaultAttrOfArticle,
    ArticleTitle: defaultAttrOfArticleTitle,
    ArticleCaption: defaultAttrOfArticleCaption,
    Paragraph: defaultAttrOfParagraph,
    ParagraphCaption: defaultAttrOfParagraphCaption,
    ParagraphNum: defaultAttrOfParagraphNum,
    ParagraphSentence: defaultAttrOfParagraphSentence,
    SupplNote: defaultAttrOfSupplNote,
    AmendProvision: defaultAttrOfAmendProvision,
    AmendProvisionSentence: defaultAttrOfAmendProvisionSentence,
    NewProvision: defaultAttrOfNewProvision,
    Class: defaultAttrOfClass,
    ClassTitle: defaultAttrOfClassTitle,
    ClassSentence: defaultAttrOfClassSentence,
    Item: defaultAttrOfItem,
    ItemTitle: defaultAttrOfItemTitle,
    ItemSentence: defaultAttrOfItemSentence,
    Subitem1: defaultAttrOfSubitem1,
    Subitem1Title: defaultAttrOfSubitem1Title,
    Subitem1Sentence: defaultAttrOfSubitem1Sentence,
    Subitem2: defaultAttrOfSubitem2,
    Subitem2Title: defaultAttrOfSubitem2Title,
    Subitem2Sentence: defaultAttrOfSubitem2Sentence,
    Subitem3: defaultAttrOfSubitem3,
    Subitem3Title: defaultAttrOfSubitem3Title,
    Subitem3Sentence: defaultAttrOfSubitem3Sentence,
    Subitem4: defaultAttrOfSubitem4,
    Subitem4Title: defaultAttrOfSubitem4Title,
    Subitem4Sentence: defaultAttrOfSubitem4Sentence,
    Subitem5: defaultAttrOfSubitem5,
    Subitem5Title: defaultAttrOfSubitem5Title,
    Subitem5Sentence: defaultAttrOfSubitem5Sentence,
    Subitem6: defaultAttrOfSubitem6,
    Subitem6Title: defaultAttrOfSubitem6Title,
    Subitem6Sentence: defaultAttrOfSubitem6Sentence,
    Subitem7: defaultAttrOfSubitem7,
    Subitem7Title: defaultAttrOfSubitem7Title,
    Subitem7Sentence: defaultAttrOfSubitem7Sentence,
    Subitem8: defaultAttrOfSubitem8,
    Subitem8Title: defaultAttrOfSubitem8Title,
    Subitem8Sentence: defaultAttrOfSubitem8Sentence,
    Subitem9: defaultAttrOfSubitem9,
    Subitem9Title: defaultAttrOfSubitem9Title,
    Subitem9Sentence: defaultAttrOfSubitem9Sentence,
    Subitem10: defaultAttrOfSubitem10,
    Subitem10Title: defaultAttrOfSubitem10Title,
    Subitem10Sentence: defaultAttrOfSubitem10Sentence,
    Sentence: defaultAttrOfSentence,
    Column: defaultAttrOfColumn,
    SupplProvision: defaultAttrOfSupplProvision,
    SupplProvisionLabel: defaultAttrOfSupplProvisionLabel,
    SupplProvisionAppdxTable: defaultAttrOfSupplProvisionAppdxTable,
    SupplProvisionAppdxTableTitle: defaultAttrOfSupplProvisionAppdxTableTitle,
    SupplProvisionAppdxStyle: defaultAttrOfSupplProvisionAppdxStyle,
    SupplProvisionAppdxStyleTitle: defaultAttrOfSupplProvisionAppdxStyleTitle,
    SupplProvisionAppdx: defaultAttrOfSupplProvisionAppdx,
    AppdxTable: defaultAttrOfAppdxTable,
    AppdxTableTitle: defaultAttrOfAppdxTableTitle,
    AppdxNote: defaultAttrOfAppdxNote,
    AppdxNoteTitle: defaultAttrOfAppdxNoteTitle,
    AppdxStyle: defaultAttrOfAppdxStyle,
    AppdxStyleTitle: defaultAttrOfAppdxStyleTitle,
    AppdxFormat: defaultAttrOfAppdxFormat,
    AppdxFormatTitle: defaultAttrOfAppdxFormatTitle,
    Appdx: defaultAttrOfAppdx,
    ArithFormulaNum: defaultAttrOfArithFormulaNum,
    ArithFormula: defaultAttrOfArithFormula,
    AppdxFig: defaultAttrOfAppdxFig,
    AppdxFigTitle: defaultAttrOfAppdxFigTitle,
    TableStruct: defaultAttrOfTableStruct,
    TableStructTitle: defaultAttrOfTableStructTitle,
    Table: defaultAttrOfTable,
    TableRow: defaultAttrOfTableRow,
    TableHeaderRow: defaultAttrOfTableHeaderRow,
    TableHeaderColumn: defaultAttrOfTableHeaderColumn,
    TableColumn: defaultAttrOfTableColumn,
    FigStruct: defaultAttrOfFigStruct,
    FigStructTitle: defaultAttrOfFigStructTitle,
    Fig: defaultAttrOfFig,
    NoteStruct: defaultAttrOfNoteStruct,
    NoteStructTitle: defaultAttrOfNoteStructTitle,
    Note: defaultAttrOfNote,
    StyleStruct: defaultAttrOfStyleStruct,
    StyleStructTitle: defaultAttrOfStyleStructTitle,
    Style: defaultAttrOfStyle,
    FormatStruct: defaultAttrOfFormatStruct,
    FormatStructTitle: defaultAttrOfFormatStructTitle,
    Format: defaultAttrOfFormat,
    RelatedArticleNum: defaultAttrOfRelatedArticleNum,
    Remarks: defaultAttrOfRemarks,
    RemarksLabel: defaultAttrOfRemarksLabel,
    List: defaultAttrOfList,
    ListSentence: defaultAttrOfListSentence,
    Sublist1: defaultAttrOfSublist1,
    Sublist1Sentence: defaultAttrOfSublist1Sentence,
    Sublist2: defaultAttrOfSublist2,
    Sublist2Sentence: defaultAttrOfSublist2Sentence,
    Sublist3: defaultAttrOfSublist3,
    Sublist3Sentence: defaultAttrOfSublist3Sentence,
    QuoteStruct: defaultAttrOfQuoteStruct,
    Ruby: defaultAttrOfRuby,
    Rt: defaultAttrOfRt,
    Line: defaultAttrOfLine,
    Sup: defaultAttrOfSup,
    Sub: defaultAttrOfSub,
} as const;

export type StdELTag = typeof stdELTags[number];

export const newStdEL = <
    TName extends string,
    TStdEL = StdELType<TName>,
    TAttr extends { [key: string]: string | undefined } = TStdEL extends StdEL ? TStdEL["attr"] : never,
    TChildren extends Array<EL | string> = TStdEL extends StdEL ? TStdEL["children"] : never,
>(
        tag: TName,
        attr?: TAttr,
        children?: TChildren,
        range: [start: number, end: number] | null = null,
    ): StdELType<TName> => {
    return new EL(tag, attr, children, range) as StdELType<TName>;
};

export const isStdEL = <TTag extends StdELTag | undefined>(obj: EL | string, tag?: TTag | TTag[]): obj is (TTag extends undefined ? StdEL : StdELType<Diff<TTag, undefined>>) => {
    if (typeof obj === "string") {
        return false;
    } else if (tag === undefined) {
        return (stdELTags as readonly string[]).includes(obj.tag);
    } else if (Array.isArray(tag)) {
        return (tag as readonly string[]).includes(obj.tag);
    } else {
        return obj.tag === tag;
    }
};

export const makeIsStdEL = <TTag extends StdELTag>(tag: TTag | TTag[]) =>
    (obj: EL | string): obj is StdELType<TTag> =>
        isStdEL(obj, tag);
