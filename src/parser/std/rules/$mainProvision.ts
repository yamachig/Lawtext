import { factory } from "../factory";
import { BlankLine, Line } from "../../../node/cst/line";
import { $blankLine, WithErrorRule } from "../util";
import { isArticle, isArticleGroup, isParagraphItem, isParagraphItemTitle, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import $paragraphItem, { $noControlAnonymParagraph, paragraphItemToLines } from "./$paragraphItem";
import { assertNever } from "../../../util";
import $article, { articleToLines } from "./$article";
import $articleGroup, { articleGroupToLines } from "./$articleGroup";
import CST from "../toCSTSettings";

export const mainProvisionToLines = (mainProvision: std.MainProvision, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    for (const child of mainProvision.children) {
        if (isParagraphItem(child)) {
            if (child.children.filter(isParagraphItemTitle).some(el => el.text !== "")) {
                lines.push(...paragraphItemToLines(child, indentTexts, { defaultTag: "Paragraph" }));
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
        }
        else { assertNever(child); }
    }

    return lines;
};


const $mainProvisionChildren: WithErrorRule<(std.ParagraphItem | std.Article | std.ArticleGroup)[]> = factory
    .withName("mainProvisionChildren")
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
        , "children")
        .action(({ children }) => {
            return {
                value: children.map(c => c.value).flat(),
                errors: children.map(c => c.errors).flat(),
            };
        })
    );

export const $mainProvision: WithErrorRule<std.MainProvision> = factory
    .withName("mainProvision")
    .sequence(s => s
        .and(() => $mainProvisionChildren, "children")
        .action(({ children }) => {
            // for (let i = 0; i < children.value.length; i++) {
            //     children.value[i].attr.Num = `${i + 1}`;
            // }
            const mainProvision = newStdEL(
                "MainProvision",
                {},
                children.value,
            );
            return {
                value: mainProvision.setRangeFromChildren(),
                errors: [
                    ...children.errors,
                    // ...(error instanceof ErrorMessage ? [error] : []),
                ],
            };
        })
    )
    ;

export default $mainProvision;
