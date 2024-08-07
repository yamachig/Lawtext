import { factory } from "../factory";
import type { Line } from "../../../node/cst/line";
import { AppdxItemHeadLine, BlankLine, LineType } from "../../../node/cst/line";
import type { WithErrorRule } from "../util";
import { $blankLine, makeIndentBlockWithCaptureRule } from "../util";
import type { StdELType } from "../../../law/std";
import { isAppdxItemTitle, newStdEL, appdxItemTags, appdxItemTitleTags, isRelatedArticleNum, isRemarks, isFigStruct, isTableStruct, isNoteLikeStruct, isArithFormula, isParagraphItem } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import type { ErrorMessage } from "../../cst/error";
import { mergeAdjacentTextsWithString } from "../../cst/util";
import { Control } from "../../../node/cst/inline";
import { rangeOfELs } from "../../../node/el";
import { assertNever } from "../../../util";
import $remarks, { remarksToLines } from "./$remarks";
import { $formatStruct, $noteStruct, $styleStruct, noteLikeStructToLines } from "./$noteLike";
import $figStruct, { figStructToLines } from "./$figStruct";
import { $requireControlParagraphItem, paragraphItemToLines } from "./$paragraphItem";
import $tableStruct, { tableStructToLines } from "./$tableStruct";
import $arithFormula, { arithFormulaToLines } from "./$arithFormula";
import { detectAppdxItemTitle } from "../../cst/rules/$appdxItemHeadLine";
import { sentenceChildrenToString } from "../../cst/rules/$sentenceChildren";
import { appdxItemControls, autoTagControls } from "../../cst/rules/$tagControl";


/**
 * The renderer for appended items ({@link std.AppdxItem | AppdxItem}). Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$appdxItem.spec.ts) for examples.
 */
export const appdxItemToLines = (appdxItem: std.AppdxItem, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const appdxItemTitleTag = appdxItemTitleTags[appdxItemTags.indexOf(appdxItem.tag)];

    const appdxItemTitleSentenceChildren = (
        (appdxItem.children as (typeof appdxItem.children)[number][])
            .find(el => el.tag === appdxItemTitleTag) as std.AppdxItemTitle | undefined
    )?.children;

    const relatedArticleNumSentenceChildren = (
        (appdxItem.children as (typeof appdxItem.children)[number][])
            .find(el => el.tag === "RelatedArticleNum") as std.AppdxItemTitle | undefined
    )?.children;

    lines.push(new AppdxItemHeadLine({
        range: null,
        indentTexts,
        mainTag: appdxItem.tag,
        controls: appdxItemTitleSentenceChildren && detectAppdxItemTitle(sentenceChildrenToString(appdxItemTitleSentenceChildren)) === appdxItem.tag ? [
            new Control(
                autoTagControls[0],
                null,
                " ",
                null,
            )
        ] : [
            new Control(
                appdxItemControls[appdxItem.tag],
                null,
                "",
                null,
            )
        ],
        title: mergeAdjacentTextsWithString(appdxItemTitleSentenceChildren ?? []),
        relatedArticleNum: mergeAdjacentTextsWithString(relatedArticleNumSentenceChildren ?? []),
        lineEndText: CST.EOL,
    }));

    lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));

    const childrenIndentTexts = [...indentTexts, CST.INDENT];

    for (const [ci, child] of appdxItem.children.entries()) {
        if (isAppdxItemTitle(child)) continue;
        if (isRelatedArticleNum(child)) continue;

        if (isNoteLikeStruct(child)) {
            lines.push(...noteLikeStructToLines(child, childrenIndentTexts));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
        } else if (isRemarks(child)) {
            lines.push(...remarksToLines(child, childrenIndentTexts));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
        } else if (isFigStruct(child)) {
            lines.push(...figStructToLines(child, childrenIndentTexts));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
        } else if (isParagraphItem(child)) {
            lines.push(...paragraphItemToLines(child, childrenIndentTexts));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
        } else if (isTableStruct(child)) {
            const withControl = (
                (0 <= (ci - 1) && isTableStruct((appdxItem.children[ci - 1]))) ||
                ((ci + 1) < appdxItem.children.length && isTableStruct((appdxItem.children[ci + 1])))
            );
            lines.push(...tableStructToLines(child, childrenIndentTexts, { withControl }));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
        } else if (isArithFormula(child)) {
            lines.push(...arithFormulaToLines(child, childrenIndentTexts));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
        }
        else { assertNever(child); }
    }

    return lines;
};

const appdxItemContentRule = {
    AppdxFig: (
        factory
            .choice(c => c
                .or(() => $figStruct)
                .or(() => $tableStruct)
            )
    ),
    AppdxStyle: (
        factory
            .choice(c => c
                .or(() => $styleStruct)
                .or(() => $remarks)
            )
    ),
    AppdxFormat: (
        factory
            .choice(c => c
                .or(() => $formatStruct)
                .or(() => $remarks)
            )
    ),
    AppdxTable: (
        factory
            .choice(c => c
                .or(() => $tableStruct)
                .or(() => $requireControlParagraphItem)
                .or(() => $remarks)
            )
    ),
    AppdxNote: (
        factory
            .choice(c => c
                .or(() => $noteStruct)
                .or(() => $figStruct)
                .or(() => $tableStruct)
                .or(() => $remarks)
            )
    ),
    Appdx: (
        factory
            .choice(c => c
                .or(() => $arithFormula)
                .or(() => $remarks)
            )
    ),
} as const;

export const makeAppdxItemRule = <TTag extends (typeof std.appdxItemTags)[number]>(
    ruleName: string,
    tag: TTag,
): WithErrorRule<StdELType<TTag>> => {

    const contentBlockRule = makeIndentBlockWithCaptureRule(
        `${ruleName}ChildrenBlock`,
        appdxItemContentRule[tag] as WithErrorRule<std.AppdxItem["children"][number]>,
    );

    const ret = factory
        .withName("appdxItem")
        .sequence(s => s
            .and(r => r
                .oneMatch(({ item }) => {
                    if (
                        item.type === LineType.APP
                        && item.line.mainTag === tag
                    ) {
                        return item;
                    } else {
                        return null;
                    }
                })
            , "titleLine")
            .and(r => r.zeroOrMore(() => $blankLine))
            .and(r => r
                .zeroOrOne(() => contentBlockRule)
            , "contentBlock")
            .action(({ titleLine, contentBlock }) => {

                const children: StdELType<TTag>["children"][number][] = [];
                const errors: ErrorMessage[] = [];

                const title = titleLine.line.title.length > 0 ? newStdEL(
                    std.appdxItemTitleTags[std.appdxItemTags.indexOf(tag)],
                    {},
                    titleLine.line.title,
                    titleLine.line.titleRange,
                ) : null;
                if (title) children.push(title);

                const relatedArticleNum = titleLine.line.relatedArticleNum.length > 0 ? newStdEL(
                    "RelatedArticleNum",
                    {},
                    titleLine.line.relatedArticleNum,
                    titleLine.line.relatedArticleNumRange,
                ) : null;
                if (relatedArticleNum) children.push(relatedArticleNum);

                if (contentBlock) {
                    children.push(...contentBlock.value.flat().map(v => v.value));
                    errors.push(...contentBlock.value.flat().map(v => v.errors).flat());
                    errors.push(...contentBlock.errors);
                }

                const pos = titleLine.line.indentsEndPos;
                const range = rangeOfELs(children) ?? (pos !== null ? [pos, pos] : null);
                if (range && pos !== null) {
                    range[0] = pos;
                }
                const appdxItem = newStdEL(
                    tag,
                    {},
                    children,
                    range,
                ) as unknown as StdELType<TTag>;
                return {
                    value: appdxItem,
                    errors,
                };
            })
        )
    ;
    return ret;
};

/**
 * The parser rule for {@link std.AppdxFig}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$appdxItem.spec.ts) for examples.
 */
export const $appdxFig = makeAppdxItemRule("$appdxFig", "AppdxFig");

/**
 * The parser rule for {@link std.AppdxTable}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$appdxItem.spec.ts) for examples.
 */
export const $appdxTable = makeAppdxItemRule("$appdxTable", "AppdxTable");

/**
 * The parser rule for {@link std.AppdxStyle}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$appdxItem.spec.ts) for examples.
 */
export const $appdxStyle = makeAppdxItemRule("$appdxStyle", "AppdxStyle");

/**
 * The parser rule for {@link std.AppdxNote}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$appdxItem.spec.ts) for examples.
 */
export const $appdxNote = makeAppdxItemRule("$appdxNote", "AppdxNote");

/**
 * The parser rule for {@link std.AppdxFormat}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$appdxItem.spec.ts) for examples.
 */
export const $appdxFormat = makeAppdxItemRule("$appdxFormat", "AppdxFormat");

/**
 * The parser rule for {@link std.Appdx}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$appdxItem.spec.ts) for examples.
 */
export const $appdx = makeAppdxItemRule("$appdx", "Appdx");


