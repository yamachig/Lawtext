import { ArticleLine, Line, LineType, OtherLine, ParagraphItemLine } from "../../../node/cst/line";
import { newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import { columnsOrSentencesToSentencesArray, sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import CST from "../toCSTSettings";
import { sentenceChildrenToString } from "../../cst/rules/$sentenceChildren";
import { assertNever, NotImplementedError } from "../../../util";
import { AttrEntries, SentenceChildEL } from "../../../node/cst/inline";
import { WithErrorRule } from "../util";
import factory from "../factory";
import { VirtualOnlyLineType } from "../virtualLine";
import { $blankLine, $optBNK_DEDENT, $optBNK_INDENT } from "../util";
import { ErrorMessage } from "../../cst/error";
import { paragraphItemSentenceTags, paragraphItemTags, paragraphItemTitleTags } from "../../../law/lawUtil";


export const paragraphItemToLines = (
    el: std.Paragraph | std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10,
    indentTexts: string[],
    firstArticleParagraphArticleTitle?: (string | SentenceChildEL)[],
    secondaryArticleParagraph = false,
): Line[] => {
    const lines: Line[] = [];

    const ParagraphCaption: (string | SentenceChildEL)[] = [];
    const ParagraphItemTitle: (string | SentenceChildEL)[] = [];
    let ParagraphItemSentence: std.ParagraphSentence | std.ItemSentence | std.Subitem1Sentence | std.Subitem2Sentence | std.Subitem3Sentence | std.Subitem4Sentence | std.Subitem5Sentence | std.Subitem6Sentence | std.Subitem7Sentence | std.Subitem8Sentence | std.Subitem9Sentence | std.Subitem10Sentence | undefined;
    const Children: Array<std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10 | std.AmendProvision | std.Class | std.TableStruct | std.FigStruct | std.StyleStruct | std.List> = [];
    for (const child of el.children) {

        if (child.tag === "ParagraphCaption") {
            ParagraphCaption.push(...child.children);
        } else if (std.isArticleCaption(child)) {
            console.error(`Unexpected ${el.tag} in ${el.tag}!`);
            ParagraphCaption.push(...(child as std.ArticleCaption).children);
        } else if (child.tag === "ParagraphNum" || child.tag === "ItemTitle" || child.tag ===
            "Subitem1Title" || child.tag === "Subitem2Title" || child.tag === "Subitem3Title" || child.tag === "Subitem4Title" || child.tag ===
            "Subitem5Title" || child.tag === "Subitem6Title" || child.tag === "Subitem7Title" || child.tag === "Subitem8Title" || child.tag ===
            "Subitem9Title" || child.tag === "Subitem10Title") {
            ParagraphItemTitle.push(...child.children);

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

    if (ParagraphCaption.length > 0) {
        const newIndentTexts = [...indentTexts, CST.INDENT];

        lines.push(new OtherLine(
            null,
            newIndentTexts.length,
            newIndentTexts,
            [],
            [
                {
                    leadingSpace: "",
                    attrEntries: [],
                    sentences: [newStdEL("Sentence", {}, ParagraphCaption)]
                }
            ],
            CST.EOL,
        ));
    }

    const Title = ParagraphItemTitle;
    if (
        firstArticleParagraphArticleTitle
        && firstArticleParagraphArticleTitle.length > 0
    ) Title.push(...firstArticleParagraphArticleTitle);

    const OldNum = (Title.length === 0 && el.tag === "Paragraph" && el.attr.OldNum === "true") ? "true" : undefined;
    const MissingNum = (secondaryArticleParagraph && Title.length === 0 && el.tag === "Paragraph" && el.attr.OldNum !== "true") ? "true" : undefined;

    const SentenceChildren = ParagraphItemSentence ? ParagraphItemSentence.children : [];
    const sentencesArray = columnsOrSentencesToSentencesArray(SentenceChildren);
    if (OldNum) {
        sentencesArray[0].attrEntries.unshift({
            text: `[OldNum="${OldNum}"]`,
            entry: ["OldNum", "${OldNum}"],
            trailingSpace: "",
        });
    }
    if (MissingNum) {
        sentencesArray[0].attrEntries.unshift({
            text: `[MissingNum="${MissingNum}"]`,
            entry: ["MissingNum", "${MissingNum}"],
            trailingSpace: "",
        });
    }

    if (firstArticleParagraphArticleTitle) {
        lines.push(new ArticleLine(
            null,
            indentTexts.length,
            indentTexts,
            sentenceChildrenToString(firstArticleParagraphArticleTitle),
            CST.MARGIN,
            sentencesArray,
            CST.EOL,
        ));
    } else {
        lines.push(new ParagraphItemLine(
            null,
            indentTexts.length,
            indentTexts,
            sentenceChildrenToString(Title),
            Title.length === 0 ? "" : CST.MARGIN,
            sentencesArray,
            CST.EOL,
        ));
    }

    for (const child of Children) {
        if (child.tag === "Item" || child.tag === "Subitem1" || child.tag === "Subitem2" || child.tag === "Subitem3" || child.tag === "Subitem4" || child.tag === "Subitem5" || child.tag === "Subitem6" || child.tag === "Subitem7" || child.tag === "Subitem8" || child.tag === "Subitem9" || child.tag === "Subitem10") {
            lines.push(...paragraphItemToLines(child, [...indentTexts, CST.INDENT])); /* >>>> INDENT >>>> */

        } else if (child.tag === "TableStruct") {
            // TODO: Implement
            throw new NotImplementedError(child.tag);
            // const isFirstTableStruct = !(0 < i && Children[i - 1].tag === "TableStruct");
            // blocks.push(renderTableStruct(child, indent + 1, !isFirstTableStruct)); /* >>>> INDENT >>>> */

        } else if (child.tag === "FigStruct") {
            // TODO: Implement
            throw new NotImplementedError(child.tag);
            // blocks.push(renderFigStruct(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "StyleStruct") {
            // TODO: Implement
            throw new NotImplementedError(child.tag);
            // blocks.push(renderStyleStruct(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "List") {
            // TODO: Implement
            throw new NotImplementedError(child.tag);
            // blocks.push(renderList(child, indent + 2)); /* >>>> INDENT ++++ INDENT >>>> */

        } else if (child.tag === "AmendProvision") {
            // TODO: Implement
            throw new NotImplementedError(child.tag);
            // blocks.push(renderAmendProvision(child, indent + 1)); /* >>>> INDENT >>>> */

        } else if (child.tag === "Class") {
            throw new NotImplementedError(child.tag);

        }
        else { assertNever(child); }
    }

    return lines;
};

export const $paragraphItemChildren: WithErrorRule<(std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10)[]> = factory
    .withName("paragraphItemChildren")
    .sequence(s => s
        .and(r => r
            .oneOrMore(r => r
                .choice(c => c
                    .orSequence(s => s
                        .and(() => $paragraphItem, "elWithErrors")
                        .and(r => r.assert(({ elWithErrors }) => !std.isParagraph(elWithErrors.value)))
                        .action(({ elWithErrors }) => {
                            return elWithErrors as {
                        value: std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10,
                        errors: ErrorMessage[],
                    };
                        })
                    )
                )
            )
        , "children")
        .action(({ children }) => {
            return {
                value: children.map(c => c.value),
                errors: children.map(c => c.errors).flat(),
            };
        })
    );

export const $paragraphItem: WithErrorRule<std.Paragraph | std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10> = factory
    .withName("paragraphItem")
    .sequence(s => s
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(r => r
                        .oneMatch(({ item }) => {
                            if (
                                item.type === VirtualOnlyLineType.TTL
                            ) {
                                return item;
                            } else {
                                return null;
                            }
                        })
                    )
                    // .andOmit(r => r
                    //     .nextIs(r => r
                    //         .sequence(s => s
                    //             .and(r => r.zeroOrMore(() => $blankLine))
                    //             .and(r => r
                    //                 .oneMatch(({ item }) => {
                    //                     if (
                    //                         item.type === LineType.PIT
                    //                         && item.virtualIndentDepth === 0
                    //                     ) {
                    //                         return item;
                    //                     } else {
                    //                         return null;
                    //                     }
                    //                 })
                    //             )
                    //         )
                    //     )
                    // )
                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                )
            )
        , "titleLine")
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === LineType.PIT
                ) {
                    return item;
                } else {
                    return null;
                }
            })
        , "firstParagraphItemLine")
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
                                                "$paragraphItem: この前にある項または号の終了時にインデント解除が必要です。",
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
        , "tailChildren")
        .action(({ titleLine, firstParagraphItemLine, tailChildren }) => {
            const paragraphItem = newStdEL(
                paragraphItemTags[firstParagraphItemLine.virtualIndentDepth],
            );
            const errors = tailChildren?.errors ?? [];

            if (firstParagraphItemLine.virtualIndentDepth === 0) {
                (paragraphItem as std.Paragraph).attr.OldStyle = "false";
            } else {
                (paragraphItem as std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10).attr.Delete = "false";
            }

            const replacedAttrEntries: AttrEntries = [];

            if (firstParagraphItemLine.line.sentencesArray.length >= 1) {
                for (const attrEntry of firstParagraphItemLine.line.sentencesArray[0].attrEntries) {
                    if (attrEntry.entry[0] === "OldNum") {
                        (paragraphItem as std.Paragraph).attr.OldNum = attrEntry.entry[1];
                    } else {
                        replacedAttrEntries.push(attrEntry);
                    }
                }
            }
            firstParagraphItemLine.line.sentencesArray[0].attrEntries.splice(0);
            firstParagraphItemLine.line.sentencesArray[0].attrEntries.push(...replacedAttrEntries);


            if (titleLine) {
                paragraphItem.append(
                    newStdEL("ParagraphCaption",
                        {},
                        titleLine.line.sentencesArray
                            .map(sa =>
                                sa.sentences.map(s => s.children)
                            )
                            .flat(2)
                    ));
            }

            if (firstParagraphItemLine.line.title) {
                paragraphItem.append(
                    newStdEL(paragraphItemTitleTags[firstParagraphItemLine.virtualIndentDepth],
                        {},
                        [firstParagraphItemLine.line.title]
                    ));
            }
            paragraphItem.append(
                newStdEL(paragraphItemSentenceTags[firstParagraphItemLine.virtualIndentDepth],
                    {},
                    sentencesArrayToColumnsOrSentences(firstParagraphItemLine.line.sentencesArray)
                ));

            if (tailChildren) {
                paragraphItem.extend(tailChildren.value);
            }

            return {
                value: paragraphItem,
                errors,
            };
        })
    )
    ;

export default $paragraphItem;
