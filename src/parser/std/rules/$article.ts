import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import { sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import CST from "../toCSTSettings";
import { assertNever } from "../../../util";
import { SentenceChildEL, Sentences } from "../../../node/cst/inline";
import { WithErrorRule } from "../util";
import factory from "../factory";
import { VirtualOnlyLineType } from "../virtualLine";
import { $blankLine, $optBNK_DEDENT, $optBNK_INDENT } from "../util";
import { ErrorMessage } from "../../cst/error";
import $paragraphItem, { $paragraphItemChildren, paragraphItemToLines } from "./$paragraphItem";
import { rangeOfELs } from "../../../node/el";

export const articleToLines = (el: std.Article, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const ArticleCaption: (string | SentenceChildEL)[] = [];
    const ArticleTitle: (string | SentenceChildEL)[] = [];
    const Paragraphs: std.Paragraph[] = [];
    const SupplNotes: std.SupplNote[] = [];
    for (const child of el.children) {

        if (child.tag === "ArticleCaption") {
            ArticleCaption.push(...child.children);

        } else if (child.tag === "ArticleTitle") {
            ArticleTitle.push(...child.children);

        } else if (child.tag === "Paragraph") {
            Paragraphs.push(child);

        } else if (child.tag === "SupplNote") {
            SupplNotes.push(child);

        }
        else { assertNever(child); }
    }

    if (ArticleCaption.length > 0) {
        const newIndentTexts = [...indentTexts, CST.INDENT];

        lines.push(new OtherLine(
            null,
            newIndentTexts.length,
            newIndentTexts,
            [],
            [
                new Sentences(
                    "",
                    null,
                    [],
                    [newStdEL("Sentence", {}, ArticleCaption)]
                )
            ],
            CST.EOL,
        ));
    }

    for (let i = 0; i < Paragraphs.length; i++) {
        const Paragraph = Paragraphs[i];
        const paragraphLines = paragraphItemToLines(
            Paragraph,
            indentTexts,
            (i === 0 && ArticleTitle) ? ArticleTitle : undefined,
            i >= 1,
        );
        lines.push(...paragraphLines);
    }

    // TODO: Implement
    // for (const SupplNote of SupplNotes) {
    //     blocks.push(renderSupplNote(SupplNote, indent));
    // }

    return lines;
};


export const $article: WithErrorRule<std.Article> = factory
    .withName("article")
    .sequence(s => s
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(r => r
                        .oneMatch(({ item }) => {
                            if (
                                item.type === VirtualOnlyLineType.CAP
                            ) {
                                return item;
                            } else {
                                return null;
                            }
                        })
                    )
                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                )
            )
        , "captionLine")
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === LineType.ART
                ) {
                    return item;
                } else {
                    return null;
                }
            })
        , "firstParagraphLine")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(() => $optBNK_INDENT)
                    .and(() => $paragraphItemChildren, "children")
                    .and(r => r
                        .choice(c => c
                            .or(() => $optBNK_DEDENT)
                            .or(r => r
                                .noConsumeRef(r => r
                                    .sequence(s => s
                                        .and(r => r.zeroOrMore(() => $blankLine))
                                        .and(r => r.anyOne(), "unexpected")
                                        .action(({ unexpected }) => {
                                            return new ErrorMessage(
                                                "$article: この前にある項または号の終了時にインデント解除が必要です。",
                                                unexpected.virtualRange,
                                            );
                                        })
                                    )
                                )
                            )
                        )
                    , "error")
                    .action(({ children, error }) => {
                        return {
                            value: children.value,
                            errors: [
                                ...children.errors,
                                ...(error instanceof ErrorMessage ? [error] : []),
                            ],
                        };
                    })
                )
            )
        , "firstParagraphChildren")
        .and(r => r
            .zeroOrMore(r => r
                .sequence(s => s
                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                    .and(() => $paragraphItem)
                )
            )
        , "otherParagraphs")
        .action(({ captionLine, firstParagraphLine, firstParagraphChildren, otherParagraphs }) => {
            const article = newStdEL("Article");
            const errors = [
                ...(firstParagraphChildren?.errors ?? []),
                ...otherParagraphs.map(p => p.errors).flat(),
            ];

            article.attr.Delete = "false";
            article.attr.Hide = "false";

            if (captionLine) {
                article.append(
                    newStdEL(
                        "ArticleCaption",
                        {},
                        captionLine.line.sentencesArray
                            .map(sa =>
                                sa.sentences.map(s => s.children)
                            )
                            .flat(2),
                        captionLine.line.sentencesArrayRange,
                    ));
            }

            if (firstParagraphLine.line.title) {
                article.append(
                    newStdEL(
                        "ArticleTitle",
                        {},
                        [firstParagraphLine.line.title],
                        firstParagraphLine.line.titleRange,
                    ));
            }

            const firstParagraph = newStdEL("Paragraph");
            firstParagraph.attr.OldStyle = "false";
            article.append(firstParagraph);

            firstParagraph.append(newStdEL("ParagraphNum"));
            firstParagraph.append(
                newStdEL(
                    "ParagraphSentence",
                    {},
                    sentencesArrayToColumnsOrSentences(firstParagraphLine.line.sentencesArray),
                    firstParagraphLine.line.sentencesArrayRange
                )
            );

            if (firstParagraphChildren) {
                firstParagraph.extend(firstParagraphChildren.value);
            }

            firstParagraph.range = rangeOfELs(firstParagraph.children);

            article.extend(otherParagraphs.map(p => p.value));

            article.range = rangeOfELs(article.children);

            return {
                value: article,
                errors,
            };
        })
    )
    ;

export default $article;
