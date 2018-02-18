import * as std from "../std_law"
import { EL, assertNever, NotImplementedError } from "../util"

const INDENT = "  "
const MARGIN = "　"
const BLANK = ""
const NEWLINE = `
`;



function renderLaw(el: std.Law, indent: number): string {
    let LawNum = "";
    let LawBody: std.LawBody | undefined = undefined;
    for (let child of el.children) {
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



function renderLawBody(el: std.LawBody, indent: number, LawNum: string): string {
    let blocks: string[] = [];
    for (let child of el.children) {

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

        } else if (child.tag === "EnactStatement") {
            blocks.push(renderEnactStatement(child, indent));

        }
        else if (child.tag === "Preamble") { throw new NotImplementedError(); }
        else if (child.tag === "AppdxNote") { throw new NotImplementedError(); }
        else if (child.tag === "Appdx") { throw new NotImplementedError(); }
        else if (child.tag === "AppdxFig") { throw new NotImplementedError(); }
        else if (child.tag === "AppdxFormat") { throw new NotImplementedError(); }
        else { assertNever(child); }
    }
    return blocks.join();
}



function renderLawTitle(el: std.LawTitle, indent: number, LawNum: string): string {
    let _____ = INDENT.repeat(indent);

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



function renderEnactStatement(el: std.EnactStatement, indent: number): string {
    let _____ = INDENT.repeat(indent);

    return (
 /* ========================= */`
${_____}${INDENT}${INDENT}${el.text}
${BLANK}
`/* ========================= */);
}



function renderTOC(el: std.TOC, indent: number): string {
    let _____ = INDENT.repeat(indent);
    let blocks: string[] = [];
    for (let child of el.children) {

        if (child.tag === "TOCLabel") {

            blocks.push(
 /* ========================= */`\
${_____}${child.text}
`/* ========================= */);

        } else if (child.tag === "TOCPart" || child.tag === "TOCChapter" || child.tag === "TOCSection" || child.tag === "TOCSupplProvision" || child.tag === "TOCArticle" || child.tag === "TOCAppdxTableLabel") {
            blocks.push(renderTOCItem(child, indent + 1)); /* >>>> INDENT >>>> */

        }
        else if (child.tag === "TOCPreambleLabel") { throw new NotImplementedError(); }
        else { assertNever(child); }
    }
    if (blocks.length > 0) {
        blocks.push(
 /* ========================= */`\
${BLANK}
`/* ========================= */);
    }
    return blocks.join();
}



function renderTOCItem(el: std.TOCPart | std.TOCChapter | std.TOCSection | std.TOCSubsection | std.TOCDivision | std.TOCSupplProvision | std.TOCArticle | std.TOCAppdxTableLabel, indent: number): string {
    let _____ = INDENT.repeat(indent);
    let blocks: string[] = [];
    if (el.tag === "TOCArticle") {
        let ArticleTitle = "";
        let ArticleCaption = "";
        for (let child of el.children) {
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

    } else if (el.tag === "TOCAppdxTableLabel") {
        throw new NotImplementedError();

    } else {
        let TocItemTitle = "";
        let ArticleRange = "";
        let TOCItems: (std.TOCChapter | std.TOCSection | std.TOCSubsection | std.TOCDivision | std.TOCArticle)[] = [];
        for (let child of el.children) {

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
        for (let TOCItem of TOCItems) {
            blocks.push(renderTOCItem(TOCItem, indent + 1)); /* >>>> INDENT >>>> */
        }

    }
    return blocks.join();
}



function renderAppdxTable(el: std.AppdxTable, indent: number): string {
    throw new NotImplementedError();
}



function renderAppdxStyle(el: std.AppdxStyle, indent: number): string {
    throw new NotImplementedError();
}



function renderSupplProvision(el: std.SupplProvision, indent: number): string {
    throw new NotImplementedError();
}



function renderArticleGroup(el: std.MainProvision | std.Part | std.Chapter | std.Section | std.Subsection | std.Division, indent: number): string {
    let _____ = INDENT.repeat(indent);
    let blocks: string[] = [];

    let ArticleGroupTitle = "";
    let ChildItems: (std.Part | std.Chapter | std.Section | std.Subsection | std.Division | std.Article | std.Paragraph)[] = [];
    for (let child of el.children) {

        if (child.tag === "PartTitle" || child.tag === "ChapterTitle" || child.tag === "SectionTitle" || child.tag === "SubsectionTitle" || child.tag === "DivisionTitle") {
            ArticleGroupTitle = renderRun(child.children);

        } else if (child.tag === "Part" || child.tag === "Chapter" || child.tag === "Section" || child.tag === "Subsection" || child.tag === "Division" || child.tag === "Article" || child.tag === "Paragraph") {
            ChildItems.push(child);

        }
        else { assertNever(child); }
    }

    if (ArticleGroupTitle) {
        blocks.push(
 /* ========================= */`\
${BLANK}
${_____}${ArticleGroupTitle}
${BLANK}
`/* ========================= */);
    }

    for (let child of ChildItems) {
        if (child.tag === "Article") {
            blocks.push(renderArticle(child, indent));

        } else if (child.tag === "Paragraph") {
            blocks.push(renderParagraphItem(child, indent));

        } else {
            blocks.push(renderArticleGroup(child, indent));
        }
    }

    return blocks.join();
}



function renderArticle(el: std.Article, indent: number): string {
    let _____ = INDENT.repeat(indent);
    let blocks: string[] = [];

    let ArticleCaption = "";
    let ArticleTitle = "";
    let Paragraphs: std.Paragraph[] = [];
    for (let child of el.children) {

        if (child.tag === "ArticleCaption") {
            ArticleCaption = renderRun(child.children);

        } else if (child.tag === "ArticleTitle") {
            ArticleTitle = renderRun(child.children);

        } else if (child.tag === "Paragraph") {
            Paragraphs.push(child);

        } else if (child.tag === "SupplNote") {
            throw new NotImplementedError();

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
        let Paragraph = Paragraphs[i];
        blocks.push(renderParagraphItem(Paragraph, indent, (i == 0 && ArticleTitle) ? ArticleTitle : undefined));
    }

    return blocks.join();
}



function renderParagraphItem(el: std.Paragraph | std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10, indent: number, ArticleCaption?: string): string {
    let _____ = INDENT.repeat(indent);
    let blocks: string[] = [];

    let ParagraphCaption = "";
    let ParagraphItemTitle = "";
    let ParagraphItemSentence: std.ParagraphSentence | std.ItemSentence | std.Subitem1Sentence | std.Subitem2Sentence | std.Subitem3Sentence | std.Subitem4Sentence | std.Subitem5Sentence | std.Subitem6Sentence | std.Subitem7Sentence | std.Subitem8Sentence | std.Subitem9Sentence | std.Subitem10Sentence | undefined = undefined;
    let Children: (std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10 | std.AmendProvision | std.Class | std.TableStruct | std.FigStruct | std.StyleStruct | std.List)[] = [];
    for (let child of el.children) {

        if (child.tag === "ParagraphCaption") {
            ParagraphCaption = renderRun(child.children);

        } else if (child.tag === 'ParagraphNum' || child.tag === 'ItemTitle' || child.tag ===
            'Subitem1Title' || child.tag === 'Subitem2Title' || child.tag === 'Subitem3Title' || child.tag === 'Subitem4Title' || child.tag ===
            'Subitem5Title' || child.tag === 'Subitem6Title' || child.tag === 'Subitem7Title' || child.tag === 'Subitem8Title' || child.tag ===
            'Subitem9Title' || child.tag === 'Subitem10Title') {
            ParagraphItemTitle = renderRun(child.children);

        } else if (child.tag === 'ParagraphSentence' || child.tag === 'ItemSentence' || child.tag ===
            'Subitem1Sentence' || child.tag === 'Subitem2Sentence' || child.tag === 'Subitem3Sentence' || child.tag === 'Subitem4Sentence' || child.tag ===
            'Subitem5Sentence' || child.tag === 'Subitem6Sentence' || child.tag === 'Subitem7Sentence' || child.tag === 'Subitem8Sentence' || child.tag ===
            'Subitem9Sentence' || child.tag === 'Subitem10Sentence') {
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
    let SentenceChildren = ParagraphItemSentence ? ParagraphItemSentence.children : [];
    blocks.push(renderBlockSentence(SentenceChildren, indent, Title));

    for (let child of Children) {
        if (child.tag === "Item" || child.tag === "Subitem1" || child.tag === "Subitem2" || child.tag === "Subitem3" || child.tag === "Subitem4" || child.tag === "Subitem5" || child.tag === "Subitem6" || child.tag === "Subitem7" || child.tag === "Subitem8" || child.tag === "Subitem9" || child.tag === "Subitem10") {
            blocks.push(renderParagraphItem(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "TableStruct") {
            blocks.push(renderTableStruct(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "FigStruct") {
            blocks.push(renderFigStruct(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "StyleStruct") {
            blocks.push(renderStyleStruct(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "List") {
            blocks.push(renderList(child, indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

        } else if (child.tag === "AmendProvision" || child.tag === "Class") {
            throw new NotImplementedError();

        }
        else { assertNever(child); }
    }

    return blocks.join();
}



function renderList(el: std.List | std.Sublist1 | std.Sublist2 | std.Sublist3, indent: number): string {
    let _____ = INDENT.repeat(indent);
    let blocks: string[] = [];

    for (let child of el.children) {

        if (child.tag === "ListSentence" || child.tag === "Sublist1Sentence" || child.tag === "Sublist2Sentence" || child.tag === "Sublist3Sentence") {
            blocks.push(renderBlockSentence(child.children, indent));

        } else if (child.tag === "Sublist1" || child.tag === "Sublist2" || child.tag === "Sublist3") {
            blocks.push(renderList(child, indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return blocks.join();
}



function renderTableStruct(el: std.TableStruct, indent: number): string {
    let _____ = INDENT.repeat(indent);
    let blocks: string[] = [];

    for (let child of el.children) {

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

    return blocks.join();
}



function renderTable(el: std.Table, indent: number): string {
    let _____ = INDENT.repeat(indent);
    let blocks: string[] = [];

    for (let child of el.children) {

        if (child.tag === "TableRow" || child.tag === "TableHeaderRow") {
            blocks.push(renderTableRow(child, indent));

        }
        else { assertNever(child); }
    }

    return blocks.join();
}



function renderRemarks(el: std.Remarks, indent: number): string {
    throw new NotImplementedError();
}



function renderTableRow(el: std.TableRow | std.TableHeaderRow, indent: number): string {
    let _____ = INDENT.repeat(indent);
    let blocks: string[] = [];

    for (let i = 0; i < el.children.length; i++) {
        let child = el.children[i];

        if (child.tag === "TableColumn" || child.tag === "TableHeaderColumn") {
            blocks.push(renderTableColumn(child, indent, i === 0));

        }
        else { assertNever(child); }
    }

    return blocks.join();
}



function renderTableColumn(el: std.TableColumn | std.TableHeaderColumn, indent: number, first: boolean): string { throw new NotImplementedError(); }



function renderStyleStruct(el: std.StyleStruct, indent: number): string { throw new NotImplementedError(); }
function renderFigStruct(el: std.FigStruct, indent: number): string { throw new NotImplementedError(); }
function renderFigRun(el: std.Fig): string { throw new NotImplementedError(); }
function renderQuoteStructRun(el: std.QuoteStruct): string { throw new NotImplementedError(); }
function renderBlockSentence(els: (std.Sentence | std.Column | std.Table)[], indent: number, Title?: string): string { throw new NotImplementedError(); }
function renderRun(els: (string | std.Line | std.Ruby | std.Sup | std.Sub | std.__EL)[]): string { throw new NotImplementedError(); }

function render(el: EL, indent: number = 0): string {
    let ret = "";
    if (std.isLaw(el)) {
        ret += renderLaw(el, indent);
    }
    return ret;
}
export default render;

