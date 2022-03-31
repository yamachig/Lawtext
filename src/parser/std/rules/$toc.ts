import { ArticleGroupHeadLine, ArticleLine, Line, LineType, OtherLine, SupplProvisionHeadLine, TOCHeadLine } from "../../../node/cst/line";
import { articleGroupTags, articleGroupTitleTags, isTOCAppdxTableLabel, isTOCArticle, isTOCArticleGroup, isTOCPreambleLabel, isTOCSupplProvision, newStdEL, tocArticleGroupTags } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { assertNever } from "../../../util";
import { $optBNK_DEDENT, $optBNK_INDENT, WithErrorRule } from "../util";
import factory from "../factory";
import { $blankLine } from "../util";
import { rangeOfELs } from "../../../node/el";
import { Sentences } from "../../../node/cst/inline";
import { sentenceChildrenToString } from "../../cst/rules/$sentenceChildren";
import { mergeAdjacentTexts } from "../../cst/util";
import { VirtualOnlyLineType } from "../virtualLine";
import { ErrorMessage } from "../../cst/error";
import { __Parentheses } from "../../../node/control";

export const tocItemToLines = (el: std.TOCItem, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const childrenIndentTexts = [...indentTexts, CST.INDENT];

    if (isTOCPreambleLabel(el) || isTOCAppdxTableLabel(el)) {

        lines.push(new OtherLine(
            null,
            indentTexts.length,
            indentTexts,
            [],
            [
                new Sentences(
                    "",
                    null,
                    [],
                    [newStdEL("Sentence", {}, el.children)]
                )
            ],
            CST.EOL,
        ));

    } else if (isTOCArticleGroup(el)) {

        const mainTag = std.articleGroupTags[std.tocArticleGroupTags.indexOf(el.tag)];
        const articleGroupTitle = (el.children as (typeof el.children)[number][]).find(std.isArticleGroupTitle);
        const articleRange = (el.children as (typeof el.children)[number][]).find(std.isArticleRange);

        lines.push(new ArticleGroupHeadLine(
            null,
            indentTexts.length,
            indentTexts,
            mainTag,
            mergeAdjacentTexts([
                ...(articleGroupTitle?.children ?? []),
                ...(articleRange?.children ?? []),
            ]),
            CST.EOL,
        ));

        for (const child of el.children) {
            if (std.isArticleGroupTitle(child) || std.isArticleRange(child)) {
                continue;
            }

            lines.push(...tocItemToLines(child, childrenIndentTexts));
        }

    } else if (isTOCArticle(el)) {

        const articleTitle = el.children.find(std.isArticleTitle);
        const articleCaption = el.children.find(std.isArticleCaption);

        lines.push(new ArticleLine(
            null,
            indentTexts.length,
            indentTexts,
            sentenceChildrenToString(articleTitle?.children ?? []),
            CST.MARGIN,
            articleCaption ? [
                new Sentences(
                    "",
                    null,
                    [],
                    [newStdEL("Sentence", {}, articleCaption.children)]
                )
            ] : [],
            CST.EOL,
        ));

    } else if (isTOCSupplProvision(el)) {

        const supplProvisionLabel = el.children.find(std.isSupplProvisionLabel) as std.SupplProvisionLabel | undefined;
        const articleRange = el.children.find(std.isArticleRange);

        lines.push(new SupplProvisionHeadLine(
            null,
            indentTexts.length,
            indentTexts,
            sentenceChildrenToString([
                ...(supplProvisionLabel?.children ?? []),
                ...(articleRange?.children ?? []),
            ]),
            "",
            "",
            "",
            "",
            CST.EOL,
        ));

        for (const child of el.children) {
            if (std.isSupplProvisionLabel(child) || std.isArticleRange(child)) {
                continue;
            }

            lines.push(...tocItemToLines(child, childrenIndentTexts));
        }

    }
    else { assertNever(el); }

    return lines;
};

export const tocToLines = (el: std.TOC, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const childrenIndentTexts = [...indentTexts, CST.INDENT];

    const tocLabel = el.children.find(std.isTOCLabel);

    lines.push(new TOCHeadLine(
        null,
        indentTexts.length,
        indentTexts,
        sentenceChildrenToString(tocLabel?.children ?? []),
        CST.EOL,
    ));

    for (const child of el.children) {
        if (std.isTOCLabel(child)) {
            continue;
        }

        lines.push(...tocItemToLines(child, childrenIndentTexts));
    }

    return lines;
};


export const $tocPreambleLabel: WithErrorRule<std.TOCPreambleLabel> = factory
    .withName("tocPreambleLabel")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === LineType.OTH
                ) {
                    return item;
                } else {
                    return null;
                }
            })
        , "headLine")
        .action(({ headLine }) => {
            const tocPreambleLabel = newStdEL(
                "TOCPreambleLabel",
                {},
                headLine.line.sentencesArray.flat().map(ss => ss.sentences).flat().map(s => s.children).flat(),
            );

            tocPreambleLabel.range = rangeOfELs(tocPreambleLabel.children);

            return {
                value: tocPreambleLabel,
                errors: [],
            };
        })
    )
    ;


export const $tocArticleGroup: WithErrorRule<std.TOCArticleGroup> = factory
    .withName("tocArticleGroup")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === VirtualOnlyLineType.TAG
                ) {
                    return item;
                } else {
                    return null;
                }
            })
        , "headLine")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(() => $optBNK_INDENT)
                    .and(r => r
                        .oneOrMore(r => r
                            .sequence(s => s
                                .andOmit(r => r.zeroOrMore(() => $blankLine))
                                .and(r => r
                                    .choice(c => c
                                        .or(() => $tocArticleGroup)
                                    )
                                )
                            )
                        )
                    , "children")
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
                                                "$tocArticleGroup: この前にある目次項目の終了時にインデント解除が必要です。",
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
                            value: children,
                            errors: error instanceof ErrorMessage ? [error] : [],
                        };
                    })
                )
            )
        , "children")
        .action(({ headLine, children }) => {
            const inline = mergeAdjacentTexts(headLine.line.sentenceChildren);
            const lastItem = inline.length > 0 ? inline[inline.length - 1] : null;
            const [title, articleRangeSentenceChildren] = (
                lastItem instanceof __Parentheses
                && lastItem.attr.type === "round"
            ) ? [inline.slice(0, -1), inline.slice(-1)] : [inline, []];

            const articleGroupTitleTag = articleGroupTitleTags[articleGroupTags.indexOf(headLine.line.mainTag)];

            const articleGroupTitle = newStdEL(
                articleGroupTitleTag,
                {},
                title,
            );

            articleGroupTitle.range = rangeOfELs(articleGroupTitle.children);

            const articleRange = articleRangeSentenceChildren.length > 0 ? newStdEL(
                "ArticleRange",
                {},
                articleRangeSentenceChildren,
            ) : null;

            if (articleRange) articleRange.range = rangeOfELs(articleRange.children);

            const tocArticleGroupTag = tocArticleGroupTags[articleGroupTags.indexOf(headLine.line.mainTag)];

            const tocArticleGroup = newStdEL(
                tocArticleGroupTag,
                {},
                [
                    articleGroupTitle,
                    ...(articleRange ? [articleRange] : []),
                    ...(children ? children.value.map(c => c.value) : []),
                ],
            );

            tocArticleGroup.range = rangeOfELs(tocArticleGroup.children);

            return {
                value: tocArticleGroup,
                errors: [],
            };
        })
    )
    ;


export const $tocArticle: WithErrorRule<std.TOCArticle> = factory
    .withName("tocArticle")
    .sequence(s => s
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
        , "headLine")
        .action(({ headLine }) => {

            const articleTitle = newStdEL(
                "ArticleTitle",
                {},
                [headLine.line.title],
            );

            articleTitle.range = rangeOfELs(articleTitle.children);

            const articleCaption = headLine.line.sentencesArray.length > 0 ? newStdEL(
                "ArticleCaption",
                {},
                mergeAdjacentTexts([...headLine.line.sentencesArray.flat().map(ss => ss.sentences).flat().map(s => s.children).flat()]),
            ) : null;

            if (articleCaption) articleCaption.range = rangeOfELs(articleCaption.children);

            const tocArticle = newStdEL(
                "TOCArticle",
                {},
                [
                    articleTitle,
                    ...(articleCaption ? [articleCaption] : []),
                ],
            );

            tocArticle.range = rangeOfELs(tocArticle.children);

            return {
                value: tocArticle,
                errors: [],
            };
        })
    )
    ;


export const $tocSupplProvision: WithErrorRule<std.TOCSupplProvision> = factory
    .withName("tocSupplProvision")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === VirtualOnlyLineType.TSP
                ) {
                    return item;
                } else {
                    return null;
                }
            })
        , "headLine")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(() => $optBNK_INDENT)
                    .and(r => r
                        .oneOrMore(r => r
                            .sequence(s => s
                                .andOmit(r => r.zeroOrMore(() => $blankLine))
                                .and(r => r
                                    .choice(c => c
                                        .or(() => $tocArticleGroup)
                                        .or(() => $tocArticle)
                                    )
                                )
                            )
                        )
                    , "children")
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
                                                "$tocSupplProvision: この前にある目次項目の終了時にインデント解除が必要です。",
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
                            value: children,
                            errors: error instanceof ErrorMessage ? [error] : [],
                        };
                    })
                )
            )
        , "children")
        .action(({ headLine, children }) => {
            const inline = mergeAdjacentTexts([
                headLine.line.head,
                headLine.line.openParen,
                headLine.line.amendLawNum,
                headLine.line.closeParen,
                headLine.line.extractText,
            ]);
            const lastItem = inline.length > 0 ? inline[inline.length - 1] : null;
            const [title, articleRangeSentenceChildren] = (
                lastItem instanceof __Parentheses
                    && lastItem.attr.type === "round"
            ) ? [inline.slice(0, -1), inline.slice(-1)] : [inline, []];

            const supplProvisionLabel = newStdEL(
                "SupplProvisionLabel",
                {},
                title,
            );

            supplProvisionLabel.range = rangeOfELs(supplProvisionLabel.children);

            const articleRange = articleRangeSentenceChildren.length > 0 ? newStdEL(
                "ArticleRange",
                {},
                articleRangeSentenceChildren,
            ) : null;

            if (articleRange) articleRange.range = rangeOfELs(articleRange.children);

            const tocSupplProvision = newStdEL(
                "TOCSupplProvision",
                {},
                [
                    supplProvisionLabel,
                    ...(articleRange ? [articleRange] : []),
                    ...(children ? children.value.map(c => c.value) : []),
                ],
            );

            tocSupplProvision.range = rangeOfELs(tocSupplProvision.children);

            return {
                value: tocSupplProvision,
                errors: [],
            };
        })
    )
    ;


export const $toc: WithErrorRule<std.TOC> = factory
    .withName("toc")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === LineType.TOC
                ) {
                    return item;
                } else {
                    return null;
                }
            })
        , "headLine")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(() => $optBNK_INDENT)
                    .and(r => r
                        .oneOrMore(r => r
                            .sequence(s => s
                                .andOmit(r => r.zeroOrMore(() => $blankLine))
                                .and(r => r
                                    .choice(c => c
                                        .or(() => $tocPreambleLabel)
                                        .or(() => $tocArticleGroup)
                                        .or(() => $tocArticle)
                                        .or(() => $tocSupplProvision)
                                    )
                                )
                            )
                        )
                    , "children")
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
                                                "$toc: この前にある目次の終了時にインデント解除が必要です。",
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
                            value: children,
                            errors: error instanceof ErrorMessage ? [error] : [],
                        };
                    })
                )
            )
        , "children")
        .action(({ headLine, children }) => {

            const tocLabel = newStdEL(
                "TOCLabel",
                {},
                [headLine.line.contentText()],
            );

            tocLabel.range = rangeOfELs(tocLabel.children);

            const toc = newStdEL(
                "TOC",
                {},
                [
                    tocLabel,
                    ...(children ? children.value.map(c => c.value) : [])
                ],
            );

            toc.range = rangeOfELs(toc.children);

            return {
                value: toc,
                errors: [],
            };
        })
    )
    ;

export default $toc;
