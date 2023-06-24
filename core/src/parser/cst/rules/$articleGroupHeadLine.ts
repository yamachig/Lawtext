import factory from "../factory";
import $sentenceChildren from "./$sentenceChildren";
import $articleGroupNum from "./$articleGroupNum";
import $indents from "./$indents";
import { ArticleGroupHeadLine } from "../../../node/cst/line";
import { $__, $_EOL, $_ } from "./lexical";
import { mergeAdjacentTexts, WithErrorRule } from "../util";
import { typeCharsMap } from "../../../law/std/helpers";
import { Control } from "../../../node/cst/inline";
import makeRangesRule from "./makeRangesRule";
import { __Text } from "../../../node/el/controls";

const { $ranges: $articleGroupRanges } = makeRangesRule(() => $articleGroupNum);


/**
 * The parser rule for [ArticleGroupHeadLine](../../../node/cst/line.ts) that represents a head line of a head line of an article group (e.g. "Chapter"). Please see the source code for the detailed syntax, and the [test code](./$articleGroupHeadLine.spec.ts) for examples.
 */
export const $articleGroupHeadLine: WithErrorRule<ArticleGroupHeadLine> = factory
    .withName("articleGroupHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(r => r
                        .sequence(s => s
                            .and(r => r.regExp(/^:keep-indents:/), "value")
                            .action(({ value, range }) => ({ value, range: range() }))
                        )
                    , "control")
                    .and(r => r
                        .sequence(s => s
                            .and(() => $_, "value")
                            .action(({ value, range }) => ({ value, range: range() }))
                        )
                    , "trailingSpace")
                    .action(({ control, trailingSpace }) => {
                        return new Control(
                            control.value,
                            control.range,
                            trailingSpace.value,
                            trailingSpace.range,
                        );
                    })
                )
            )
        , "control")
        .and(r => r
            .sequence(s => s
                .and(() => $articleGroupRanges, "ranges")
                .action(({ ranges, text, range }) => ({ ranges, text: text(), range: range() }))
            )
        , "articleGroupNum")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(c => c
                    .and(r => r
                        .sequence(c => c
                            .and(() => $__, "space")
                            .action(({ space, range }) => {
                                return { text: space, range: range() };
                            })
                        )
                    , "space")
                    .and(() => $sentenceChildren, "inline")
                    .action(({ space, inline }) => {
                        return { space, inline };
                    })
                )
            )
        , "tail")
        .and(() => $_EOL, "lineEndText")
        .action(({ range, control, indentsStruct, articleGroupNum, tail, lineEndText }) => {
            const errors = [
                ...indentsStruct.errors,
                ...articleGroupNum.ranges.errors,
                ...(tail?.inline.errors ?? []),
            ];
            const sentenceChildren = mergeAdjacentTexts([
                new __Text(articleGroupNum.text, articleGroupNum.range),
                ...(
                    tail
                        ? [
                            new __Text(tail.space.text, tail.space.range),
                            ...tail.inline.value,
                        ]
                        : []
                ),
            ]);
            return {
                value: new ArticleGroupHeadLine({
                    range: range(),
                    indentTexts: indentsStruct.value.indentTexts,
                    mainTag: typeCharsMap[articleGroupNum.ranges.value[0][0].value.typeChar],
                    controls: control ? [control] : [],
                    sentenceChildren,
                    lineEndText,
                }),
                errors,
            };
        })
    )
    ;

export default $articleGroupHeadLine;
