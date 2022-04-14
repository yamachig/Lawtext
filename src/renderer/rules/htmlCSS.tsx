import { range } from "../../util";
import { HTMLArticleCSS } from "./article";
import { HTMLArticleGroupCSS } from "./articleGroup";
import { HTMLColumnsOrSentencesCSS } from "./columnsOrSentences";
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
    HTMLParagraphItemCSS,
    HTMLArticleCSS,
    HTMLArticleGroupCSS,
].join("\n");

export default htmlCSS;
