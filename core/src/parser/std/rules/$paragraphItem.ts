/* eslint-disable no-irregular-whitespace */
import type { Line } from "../../../node/cst/line";
import { ArticleLine, BlankLine, LineType, OtherLine, ParagraphItemLine } from "../../../node/cst/line";
import * as std from "../../../law/std";
import { columnsOrSentencesToSentencesArray, sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import CST from "../toCSTSettings";
import $sentenceChildren, { sentenceChildrenToString } from "../../cst/rules/$sentenceChildren";
import type { Diff } from "../../../util";
import { assertNever, NotImplementedError } from "../../../util";
import type { AttrEntries, SentenceChildEL } from "../../../node/cst/inline";
import { AttrEntry, Control, Sentences } from "../../../node/cst/inline";
import type { WithErrorRule } from "../util";
import { $optBNK_INDENT, captionControl, isSingleParentheses, makeIndentBlockWithCaptureRule } from "../util";
import type { VirtualLineRuleFactory } from "../factory";
import factory from "../factory";
import type { VirtualLine } from "../virtualLine";
import { VirtualOnlyLineType } from "../virtualLine";
import { $blankLine } from "../util";
import { ErrorMessage } from "../../cst/error";
import { EL, rangeOfELs } from "../../../node/el";
import $amendProvision, { amendProvisionToLines } from "./$amendProvision";
import type { Env } from "../env";
import { $list, listOrSublistToLines } from "./$list";
import $tableStruct, { tableStructToLines } from "./$tableStruct";
import $figStruct, { figStructToLines } from "./$figStruct";
import { $styleStruct, noteLikeStructToLines } from "./$noteLike";
import { paragraphItemTitleMatch, paragraphItemTitleRule, unknownParagraphItemTitleMatch } from "../../cst/rules/$paragraphItemLine";
import { anonymParagraphItemControls, autoTagControls, paragraphItemControls } from "../../cst/rules/$tagControl";
import { circledDigitChars, parseNamedNum } from "../../../law/num";
import { initialEnv } from "../../cst/env";

const reOldParagraphNum = new RegExp(`^(?:○[0123456789０１２３４５６７８９]+|[${circledDigitChars}])`);
const reAmendingText = /.*?の一部を次のように(?:改正す|改め)る。$/;

interface ParagraphItemToLinesOptions {
    firstArticleParagraphArticleTitle?: (string | SentenceChildEL)[],
    secondaryArticleParagraph?: boolean,
    noControl?: boolean,
    // requireControl?: boolean,
    defaultTag?: (typeof std.paragraphItemTags)[number],
}

/**
 * The renderer for Paragraph, Item and subitem ({@link std.ParagraphItem | ParagraphItem}). Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$paragraphItem.spec.ts) for examples.
 */
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
        const captionString = sentenceChildrenToString(ParagraphCaption);
        const result = $sentenceChildren.match(0, captionString, initialEnv({}));
        if (!result.ok) {
            const message = `addControls: Error: ${captionString}`;
            throw new Error(message);
        }
        const line = new OtherLine({
            range: null,
            indentTexts: newIndentTexts,
            controls: [],
            sentencesArray: [
                new Sentences(
                    "",
                    null,
                    [],
                    [std.newStdEL("Sentence", {}, result.value.value)],
                ),
            ],
            lineEndText: CST.EOL,
        });
        if (!isSingleParentheses(line)) {
            line.controls.push(new Control(
                captionControl,
                null,
                "",
                null,
            ));
        }
        lines.push(line);
    }

    const Title = ParagraphItemTitle;
    if (
        firstArticleParagraphArticleTitle
        && firstArticleParagraphArticleTitle.length > 0
    ) Title.push(...firstArticleParagraphArticleTitle);
    let paragraphItemTitleStr = sentenceChildrenToString(Title);

    const oldNum = (paragraphItemTitleStr.length === 0 && el.tag === "Paragraph" && el.attr.OldNum === "true");
    if (oldNum) {
        paragraphItemTitleStr = circledDigitChars[Number(el.attr.Num)];
    }
    const MissingNum = (secondaryArticleParagraph && Title.length === 0 && el.tag === "Paragraph" && el.attr.OldNum !== "true") ? "true" : undefined;

    const SentenceChildren = ParagraphItemSentence ? ParagraphItemSentence.children : [];
    const sentencesArray = columnsOrSentencesToSentencesArray(SentenceChildren);
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
        const title = sentenceChildrenToString(firstArticleParagraphArticleTitle);
        lines.push(new ArticleLine({
            range: null,
            indentTexts,
            title,
            midSpace: (title.length === 0 || sentencesArray.length === 0) ? "" : CST.MARGIN,
            sentencesArray,
            lineEndText: CST.EOL,
        }));
    } else if (
        noControl
        && ParagraphCaption.every(c => (typeof c !== "string" && !c.text()) && !c)
        && ParagraphItemTitle.every(c => (typeof c !== "string" && !c.text()) && !c)
        // && paragraphItemTitleStr.length > 0
    ) {
        lines.push(new ParagraphItemLine({
            range: null,
            indentTexts,
            mainTag: el.tag,
            controls: [],
            title: paragraphItemTitleStr,
            midSpace: (Title.length === 0 || sentencesArray.length === 0) ? "" : CST.MARGIN,
            sentencesArray,
            lineEndText: CST.EOL,
        }));
    } else if (paragraphItemTitleStr.length > 0) {
        const controls: Control[] = [];

        if (
            (el.tag === defaultTag)
            && unknownParagraphItemTitleMatch(paragraphItemTitleStr).ok
        ) {
            // e.g.
            //  │第一条・・・
            //  │　一    <- Item
            //  │　１    <- Item
            //   -> If "一" or "１" appears as Item, no control needed.

        } else if (
            (
                (el.tag in paragraphItemTitleRule)
                && (
                    paragraphItemTitleMatch[el.tag as keyof typeof paragraphItemTitleRule](paragraphItemTitleStr).ok
                )
            )
            || (
                (el.tag === "Paragraph")
                && (el.attr.OldNum === "true")
                && reOldParagraphNum.test(paragraphItemTitleStr)
            )
        ) {
            // e.g.
            //  │第一条・・・
            //  │　# １             <- Paragraph
            //   -> If "１" appears as Paragraph, auto control needed.
            controls.push(new Control(
                autoTagControls[0],
                null,
                " ",
                null,
            ));

        } else {
            // e.g.
            //  │第一条・・・
            //  │　:paragraph:一    <- Paragraph
            //   -> If "一" appears as Paragraph, specified control needed.

            controls.push(new Control(
                paragraphItemControls[el.tag],
                null,
                "",
                null,
            ));
        }

        lines.push(new ParagraphItemLine({
            range: null,
            indentTexts,
            mainTag: el.tag,
            controls,
            title: paragraphItemTitleStr,
            midSpace: (sentencesArray.length === 0) ? "" : CST.MARGIN,
            sentencesArray,
            lineEndText: CST.EOL,
        }));
    } else {
        lines.push(new ParagraphItemLine({
            range: null,
            indentTexts,
            mainTag: el.tag,
            controls: [
                new Control(
                    anonymParagraphItemControls[el.tag],
                    null,
                    "",
                    null,
                )
            ],
            title: "",
            midSpace: "",
            sentencesArray,
            lineEndText: CST.EOL,
        }));
    }

    for (const [ci, child] of Children.entries()) {
        if (std.isParagraphItem(child)) {
            lines.push(...paragraphItemToLines(
                child,
                [...indentTexts, CST.INDENT],
                {
                    defaultTag: std.paragraphItemTags[std.paragraphItemTags.indexOf(el.tag) + 1],
                }
            )); /* >>>> INDENT >>>> */

        } else if (child.tag === "TableStruct") {
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
            const withControl = (
                (0 <= (ci - 1) && std.isTableStruct((Children[ci - 1]))) ||
                ((ci + 1) < Children.length && std.isTableStruct((Children[ci + 1])))
            );
            lines.push(...tableStructToLines(child, [...indentTexts, CST.INDENT], { withControl })); /* >>>> INDENT >>>> */
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));

        } else if (child.tag === "FigStruct") {
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
            lines.push(...figStructToLines(child, [...indentTexts, CST.INDENT])); /* >>>> INDENT >>>> */
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));

        } else if (child.tag === "StyleStruct") {
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
            lines.push(...noteLikeStructToLines(child, [...indentTexts, CST.INDENT])); /* >>>> INDENT >>>> */
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));

        } else if (child.tag === "List") {
            lines.push(...listOrSublistToLines(child, [...indentTexts, CST.INDENT])); /* >>>> INDENT >>>> */

        } else if (child.tag === "AmendProvision") {
            const lastText = sentencesArray.slice(-1)[0]
                ?.sentences.slice(-1)[0]
                ?.text() ?? "";
            lines.push(...amendProvisionToLines(
                child,
                [...indentTexts, CST.INDENT],
                { withControl: !reAmendingText.test(lastText) },
            )); /* >>>> INDENT >>>> */

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
                    .andOmit(r => r
                        .choice(c => c
                            .or(r => r
                                .assert(({ firstParagraphItemLine }) => {
                                    const lastText = firstParagraphItemLine.line
                                        .sentencesArray.slice(-1)[0]
                                        ?.sentences.slice(-1)[0]
                                        ?.text() ?? "";
                                    return reAmendingText.test(lastText);
                                })
                            )
                            .or(r => r
                                .nextIs(r => r
                                    .sequence(s => s
                                        .andOmit(() => $optBNK_INDENT)
                                        .and(r => r
                                            .oneMatch(({ item }) => {
                                                if (
                                                    item.type === LineType.OTH
                                                    && item.line.controls.some(c => c.control === ":amend-provision:")
                                                ) {
                                                    return item;
                                                } else {
                                                    return null;
                                                }
                                            })
                                        )
                                    )
                                )
                            )
                        )
                    )
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
    Object.assign(attr, paragraphItem.attr);

    const children = paragraphItem.children.map(c => {
        if (std.isParagraphItem(c) || isAutoParagraphItem(c)) {
            return paragraphItemFromAuto(
                std.paragraphItemTags[std.paragraphItemTags.indexOf(tag) + 1],
                c,
            );
        } else if (isAutoParagraphItemTitle(c)) {
            return std.newStdEL(
                std.paragraphItemTitleTags[std.paragraphItemTags.indexOf(tag)],
                c.attr,
                c.children,
                c.range,
            );
        } else if (isAutoParagraphItemSentence(c)) {
            return std.newStdEL(
                std.paragraphItemSentenceTags[std.paragraphItemTags.indexOf(tag)],
                c.attr,
                c.children,
                c.range,
            );
        } else {
            return c;
        }
    });

    const titleEL = children.find(std.isParagraphItemTitle);
    const titleStr = titleEL ? titleEL.text() : "";
    const num = titleStr ? parseNamedNum(titleStr) : null; // Assume KanaMode.Iroha tentatively
    if (num) attr.Num = num;

    if (tag === "Paragraph" && titleEL && reOldParagraphNum.test(titleStr)) {
        attr.OldNum = "true";
        titleEL.children.splice(0, titleEL.children.length);
    }

    return std.newStdEL(
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

            if (firstParagraphItemLine.line.sentencesArray.length >= 1) {
                const replacedAttrEntries: AttrEntries = [];
                for (const attrEntry of firstParagraphItemLine.line.sentencesArray[0].attrEntries) {
                    if (attrEntry.entry[0] === "OldNum" && attrEntry.entry[1] !== std.defaultAttrs.Paragraph.OldNum) {
                        (paragraphItem as std.Paragraph).attr.OldNum = attrEntry.entry[1];
                    } else {
                        replacedAttrEntries.push(attrEntry);
                    }
                }
                firstParagraphItemLine.line.sentencesArray[0].attrEntries.splice(0);
                firstParagraphItemLine.line.sentencesArray[0].attrEntries.push(...replacedAttrEntries);
            }


            if (captionLine) {
                (paragraphItem.children as (typeof paragraphItem.children)[number][]).push(
                    std.newStdEL(
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

            (paragraphItem.children as (typeof paragraphItem.children)[number][]).push(
                std.newStdEL(
                    tag !== "__AutoParagraphItem"
                        ? std.paragraphItemTitleTags[std.paragraphItemTags.indexOf(tag)]
                        : "__AutoParagraphItemTitle",
                    {},
                    firstParagraphItemLine.line.title ? [firstParagraphItemLine.line.title] : [],
                    firstParagraphItemLine.line.titleRange,
                )
            );

            const sentencesArrayRange = firstParagraphItemLine.line.sentencesArrayRange;
            const paragraphItemSentencePos = firstParagraphItemLine.line.indentsEndPos;
            (paragraphItem.children as (typeof paragraphItem.children)[number][]).push(
                std.newStdEL(
                    tag !== "__AutoParagraphItem"
                        ? std.paragraphItemSentenceTags[std.paragraphItemTags.indexOf(tag)]
                        : "__AutoParagraphItemSentence",
                    {},
                    sentencesArrayToColumnsOrSentences(firstParagraphItemLine.line.sentencesArray),
                    sentencesArrayRange ?? (paragraphItemSentencePos !== null ? [paragraphItemSentencePos, paragraphItemSentencePos] : null),
                ));

            if (tailChildren) {
                (paragraphItem.children as (typeof paragraphItem.children)[number][]).push(...tailChildren.value);
            }

            const pos = captionLine ? captionLine.line.indentsEndPos : firstParagraphItemLine.line.indentsEndPos;
            const range = rangeOfELs(paragraphItem.children) ?? (pos !== null ? [pos, pos] : null);
            if (range && pos !== null) {
                range[0] = pos;
            }
            paragraphItem.range = range;

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
        .action(({ autoParagraphItem }) => {
            let defautTag: (typeof std.paragraphItemTags)[number];
            const errors: ErrorMessage[] = [];
            errors.push(...autoParagraphItem.errors);
            if (autoParagraphItem.value.tag === "__AutoParagraphItem") {
                defautTag = "Paragraph";
                errors.push(new ErrorMessage(
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

/**
 * The parser rule for Paragraph, Item and subitem ({@link std.ParagraphItem | ParagraphItem}). Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$paragraphItem.spec.ts) for examples.
 */
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

            const sentencesArrayRange = firstParagraphItemLine.line.sentencesArrayRange;
            const paragraph = std.newStdEL(
                "Paragraph",
                {
                    // OldStyle: "false",
                },
                [
                    std.newStdEL("ParagraphNum", {}, [], sentencesArrayRange ? [sentencesArrayRange[0], sentencesArrayRange[0]] : null),
                    std.newStdEL(
                        "ParagraphSentence",
                        {},
                        sentencesArrayToColumnsOrSentences(firstParagraphItemLine.line.sentencesArray),
                        sentencesArrayRange,
                    ),
                ]
            );

            if (tailChildren) {
                paragraph.children.push(...(tailChildren.value as std.Paragraph["children"]));
            }

            const pos = firstParagraphItemLine.line.indentsEndPos;
            const range = rangeOfELs(paragraph.children) ?? (pos !== null ? [pos, pos] : null);
            if (range && pos !== null) {
                range[0] = pos;
            }
            paragraph.range = range;

            return {
                value: paragraphItemFromAuto("Paragraph", paragraph) as std.Paragraph,
                errors: tailChildren?.errors ?? [],
            };
        })
    )
    ;

export default $paragraphItem;
