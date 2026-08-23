import { range } from "../../util/index.ts";
import { HTMLAmendProvisionCSS } from "./amendProvision.tsx";
import { HTMLAnyELsCSS } from "./any.tsx";
import { HTMLAppdxItemCSS } from "./appdxItem.tsx";
import { HTMLArithFormulaRunCSS } from "./arithFormulaRun.tsx";
import { HTMLArticleCSS } from "./article.tsx";
import { HTMLArticleGroupCSS } from "./articleGroup.tsx";
import { HTMLColumnsOrSentencesRunCSS } from "./columnsOrSentencesRun.tsx";
import { HTMLControlRunCSS } from "./controlRun.tsx";
import { HTMLFigRunCSS } from "./figRun.tsx";
import { HTMLItemStructCSS } from "./itemStruct.tsx";
import { HTMLEnactStatementCSS, HTMLLawCSS, HTMLPreambleCSS } from "./law.tsx";
import { HTMLListCSS } from "./list.tsx";
import { HTMLNoteLikeCSS } from "./noteLike.tsx";
import { HTMLParagraphItemCSS } from "./paragraphItem.tsx";
import { HTMLQuoteStructRunCSS } from "./quoteStructRun.tsx";
import { HTMLRemarksCSS } from "./remarks.tsx";
import { HTMLSentenceChildrenRunCSS } from "./sentenceChildrenRun.tsx";
import { HTMLSupplNoteCSS } from "./supplNote.tsx";
import { HTMLTableCSS } from "./table.tsx";
import { HTMLTOCCSS } from "./toc.tsx";

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
