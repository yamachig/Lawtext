import { range } from "../../util";
import { HTMLAmendProvisionCSS } from "./amendProvision";
import { HTMLAnyELsCSS } from "./any";
import { HTMLAppdxItemCSS } from "./appdxItem";
import { HTMLArithFormulaRunCSS } from "./arithFormulaRun";
import { HTMLArticleCSS } from "./article";
import { HTMLArticleGroupCSS } from "./articleGroup";
import { HTMLColumnsOrSentencesRunCSS } from "./columnsOrSentencesRun";
import { HTMLControlRunCSS } from "./controlRun";
import { HTMLFigRunCSS } from "./figRun";
import { HTMLItemStructCSS } from "./itemStruct";
import { HTMLEnactStatementCSS, HTMLLawCSS, HTMLPreambleCSS } from "./law";
import { HTMLListCSS } from "./list";
import { HTMLNoteLikeCSS } from "./noteLike";
import { HTMLParagraphItemCSS } from "./paragraphItem";
import { HTMLQuoteStructRunCSS } from "./quoteStructRun";
import { HTMLRemarksCSS } from "./remarks";
import { HTMLSentenceChildrenRunCSS } from "./sentenceChildrenRun";
import { HTMLSupplNoteCSS } from "./supplNote";
import { HTMLTableCSS } from "./table";
import { HTMLTOCCSS } from "./toc";

export const HTMLIndentCSS = [...range(0, 30)]
    .map(indent => /*css*/`
.indent-${indent} {
    margin-left: var(--margin-left);
    --margin-left: ${indent}em;
}
`).join("\n");

export const HTMLAdditionalCSS = /*css*/`
`;

export const htmlCSS = [
    HTMLIndentCSS,
    HTMLAdditionalCSS,

    HTMLAnyELsCSS,
    HTMLLawCSS,
    HTMLArticleGroupCSS,
    HTMLArticleCSS,
    HTMLParagraphItemCSS,
    HTMLTableCSS,
    HTMLItemStructCSS,
    HTMLAppdxItemCSS,
    HTMLRemarksCSS,
    HTMLNoteLikeCSS,
    HTMLListCSS,
    HTMLAmendProvisionCSS,
    HTMLSupplNoteCSS,
    HTMLEnactStatementCSS,
    HTMLPreambleCSS,
    HTMLTOCCSS,

    HTMLSentenceChildrenRunCSS,
    HTMLColumnsOrSentencesRunCSS,
    HTMLFigRunCSS,
    HTMLArithFormulaRunCSS,
    HTMLQuoteStructRunCSS,

    HTMLControlRunCSS,
].join("\n");

export default htmlCSS;
