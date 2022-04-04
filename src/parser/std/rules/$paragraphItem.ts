import { ArticleLine, BlankLine, Line, LineType, OtherLine, ParagraphItemLine } from "../../../node/cst/line";
import { isParagraph, newStdEL, paragraphItemTags } from "../../../law/std";
import * as std from "../../../law/std";
import { columnsOrSentencesToSentencesArray, sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import CST from "../toCSTSettings";
import { sentenceChildrenToString } from "../../cst/rules/$sentenceChildren";
import { assertNever, Diff, NotImplementedError } from "../../../util";
import { AttrEntries, AttrEntry, Control, SentenceChildEL, Sentences } from "../../../node/cst/inline";
import { makeIndentBlockWithCaptureRule, WithErrorRule } from "../util";
import factory, { VirtualLineRuleFactory } from "../factory";
import { VirtualLine, VirtualOnlyLineType } from "../virtualLine";
import { $blankLine } from "../util";
import { ErrorMessage } from "../../cst/error";
import { rangeOfELs } from "../../../node/el";
import $amendProvision, { amendProvisionToLines } from "./$amendProvision";
import { Env } from "../env";
import { $listsOuter, listOrSublistToLines } from "./$list";
import $tableStruct, { tableStructToLines } from "./$tableStruct";
import $figStruct, { figStructToLines } from "./$figStruct";
import { $styleStruct, noteLikeStructToLines } from "./$noteLike";
import { paragraphItemTitleMatch, paragraphItemTitleRule } from "../../cst/rules/$paragraphItemLine";
import { autoTagControls, tagControls } from "../../cst/rules/$tagControl";


export const paragraphItemToLines = (
    el: std.ParagraphItem,
    indentTexts: string[],
    firstArticleParagraphArticleTitle?: (string | SentenceChildEL)[],
    secondaryArticleParagraph = false,
): Line[] => {
    const lines: Line[] = [];

    const ParagraphCaption: (string | SentenceChildEL)[] = [];
    const ParagraphItemTitle: (string | SentenceChildEL)[] = [];
    let ParagraphItemSentence: std.ParagraphItemSentence | undefined;
    const Children: Array<Diff<std.ParagraphItem, std.Paragraph> | std.AmendProvision | std.Class | std.TableStruct | std.FigStruct | std.StyleStruct | std.List> = [];
    for (const child of el.children) {

        if (child.tag === "ParagraphCaption") {
            ParagraphCaption.push(...child.children);
        } else if (std.isArticleCaption(child)) {
            console.error(`Unexpected ${el.tag} in ${el.tag}!`);
            ParagraphCaption.push(...(child as std.ArticleCaption).children);
        } else if (std.isParagraphItemTitle(child)) {
            ParagraphItemTitle.push(...child.children);

        } else if (std.isParagraphItemSentence(child)) {
            ParagraphItemSentence = child;

        } else if (std.isParagraphItem(child) || child.tag === "AmendProvision" || child.tag === "Class" || child.tag === "TableStruct" || child.tag === "FigStruct" || child.tag === "StyleStruct" || child.tag === "List") {
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
            el.tag,
            (
                (
                    paragraphItemTags.indexOf(el.tag) === indentTexts.length
                )
                    ? []
                    : (
                        (el.tag in paragraphItemTitleRule)
                        && (
                            paragraphItemTitleMatch[el.tag as keyof typeof paragraphItemTitleRule]( sentenceChildrenToString(ParagraphItemTitle)).ok
                        )
                    )
                        ? [
                            new Control(
                                autoTagControls[0],
                                null,
                                " ",
                                null,
                            )
                        ]
                        : [
                            new Control(
                                tagControls[el.tag],
                                null,
                                "",
                                null,
                            )
                        ]
            ),
            sentenceChildrenToString(Title),
            (Title.length === 0 || sentencesArray.length === 0) ? "" : CST.MARGIN,
            sentencesArray,
            CST.EOL,
        ));
    }

    for (const child of Children) {
        if (std.isParagraphItem(child)) {
            lines.push(...paragraphItemToLines(child, [...indentTexts, CST.INDENT])); /* >>>> INDENT >>>> */

        } else if (child.tag === "TableStruct") {
            lines.push(new BlankLine(null, CST.EOL));
            lines.push(...tableStructToLines(child, [...indentTexts, CST.INDENT])); /* >>>> INDENT >>>> */
            lines.push(new BlankLine(null, CST.EOL));

        } else if (child.tag === "FigStruct") {
            lines.push(new BlankLine(null, CST.EOL));
            lines.push(...figStructToLines(child, [...indentTexts, CST.INDENT])); /* >>>> INDENT >>>> */
            lines.push(new BlankLine(null, CST.EOL));

        } else if (child.tag === "StyleStruct") {
            lines.push(new BlankLine(null, CST.EOL));
            lines.push(...noteLikeStructToLines(child, [...indentTexts, CST.INDENT])); /* >>>> INDENT >>>> */
            lines.push(new BlankLine(null, CST.EOL));

        } else if (child.tag === "List") {
            lines.push(...listOrSublistToLines(child, [...indentTexts, CST.INDENT, CST.INDENT])); /* >>>> INDENT ++++ INDENT >>>> */

        } else if (child.tag === "AmendProvision") {
            lines.push(...amendProvisionToLines(child, [...indentTexts, CST.INDENT])); /* >>>> INDENT >>>> */

        } else if (child.tag === "Class") {
            throw new NotImplementedError(child.tag);

        }
        else { assertNever(child); }
    }

    return lines;
};


const $paragraphItemNotAmendChildrenBlock = makeIndentBlockWithCaptureRule(
    "$paragraphItemNotAmendChildrenBlock",
    (factory
        .choice(c => c
            .orSequence(s => s
                .and(() => $listsOuter, "content")
                .action(({ content }) => {
                    return {
                        value: content.value.map(c => c.value),
                        errors: [
                            ...content.errors,
                            ...content.value.map(c => c.errors).flat(),
                        ],
                    };
                })
            )
            .orSequence(s => s
                .and(r => r
                    .choice(c => c
                        .orSequence(s => s
                            .and(() => $paragraphItem, "elWithErrors")
                            .and(r => r.assert(({ elWithErrors }) => !std.isParagraph(elWithErrors.value)))
                            .action(({ elWithErrors }) => {
                                return elWithErrors as {
                                    value: Diff<std.ParagraphItem, std.Paragraph>,
                                    errors: ErrorMessage[],
                                };
                            })
                        )
                        .or(() => $tableStruct)
                        .or(() => $figStruct)
                        .or(() => $styleStruct)
                    )
                , "content")
                .action(({ content }) => {
                    return {
                        value: [content.value],
                        errors: content.errors,
                    };
                })
            )
        )
    ),
);

const $amendProvisionsBlock = makeIndentBlockWithCaptureRule(
    "$amendProvisionsBlock",
    (factory.ref(() => $amendProvision)),
);

export const $paragraphItemChildrenOuter: WithErrorRule<
    std.ParagraphItem["children"][number][]
> = (
    factory as VirtualLineRuleFactory<
        Env & {
            firstParagraphItemLine: VirtualLine & {
                type: LineType.ART | LineType.PIT | LineType.OTH;
            }
        }
    >
)
    .withName("paragraphItemChildrenOuter")
    .sequence(s => s
        .and(r => r
            .choice(c => c
                .orSequence(s => s
                    .andOmit(r => r.assert(({ firstParagraphItemLine }) => {
                        const lastText = firstParagraphItemLine.line
                            .sentencesArray.slice(-1)[0]
                            ?.sentences.slice(-1)[0]
                            ?.text ?? "";
                        const m = /.*?の一部を次のように(?:改正す|改め)る。$/.exec(lastText);
                        return m !== null;
                    }))
                    .and(() => $amendProvisionsBlock, "block")
                    .action(({ block }) => {
                        return {
                            value: block.value.map(c => c.value),
                            errors: [
                                ...block.errors,
                                ...block.value.map(c => c.errors).flat(),
                            ],
                        };
                    })
                )
                .orSequence(s => s
                    .and(() => $paragraphItemNotAmendChildrenBlock, "block")
                    .action(({ block }) => {
                        return {
                            value: block.value.map(c => c.value).flat(),
                            errors: [
                                ...block.errors,
                                ...block.value.map(c => c.errors).flat(),
                            ],
                        };
                    })
                )
            )
        , "childrenBlock")
        .action(({ childrenBlock }) => {
            const value: std.ParagraphItem["children"][number][] = [];
            const errors: ErrorMessage[] = [];

            value.push(...childrenBlock.value);
            errors.push(...childrenBlock.errors);

            return {
                value,
                errors,
            };
        })
    );

export const $paragraphItem: WithErrorRule<std.ParagraphItem> = factory
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
            .zeroOrOne(() => $paragraphItemChildrenOuter)
        , "tailChildren")
        .action(({ captionLine, firstParagraphItemLine, tailChildren }) => {

            const paragraphItem = newStdEL(firstParagraphItemLine.line.mainTag);
            const errors = tailChildren?.errors ?? [];

            if (isParagraph(paragraphItem)) {
                (paragraphItem as std.Paragraph).attr.OldStyle = "false";
            } else {
                (paragraphItem as Diff<std.ParagraphItem, std.Paragraph>).attr.Delete = "false";
            }

            if (firstParagraphItemLine.line.sentencesArray.length >= 1) {
                const replacedAttrEntries: AttrEntries = [];
                for (const attrEntry of firstParagraphItemLine.line.sentencesArray[0].attrEntries) {
                    if (attrEntry.entry[0] === "OldNum") {
                        (paragraphItem as std.Paragraph).attr.OldNum = attrEntry.entry[1];
                    } else {
                        replacedAttrEntries.push(attrEntry);
                    }
                }
                firstParagraphItemLine.line.sentencesArray[0].attrEntries.splice(0);
                firstParagraphItemLine.line.sentencesArray[0].attrEntries.push(...replacedAttrEntries);
            }


            if (captionLine) {
                paragraphItem.append(
                    newStdEL(
                        "ParagraphCaption",
                        {},
                        captionLine.line.sentencesArray
                            .map(sa =>
                                sa.sentences.map(s => s.children)
                            )
                            .flat(2),
                        captionLine.line.sentencesArrayRange,
                    )
                );
            }

            if (firstParagraphItemLine.line.title) {
                paragraphItem.append(
                    newStdEL(
                        std.paragraphItemTitleTags[std.paragraphItemTags.indexOf(firstParagraphItemLine.line.mainTag)],
                        {},
                        [firstParagraphItemLine.line.title],
                        firstParagraphItemLine.line.titleRange,
                    )
                );
            }

            paragraphItem.append(
                newStdEL(
                    std.paragraphItemSentenceTags[std.paragraphItemTags.indexOf(firstParagraphItemLine.line.mainTag)],
                    {},
                    sentencesArrayToColumnsOrSentences(firstParagraphItemLine.line.sentencesArray),
                    firstParagraphItemLine.line.sentencesArrayRange,
                ));

            if (tailChildren) {
                paragraphItem.extend(tailChildren.value);
            }

            paragraphItem.range = rangeOfELs(paragraphItem.children);

            return {
                value: paragraphItem,
                errors,
            };
        })
    )
    ;

export const $noNumParagraph: WithErrorRule<std.ParagraphItem> = factory
    .withName("noNumParagraph")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === LineType.OTH
                    && item.line.controls.length === 0
                ) {
                    return item;
                } else {
                    return null;
                }
            })
        , "firstParagraphItemLine")
        .and(r => r
            .zeroOrOne(() => $paragraphItemChildrenOuter)
        , "tailChildren")
        .action(({ firstParagraphItemLine, tailChildren }) => {

            const paragraph = newStdEL(
                "Paragraph",
                {
                    OldStyle: "false",
                },
                [
                    newStdEL("ParagraphNum"),
                    newStdEL(
                        "ParagraphSentence",
                        {},
                        sentencesArrayToColumnsOrSentences(firstParagraphItemLine.line.sentencesArray),
                        firstParagraphItemLine.line.sentencesArrayRange,
                    ),
                ]
            );

            if (tailChildren) {
                paragraph.extend(tailChildren.value);
            }

            paragraph.range = rangeOfELs(paragraph.children);

            return {
                value: paragraph,
                errors: tailChildren?.errors ?? [],
            };
        })
    )
    ;

export default $paragraphItem;
