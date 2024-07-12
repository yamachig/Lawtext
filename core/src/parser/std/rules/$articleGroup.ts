import type { Line } from "../../../node/cst/line";
import { ArticleGroupHeadLine, BlankLine, LineType } from "../../../node/cst/line";
import { newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import type { Diff } from "../../../util";
import { assertNever, range } from "../../../util";
import type { WithErrorRule } from "../util";
import factory from "../factory";
import { $blankLine, $indentBlock } from "../util";
import { paragraphItemToLines } from "./$paragraphItem";
import { mergeAdjacentTextsWithString } from "../../cst/util";
import $article, { articleToLines } from "./$article";
import { parseNamedNum } from "../../../law/num";
import { appdxItemToLines } from "./$appdxItem";
import { ErrorMessage } from "../../cst/error";
import { Control } from "../../../node/cst/inline";
import { rangeOfELs } from "../../../node/el";

/**
 * The renderer for article group ({@link std.ArticleGroup | ArticleGroup}) such as Chapter. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$articleGroup.spec.ts) for examples.
 */
export const articleGroupToLines = (el: std.ArticleGroup, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const ChildItems: Array<Diff<std.ArticleGroup, std.Part> | std.Article | std.Paragraph> = [];
    for (const child of el.children) {

        if (std.isArticleGroupTitle(child)) {
            const titleIndentDepth = indentTexts.length === 0
                ? std.articleGroupTitleTags.indexOf(child.tag) + 2
                : indentTexts.length;
            const titleIndentTexts = indentTexts.length === 0
                ? [...range(0, titleIndentDepth)].map(() => CST.INDENT)
                : indentTexts;

            lines.push(new ArticleGroupHeadLine({
                range: null,
                indentTexts: titleIndentTexts,
                mainTag: el.tag,
                controls: indentTexts.length == 0 ? [] : [
                    new Control(
                        ":keep-indents:",
                        null,
                        "",
                        null,
                    )
                ],
                sentenceChildren: mergeAdjacentTextsWithString(child.children),
                lineEndText: CST.EOL,
            }));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));

        } else {
            ChildItems.push(child);
        }
    }

    for (const [i, child] of ChildItems.entries()) {
        if (i > 0) lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
        if (child.tag === "Article") {
            lines.push(...articleToLines(child, indentTexts));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));

        } else if (child.tag === "Paragraph") {
            lines.push(...paragraphItemToLines(child, indentTexts, { defaultTag: "Paragraph" }));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));

        } else if (std.isArticleGroup(child)) {
            lines.push(...articleGroupToLines(child, indentTexts));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));

        } else if (std.isAppdxStyle(child)) {
            console.error("Unexpected AppdxStyle in MainProvision!");
            lines.push(...appdxItemToLines(child, indentTexts));

        }
        else { assertNever(child); }
    }

    return lines;
};


/**
 * The parser rule for article group ({@link std.ArticleGroup | ArticleGroup}) such as Chapter. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$articleGroup.spec.ts) for examples.
 */
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
                            // .or(() => $paragraphItem)
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
                            .or(r => r
                                .asSlice(r => r
                                    .oneOrMore(r => r
                                        .sequence(s => s
                                            .and(r => r
                                                .choice(c => c
                                                    .or(() => $indentBlock)
                                                    .orSequence(s => s
                                                        .and(r => r.anyOne(), "captured")
                                                        .andOmit(r => r.assert(({ captured }) =>
                                                            (captured.type === LineType.OTH)
                                                            || (captured.type === LineType.PIT)
                                                        ))
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        , "childrenAndErrors")
        .action(({ headLine, childrenAndErrors }) => {

            const children: (Diff<std.ArticleGroup, std.Part> | std.Article)[] = [];
            const errors: ErrorMessage[] = [];

            for (const child of childrenAndErrors) {
                if (Array.isArray(child)) {
                    errors.push(new ErrorMessage(
                        "$articleGroup: この部分をパースできませんでした。",
                        [
                            child[0].virtualRange[0],
                            child.slice(-1)[0].virtualRange[1],
                        ],
                    ));
                } else {
                    children.push(child.value as Diff<std.ArticleGroup, std.Part>);
                    errors.push(...child.errors);
                }
            }

            const articleGroup = newStdEL(
                headLine.line.mainTag,
            );

            (articleGroup.children as (typeof articleGroup.children)[number][]).push(newStdEL(
                std.articleGroupTitleTags[std.articleGroupTags.indexOf(headLine.line.mainTag)],
                {},
                headLine.line.title,
                headLine.line.titleRange,
            ));

            const num = parseNamedNum(
                typeof headLine.line.title[0] === "string"
                    ? headLine.line.title[0]
                    : headLine.line.title[0]?.text()
            );
            if (num) {
                articleGroup.attr.Num = num;
            }

            (articleGroup.children as (typeof articleGroup.children)[number][]).push(...children);

            const pos = headLine.line.indentsEndPos;
            const range = rangeOfELs(articleGroup.children) ?? (pos !== null ? [pos, pos] : null);
            if (range && pos !== null) {
                range[0] = pos;
            }
            articleGroup.range = range;

            return {
                value: articleGroup,
                errors,
            };
        })
    )
    ;

export default $articleGroup;
