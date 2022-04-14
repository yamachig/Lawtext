import { range } from "../../util";
import { HTMLArticleCSS } from "./article";
import { HTMLArticleGroupCSS } from "./articleGroup";
import { HTMLColumnsOrSentencesCSS } from "./columnsOrSentences";
import { HTMLLawCSS } from "./law";
import { HTMLParagraphItemCSS } from "./paragraphItem";
import { HTMLSentenceChildrenCSS } from "./sentenceChildren";

export const HTMLIndentCSS = [...range(0, 30)]
    .map(indent => /*css*/`
.indent-${indent} {
    margin-left: ${indent}em;
}
`).join("\n");

export const htmlCSS = [
    HTMLIndentCSS,
    HTMLSentenceChildrenCSS,
    HTMLColumnsOrSentencesCSS,
    HTMLLawCSS,
    HTMLArticleGroupCSS,
    HTMLArticleCSS,
    HTMLParagraphItemCSS,
].join("\n");

export default htmlCSS;
