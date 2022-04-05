import factory from "../factory";
import $sentenceChildren from "./$sentenceChildren";
import $articleGroupNum from "./$articleGroupNum";
import $indents from "./$indents";
import { ArticleGroupHeadLine } from "../../../node/cst/line";
import { $__, $_EOL, $_ } from "./lexical";
import { mergeAdjacentTexts, WithErrorRule } from "../util";
import { articleGroupType } from "../../../law/num";
import { Control } from "../../../node/cst/inline";


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
        .and(() => $articleGroupNum, "articleGroupNum")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(c => c
                    .and(() => $__, "space")
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
                ...articleGroupNum.errors,
                ...(tail?.inline.errors ?? []),
            ];
            return {
                value: new ArticleGroupHeadLine(
                    range(),
                    indentsStruct.value.indentDepth,
                    indentsStruct.value.indentTexts,
                    articleGroupType[articleGroupNum.value.typeChar],
                    control ? [control] : [],
                    mergeAdjacentTexts([
                        articleGroupNum.value.text,
                        tail?.space ?? "",
                        ...(tail?.inline.value ?? []),
                    ]),
                    lineEndText,
                ),
                errors,
            };
        })
    )
    ;

export default $articleGroupHeadLine;
