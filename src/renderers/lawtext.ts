import { isString } from "util";
import * as std from "../std_law";
import { assertNever, EL, NotImplementedError } from "../util";

const INDENT = "  "
const MARGIN = "　"
const BLANK = ""
// const NEWLINE = `
// `;



const renderLaw = (el: std.Law, indent: number): string => {
    let LawNum = "";
    let LawBody: std.LawBody | undefined;
    for (const child of el.children) {
        if (child.tag === "LawNum") {
            LawNum = child.text;
        } else if (child.tag === "LawBody") {
            LawBody = child;
        } else {
            assertNever(child);
        }
    }

    return LawBody ? renderLawBody(LawBody, indent, LawNum) : "";
}



const renderLawBody = (el: std.LawBody, indent: number, LawNum: string): string => {
    const blocks: string[] = [];
    for (const child of el.children) {

        if (child.tag === "LawTitle") {
            blocks.push(renderLawTitle(child, indent, LawNum));

        } else if (child.tag === "TOC") {
            blocks.push(renderTOC(child, indent));

        } else if (child.tag === "MainProvision") {
            blocks.push(renderArticleGroup(child, indent));

        } else if (child.tag === "SupplProvision") {
            blocks.push(renderSupplProvision(child, indent));

        } else if (child.tag === "AppdxTable") {
            blocks.push(renderAppdxTable(child, indent));

        } else if (child.tag === "AppdxStyle") {
            blocks.push(renderAppdxStyle(child, indent));

        } else if (child.tag === "AppdxFormat") {
            blocks.push(renderAppdxFormat(child, indent));

        } else if (child.tag === "AppdxFig") {
            blocks.push(renderAppdxFig(child, indent));

        } else if (child.tag === "AppdxNote") {
            blocks.push(renderAppdxNote(child, indent));

        } else if (child.tag === "Appdx") {
            blocks.push(renderAppdx(child, indent));

        } else if (child.tag === "EnactStatement") {
            blocks.push(renderEnactStatement(child, indent));

        } else if (child.tag === "Preamble") {
            blocks.push(renderPreamble(child, indent));

        }
        else { assertNever(child); }
    }
    return blocks.join("");
}



const renderLawTitle = (el: std.LawTitle, indent: number, LawNum: string): string => {
    const _____ = INDENT.repeat(indent);

    return LawNum
        ?
 /* ========================= */`\
${_____}${el.text}
${_____}（${LawNum}）
${BLANK}
`/* ========================= */
        :
/* ========================= */`\
${_____}${el.text}
${BLANK}
`/* ========================= */;

}



const renderEnactStatement = (el: std.EnactStatement, indent: number): string => {
    const _____ = INDENT.repeat(indent);

    return (
 /* ========================= */`
${_____}${INDENT}${INDENT}${el.text}
${BLANK}
`/* ========================= */);
}



const renderPreamble = (el: std.Preamble, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    for (const paragraph of el.children) {
        blocks.push(renderParagraphItem(paragraph, indent));
    }

    return (
 /* ========================= */`
${_____}:前文:
${blocks.join("")}
${BLANK}
`/* ========================= */);
}



const renderTOC = (el: std.TOC, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];
    for (const child of el.children) {

        if (child.tag === "TOCLabel") {

            blocks.push(
 /* ========================= */`\
${_____}${child.text}
`/* ========================= */);

        } else if (child.tag === "TOCPreambleLabel" || child.tag === "TOCPart" || child.tag === "TOCChapter" || child.tag === "TOCSection" || child.tag === "TOCSupplProvision" || child.tag === "TOCArticle" || child.tag === "TOCAppdxTableLabel") {
            blocks.push(renderTOCItem(child, indent + 1)); /* >>>> INDENT >>>> */

        }
        else { assertNever(child); }
    }
    if (blocks.length > 0) {
        blocks.push(
 /* ========================= */`\
${BLANK}
`/* ========================= */);
    }
    return blocks.join("");
}



const renderTOCItem = (el: std.TOCPreambleLabel | std.TOCPart | std.TOCChapter | std.TOCSection | std.TOCSubsection | std.TOCDivision | std.TOCSupplProvision | std.TOCArticle | std.TOCAppdxTableLabel, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];
    if (el.tag === "TOCArticle") {
        let ArticleTitle = "";
        let ArticleCaption = "";
        for (const child of el.children) {
            if (child.tag === "ArticleTitle") {
                ArticleTitle = renderRun(child.children);
            } else if (child.tag === "ArticleCaption") {
                ArticleCaption = renderRun(child.children);
            }
            else { assertNever(child); }
        }
        if (ArticleTitle || ArticleCaption) {
            blocks.push(
 /* ========================= */`\
${_____}${ArticleTitle}${ArticleCaption}
`/* ========================= */);
        }

    } else if (el.tag === "TOCPreambleLabel") {
        blocks.push(
 /* ========================= */`\
${_____}${el.text}
`/* ========================= */);

    } else if (el.tag === "TOCAppdxTableLabel") {
        throw new NotImplementedError(el.tag);

    } else {
        let TocItemTitle = "";
        let ArticleRange = "";
        const TOCItems: Array<std.TOCChapter | std.TOCSection | std.TOCSubsection | std.TOCDivision | std.TOCArticle> = [];
        for (const child of el.children) {

            if (child.tag === "PartTitle" || child.tag === "ChapterTitle" || child.tag === "SectionTitle" || child.tag === "SubsectionTitle" || child.tag === "DivisionTitle" || child.tag === "SupplProvisionLabel") {
                TocItemTitle = renderRun(child.children);

            } else if (child.tag === "ArticleRange") {
                ArticleRange = renderRun(child.children);

            } else if (child.tag === "TOCChapter" || child.tag === "TOCSection" || child.tag === "TOCSubsection" || child.tag === "TOCDivision" || child.tag === "TOCArticle") {
                TOCItems.push(child);

            }
            else { assertNever(child); }
        }
        if (TocItemTitle || ArticleRange) {
            blocks.push(
 /* ========================= */`\
${_____}${TocItemTitle}${ArticleRange}
`/* ========================= */);
        }
        for (const TOCItem of TOCItems) {
            blocks.push(renderTOCItem(TOCItem, indent + 1)); /* >>>> INDENT >>>> */
        }

    }
    return blocks.join("");
}



const renderAppdxTable = (el: std.AppdxTable, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    let AppdxTableTitle = "";
    let RelatedArticleNum = "";
    const ChildItems: Array<std.TableStruct | std.Item | std.Remarks> = [];
    for (const child of el.children) {

        if (child.tag === "AppdxTableTitle") {
            AppdxTableTitle = renderRun(child.children);
            if (child.attr.WritingMode === "horizontal") {
                AppdxTableTitle = `[WritingMode="horizontal"]` + AppdxTableTitle;
            }

        } else if (child.tag === "RelatedArticleNum") {
            RelatedArticleNum = renderRun(child.children);

        } else {
            ChildItems.push(child);
        }
    }

    if (AppdxTableTitle || RelatedArticleNum) {
        blocks.push(
 /* ========================= */`\
${BLANK}
${_____}${AppdxTableTitle}${RelatedArticleNum}
${BLANK}
`/* ========================= */);
    }

    for (const [i, child] of ChildItems.entries()) {
        if (child.tag === "TableStruct") {
            const isFirstTableStruct = !(0 < i && ChildItems[i - 1].tag === "TableStruct");
            blocks.push(renderTableStruct(child, indent + 1, !isFirstTableStruct)); /* >>>> INDENT >>>> */

        } else if (child.tag === "Item") {
            blocks.push(renderParagraphItem(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "Remarks") {
            blocks.push(renderRemarks(child, indent + 1)); /* >>>> INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return blocks.join("");
}



const renderSupplProvisionAppdxTable = (el: std.SupplProvisionAppdxTable, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    let SupplProvisionAppdxTableTitle = "";
    let RelatedArticleNum = "";
    const TableStructs: std.TableStruct[] = [];
    for (const child of el.children) {

        if (child.tag === "SupplProvisionAppdxTableTitle") {
            SupplProvisionAppdxTableTitle = renderRun(child.children);
            if (child.attr.WritingMode === "horizontal") {
                SupplProvisionAppdxTableTitle = `[WritingMode="horizontal"]` + SupplProvisionAppdxTableTitle;
            }

        } else if (child.tag === "RelatedArticleNum") {
            RelatedArticleNum = renderRun(child.children);

        } else if (child.tag === "TableStruct") {
            TableStructs.push(child);

        } else { assertNever(child); }
    }

    if (SupplProvisionAppdxTableTitle || RelatedArticleNum) {
        blocks.push(
 /* ========================= */`\
${BLANK}
${_____}${SupplProvisionAppdxTableTitle}${RelatedArticleNum}
${BLANK}
`/* ========================= */);
    }

    for (const [i, TableStruct] of TableStructs.entries()) {
        const isFirstTableStruct = i === 0;
        blocks.push(renderTableStruct(TableStruct, indent + 1, !isFirstTableStruct)); /* >>>> INDENT >>>> */
    }

    return blocks.join("");
}



const renderAppdxStyle = (el: std.AppdxStyle, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    let AppdxStyleTitle = "";
    let RelatedArticleNum = "";
    const ChildItems: Array<std.StyleStruct | std.Item | std.Remarks> = [];
    for (const child of el.children) {

        if (child.tag === "AppdxStyleTitle") {
            AppdxStyleTitle = renderRun(child.children);

        } else if (child.tag === "RelatedArticleNum") {
            RelatedArticleNum = renderRun(child.children);

        } else {
            ChildItems.push(child);
        }
    }

    if (AppdxStyleTitle || RelatedArticleNum) {
        blocks.push(
 /* ========================= */`\
${BLANK}
${_____}${AppdxStyleTitle}${RelatedArticleNum}
${BLANK}
`/* ========================= */);
    }

    for (const child of ChildItems) {
        if (child.tag === "StyleStruct") {
            blocks.push(renderStyleStruct(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "Item") {
            blocks.push(renderParagraphItem(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "Remarks") {
            blocks.push(renderRemarks(child, indent + 1)); /* >>>> INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return blocks.join("");
}



const renderSupplProvisionAppdxStyle = (el: std.SupplProvisionAppdxStyle, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    let SupplProvisionAppdxStyleTitle = "";
    let RelatedArticleNum = "";
    const ChildItems: std.StyleStruct[] = [];
    for (const child of el.children) {

        if (child.tag === "SupplProvisionAppdxStyleTitle") {
            SupplProvisionAppdxStyleTitle = renderRun(child.children);

        } else if (child.tag === "RelatedArticleNum") {
            RelatedArticleNum = renderRun(child.children);

        } else {
            ChildItems.push(child);
        }
    }

    if (SupplProvisionAppdxStyleTitle || RelatedArticleNum) {
        blocks.push(
 /* ========================= */`\
${BLANK}
${_____}${SupplProvisionAppdxStyleTitle}${RelatedArticleNum}
${BLANK}
`/* ========================= */);
    }

    for (const child of ChildItems) {
        if (child.tag === "StyleStruct") {
            blocks.push(renderStyleStruct(child, indent + 1)); /* >>>> INDENT >>>> */

        }
        else { assertNever(child.tag); }
    }

    return blocks.join("");
}



const renderAppdxFormat = (el: std.AppdxFormat, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    let AppdxFormatTitle = "";
    let RelatedArticleNum = "";
    const ChildItems: Array<std.FormatStruct | std.Remarks> = [];
    for (const child of el.children) {

        if (child.tag === "AppdxFormatTitle") {
            AppdxFormatTitle = renderRun(child.children);

        } else if (child.tag === "RelatedArticleNum") {
            RelatedArticleNum = renderRun(child.children);

        } else {
            ChildItems.push(child);
        }
    }

    if (AppdxFormatTitle || RelatedArticleNum) {
        blocks.push(
 /* ========================= */`\
${BLANK}
${_____}${AppdxFormatTitle}${RelatedArticleNum}
${BLANK}
`/* ========================= */);
    } else {
        blocks.push(
 /* ========================= */`\
${BLANK}
${_____}:appdx-format:
`/* ========================= */);
    }

    for (const child of ChildItems) {
        if (child.tag === "FormatStruct") {
            blocks.push(renderFormatStruct(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "Remarks") {
            blocks.push(renderRemarks(child, indent + 1)); /* >>>> INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return blocks.join("");
}



const renderAppdxFig = (el: std.AppdxFig, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    let AppdxFigTitle = "";
    let RelatedArticleNum = "";
    const ChildItems: Array<std.FigStruct | std.TableStruct> = [];
    for (const child of el.children) {

        if (child.tag === "AppdxFigTitle") {
            AppdxFigTitle = renderRun(child.children);

        } else if (child.tag === "RelatedArticleNum") {
            RelatedArticleNum = renderRun(child.children);

        } else {
            ChildItems.push(child);
        }
    }

    if (AppdxFigTitle || RelatedArticleNum) {
        blocks.push(
 /* ========================= */`\
${BLANK}
${_____}${AppdxFigTitle}${RelatedArticleNum}
${BLANK}
`/* ========================= */);
    }

    for (const child of ChildItems) {
        if (child.tag === "FigStruct") {
            blocks.push(renderFigStruct(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "TableStruct") {
            blocks.push(renderTableStruct(child, indent + 1)); /* >>>> INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return blocks.join("");
}



const renderAppdxNote = (el: std.AppdxNote, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    let AppdxNoteTitle = "";
    let RelatedArticleNum = "";
    const ChildItems: Array<std.TableStruct | std.Remarks | std.FigStruct | std.NoteStruct> = [];
    for (const child of el.children) {

        if (child.tag === "AppdxNoteTitle") {
            AppdxNoteTitle = renderRun(child.children);
            if (child.attr.WritingMode === "horizontal") {
                AppdxNoteTitle = `[WritingMode="horizontal"]` + AppdxNoteTitle;
            }

        } else if (child.tag === "RelatedArticleNum") {
            RelatedArticleNum = renderRun(child.children);

        } else {
            ChildItems.push(child);
        }
    }

    if (AppdxNoteTitle || RelatedArticleNum) {
        blocks.push(
 /* ========================= */`\
${BLANK}
${_____}${AppdxNoteTitle}${RelatedArticleNum}
${BLANK}
`/* ========================= */);
    }

    for (const [i, child] of ChildItems.entries()) {
        if (child.tag === "NoteStruct") {
            blocks.push(renderNoteStruct(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "TableStruct") {
            const isFirstTableStruct = !(0 < i && ChildItems[i - 1].tag === "TableStruct");
            blocks.push(renderTableStruct(child, indent + 1, !isFirstTableStruct)); /* >>>> INDENT >>>> */
        } else if (child.tag === "FigStruct") {
            blocks.push(renderFigStruct(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "Remarks") {
            blocks.push(renderRemarks(child, indent + 1)); /* >>>> INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return blocks.join("");
}



const renderAppdx = (el: std.Appdx, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    let ArithFormulaNum = "";
    let RelatedArticleNum = "";
    const ChildItems: Array<std.ArithFormula | std.Remarks> = [];
    for (const child of el.children) {

        if (child.tag === "ArithFormulaNum") {
            ArithFormulaNum = renderRun(child.children);

        } else if (child.tag === "RelatedArticleNum") {
            RelatedArticleNum = renderRun(child.children);

        } else {
            ChildItems.push(child);
        }
    }

    if (ArithFormulaNum || RelatedArticleNum) {
        blocks.push(
 /* ========================= */`\
${BLANK}
${_____}${ArithFormulaNum}${RelatedArticleNum}
${BLANK}
`/* ========================= */);
    }

    for (const child of ChildItems) {
        if (child.tag === "ArithFormula") {
            blocks.push(
 /* ========================= */`\
${_____}${INDENT}${renderRun([child])}
`/* ========================= */); /* >>>> INDENT >>>> */

        } else if (child.tag === "Remarks") {
            blocks.push(renderRemarks(child, indent + 1)); /* >>>> INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return blocks.join("");
}



const renderSupplProvisionAppdx = (el: std.SupplProvisionAppdx, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    let ArithFormulaNum = "";
    let RelatedArticleNum = "";
    const ChildItems: std.ArithFormula[] = [];
    for (const child of el.children) {

        if (child.tag === "ArithFormulaNum") {
            ArithFormulaNum = renderRun(child.children);

        } else if (child.tag === "RelatedArticleNum") {
            RelatedArticleNum = renderRun(child.children);

        } else {
            ChildItems.push(child);
        }
    }

    if (ArithFormulaNum || RelatedArticleNum) {
        blocks.push(
 /* ========================= */`\
${BLANK}
${_____}${ArithFormulaNum}${RelatedArticleNum}
${BLANK}
`/* ========================= */);
    }

    for (const child of ChildItems) {
        if (child.tag === "ArithFormula") {
            blocks.push(
 /* ========================= */`\
${_____}${INDENT}${renderRun([child])}
`/* ========================= */); /* >>>> INDENT >>>> */

        }
        else { assertNever(child.tag); }
    }

    return blocks.join("");
}



const renderSupplProvision = (el: std.SupplProvision, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    let SupplProvisionLabel = "";
    const Extract = el.attr.Extract === "true" ? `${MARGIN}抄` : "";
    const ChildItems: Array<std.Chapter | std.Article | std.Paragraph | std.SupplProvisionAppdxTable | std.SupplProvisionAppdxStyle | std.SupplProvisionAppdx> = [];
    for (const child of el.children) {

        if (child.tag === "SupplProvisionLabel") {
            SupplProvisionLabel = `${INDENT.repeat(3)}${renderRun(child.children)}`;

        } else {
            ChildItems.push(child);
        }
    }

    if (SupplProvisionLabel) {
        blocks.push(el.attr.AmendLawNum
            ?
 /* ========================= */`\
${BLANK}
${_____}${SupplProvisionLabel}（${el.attr.AmendLawNum}）${Extract}
${BLANK}
`/* ========================= */
            :
 /* ========================= */`\
${BLANK}
${_____}${SupplProvisionLabel}${Extract}
${BLANK}
`/* ========================= */);
    }

    for (const child of ChildItems) {
        if (child.tag === "Article") {
            blocks.push(renderArticle(child, indent));

        } else if (child.tag === "Paragraph") {
            blocks.push(renderParagraphItem(child, indent));

        } else if (child.tag === "Chapter") {
            blocks.push(renderArticleGroup(child, indent));

        } else if (child.tag === "SupplProvisionAppdxTable") {
            blocks.push(renderSupplProvisionAppdxTable(child, indent));

        } else if (child.tag === "SupplProvisionAppdxStyle") {
            blocks.push(renderSupplProvisionAppdxStyle(child, indent));

        } else if (child.tag === "SupplProvisionAppdx") {
            blocks.push(renderSupplProvisionAppdx(child, indent));

        }
        else { assertNever(child); }
    }

    return blocks.join("");
}



const renderArticleGroup = (el: std.MainProvision | std.Part | std.Chapter | std.Section | std.Subsection | std.Division, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    let ArticleGroupTitle = "";
    const ChildItems: Array<std.Part | std.Chapter | std.Section | std.Subsection | std.Division | std.Article | std.Paragraph> = [];
    for (const child of el.children) {

        if (child.tag === "PartTitle" || child.tag === "ChapterTitle" || child.tag === "SectionTitle" || child.tag === "SubsectionTitle" || child.tag === "DivisionTitle") {
            const titleIndent =
                child.tag === "PartTitle"
                    ? 2
                    : child.tag === "ChapterTitle"
                        ? 3
                        : child.tag === "SectionTitle"
                            ? 4
                            : child.tag === "SubsectionTitle"
                                ? 5
                                : child.tag === "DivisionTitle"
                                    ? 6
                                    : assertNever(child);
            ArticleGroupTitle = `${INDENT.repeat(titleIndent)}${renderRun(child.children)}`;

        } else {
            ChildItems.push(child);
        }
    }

    if (ArticleGroupTitle) {
        blocks.push(
 /* ========================= */`\
${BLANK}
${_____}${ArticleGroupTitle}
${BLANK}
`/* ========================= */);
    }

    for (const child of ChildItems) {
        if (child.tag === "Article") {
            blocks.push(renderArticle(child, indent));

        } else if (child.tag === "Paragraph") {
            blocks.push(renderParagraphItem(child, indent));

        } else if (child.tag === "Part" || child.tag === "Chapter" || child.tag === "Section" || child.tag === "Subsection" || child.tag === "Division") {
            blocks.push(renderArticleGroup(child, indent));

        } else if (std.isAppdxStyle(child)) {
            console.error("Unexpected AppdxStyle in MainProvision!");
            blocks.push(renderAppdxStyle(child, indent));

        }
        else { assertNever(child); }
    }

    return blocks.join("");
}



const renderArticle = (el: std.Article, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    let ArticleCaption = "";
    let ArticleTitle = "";
    const Paragraphs: std.Paragraph[] = [];
    const SupplNotes: std.SupplNote[] = [];
    for (const child of el.children) {

        if (child.tag === "ArticleCaption") {
            ArticleCaption = renderRun(child.children);

        } else if (child.tag === "ArticleTitle") {
            ArticleTitle = renderRun(child.children);

        } else if (child.tag === "Paragraph") {
            Paragraphs.push(child);

        } else if (child.tag === "SupplNote") {
            SupplNotes.push(child);

        }
        else { assertNever(child); }
    }

    if (ArticleCaption) {
        blocks.push(
 /* ========================= */`\
${BLANK}
${_____}${INDENT}${ArticleCaption}
`/* ========================= */);
    }

    for (let i = 0; i < Paragraphs.length; i++) {
        const Paragraph = Paragraphs[i];
        blocks.push(renderParagraphItem(Paragraph, indent, (i === 0 && ArticleTitle) ? ArticleTitle : undefined));
    }

    for (const SupplNote of SupplNotes) {
        blocks.push(renderSupplNote(SupplNote, indent));
    }

    blocks.push(
 /* ========================= */`\
${BLANK}
`/* ========================= */);

    return blocks.join("");
}



const renderParagraphItem = (el: std.Paragraph | std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10, indent: number, ArticleCaption?: string): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    let ParagraphCaption = "";
    let ParagraphItemTitle = "";
    let ParagraphItemSentence: std.ParagraphSentence | std.ItemSentence | std.Subitem1Sentence | std.Subitem2Sentence | std.Subitem3Sentence | std.Subitem4Sentence | std.Subitem5Sentence | std.Subitem6Sentence | std.Subitem7Sentence | std.Subitem8Sentence | std.Subitem9Sentence | std.Subitem10Sentence | undefined;
    const Children: Array<std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10 | std.AmendProvision | std.Class | std.TableStruct | std.FigStruct | std.StyleStruct | std.List> = [];
    for (const child of el.children) {

        if (child.tag === "ParagraphCaption") {
            ParagraphCaption = renderRun(child.children);

        } else if (child.tag === "ParagraphNum" || child.tag === "ItemTitle" || child.tag ===
            "Subitem1Title" || child.tag === "Subitem2Title" || child.tag === "Subitem3Title" || child.tag === "Subitem4Title" || child.tag ===
            "Subitem5Title" || child.tag === "Subitem6Title" || child.tag === "Subitem7Title" || child.tag === "Subitem8Title" || child.tag ===
            "Subitem9Title" || child.tag === "Subitem10Title") {
            ParagraphItemTitle = renderRun(child.children);

        } else if (child.tag === "ParagraphSentence" || child.tag === "ItemSentence" || child.tag ===
            "Subitem1Sentence" || child.tag === "Subitem2Sentence" || child.tag === "Subitem3Sentence" || child.tag === "Subitem4Sentence" || child.tag ===
            "Subitem5Sentence" || child.tag === "Subitem6Sentence" || child.tag === "Subitem7Sentence" || child.tag === "Subitem8Sentence" || child.tag ===
            "Subitem9Sentence" || child.tag === "Subitem10Sentence") {
            ParagraphItemSentence = child;

        } else if (child.tag === "Item" || child.tag === "Subitem1" || child.tag === "Subitem2" || child.tag === "Subitem3" || child.tag === "Subitem4" || child.tag === "Subitem5" || child.tag === "Subitem6" || child.tag === "Subitem7" || child.tag === "Subitem8" || child.tag === "Subitem9" || child.tag === "Subitem10" || child.tag === "AmendProvision" || child.tag === "Class" || child.tag === "TableStruct" || child.tag === "FigStruct" || child.tag === "StyleStruct" || child.tag === "List") {
            Children.push(child);

        }
        else { assertNever(child); }
    }

    if (ParagraphCaption) {
        blocks.push(
 /* ========================= */`\
${BLANK}
${_____}${INDENT}${ParagraphCaption}
`/* ========================= */);
    }

    let Title = ParagraphItemTitle;
    if (ArticleCaption) Title += ArticleCaption;
    const SentenceChildren = ParagraphItemSentence ? ParagraphItemSentence.children : [];
    blocks.push(renderBlockSentence(SentenceChildren, indent, Title));

    for (const [i, child] of Children.entries()) {
        if (child.tag === "Item" || child.tag === "Subitem1" || child.tag === "Subitem2" || child.tag === "Subitem3" || child.tag === "Subitem4" || child.tag === "Subitem5" || child.tag === "Subitem6" || child.tag === "Subitem7" || child.tag === "Subitem8" || child.tag === "Subitem9" || child.tag === "Subitem10") {
            blocks.push(renderParagraphItem(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "TableStruct") {
            const isFirstTableStruct = !(0 < i && Children[i - 1].tag === "TableStruct");
            blocks.push(renderTableStruct(child, indent + 1, !isFirstTableStruct)); /* >>>> INDENT >>>> */

        } else if (child.tag === "FigStruct") {
            blocks.push(renderFigStruct(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "StyleStruct") {
            blocks.push(renderStyleStruct(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "List") {
            blocks.push(renderList(child, indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

        } else if (child.tag === "AmendProvision") {
            blocks.push(renderAmendProvision(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "Class") {
            throw new NotImplementedError(child.tag);

        }
        else { assertNever(child); }
    }

    return blocks.join("");
}



const renderList = (el: std.List | std.Sublist1 | std.Sublist2 | std.Sublist3, indent: number): string => {
    const blocks: string[] = [];

    for (const child of el.children) {

        if (child.tag === "ListSentence" || child.tag === "Sublist1Sentence" || child.tag === "Sublist2Sentence" || child.tag === "Sublist3Sentence") {
            if (child.children.every(subchild => subchild.tag === "Sentence")) {
                for (const Sentence of child.children as std.Sentence[]) {
                    blocks.push(renderBlockSentence([Sentence], indent));
                }
            } else {
                blocks.push(renderBlockSentence(child.children, indent));
            }

        } else if (child.tag === "Sublist1" || child.tag === "Sublist2" || child.tag === "Sublist3") {
            blocks.push(renderList(child, indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return blocks.join("");
}



const renderAmendProvision = (el: std.AmendProvision, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    blocks.push(
 /* ========================= */`\
${BLANK}
${_____}:AmendProvision:
`/* ========================= */);

    for (const child of el.children) {

        if (child.tag === "AmendProvisionSentence") {
            blocks.push(renderBlockSentence(child.children, indent));

        } else if (child.tag === "NewProvision") {
            blocks.push(
 /* ========================= */`\
${_____}${child.outerXML()}
`/* ========================= */);

        }
        else { assertNever(child); }
    }

    blocks.push(
 /* ========================= */`\
${BLANK}
`/* ========================= */);

    return blocks.join("");
}



const renderTableStruct = (el: std.TableStruct, indent: number, renderTag = false): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    if (renderTag) {
        blocks.push(
 /* ========================= */`\
${_____}:table-struct:
`/* ========================= */);
    }

    for (const child of el.children) {

        if (child.tag === "TableStructTitle") {
            blocks.push(
 /* ========================= */`\
${_____}:table-struct-title:${renderRun(child.children)}
`/* ========================= */);

        } else if (child.tag === "Table") {
            blocks.push(renderTable(child, indent));

        } else if (child.tag === "Remarks") {
            blocks.push(renderRemarks(child, indent));

        }
        else { assertNever(child); }
    }

    blocks.push(
 /* ========================= */`\
${BLANK}
`/* ========================= */);

    return blocks.join("");
}



const renderTable = (el: std.Table, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    if (el.attr.WritingMode === "horizontal") {
        blocks.push(
 /* ========================= */`\
${_____}[WritingMode="horizontal"]
`/* ========================= */);
    }

    for (const child of el.children) {

        if (child.tag === "TableRow" || child.tag === "TableHeaderRow") {
            blocks.push(renderTableRow(child, indent));

        }
        else { assertNever(child); }
    }

    return blocks.join("");
}



const renderRemarks = (el: std.Remarks, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    let RemarksLabel = "";
    const ChildItems: Array<std.Item | std.Sentence> = [];
    for (const child of el.children) {

        if (child.tag === "RemarksLabel") {
            RemarksLabel = renderRun(child.children);
            if (child.attr.LineBreak === "true") RemarksLabel = /* $$$$$$ */`[LineBreak="true"]`/* $$$$$$ */ + RemarksLabel;

        } else {
            ChildItems.push(child);
        }
    }

    for (let i = 0; i < ChildItems.length; i++) {
        const child = ChildItems[i];

        if (child.tag === "Sentence") {
            blocks.push((i === 0)
                ?
 /* ========================= */`\
${_____}${RemarksLabel}${MARGIN}${renderBlockSentence([child], indent + 2).trim()}
`/* ========================= */
                : renderBlockSentence([child], indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

        } else if (child.tag === "Item") {
            if (i === 0) {
                blocks.push(
 /* ========================= */`\
${_____}${RemarksLabel}
`/* ========================= */);
            }
            blocks.push(renderParagraphItem(child, indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return blocks.join("");
}



const renderTableRow = (el: std.TableRow | std.TableHeaderRow, indent: number): string => {
    const blocks: string[] = [];

    for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i];

        if (child.tag === "TableColumn" || child.tag === "TableHeaderColumn") {
            blocks.push(renderTableColumn(child, indent, i === 0));

        }
        else { assertNever(child); }
    }

    return blocks.join("");
}



const renderTableColumn = (el: std.TableColumn | std.TableHeaderColumn, indent: number, first: boolean): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    const bullet = first
        ? "* - "
        : "  - ";
    const attr = Object.keys(el.attr).map(k => `[${k}="${el.attr[k]}"]`).join("");

    if (el.tag === "TableHeaderColumn") {
        blocks.push(
 /* ========================= */`\
${_____}${bullet}[header]${attr}${renderRun(el.children)}
`/* ========================= */);

    } else if (el.tag === "TableColumn") {
        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];

            if (child.tag === "Sentence" || child.tag === "Column") {
                blocks.push((i === 0)
                    ?
 /* ========================= */`\
${_____}${bullet}${attr}${renderBlockSentence([child], indent + 2).trim()}
`/* ========================= */
                    : renderBlockSentence([child], indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

            } else if (child.tag === "FigStruct") {
                blocks.push((i === 0)
                    ?
 /* ========================= */`\
${_____}${bullet}${attr}${renderFigStruct(child, indent + 2).trim()}
`/* ========================= */
                    : renderFigStruct(child, indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

            } else if (child.tag === "Remarks") {
                blocks.push((i === 0)
                    ?
 /* ========================= */`\
${_____}${bullet}${attr}${renderRemarks(child, indent + 2).trim()}
`/* ========================= */
                    : renderRemarks(child, indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

            } else if (child.tag === "Part" || child.tag === "Chapter" || child.tag === "Section" || child.tag === "Subsection" || child.tag === "Division") {
                blocks.push((i === 0)
                    ?
 /* ========================= */`\
${_____}${bullet}${attr}${renderArticleGroup(child, indent + 2).trim()}
`/* ========================= */
                    : renderArticleGroup(child, indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

            } else if (child.tag === "Article") {
                blocks.push((i === 0)
                    ?
 /* ========================= */`\
${_____}${bullet}${attr}${renderArticle(child, indent + 2).trim()}
`/* ========================= */
                    : renderArticle(child, indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

            } else if (child.tag === "Paragraph" || child.tag === "Item" || child.tag === "Subitem1" || child.tag === "Subitem2" || child.tag === "Subitem3" || child.tag === "Subitem4" || child.tag === "Subitem5" || child.tag === "Subitem6" || child.tag === "Subitem7" || child.tag === "Subitem8" || child.tag === "Subitem9" || child.tag === "Subitem10") {
                blocks.push((i === 0)
                    ?
 /* ========================= */`\
${_____}${bullet}${attr}${renderParagraphItem(child, indent + 2).trim()}
`/* ========================= */
                    : renderParagraphItem(child, indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

            }
            else { assertNever(child); }
        }

    }
    else { assertNever(el); }

    return blocks.join("");
}



const renderStyleStruct = (el: std.StyleStruct, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    for (const child of el.children) {

        if (child.tag === "StyleStructTitle") {
            blocks.push(
 /* ========================= */`\
${_____}:style-struct-title:${renderRun(child.children)}
`/* ========================= */);

        } else if (child.tag === "Style") {
            blocks.push(renderStyle(child, indent));

        } else if (child.tag === "Remarks") {
            blocks.push(renderRemarks(child, indent));

        }
        else { assertNever(child); }
    }

    blocks.push(
 /* ========================= */`\
${BLANK}
`/* ========================= */);

    return blocks.join("");
}



const renderStyle = (el: std.Style, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    for (const child of el.children) {
        if (isString(child)) {
            blocks.push(
 /* ========================= */`\
${_____}${renderRun([child])}
`/* ========================= */);

        } else if (std.isTable(child)) {
            blocks.push(renderTable(child, indent));

        } else if (std.isFigStruct(child)) {
            blocks.push(renderFigStruct(child, indent, true));

        } else if (std.isFig(child)) {
            blocks.push(
 /* ========================= */`\
${_____}${renderFigRun(child)}
`/* ========================= */);

        } else if (std.isList(child)) {
            blocks.push(renderList(child, indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

        } else if (std.isTableStruct(child)) {
            blocks.push(renderTableStruct(child, indent, true));

        } else if (std.isParagraph(child)) {
            blocks.push(renderParagraphItem(child, indent));

        } else if (std.isItem(child)) {
            blocks.push(renderParagraphItem(child, indent));

        } else if (std.isRemarks(child)) {
            blocks.push(renderRemarks(child, indent));

        } else if (std.isSentence(child)) {
            blocks.push(renderBlockSentence([child], indent));

        } else if (std.isArithFormula(child)) {
            blocks.push(
 /* ========================= */`\
${_____}${renderRun([child])}
`/* ========================= */);

        } else {
            throw new NotImplementedError(child.tag);

        }
    }

    blocks.push(
 /* ========================= */`\
${BLANK}
`/* ========================= */);

    return blocks.join("");
}



const renderFormatStruct = (el: std.FormatStruct, indent: number, renderTag: boolean = false): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    if (renderTag) {
        blocks.push(
 /* ========================= */`\
${_____}:format-struct:
`/* ========================= */);
    }

    for (const child of el.children) {

        if (child.tag === "FormatStructTitle") {
            blocks.push(
 /* ========================= */`\
${_____}:format-struct-title:${renderRun(child.children)}
`/* ========================= */);

        } else if (child.tag === "Format") {

            for (const subchild of child.children) {
                if (isString(subchild)) {
                    throw new NotImplementedError("string");

                } else if (std.isFig(subchild)) {
                    blocks.push(
 /* ========================= */`\
${_____}${renderFigRun(subchild)}
`/* ========================= */);

                } else {
                    throw new NotImplementedError(subchild.tag);

                }
            }

        } else if (child.tag === "Remarks") {
            blocks.push(renderRemarks(child, indent));

        }
        else { assertNever(child); }
    }

    blocks.push(
 /* ========================= */`\
${BLANK}
`/* ========================= */);

    return blocks.join("");
}



const renderFigStruct = (el: std.FigStruct, indent: number, renderTag: boolean = false): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    if (renderTag) {
        blocks.push(
 /* ========================= */`\
${_____}:fig-struct:
`/* ========================= */);
    }

    for (const child of el.children) {

        if (child.tag === "FigStructTitle") {
            blocks.push(
 /* ========================= */`\
${_____}:fig-struct-title:${renderRun(child.children)}
`/* ========================= */);

        } else if (child.tag === "Fig") {
            blocks.push(
 /* ========================= */`\
${_____}${renderFigRun(child)}
`/* ========================= */);

        } else if (child.tag === "Remarks") {
            blocks.push(renderRemarks(child, indent));

        }
        else { assertNever(child); }
    }

    blocks.push(
 /* ========================= */`\
${BLANK}
`/* ========================= */);

    return blocks.join("");
}



const renderFigRun = (el: std.Fig): string => {
    if (el.children.length > 0) {
        throw new NotImplementedError(el.outerXML());
    }

    return (/* $$$$$$ */`.. figure:: ${el.attr.src}`/* $$$$$$ */);
}



const renderNoteStruct = (el: std.NoteStruct, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    const blocks: string[] = [];

    for (const child of el.children) {

        if (child.tag === "NoteStructTitle") {
            blocks.push(
 /* ========================= */`\
${_____}:note-struct-title:${renderRun(child.children)}
`/* ========================= */);

        } else if (child.tag === "Note") {

            for (const subchild of child.children) {
                if (isString(subchild)) {
                    throw new NotImplementedError("string");

                } else if (std.isParagraph(subchild) || std.isItem(subchild)) {
                    blocks.push(renderParagraphItem(subchild, indent));

                } else if (std.isTable(subchild)) {
                    blocks.push(renderTable(subchild, indent));

                } else if (std.isStyle(subchild)) {
                    blocks.push(renderStyle(subchild, indent));

                } else if (std.isFig(subchild)) {
                    blocks.push(
 /* ========================= */`\
${_____}${renderFigRun(subchild)}
`/* ========================= */);

                } else if (std.isList(subchild)) {
                    blocks.push(renderList(subchild, indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

                } else if (std.isArithFormula(subchild)) {
                    blocks.push(
 /* ========================= */`\
${_____}${renderRun([subchild])}
`/* ========================= */);

                } else {
                    throw new NotImplementedError(subchild.tag);

                }
            }

        } else if (child.tag === "Remarks") {
            blocks.push(renderRemarks(child, indent));

        }
        else { assertNever(child); }
    }

    blocks.push(
 /* ========================= */`\
${BLANK}
`/* ========================= */);

    return blocks.join("");
}



const renderSupplNote = (el: std.SupplNote, indent: number): string => {
    const _____ = INDENT.repeat(indent);
    return (
 /* ========================= */`\
${_____}:SupplNote:${renderRun(el.children)}
`/* ========================= */);
}



const renderBlockSentence = (els: Array<std.Sentence | std.Column | std.Table>, indent: number, Title?: string): string => {
    const _____ = INDENT.repeat(indent);
    // let blocks: string[] = [];
    const runs: string[] = [];

    if (Title) {
        runs.push(/* $$$$$$ */Title/* $$$$$$ */);
        runs.push(/* $$$$$$ */MARGIN/* $$$$$$ */);
    }

    for (let i = 0; i < els.length; i++) {
        const el = els[i];

        if (el.tag === "Sentence") {
            if (el.attr.WritingMode === "horizontal") runs.push(/* $$$$$$ */`[WritingMode="horizontal"]`/* $$$$$$ */);
            runs.push(renderRun(el.children));

        } else if (el.tag === "Column") {
            if (i !== 0) {
                runs.push(/* $$$$$$ */MARGIN/* $$$$$$ */);
            }
            if (el.attr.LineBreak === "true") runs.push(/* $$$$$$ */`[LineBreak="true"]`/* $$$$$$ */);
            for (const subel of el.children) {
                runs.push(renderRun(subel.children));
            }

        } else if (el.tag === "Table") {
            throw new NotImplementedError(el.tag);

        }
        else { assertNever(el); }
    }

    return (
 /* ========================= */`\
${_____}${runs.join("")}
`/* ========================= */);
}



const renderRun = (els: Array<string | std.Line | std.QuoteStruct | std.ArithFormula | std.Ruby | std.Sup | std.Sub | std.__EL>): string => {
    const runs: string[] = [];

    for (const el of els) {
        if (isString(el)) {
            runs.push(/* $$$$$$ */el.replace(/\r|\n/, "")/* $$$$$$ */);
        } else if (el.isControl) {
            runs.push(/* $$$$$$ */el.text.replace(/\r|\n/, "")/* $$$$$$ */);

        } else if (el.tag === "Ruby" || el.tag === "Sub" || el.tag === "Sup" || el.tag === "QuoteStruct") {
            runs.push(/* $$$$$$ */el.outerXML()/* $$$$$$ */);

        } else if (el.tag === "ArithFormula") {
            runs.push(/* $$$$$$ */el.outerXML()/* $$$$$$ */);

        } else if (el.tag === "Line") {
            throw new NotImplementedError(el.tag);

        }
        else { assertNever(el.tag); }
    }

    return /* $$$$$$ */`${runs.join("")}`/* $$$$$$ */;
}




export const render = (el: EL, indent: number = 0): string => {
    let ret = "";
    if (std.isLaw(el)) {
        ret += renderLaw(el, indent);
    }
    ret = ret.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n").replace(/(\r?\n\r?\n)(?:\r?\n)+/g, "$1");
    return ret;
}
const renderLawtext = render;
export default renderLawtext;

