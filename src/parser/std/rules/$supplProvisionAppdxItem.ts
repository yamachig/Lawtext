import { factory } from "../factory";
import { SupplProvisionAppdxItemHeadLine, Line, LineType } from "../../../node/cst/line";
import { $blankLine, makeIndentBlockWithCaptureRule, WithErrorRule } from "../util";
import { isSupplProvisionAppdxItemTitle, newStdEL, supplProvisionAppdxItemTags, supplProvisionAppdxItemTitleTags, StdELType, isRelatedArticleNum, isTableStruct, isNoteLikeStruct, isArithFormula } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { ErrorMessage } from "../../cst/error";
import { mergeAdjacentTextsWithString } from "../../cst/util";
import { Control } from "../../../node/cst/inline";
import { rangeOfELs } from "../../../node/el";
import { assertNever } from "../../../util";
import { $styleStruct, noteLikeStructToLines } from "./$noteLike";
import $tableStruct, { tableStructToLines } from "./$tableStruct";
import $arithFormula, { arithFormulaToLines } from "./$arithFormula";
import { sentenceChildrenToString } from "../../cst/rules/$sentenceChildren";
import { autoTagControls, supplProvisionAppdxItemControls } from "../../cst/rules/$tagControl";
import { detectSupplProvisionAppdxItemTitle } from "../../cst/rules/$supplProvisionAppdxItemHeadLine";


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

    lines.push(new SupplProvisionAppdxItemHeadLine({
        range: null,
        indentTexts,
        mainTag: supplProvisionAppdxItem.tag,
        controls: supplProvisionAppdxItemTitleSentenceChildren && detectSupplProvisionAppdxItemTitle(sentenceChildrenToString(supplProvisionAppdxItemTitleSentenceChildren)) === supplProvisionAppdxItem.tag ? [
            new Control(
                autoTagControls[0],
                null,
                " ",
                null,
            )
        ] : [
            new Control(
                supplProvisionAppdxItemControls[supplProvisionAppdxItem.tag],
                null,
                "",
                null,
            )
        ],
        title: mergeAdjacentTextsWithString(supplProvisionAppdxItemTitleSentenceChildren ?? []),
        relatedArticleNum: mergeAdjacentTextsWithString(relatedArticleNumSentenceChildren ?? []),
        lineEndText: CST.EOL,
    }));

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
            .choice(c => c
                .or(() => $styleStruct)
            )
    ),
    SupplProvisionAppdxTable: (
        factory
            .choice(c => c
                .or(() => $tableStruct)
            )
    ),
    SupplProvisionAppdx: (
        factory
            .choice(c => c
                .or(() => $arithFormula)
            )
    ),
} as const;

export const makeSupplProvisionAppdxItemRule = <TTag extends (typeof std.supplProvisionAppdxItemTags)[number]>(
    ruleName: string,
    tag: TTag,
): WithErrorRule<StdELType<TTag>> => {

    const contentBlockRule = makeIndentBlockWithCaptureRule(
        `${ruleName}ChildrenBlock`,
        supplProvisionAppdxItemContentRule[tag] as WithErrorRule<std.SupplProvisionAppdxItem["children"][number]>,
    );

    const ret = factory
        .withName(ruleName)
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
            .and(r => r
                .zeroOrOne(() => contentBlockRule)
            , "contentBlock")
            .action(({ titleLine, contentBlock }) => {

                const children: StdELType<TTag>["children"][number][] = [];
                const errors: ErrorMessage[] = [];

                const title = titleLine.line.title.length > 0 ? newStdEL(
                    std.supplProvisionAppdxItemTitleTags[std.supplProvisionAppdxItemTags.indexOf(tag)],
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
                const supplProvisionAppdxItem = newStdEL(
                    tag,
                    {},
                    children,
                    range,
                ) as unknown as StdELType<TTag>;

                return {
                    value: supplProvisionAppdxItem,
                    errors,
                };
            })
        )
    ;
    return ret;
};

export const $supplProvisionAppdxStyle = makeSupplProvisionAppdxItemRule("$supplProvisionAppdxStyle", "SupplProvisionAppdxStyle");
export const $supplProvisionAppdxTable = makeSupplProvisionAppdxItemRule("$supplProvisionAppdxTable", "SupplProvisionAppdxTable");
export const $supplProvisionAppdx = makeSupplProvisionAppdxItemRule("$supplProvisionAppdx", "SupplProvisionAppdx");


