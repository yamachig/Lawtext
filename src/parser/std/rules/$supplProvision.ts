import { factory } from "../factory";
import { BlankLine, Line, LineType, SupplProvisionHeadLine } from "../../../node/cst/line";
import { $blankLine, WithErrorRule } from "../util";
import { isArticle, isArticleGroup, isParagraphItem, isParagraphItemTitle, isSupplProvisionAppdxItem, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import $paragraphItem, { $noControlAnonymParagraph, paragraphItemToLines } from "./$paragraphItem";
import { assertNever } from "../../../util";
import { sentenceChildrenToString } from "../../cst/rules/$sentenceChildren";
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

    lines.push(new BlankLine(null, CST.EOL));

    for (const child of supplProvision.children) {
        if (child.tag === "SupplProvisionLabel") continue;

        if (isParagraphItem(child)) {
            if (child.children.filter(isParagraphItemTitle).some(el => el.text !== "")) {
                lines.push(...paragraphItemToLines(child, indentTexts));
            } else {
                lines.push(...paragraphItemToLines(child, indentTexts, { noControl: true }));
            }
            lines.push(new BlankLine(null, CST.EOL));
        } else if (isArticle(child)) {
            lines.push(...articleToLines(child, indentTexts));
            lines.push(new BlankLine(null, CST.EOL));
        } else if (isArticleGroup(child)) {
            lines.push(...articleGroupToLines(child, indentTexts));
            lines.push(new BlankLine(null, CST.EOL));
        } else if (isSupplProvisionAppdxItem(child)) {
            lines.push(...supplProvisionAppdxItemToLines(child, indentTexts));
            lines.push(new BlankLine(null, CST.EOL));
        }
        else { assertNever(child); }
    }

    return lines;
};


const $supplProvisionChildren: WithErrorRule<(std.ParagraphItem | std.Article | std.ArticleGroup | std.SupplProvisionAppdxItem)[]> = factory
    .withName("supplProvisionChildren")
    .sequence(s => s
        .and(r => r
            .sequence(s => s
                .and(r => r
                    .choice(c => c
                        .or(r => r
                            .oneOrMore(r => r
                                .sequence(s => s
                                    .and(r => r
                                        .choice(c => c
                                            .or(() => $article)
                                            .or(() => $articleGroup)
                                        )
                                    )
                                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                                )
                            )
                        )
                        .or(r => r
                            .oneOrMore(r => r
                                .sequence(s => s
                                    .and(r => r
                                        .choice(c => c
                                            .or(() => $paragraphItem)
                                        )
                                    )
                                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                                )
                            )
                        )
                        .or(r => r
                            .oneOrMore(r => r
                                .sequence(s => s
                                    .and(r => r
                                        .choice(c => c
                                            .or(() => $noControlAnonymParagraph)
                                        )
                                    )
                                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                                )
                            )
                        )
                    )
                )
                .and(r => r
                    .zeroOrMore(r => r
                        .sequence(s => s
                            .and(r => r
                                .choice(c => c
                                    .or(() => $supplProvisionAppdx)
                                    .or(() => $supplProvisionAppdxStyle)
                                    .or(() => $supplProvisionAppdxTable)
                                )
                            )
                            .andOmit(r => r.zeroOrMore(() => $blankLine))
                        )
                    )
                )
            )
        , "childrenList")
        .action(({ childrenList }) => {
            const children = childrenList.flat();
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
        .and(() => $supplProvisionChildren, "children")
        .action(({ labelLine, children }) => {
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
            return {
                value: supplProvision.setRangeFromChildren(),
                errors: [...children.errors],
            };
        })
    )
    ;

export default $supplProvision;
