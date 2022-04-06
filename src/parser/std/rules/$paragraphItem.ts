import { ArticleLine, BlankLine, Line, LineType, OtherLine, ParagraphItemLine } from "../../../node/cst/line";
import { isParagraph, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import { columnsOrSentencesToSentencesArray, sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import CST from "../toCSTSettings";
import { sentenceChildrenToString } from "../../cst/rules/$sentenceChildren";
import { assertNever, Diff, NotImplementedError } from "../../../util";
import { AttrEntry, Control, SentenceChildEL, Sentences } from "../../../node/cst/inline";
import { makeIndentBlockWithCaptureRule, WithErrorRule } from "../util";
import factory, { VirtualLineRuleFactory } from "../factory";
import { VirtualLine, VirtualOnlyLineType } from "../virtualLine";
import { $blankLine } from "../util";
import { ErrorMessage } from "../../cst/error";
import { EL, rangeOfELs } from "../../../node/el";
import $amendProvision, { amendProvisionToLines } from "./$amendProvision";
import { Env } from "../env";
import { $list, listOrSublistToLines } from "./$list";
import $tableStruct, { tableStructToLines } from "./$tableStruct";
import $figStruct, { figStructToLines } from "./$figStruct";
import { $styleStruct, noteLikeStructToLines } from "./$noteLike";
import { paragraphItemTitleMatch, paragraphItemTitleRule, unknownParagraphItemTitleMatch } from "../../cst/rules/$paragraphItemLine";
import { anonymParagraphItemControls, autoTagControls, paragraphItemControls } from "../../cst/rules/$tagControl";

interface ParagraphItemToLinesOptions {
    firstArticleParagraphArticleTitle?: (string | SentenceChildEL)[],
    secondaryArticleParagraph?: boolean,
    noControl?: boolean,
    // requireControl?: boolean,
    defaultTag?: (typeof std.paragraphItemTags)[number],
}

export const paragraphItemToLines = (
    el: std.ParagraphItem,
    indentTexts: string[],
    options?: ParagraphItemToLinesOptions,
): Line[] => {
    const lines: Line[] = [];

    const {
        firstArticleParagraphArticleTitle,
        secondaryArticleParagraph,
        noControl,
        // requireControl,
        defaultTag,
    } = {
        firstArticleParagraphArticleTitle: undefined,
        secondaryArticleParagraph: false,
        noControl: false,
        // requireControl: false,
        defaultTag: null,
        ...options,
    };

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
    const paragraphItemTitleStr = sentenceChildrenToString(Title);

    const OldNum = (paragraphItemTitleStr.length === 0 && el.tag === "Paragraph" && el.attr.OldNum === "true") ? "true" : undefined;
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
    } else if (
        noControl
        && ParagraphCaption.every(c => (typeof c !== "string" && !c.text) && !c)
        && ParagraphItemTitle.every(c => (typeof c !== "string" && !c.text) && !c)
        // && paragraphItemTitleStr.length > 0
    ) {
        lines.push(new ParagraphItemLine(
            null,
            indentTexts.length,
            indentTexts,
            el.tag,
            [],
            paragraphItemTitleStr,
            (Title.length === 0 || sentencesArray.length === 0) ? "" : CST.MARGIN,
            sentencesArray,
            CST.EOL,
        ));
    } else if (paragraphItemTitleStr.length > 0) {
        lines.push(new ParagraphItemLine(
            null,
            indentTexts.length,
            indentTexts,
            el.tag,
            (
                (
                    (el.tag === defaultTag)
                    && unknownParagraphItemTitleMatch(paragraphItemTitleStr).ok
                )
                    ? []
                    : (
                        (el.tag in paragraphItemTitleRule)
                        && (
                            paragraphItemTitleMatch[el.tag as keyof typeof paragraphItemTitleRule](paragraphItemTitleStr).ok
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
                                paragraphItemControls[el.tag],
                                null,
                                "",
                                null,
                            )
                        ]
            ),
            paragraphItemTitleStr,
            (sentencesArray.length === 0) ? "" : CST.MARGIN,
            sentencesArray,
            CST.EOL,
        ));
    } else {
        lines.push(new ParagraphItemLine(
            null,
            indentTexts.length,
            indentTexts,
            el.tag,
            [
                new Control(
                    anonymParagraphItemControls[el.tag],
                    null,
                    "",
                    null,
                )
            ],
            "",
            "",
            sentencesArray,
            CST.EOL,
        ));
    }

    for (const child of Children) {
        if (std.isParagraphItem(child)) {
            lines.push(...paragraphItemToLines(
                child,
                [...indentTexts, CST.INDENT],
                {
                    defaultTag: std.paragraphItemTags[std.paragraphItemTags.indexOf(el.tag) + 1],
                }
            )); /* >>>> INDENT >>>> */

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
            lines.push(...listOrSublistToLines(child, [...indentTexts, CST.INDENT])); /* >>>> INDENT >>>> */

        } else if (child.tag === "AmendProvision") {
            lines.push(...amendProvisionToLines(child, [...indentTexts, CST.INDENT])); /* >>>> INDENT >>>> */

        } else if (child.tag === "Class") {
            throw new NotImplementedError(child.tag);

        }
        else { assertNever(child); }
    }

    return lines;
};

const $autoParagraphItemNotAmendChildrenBlock = makeIndentBlockWithCaptureRule(
    "$paragraphItemNotAmendChildrenBlock",
    (factory
        .choice(c => c
            // .orSequence(s => s
            //     .and(() => $listsOuter, "content")
            //     .action(({ content }) => {
            //         return {
            //             value: content.value.map(c => c.value),
            //             errors: [
            //                 ...content.errors,
            //                 ...content.value.map(c => c.errors).flat(),
            //             ],
            //         };
            //     })
            // )
            .orSequence(s => s
                .and(r => r
                    .choice(c => c
                        .orSequence(s => s
                            .and(() => $autoParagraphItem, "elWithErrors")
                            .and(r => r.assert(({ elWithErrors }) => !std.isParagraph(elWithErrors.value)))
                            .action(({ elWithErrors }) => {
                                return elWithErrors as {
                                    value: Diff<std.ParagraphItem, std.Paragraph>,
                                    errors: ErrorMessage[],
                                };
                            })
                        )
                        .or(() => $list)
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

export const $autoParagraphItemChildrenOuter: WithErrorRule<
    (std.ParagraphItem["children"][number] | __AutoParagraphItem)[]
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
                    .and(() => $autoParagraphItemNotAmendChildrenBlock, "block")
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

type __AutoParagraphItem = EL & {tag: "__AutoParagraphItem"};
export const isAutoParagraphItem = (el: EL | string): el is __AutoParagraphItem =>
    typeof el !== "string" && el.tag === "__AutoParagraphItem";

// type __AutoParagraphItemTitle = EL & {tag: "__AutoParagraphItemTitle"};
export const isAutoParagraphItemTitle = (el: EL | string): el is __AutoParagraphItem =>
    typeof el !== "string" && el.tag === "__AutoParagraphItemTitle";

// type __AutoParagraphItemSentence = EL & {tag: "__AutoParagraphItemSentence"};
export const isAutoParagraphItemSentence = (el: EL | string): el is __AutoParagraphItem =>
    typeof el !== "string" && el.tag === "__AutoParagraphItemSentence";

export const paragraphItemFromAuto = (
    defautTag: (typeof std.paragraphItemTags)[number],
    paragraphItem: std.ParagraphItem | __AutoParagraphItem,
): std.ParagraphItem => {
    const tag = paragraphItem.tag === "__AutoParagraphItem" ? defautTag : paragraphItem.tag;
    const attr = {} as Record<string, string>;
    if (tag === "Paragraph") {
        attr.OldStyle = "false";
    } else {
        attr.Delete = "false";
    }
    Object.assign(attr, paragraphItem.attr);

    const children = paragraphItem.children.map(c => {
        if (std.isParagraphItem(c) || isAutoParagraphItem(c)) {
            return paragraphItemFromAuto(
                std.paragraphItemTags[std.paragraphItemTags.indexOf(tag) + 1],
                c,
            );
        } else if (isAutoParagraphItemTitle(c)) {
            return newStdEL(
                std.paragraphItemTitleTags[std.paragraphItemTags.indexOf(tag)],
                c.attr,
                c.children,
                c.range,
            );
        } else if (isAutoParagraphItemSentence(c)) {
            return newStdEL(
                std.paragraphItemSentenceTags[std.paragraphItemTags.indexOf(tag)],
                c.attr,
                c.children,
                c.range,
            );
        } else {
            return c;
        }
    });

    return newStdEL(
        tag,
        attr,
        children,
        paragraphItem.range,
    );
};

export const $autoParagraphItem: WithErrorRule<std.ParagraphItem | __AutoParagraphItem> = factory
    .withName("autoParagraphItem")
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
            .zeroOrOne(() => $autoParagraphItemChildrenOuter)
        , "tailChildren")
        .action(({ captionLine, firstParagraphItemLine, tailChildren }) => {

            const tag = firstParagraphItemLine.line.mainTag ?? "__AutoParagraphItem";

            const paragraphItem = new EL(tag) as std.ParagraphItem | __AutoParagraphItem;
            const errors = tailChildren?.errors ?? [];

            if (std.isParagraphItem(paragraphItem)) {
                if (isParagraph(paragraphItem)) {
                    (paragraphItem as std.Paragraph).attr.OldStyle = "false";
                } else {
                    (paragraphItem as Diff<std.ParagraphItem, std.Paragraph>).attr.Delete = "false";
                }
            }

            // if (firstParagraphItemLine.line.sentencesArray.length >= 1) {
            //     const replacedAttrEntries: AttrEntries = [];
            //     for (const attrEntry of firstParagraphItemLine.line.sentencesArray[0].attrEntries) {
            //         if (attrEntry.entry[0] === "OldNum") {
            //             (paragraphItem as std.Paragraph).attr.OldNum = attrEntry.entry[1];
            //         } else {
            //             replacedAttrEntries.push(attrEntry);
            //         }
            //     }
            //     firstParagraphItemLine.line.sentencesArray[0].attrEntries.splice(0);
            //     firstParagraphItemLine.line.sentencesArray[0].attrEntries.push(...replacedAttrEntries);
            // }


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

            paragraphItem.append(
                newStdEL(
                    tag !== "__AutoParagraphItem"
                        ? std.paragraphItemTitleTags[std.paragraphItemTags.indexOf(tag)]
                        : "__AutoParagraphItemTitle",
                    {},
                    firstParagraphItemLine.line.title ? [firstParagraphItemLine.line.title] : [],
                    firstParagraphItemLine.line.titleRange,
                )
            );

            paragraphItem.append(
                newStdEL(
                    tag !== "__AutoParagraphItem"
                        ? std.paragraphItemSentenceTags[std.paragraphItemTags.indexOf(tag)]
                        : "__AutoParagraphItemSentence",
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

export const $requireControlParagraphItem: WithErrorRule<std.ParagraphItem> = factory
    .withName("$paragraphItem")
    .sequence(s => s
        .and(() => $autoParagraphItem, "autoParagraphItem")
        .action(({ autoParagraphItem, newErrorMessage }) => {
            let defautTag: (typeof std.paragraphItemTags)[number];
            const errors: ErrorMessage[] = [];
            errors.push(...autoParagraphItem.errors);
            if (autoParagraphItem.value.tag === "__AutoParagraphItem") {
                defautTag = "Paragraph";
                errors.push(newErrorMessage(
                    "$requireControlParagraphItem: 制御記号（\":paragraph:\" や \"#\" など）が必要です。",
                    autoParagraphItem.value.range ?? [0, 0],
                ));
            } else {
                defautTag = autoParagraphItem.value.tag;
            }
            return {
                value: paragraphItemFromAuto(defautTag, autoParagraphItem.value),
                errors,
            };
        })
    );

export const $paragraphItem = (defautTag: (typeof std.paragraphItemTags)[number]): WithErrorRule<std.ParagraphItem> => factory
    .withName("$paragraphItem")
    .sequence(s => s
        .and(() => $autoParagraphItem, "autoParagraphItem")
        .action(({ autoParagraphItem }) => ({
            value: paragraphItemFromAuto(defautTag, autoParagraphItem.value),
            errors: autoParagraphItem.errors,
        }))
    );

export const $noControlAnonymParagraph: WithErrorRule<std.Paragraph> = factory
    .withName("noControlAnonymParagraph")
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
            .zeroOrOne(() => $autoParagraphItemChildrenOuter)
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
                value: paragraphItemFromAuto("Paragraph", paragraph) as std.Paragraph,
                errors: tailChildren?.errors ?? [],
            };
        })
    )
    ;

export default $paragraphItem;
