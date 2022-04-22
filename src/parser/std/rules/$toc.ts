import { ArticleGroupHeadLine, ArticleLine, BlankLine, Line, LineType, OtherLine, SupplProvisionHeadLine, TOCHeadLine } from "../../../node/cst/line";
import { articleGroupTags, articleGroupTitleTags, isTOCAppdxTableLabel, isTOCArticle, isTOCArticleGroup, isTOCPreambleLabel, isTOCSupplProvision, newStdEL, tocArticleGroupTags } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { assertNever } from "../../../util";
import { makeIndentBlockWithCaptureRule, WithErrorRule } from "../util";
import factory from "../factory";
import { Sentences } from "../../../node/cst/inline";
import { sentenceChildrenToString } from "../../cst/rules/$sentenceChildren";
import { mergeAdjacentTexts, mergeAdjacentTextsWithString } from "../../cst/util";
import { VirtualOnlyLineType } from "../virtualLine";
import { ErrorMessage } from "../../cst/error";
import { __Parentheses, __Text } from "../../../node/el/control";
import { forceSentencesArrayToSentenceChildren } from "../../cst/rules/$sentencesArray";
import { rangeOfELs } from "../../../node/el";

export const tocItemToLines = (el: std.TOCItem, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const childrenIndentTexts = [...indentTexts, CST.INDENT];

    if (isTOCPreambleLabel(el) || isTOCAppdxTableLabel(el)) {

        lines.push(new OtherLine({
            range: null,
            indentTexts,
            controls: [],
            sentencesArray: [
                new Sentences(
                    "",
                    null,
                    [],
                    [newStdEL("Sentence", {}, el.children)]
                )
            ],
            lineEndText: CST.EOL,
        }));

    } else if (isTOCArticleGroup(el)) {

        const mainTag = std.articleGroupTags[std.tocArticleGroupTags.indexOf(el.tag)];
        const articleGroupTitle = (el.children as (typeof el.children)[number][]).find(std.isArticleGroupTitle);
        const articleRange = (el.children as (typeof el.children)[number][]).find(std.isArticleRange);

        const sentenceChildren = mergeAdjacentTextsWithString([
            ...(articleGroupTitle?.children ?? []),
            ...(
                /^[(（]/.exec(articleRange?.text() ?? "（")
                    ? []
                    : [CST.MARGIN]
            ),
            ...(articleRange?.children ?? []),
        ]);
        lines.push(new ArticleGroupHeadLine({
            range: null,
            indentTexts,
            mainTag,
            controls: [],
            sentenceChildren,
            lineEndText: CST.EOL,
        }));

        for (const child of el.children) {
            if (std.isArticleGroupTitle(child) || std.isArticleRange(child)) {
                continue;
            }

            lines.push(...tocItemToLines(child, childrenIndentTexts));
        }

    } else if (isTOCArticle(el)) {

        const articleTitle = el.children.find(std.isArticleTitle);
        const articleCaption = el.children.find(std.isArticleCaption);

        lines.push(new ArticleLine({
            range: null,
            indentTexts,
            title: sentenceChildrenToString(articleTitle?.children ?? []),
            midSpace: CST.MARGIN,
            sentencesArray: articleCaption ? [
                new Sentences(
                    "",
                    null,
                    [],
                    [newStdEL("Sentence", {}, articleCaption.children)]
                )
            ] : [],
            lineEndText: CST.EOL,
        }));

    } else if (isTOCSupplProvision(el)) {

        const supplProvisionLabel = el.children.find(std.isSupplProvisionLabel) as std.SupplProvisionLabel | undefined;
        const articleRange = el.children.find(std.isArticleRange);

        lines.push(new SupplProvisionHeadLine({
            range: null,
            indentTexts,
            controls: [],
            title: sentenceChildrenToString([
                ...(supplProvisionLabel?.children ?? []),
                ...(articleRange?.children ?? []),
            ]),
            titleRange: null,
            openParen: "",
            amendLawNum: "",
            closeParen: "",
            extractText: "",
            lineEndText: CST.EOL,
        }));

        for (const child of el.children) {
            if (std.isSupplProvisionLabel(child) || std.isArticleRange(child)) {
                continue;
            }

            lines.push(...tocItemToLines(child, childrenIndentTexts));
        }

        lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));

    }
    else { assertNever(el); }

    return lines;
};

export const tocToLines = (el: std.TOC, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const childrenIndentTexts = [...indentTexts, CST.INDENT];

    const tocLabel = el.children.find(std.isTOCLabel);

    lines.push(new TOCHeadLine({
        range: null,
        indentTexts,
        title: sentenceChildrenToString(tocLabel?.children ?? []),
        lineEndText: CST.EOL,
    }));

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
                    && item.line.sentencesArray.length === 1
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
                forceSentencesArrayToSentenceChildren(headLine.line.sentencesArray),
                headLine.line.sentencesArrayRange,
            );

            return {
                value: tocPreambleLabel,
                errors: [],
            };
        })
    )
    ;

const $tocArticleGroupChildrenBlock = makeIndentBlockWithCaptureRule(
    "$tableStructChildrenBlock",
    (factory
        .choice(c => c
            .or(() => $tocArticleGroup)
        )
    ),
);


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
            .zeroOrOne(() => $tocArticleGroupChildrenBlock)
        , "childrenBlock")
        .action(({ headLine, childrenBlock }) => {

            const children: (std.TOCArticleGroup["children"][number] | std.TOCPart)[] = [];
            const errors: ErrorMessage[] = [];

            const inline = mergeAdjacentTexts(headLine.line.title);
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
                rangeOfELs(title),
            );

            children.push(articleGroupTitle);

            const articleRange = articleRangeSentenceChildren.length > 0 ? newStdEL(
                "ArticleRange",
                {},
                articleRangeSentenceChildren,
                rangeOfELs(articleRangeSentenceChildren),
            ) : null;

            if (articleRange) {
                children.push(articleRange);
            }

            if (childrenBlock) {
                children.push(...childrenBlock.value.flat().map(v => v.value));
                errors.push(...childrenBlock.value.flat().map(v => v.errors).flat());
                errors.push(...childrenBlock.errors);
            }

            const tocArticleGroupTag = tocArticleGroupTags[articleGroupTags.indexOf(headLine.line.mainTag)];

            const pos = headLine.line.indentsEndPos;
            const range = rangeOfELs(children) ?? (pos !== null ? [pos, pos] : null);
            if (range && pos !== null) {
                range[0] = pos;
            }
            const tocArticleGroup = newStdEL(
                tocArticleGroupTag,
                {},
                children,
                range,
            );

            return {
                value: tocArticleGroup,
                errors,
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
                headLine.line.titleRange,
            );

            const articleCaptionChildren = forceSentencesArrayToSentenceChildren(headLine.line.sentencesArray);
            const articleCaption = headLine.line.sentencesArray.length > 0 ? newStdEL(
                "ArticleCaption",
                {},
                articleCaptionChildren,
                rangeOfELs(articleCaptionChildren)
            ) : null;

            const tocArticleChildren = [
                articleTitle,
                ...(articleCaption ? [articleCaption] : []),
            ];

            const pos = headLine.line.indentsEndPos;
            const range = rangeOfELs(tocArticleChildren) ?? (pos !== null ? [pos, pos] : null);
            if (range && pos !== null) {
                range[0] = pos;
            }
            const tocArticle = newStdEL(
                "TOCArticle",
                {},
                tocArticleChildren,
                range,
            );

            return {
                value: tocArticle,
                errors: [],
            };
        })
    )
    ;

const $tocSupplProvisionChildrenBlock = makeIndentBlockWithCaptureRule(
    "$tocSupplProvisionChildrenBlock",
    (factory
        .choice(c => c
            .or(() => $tocArticleGroup)
            .or(() => $tocArticle)
        )
    ),
);


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
            .zeroOrOne(() => $tocSupplProvisionChildrenBlock)
        , "childrenBlock")
        .action(({ headLine, childrenBlock }) => {

            const children: (std.TOCSupplProvision["children"][number] | std.TOCArticleGroup)[] = [];
            const errors: ErrorMessage[] = [];

            const inline = mergeAdjacentTexts([
                new __Text(headLine.line.title, headLine.line.titleRange),
                new __Text(headLine.line.openParen, headLine.line.openParenRange),
                new __Text(headLine.line.amendLawNum, headLine.line.amendLawNumRange),
                new __Text(headLine.line.closeParen, headLine.line.closeParenRange),
                new __Text(headLine.line.extractText, headLine.line.extractTextRange),
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
                rangeOfELs(title),
            );

            children.push(supplProvisionLabel);

            const articleRange = articleRangeSentenceChildren.length > 0 ? newStdEL(
                "ArticleRange",
                {},
                articleRangeSentenceChildren,
                rangeOfELs(articleRangeSentenceChildren),
            ) : null;

            if (articleRange) {
                children.push(articleRange);
            }

            if (childrenBlock) {
                children.push(...childrenBlock.value.flat().map(v => v.value));
                errors.push(...childrenBlock.value.flat().map(v => v.errors).flat());
                errors.push(...childrenBlock.errors);
            }

            const pos = headLine.line.indentsEndPos;
            const range = rangeOfELs(children) ?? (pos !== null ? [pos, pos] : null);
            if (range && pos !== null) {
                range[0] = pos;
            }
            const tocSupplProvision = newStdEL(
                "TOCSupplProvision",
                {},
                children,
                range,
            );

            return {
                value: tocSupplProvision,
                errors,
            };
        })
    )
    ;

const $tocChildrenBlock = makeIndentBlockWithCaptureRule(
    "$tocChildrenBlock",
    (factory
        .choice(c => c
            .or(() => $tocPreambleLabel)
            .or(() => $tocArticleGroup)
            .or(() => $tocArticle)
            .or(() => $tocSupplProvision)
        )
    ),
);

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
            .zeroOrOne(() => $tocChildrenBlock)
        , "childrenBlock")
        .action(({ headLine, childrenBlock }) => {

            const children: (std.TOC["children"][number] | std.TOCArticleGroup)[] = [];
            const errors: ErrorMessage[] = [];

            const tocLabel = newStdEL(
                "TOCLabel",
                {},
                [headLine.line.title],
                headLine.line.titleRange,
            );

            children.push(tocLabel);

            if (childrenBlock) {
                children.push(...childrenBlock.value.flat().map(v => v.value));
                errors.push(...childrenBlock.value.flat().map(v => v.errors).flat());
                errors.push(...childrenBlock.errors);
            }

            const pos = headLine.line.indentsEndPos;
            const range = rangeOfELs(children) ?? (pos !== null ? [pos, pos] : null);
            if (range && pos !== null) {
                range[0] = pos;
            }
            const toc = newStdEL(
                "TOC",
                {},
                children,
                range,
            );

            return {
                value: toc,
                errors,
            };
        })
    )
    ;

export default $toc;
