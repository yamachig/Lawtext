import { factory } from "../factory";
import { SupplProvisionAppdxItemHeadLine, Line, LineType } from "../../../node/cst/line";
import { $blankLine, $optBNK_DEDENT, $optBNK_INDENT, WithErrorRule } from "../util";
import { isSupplProvisionAppdxItemTitle, newStdEL, supplProvisionAppdxItemTags, supplProvisionAppdxItemTitleTags, StdELType, isRelatedArticleNum, isTableStruct, isNoteLikeStruct, isArithFormula } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { ErrorMessage } from "../../cst/error";
import { mergeAdjacentTexts } from "../../cst/util";
import { Control } from "../../../node/cst/inline";
import { rangeOfELs } from "../../../node/el";
import { assertNever } from "../../../util";
import { $styleStruct, noteLikeStructToLines } from "./$noteLike";
import $tableStruct, { tableStructToLines } from "./$tableStruct";
import $arithFormula, { arithFormulaToLines } from "./$arithFormula";
import { supplProvisionAppdxItemTitlePtn } from "../../cst/rules/$supplProvisionAppdxItemHeadLine";
import { sentenceChildrenToString } from "../../cst/rules/$sentenceChildren";
import { autoTagControls, tagControls } from "../../cst/rules/$tagControl";


export const supplProvisionAppdxItemToLines = (supplProvisionAppdxItem: std.SupplProvisionAppdxItem, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const supplProvisionAppdxItemTitleTag = supplProvisionAppdxItemTitleTags[supplProvisionAppdxItemTags.indexOf(supplProvisionAppdxItem.tag)];

    const supplProvisionAppdxItemTitleSentenceChildren = (
        (supplProvisionAppdxItem.children as (typeof supplProvisionAppdxItem.children)[number][])
            .find(el => el.tag === supplProvisionAppdxItemTitleTag) as std.SupplProvisionAppdxItemTitle | undefined
    )?.children;

    const relatedArticleNumSentenceChildren = (
        (supplProvisionAppdxItem.children as (typeof supplProvisionAppdxItem.children)[number][])
            .find(el => el.tag === "RelatedArticleNum") as std.SupplProvisionAppdxItemTitle | undefined
    )?.children;

    lines.push(new SupplProvisionAppdxItemHeadLine(
        null,
        indentTexts.length,
        indentTexts,
        supplProvisionAppdxItem.tag,
        supplProvisionAppdxItemTitleSentenceChildren && supplProvisionAppdxItemTitlePtn[supplProvisionAppdxItem.tag].exec(sentenceChildrenToString(supplProvisionAppdxItemTitleSentenceChildren)) ? [
            new Control(
                autoTagControls[0],
                null,
                " ",
                null,
            )
        ] : [
            new Control(
                tagControls[supplProvisionAppdxItem.tag],
                null,
                "",
                null,
            )
        ],
        mergeAdjacentTexts(supplProvisionAppdxItemTitleSentenceChildren ?? []),
        mergeAdjacentTexts(relatedArticleNumSentenceChildren ?? []),
        CST.EOL,
    ));

    const childrenIndentTexts = [...indentTexts, CST.INDENT];

    for (const child of supplProvisionAppdxItem.children) {
        if (isSupplProvisionAppdxItemTitle(child)) continue;
        if (isRelatedArticleNum(child)) continue;

        if (isNoteLikeStruct(child)) {
            lines.push(...noteLikeStructToLines(child, childrenIndentTexts));
        } else if (isTableStruct(child)) {
            lines.push(...tableStructToLines(child, childrenIndentTexts));
        } else if (isArithFormula(child)) {
            lines.push(...arithFormulaToLines(child, childrenIndentTexts));
        }
        else { assertNever(child); }
    }

    return lines;
};

const supplProvisionAppdxItemContentRule = {
    SupplProvisionAppdxStyle: (
        factory
            .sequence(s => s
                .and(r => r
                    .zeroOrMore(r => r
                        .sequence(s => s
                            .and(r => r
                                .choice(c => c
                                    .or(() => $styleStruct)
                                )
                            )
                            .andOmit(r => r.zeroOrMore(() => $blankLine))
                        )
                    )
                , "content")
                .action(({ content }) => ({
                    value: content.map(c => c.value),
                    errors: content.map(c => c.errors).flat(),
                })),
            )
    ),
    SupplProvisionAppdxTable: (
        factory
            .sequence(s => s
                .and(r => r
                    .zeroOrMore(r => r
                        .sequence(s => s
                            .and(r => r
                                .choice(c => c
                                    .or(() => $tableStruct)
                                )
                            )
                            .andOmit(r => r.zeroOrMore(() => $blankLine))
                        )
                    )
                , "content")
                .action(({ content }) => ({
                    value: content.map(c => c.value),
                    errors: content.map(c => c.errors).flat(),
                })),
            )
    ),
    SupplProvisionAppdx: (
        factory
            .sequence(s => s
                .and(r => r
                    .zeroOrMore(r => r
                        .sequence(s => s
                            .and(r => r
                                .choice(c => c
                                    .or(() => $arithFormula)
                                )
                            )
                            .andOmit(r => r.zeroOrMore(() => $blankLine))
                        )
                    )
                , "content")
                .action(({ content }) => ({
                    value: content.map(c => c.value),
                    errors: content.map(c => c.errors).flat(),
                })),
            )
    ),
} as const;

export const makeSupplProvisionAppdxItemRule = <TTag extends (typeof std.supplProvisionAppdxItemTags)[number]>(tag: TTag): WithErrorRule<StdELType<TTag>> => {

    const contentRule = supplProvisionAppdxItemContentRule[tag];

    const ret = factory
        .withName("supplProvisionAppdxItem")
        .sequence(s => s
            .and(r => r
                .oneMatch(({ item }) => {
                    if (
                        item.type === LineType.SPA
                        && item.line.mainTag === tag
                    ) {
                        return item;
                    } else {
                        return null;
                    }
                })
            , "titleLine")
            .and(r => r.zeroOrMore(() => $blankLine))
            .and(() => $optBNK_INDENT)
            .and(() => contentRule, "content")
            .and(r => r
                .choice(c => c
                    .or(() => $optBNK_DEDENT)
                    .or(r => r
                        .noConsumeRef(r => r
                            .sequence(s => s
                                .and(r => r.zeroOrMore(() => $blankLine))
                                .and(r => r.anyOne(), "unexpected")
                                .action(({ unexpected, newErrorMessage }) => {
                                    return newErrorMessage(
                                        "supplProvisionAppdxItem: この前にある附則別記類の終了時にインデント解除が必要です。",
                                        unexpected.virtualRange,
                                    );
                                })
                            )
                        )
                    )
                )
            , "error")
            .action(({ titleLine, content, error }) => {
            // for (let i = 0; i < children.value.length; i++) {
            //     children.value[i].attr.Num = `${i + 1}`;
            // }

                const title = titleLine.line.title.length > 0 ? newStdEL(
                    std.supplProvisionAppdxItemTitleTags[std.supplProvisionAppdxItemTags.indexOf(tag)],
                    {},
                    titleLine.line.title,
                    titleLine.line.titleRange,
                ) : null;
                const relatedArticleNum = titleLine.line.relatedArticleNum.length > 0 ? newStdEL(
                    "RelatedArticleNum",
                    {},
                    titleLine.line.relatedArticleNum,
                    titleLine.line.relatedArticleNumRange,
                ) : null;
                const supplProvisionAppdxItem = newStdEL(
                    tag,
                    {},
                    [
                        ...(title ? [title] : []),
                        ...(relatedArticleNum ? [relatedArticleNum] : []),
                        ...content.value,
                    ],
                );
                supplProvisionAppdxItem.range = rangeOfELs(supplProvisionAppdxItem.children);
                return {
                    value: supplProvisionAppdxItem,
                    errors: [
                        ...content.errors,
                        ...(error instanceof ErrorMessage ? [error] : []),
                    ],
                };
            })
        )
    ;
    return ret;
};

export const $supplProvisionAppdxStyle = makeSupplProvisionAppdxItemRule("SupplProvisionAppdxStyle");
export const $supplProvisionAppdxTable = makeSupplProvisionAppdxItemRule("SupplProvisionAppdxTable");
export const $supplProvisionAppdx = makeSupplProvisionAppdxItemRule("SupplProvisionAppdx");


