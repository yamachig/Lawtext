import * as std from "../std_law"
import { EL, assertNever, NotImplementedError } from "../util"
import { isString } from "util";

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
        else if (child.tag === "Preamble") { throw new NotImplementedError(child.tag); }
        else if (child.tag === "AppdxNote") { throw new NotImplementedError(child.tag); }
        else if (child.tag === "Appdx") { throw new NotImplementedError(child.tag); }
        else if (child.tag === "AppdxFig") { throw new NotImplementedError(child.tag); }
        else if (child.tag === "AppdxFormat") { throw new NotImplementedError(child.tag); }
        else { assertNever(child); }
    }
    return blocks.join("");
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
        else if (child.tag === "TOCPreambleLabel") { throw new NotImplementedError(child.tag); }
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
        throw new NotImplementedError(el.tag);

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
    return blocks.join("");
}



function renderAppdxTable(el: std.AppdxTable, indent: number): string {
    let _____ = INDENT.repeat(indent);
    let blocks: string[] = [];

    let AppdxTableTitle = "";
    let RelatedArticleNum = "";
    let ChildItems: (std.TableStruct | std.Item | std.Remarks)[] = [];
    for (let child of el.children) {

        if (child.tag === "AppdxTableTitle") {
            AppdxTableTitle = renderRun(child.children);

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

    for (let child of ChildItems) {
        if (child.tag === "TableStruct") {
            blocks.push(renderTableStruct(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "Item") {
            blocks.push(renderParagraphItem(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "Remarks") {
            blocks.push(renderRemarks(child, indent + 1)); /* >>>> INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return blocks.join("");
}



function renderAppdxStyle(el: std.AppdxStyle, indent: number): string {
    let _____ = INDENT.repeat(indent);
    let blocks: string[] = [];

    let AppdxStyleTitle = "";
    let RelatedArticleNum = "";
    let ChildItems: (std.StyleStruct | std.Item | std.Remarks)[] = [];
    for (let child of el.children) {

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

    for (let child of ChildItems) {
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



function renderSupplProvision(el: std.SupplProvision, indent: number): string {
    let _____ = INDENT.repeat(indent);
    let blocks: string[] = [];

    let SupplProvisionLabel = "";
    let Extract = el.attr.Extract == "true" ? `${MARGIN}抄` : "";
    let ChildItems: (std.Chapter | std.Article | std.Paragraph | std.SupplProvisionAppdxTable | std.SupplProvisionAppdxStyle | std.SupplProvisionAppdx)[] = [];
    for (let child of el.children) {

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

    for (let child of ChildItems) {
        if (child.tag === "Article") {
            blocks.push(renderArticle(child, indent));

        } else if (child.tag === "Paragraph") {
            blocks.push(renderParagraphItem(child, indent));

        } else if (child.tag === "Chapter") {
            blocks.push(renderArticleGroup(child, indent));

        } else if (child.tag === "SupplProvisionAppdxTable") {
            throw new NotImplementedError(child.tag);

        } else if (child.tag === "SupplProvisionAppdxStyle") {
            throw new NotImplementedError(child.tag);

        } else if (child.tag === "SupplProvisionAppdx") {
            throw new NotImplementedError(child.tag);

        }
        else { assertNever(child); }
    }

    return blocks.join("");
}



function renderArticleGroup(el: std.MainProvision | std.Part | std.Chapter | std.Section | std.Subsection | std.Division, indent: number): string {
    let _____ = INDENT.repeat(indent);
    let blocks: string[] = [];

    let ArticleGroupTitle = "";
    let ChildItems: (std.Part | std.Chapter | std.Section | std.Subsection | std.Division | std.Article | std.Paragraph)[] = [];
    for (let child of el.children) {

        if (child.tag === "PartTitle" || child.tag === "ChapterTitle" || child.tag === "SectionTitle" || child.tag === "SubsectionTitle" || child.tag === "DivisionTitle") {
            let titleIndent =
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

    for (let child of ChildItems) {
        if (child.tag === "Article") {
            blocks.push(renderArticle(child, indent));

        } else if (child.tag === "Paragraph") {
            blocks.push(renderParagraphItem(child, indent));

        } else {
            blocks.push(renderArticleGroup(child, indent));
        }
    }

    return blocks.join("");
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
            throw new NotImplementedError(child.tag);

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

    return blocks.join("");
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
            throw new NotImplementedError(child.tag);

        }
        else { assertNever(child); }
    }

    return blocks.join("");
}



function renderList(el: std.List | std.Sublist1 | std.Sublist2 | std.Sublist3, indent: number): string {
    let blocks: string[] = [];

    for (let child of el.children) {

        if (child.tag === "ListSentence" || child.tag === "Sublist1Sentence" || child.tag === "Sublist2Sentence" || child.tag === "Sublist3Sentence") {
            blocks.push(renderBlockSentence(child.children, indent));

        } else if (child.tag === "Sublist1" || child.tag === "Sublist2" || child.tag === "Sublist3") {
            blocks.push(renderList(child, indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

        }
        else { assertNever(child); }
    }

    return blocks.join("");
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

    return blocks.join("");
}



function renderTable(el: std.Table, indent: number): string {
    let blocks: string[] = [];

    for (let child of el.children) {

        if (child.tag === "TableRow" || child.tag === "TableHeaderRow") {
            blocks.push(renderTableRow(child, indent));

        }
        else { assertNever(child); }
    }

    return blocks.join("");
}



function renderRemarks(el: std.Remarks, indent: number): string {
    let _____ = INDENT.repeat(indent);
    let blocks: string[] = [];

    let RemarksLabel = "";
    let ChildItems: (std.Item | std.Sentence)[] = [];
    for (let child of el.children) {

        if (child.tag === "RemarksLabel") {
            RemarksLabel = renderRun(child.children);

        } else {
            ChildItems.push(child);
        }
    }

    for (let i = 0; i < ChildItems.length; i++) {
        let child = ChildItems[i];

        if (child.tag === "Sentence") {
            blocks.push((i == 0)
                ?
 /* ========================= */`\
${_____}${RemarksLabel}${MARGIN}${renderBlockSentence([child], indent + 2).trim()}
`/* ========================= */
                : renderBlockSentence([child], indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

        } else if (child.tag === "Item") {
            if (i == 0) {
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



function renderTableRow(el: std.TableRow | std.TableHeaderRow, indent: number): string {
    let blocks: string[] = [];

    for (let i = 0; i < el.children.length; i++) {
        let child = el.children[i];

        if (child.tag === "TableColumn" || child.tag === "TableHeaderColumn") {
            blocks.push(renderTableColumn(child, indent, i === 0));

        }
        else { assertNever(child); }
    }

    return blocks.join("");
}



function renderTableColumn(el: std.TableColumn | std.TableHeaderColumn, indent: number, first: boolean): string {
    let _____ = INDENT.repeat(indent);
    let blocks: string[] = [];

    let bullet = first
        ? "* - "
        : "  - ";
    let attr = Object.keys(el.attr).map(k => `[${k}="${el.attr[k]}"]`).join("");

    if (el.tag === "TableHeaderColumn") {
        blocks.push(
 /* ========================= */`\
${_____}${bullet}[header]${attr}${renderRun(el.children)}
`/* ========================= */);

    } else if (el.tag === "TableColumn") {
        for (let i = 0; i < el.children.length; i++) {
            let child = el.children[i];

            if (child.tag === "Sentence" || child.tag === "Column") {
                blocks.push((i == 0)
                    ?
 /* ========================= */`\
${_____}${bullet}${attr}${renderBlockSentence([child], indent + 2).trim()}
`/* ========================= */
                    : renderBlockSentence([child], indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

            } else if (child.tag === "FigStruct") {
                blocks.push((i == 0)
                    ?
 /* ========================= */`\
${_____}${bullet}${attr}${renderFigStruct(child, indent + 2).trim()}
`/* ========================= */
                    : renderFigStruct(child, indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

            } else if (child.tag === "Part" || child.tag === "Chapter" || child.tag === "Section" || child.tag === "Subsection" || child.tag === "Division" || child.tag === "Article" || child.tag === "Paragraph" || child.tag === "Item" || child.tag === "Subitem1" || child.tag === "Subitem2" || child.tag === "Subitem3" || child.tag === "Subitem4" || child.tag === "Subitem5" || child.tag === "Subitem6" || child.tag === "Subitem7" || child.tag === "Subitem8" || child.tag === "Subitem9" || child.tag === "Subitem10" || child.tag === "Remarks") {
                throw new NotImplementedError(child.tag);
            }
            else { assertNever(child); }
        }

    }
    else { assertNever(el); }

    return blocks.join("");
}



function renderStyleStruct(el: std.StyleStruct, indent: number): string {
    let _____ = INDENT.repeat(indent);
    let blocks: string[] = [];

    for (let child of el.children) {

        if (child.tag === "StyleStructTitle") {
            blocks.push(
 /* ========================= */`\
${_____}:style-struct-title:${renderRun(child.children)}
`/* ========================= */);

        } else if (child.tag === "Style") {

            for (let subchild of child.children) {
                if (isString(subchild)) {
                    throw new NotImplementedError("string");

                } else if (std.isTable(subchild)) {
                    blocks.push(renderTable(subchild, indent));

                } else if (std.isFig(subchild)) {
                    blocks.push(
 /* ========================= */`\
${_____}${renderFigRun(subchild)}
`/* ========================= */);

                } else if (std.isList(subchild)) {
                    blocks.push(renderList(subchild, indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

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



function renderFigStruct(el: std.FigStruct, indent: number): string {
    let _____ = INDENT.repeat(indent);
    let blocks: string[] = [];

    for (let child of el.children) {

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



function renderFigRun(el: std.Fig): string {
    if (el.children.length > 0) {
        throw new NotImplementedError(el.outerXML());
    }

    return (/* $$$$$$ */`.. figure:: ${el.attr.src}`/* $$$$$$ */);
}



function renderBlockSentence(els: (std.Sentence | std.Column | std.Table)[], indent: number, Title?: string): string {
    let _____ = INDENT.repeat(indent);
    // let blocks: string[] = [];
    let runs: string[] = [];

    if (Title) {
        runs.push(/* $$$$$$ */Title/* $$$$$$ */);
        runs.push(/* $$$$$$ */MARGIN/* $$$$$$ */);
    }

    for (let i = 0; i < els.length; i++) {
        let el = els[i];

        if (el.tag === "Sentence") {
            runs.push(renderRun(el.children));

        } else if (el.tag === "Column") {
            if (i != 0) {
                runs.push(/* $$$$$$ */MARGIN/* $$$$$$ */);
            }
            for (let subel of el.children) {
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



function renderRun(els: (string | std.Line | std.QuoteStruct | std.ArithFormula | std.Ruby | std.Sup | std.Sub | std.__EL)[]): string {
    let runs: string[] = [];

    for (let el of els) {
        if (isString(el)) {
            runs.push(/* $$$$$$ */el/* $$$$$$ */);
        } else if (el.isControl) {
            runs.push(/* $$$$$$ */el.text/* $$$$$$ */);

        } else if (el.tag === "Ruby" || el.tag === "Sub" || el.tag === "Sup" || el.tag === "QuoteStruct") {
            runs.push(/* $$$$$$ */el.outerXML()/* $$$$$$ */);

        } else if (el.tag === "ArithFormula") {
            throw new NotImplementedError(el.tag);

        } else if (el.tag === "Line") {
            throw new NotImplementedError(el.tag);

        }
        else { assertNever(el.tag); }
    }

    return /* $$$$$$ */`${runs.join("")}`/* $$$$$$ */;
}




export function render(el: EL, indent: number = 0): string {
    let ret = "";
    if (std.isLaw(el)) {
        ret += renderLaw(el, indent);
    }
    ret = ret.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n").replace(/(\r?\n\r?\n)(?:\r?\n)+/g, "$1");
    return ret;
}
let render_lawtext = render;
export default render_lawtext;

