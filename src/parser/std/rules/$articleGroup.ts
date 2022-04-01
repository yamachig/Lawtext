import { ArticleGroupHeadLine, BlankLine, Line, LineType } from "../../../node/cst/line";
import { newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { assertNever, Diff, range } from "../../../util";
import { WithErrorRule } from "../util";
import factory from "../factory";
import { $blankLine } from "../util";
import $paragraphItem, { paragraphItemToLines } from "./$paragraphItem";
import { mergeAdjacentTexts } from "../../cst/util";
import $article, { articleToLines } from "./$article";
import { rangeOfELs } from "../../../node/el";
import { parseNamedNum } from "../../../law/num";
import { appdxItemToLines } from "./$appdxItem";

export const articleGroupToLines = (el: std.ArticleGroup, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const ChildItems: Array<Diff<std.ArticleGroup, std.Part> | std.Article | std.Paragraph> = [];
    for (const child of el.children) {

        if (std.isArticleGroupTitle(child)) {
            const titleIndentDepth = indentTexts.length + std.articleGroupTitleTags.indexOf(child.tag) + 2;
            const titleIndentTexts = [
                ...indentTexts,
                ...[...range(0, titleIndentDepth)].map(() => CST.INDENT)
            ];

            lines.push(new ArticleGroupHeadLine(
                null,
                titleIndentDepth,
                titleIndentTexts,
                el.tag,
                mergeAdjacentTexts(child.children),
                CST.EOL,
            ));
            lines.push(new BlankLine(null, CST.EOL));

        } else {
            ChildItems.push(child);
        }
    }

    for (const [i, child] of ChildItems.entries()) {
        if (i > 0) lines.push(new BlankLine(null, CST.EOL));
        if (child.tag === "Article") {
            lines.push(...articleToLines(child, indentTexts));
            lines.push(new BlankLine(null, CST.EOL));

        } else if (child.tag === "Paragraph") {
            lines.push(...paragraphItemToLines(child, indentTexts));
            lines.push(new BlankLine(null, CST.EOL));

        } else if (std.isArticleGroup(child)) {
            lines.push(...articleGroupToLines(child, indentTexts));
            lines.push(new BlankLine(null, CST.EOL));

        } else if (std.isAppdxStyle(child)) {
            console.error("Unexpected AppdxStyle in MainProvision!");
            lines.push(...appdxItemToLines(child, indentTexts));

        }
        else { assertNever(child); }
    }

    return lines;
};


export const $articleGroup: WithErrorRule<std.ArticleGroup> = factory
    .withName("articleGroup")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === LineType.ARG
                ) {
                    return item;
                } else {
                    return null;
                }
            })
        , "headLine")
        .and(r => r
            .zeroOrMore(r => r
                .sequence(r => r
                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                    .and(r => r
                        .choice(r => r
                            .or(() => $article)
                            .or(() => $paragraphItem)
                            .orSequence(s => s
                                .andOmit(r => r
                                    .nextIs(r => r
                                        .oneMatch(({ item, headLine }) => {
                                            if (
                                                item.type === LineType.ARG
                                                && std.articleGroupTags.indexOf(headLine.line.mainTag) < std.articleGroupTags.indexOf(item.line.mainTag)
                                            ) {
                                                return item;
                                            } else {
                                                return null;
                                            }
                                        })
                                    )
                                )
                                .and(() => $articleGroup)
                            )
                        )
                    )
                )
            )
        , "children")
        .action(({ headLine, children }) => {
            const errors = [...children.map(c => c.errors).flat()];
            const articleGroup = newStdEL(
                headLine.line.mainTag,
                { Delete: "false", Hide: "false" },
            );

            articleGroup.append(newStdEL(
                std.articleGroupTitleTags[std.articleGroupTags.indexOf(headLine.line.mainTag)],
                {},
                headLine.line.sentenceChildren,
                headLine.line.contentRange,
            ));

            const num = parseNamedNum(
                typeof headLine.line.sentenceChildren[0] === "string"
                    ? headLine.line.sentenceChildren[0]
                    : headLine.line.sentenceChildren[0]?.text
            );
            if (num) {
                articleGroup.attr.Num = num;
            }

            articleGroup.extend(children.map(c => c.value));

            articleGroup.range = rangeOfELs(articleGroup.children);

            return {
                value: articleGroup,
                errors,
            };
        })
    )
    ;

export default $articleGroup;
