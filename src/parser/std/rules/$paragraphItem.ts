import { ArticleLine, Line, LineType, OtherLine, ParagraphItemLine } from "../../../node/cst/line";
import { newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import { columnsOrSentencesToSentencesArray, sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import CST from "../toCSTSettings";
import { sentenceChildrenToString } from "../../cst/rules/$sentenceChildren";
import { assertNever, Diff, NotImplementedError } from "../../../util";
import { AttrEntries, AttrEntry, SentenceChildEL, Sentences } from "../../../node/cst/inline";
import { WithErrorRule } from "../util";
import factory from "../factory";
import { VirtualOnlyLineType } from "../virtualLine";
import { $blankLine, $optBNK_DEDENT, $optBNK_INDENT } from "../util";
import { ErrorMessage } from "../../cst/error";
import { isParagraphItem, isParagraphItemSentence, isParagraphItemTitle, ParagraphItem, ParagraphItemSentence, paragraphItemSentenceTags, paragraphItemTags, paragraphItemTitleTags } from "../../../law/lawUtil";


export const paragraphItemToLines = (
    el: ParagraphItem,
    indentTexts: string[],
    firstArticleParagraphArticleTitle?: (string | SentenceChildEL)[],
    secondaryArticleParagraph = false,
): Line[] => {
    const lines: Line[] = [];

    const ParagraphCaption: (string | SentenceChildEL)[] = [];
    const ParagraphItemTitle: (string | SentenceChildEL)[] = [];
    let ParagraphItemSentence: ParagraphItemSentence | undefined;
    const Children: Array<Diff<ParagraphItem, std.Paragraph> | std.AmendProvision | std.Class | std.TableStruct | std.FigStruct | std.StyleStruct | std.List> = [];
    for (const child of el.children) {

        if (child.tag === "ParagraphCaption") {
            ParagraphCaption.push(...child.children);
        } else if (std.isArticleCaption(child)) {
            console.error(`Unexpected ${el.tag} in ${el.tag}!`);
            ParagraphCaption.push(...(child as std.ArticleCaption).children);
        } else if (isParagraphItemTitle(child)) {
            ParagraphItemTitle.push(...child.children);

        } else if (isParagraphItemSentence(child)) {
            ParagraphItemSentence = child;

        } else if (isParagraphItem(child) || child.tag === "AmendProvision" || child.tag === "Class" || child.tag === "TableStruct" || child.tag === "FigStruct" || child.tag === "StyleStruct" || child.tag === "List") {
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
                new Sentences(
                    "",
                    null,
                    [],
                    [newStdEL("Sentence", {}, ParagraphCaption)]
                ),
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
        sentencesArray[0].attrEntries.unshift(
            new AttrEntry(
                `[OldNum="${OldNum}"]`,
                ["OldNum", "${OldNum}"],
                null,
                "",
                null,
            )
        );
    }
    if (MissingNum) {
        sentencesArray[0].attrEntries.unshift(
            new AttrEntry(
                `[MissingNum="${MissingNum}"]`,
                ["MissingNum", "${MissingNum}"],
                null,
                "",
                null,
            )
        );
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
        if (isParagraphItem(child)) {
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

export const $paragraphItemChildren: WithErrorRule<Diff<ParagraphItem, std.Paragraph>[]> = factory
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
                        value: Diff<ParagraphItem, std.Paragraph>,
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

export const $paragraphItem: WithErrorRule<ParagraphItem> = factory
    .withName("paragraphItem")
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
        .action(({ captionLine, firstParagraphItemLine, tailChildren }) => {
            const paragraphItem = newStdEL(
                paragraphItemTags[firstParagraphItemLine.virtualIndentDepth],
            );
            const errors = tailChildren?.errors ?? [];

            if (firstParagraphItemLine.virtualIndentDepth === 0) {
                (paragraphItem as std.Paragraph).attr.OldStyle = "false";
            } else {
                (paragraphItem as Diff<ParagraphItem, std.Paragraph>).attr.Delete = "false";
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


            if (captionLine) {
                paragraphItem.append(
                    newStdEL("ParagraphCaption",
                        {},
                        captionLine.line.sentencesArray
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
