import { factory } from "../factory";
import { BlankLine, Line, LineType, SupplProvisionHeadLine } from "../../../node/cst/line";
import { $blankLine, WithErrorRule } from "../util";
import { isArticle, isArticleGroup, isParagraph, isParagraphItem, isParagraphItemTitle, isSupplProvisionAppdxItem, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import $paragraphItem, { $noControlAnonymParagraph, paragraphItemToLines } from "./$paragraphItem";
import { assertNever } from "../../../util";
import { sentenceChildrenToString } from "../../cst/rules/$sentenceChildren";
import $article, { articleToLines } from "./$article";
import $articleGroup, { articleGroupToLines } from "./$articleGroup";
import { $supplProvisionAppdx, $supplProvisionAppdxStyle, $supplProvisionAppdxTable, supplProvisionAppdxItemToLines } from "./$supplProvisionAppdxItem";
import { Control } from "../../../node/cst/inline";
import { supplProvisionControl, supplProvisionLabelPtn } from "../../cst/rules/$supplProvisionHeadLine";
import { rangeOfELs } from "../../../node/el";

/**
 * The renderer for {@link std.SupplProvision}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$supplProvision.spec.ts) for examples.
 */
export const supplProvisionToLines = (supplProvision: std.SupplProvision, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const supplProvisionLabel = supplProvision.children.find(el => el.tag === "SupplProvisionLabel") as std.SupplProvisionLabel | undefined;
    const supplProvisionLabelStr = sentenceChildrenToString(supplProvisionLabel?.children ?? []);

    const controlStrs: string[] = [];
    if (indentTexts.length !== 0) {
        controlStrs.push(":keep-indents:");
    }
    if (!supplProvisionLabelPtn.exec(supplProvisionLabelStr)) {
        controlStrs.push(supplProvisionControl);
    }

    lines.push(new SupplProvisionHeadLine({
        range: null,
        indentTexts: [...indentTexts, CST.INDENT, CST.INDENT, CST.INDENT],
        controls: controlStrs.map((str, i) => new Control(str, null, i !== controlStrs.length - 1 ? " " : "", null)),
        title: supplProvisionLabelStr,
        titleRange: null,
        openParen: (typeof supplProvision.attr.AmendLawNum === "string") ? `${CST.MARGIN}（` : "",
        amendLawNum: supplProvision.attr.AmendLawNum ?? "",
        closeParen: (typeof supplProvision.attr.AmendLawNum === "string") ? "）" : "",
        extractText: supplProvision.attr.Extract === "true" ? `${CST.MARGIN}抄` : "",
        lineEndText: CST.EOL,
    }));

    lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));

    const paragraphs = supplProvision.children.filter(isParagraph);
    const isSingleAnonymParagraph = (
        (paragraphs.length === 1) &&
        paragraphs.every(p => (
            p.children.filter(isParagraphItemTitle).every(el => el.text() === "") &&
            (p.children.filter(c => std.isParagraphSentence(c) && c.text().length > 0).length > 0)
        ))
    );

    for (const child of supplProvision.children) {
        if (child.tag === "SupplProvisionLabel") continue;

        if (isParagraphItem(child)) {
            if (isSingleAnonymParagraph) {
                lines.push(...paragraphItemToLines(child, indentTexts, { noControl: true }));
            } else {
                lines.push(...paragraphItemToLines(child, indentTexts, { defaultTag: "Paragraph" }));
            }
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
        } else if (isArticle(child)) {
            lines.push(...articleToLines(child, indentTexts));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
        } else if (isArticleGroup(child)) {
            lines.push(...articleGroupToLines(child, indentTexts));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
        } else if (isSupplProvisionAppdxItem(child)) {
            lines.push(...supplProvisionAppdxItemToLines(child, indentTexts));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
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
                                            .or(() => $paragraphItem("Paragraph"))
                                        )
                                    )
                                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                                )
                            )
                        )
                        .or(r => r
                            .sequence(s => s
                                .and(r => r
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
                                , "anonymParagraphs")
                                .action(({ anonymParagraphs }) => {
                                    for (const [i, { value: paragraph }] of anonymParagraphs.entries()) {
                                        paragraph.attr.Num = (i + 1).toString();
                                    }
                                    return anonymParagraphs;
                                })
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

/**
 * The parser rule for {@link std.SupplProvision}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$supplProvision.spec.ts) for examples.
 */
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
                [labelLine.line.title],
                labelLine.virtualRange,
            );
            const supplProvisionChildren = [
                supplProvisionLabel,
                ...children.value
            ];
            const pos = labelLine.line.indentsEndPos;
            const range = rangeOfELs(supplProvisionChildren) ?? (pos !== null ? [pos, pos] : null);
            if (range && pos !== null) {
                range[0] = pos;
            }
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
                supplProvisionChildren,
                range,
            );
            return {
                value: supplProvision,
                errors: [...children.errors],
            };
        })
    )
    ;

export default $supplProvision;
