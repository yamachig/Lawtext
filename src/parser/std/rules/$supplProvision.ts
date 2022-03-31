import { factory } from "../factory";
import { Line, LineType, SupplProvisionHeadLine } from "../../../node/cst/line";
import { $blankLine, WithErrorRule } from "../util";
import { isArticle, isSupplProvisionAppdxItem, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import $paragraphItem, { paragraphItemToLines } from "./$paragraphItem";
import { rangeOfELs } from "../../../node/el";
import { assertNever } from "../../../util";
import { sentenceChildrenToString } from "../../cst/rules/$sentenceChildren";
import { isArticleGroup, isParagraphItem } from "../../out_ std copy/lawUtil";
import $article, { articleToLines } from "./$article";
import $articleGroup, { articleGroupToLines } from "./$articleGroup";
import { $supplProvisionAppdx, $supplProvisionAppdxStyle, $supplProvisionAppdxTable, supplProvisionAppdxItemToLines } from "./$supplProvisionAppdxItem";

export const supplProvisionToLines = (supplProvision: std.SupplProvision, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const supplProvisionLabel = supplProvision.children.find(el => el.tag === "SupplProvisionLabel") as std.SupplProvisionLabel | undefined;

    lines.push(new SupplProvisionHeadLine(
        null,
        indentTexts.length * 3,
        [...indentTexts, CST.INDENT, CST.INDENT, CST.INDENT],
        sentenceChildrenToString(supplProvisionLabel?.children ?? []),
        (typeof supplProvision.attr.AmendLawNum === "string") ? `${CST.MARGIN}（` : "",
        supplProvision.attr.AmendLawNum ?? "",
        (typeof supplProvision.attr.AmendLawNum === "string") ? "）" : "",
        supplProvision.attr.Extract === "true" ? `${CST.MARGIN}抄` : "",
        CST.EOL,
    ));

    for (const child of supplProvision.children) {
        if (child.tag === "SupplProvisionLabel") continue;

        if (isParagraphItem(child)) {
            lines.push(...paragraphItemToLines(child, indentTexts));
        } else if (isArticle(child)) {
            lines.push(...articleToLines(child, indentTexts));
        } else if (isArticleGroup(child)) {
            lines.push(...articleGroupToLines(child, indentTexts));
        } else if (isSupplProvisionAppdxItem(child)) {
            lines.push(...supplProvisionAppdxItemToLines(child, indentTexts));
        }
        else { assertNever(child); }
    }

    return lines;
};


const $supplProvisionChildren: WithErrorRule<(std.ParagraphItem | std.Article | std.ArticleGroup | std.SupplProvisionAppdxItem)[]> = factory
    .withName("supplProvisionChildren")
    .sequence(s => s
        .and(r => r
            .oneOrMore(r => r
                .sequence(s => s
                    .and(r => r
                        .choice(c => c
                            .or(() => $paragraphItem)
                            .or(() => $article)
                            .or(() => $articleGroup)
                            .or(() => $supplProvisionAppdx)
                            .or(() => $supplProvisionAppdxStyle)
                            .or(() => $supplProvisionAppdxTable)
                        )
                    )
                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                )
            )
        , "children")
        .action(({ children }) => {
            return {
                value: children.map(c => c.value).flat(),
                errors: children.map(c => c.errors).flat(),
            };
        })
    );

export const $supplProvision: WithErrorRule<std.SupplProvision> = factory
    .withName("supplProvision")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === LineType.SPR
                ) {
                    return item;
                } else {
                    return null;
                }
            })
        , "labelLine")
        .and(r => r.zeroOrMore(() => $blankLine))
        // .and(() => $optBNK_INDENT)
        .and(() => $supplProvisionChildren, "children")
        // .and(r => r
        //     .choice(c => c
        //         .or(() => $optBNK_DEDENT)
        //         .or(r => r
        //             .noConsumeRef(r => r
        //                 .sequence(s => s
        //                     .and(r => r.zeroOrMore(() => $blankLine))
        //                     .and(r => r.anyOne(), "unexpected")
        //                     .action(({ unexpected }) => {
        //                         return new ErrorMessage(
        //                             "$supplProvision: この前にある附則の終了時にインデント解除が必要です。",
        //                             unexpected.virtualRange,
        //                         );
        //                     })
        //                 )
        //             )
        //         )
        //     )
        // , "error")
        .action(({ labelLine, children }) => {
            // for (let i = 0; i < children.value.length; i++) {
            //     children.value[i].attr.Num = `${i + 1}`;
            // }
            const supplProvisionLabel = newStdEL(
                "SupplProvisionLabel",
                {},
                [labelLine.line.head],
                labelLine.virtualRange,
            );
            const supplProvision = newStdEL(
                "SupplProvision",
                {
                    ...(
                        labelLine.line.amendLawNum !== "" ? { AmendLawNum: labelLine.line.amendLawNum } : {}
                    ),
                    ...(
                        labelLine.line.extractText !== "" ? { Extract: "true" } : {}
                    ),
                },
                [
                    supplProvisionLabel,
                    ...children.value
                ],
            );
            supplProvision.range = rangeOfELs(supplProvision.children);
            return {
                value: supplProvision,
                errors: [
                    ...children.errors,
                    // ...(error instanceof ErrorMessage ? [error] : []),
                ],
            };
        })
    )
    ;

export default $supplProvision;
