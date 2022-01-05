import factory from "../factory";
import { articleGroupType } from "../../../law/lawUtil";
import $sentenceChildren from "./$sentenceChildren";
import $articleGroupNum from "./$articleGroupNum";
import $indents from "./$indents";
import { ArticleGroupHeadLine } from "../../../node/cst/line";
import { $__, $_EOL } from "./lexical";
import { WithErrorRule } from "../util";


export const $articleGroupHeadLine: WithErrorRule<ArticleGroupHeadLine> = factory
    .withName("articleGroupHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
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
        .action(({ range, indentsStruct, articleGroupNum, tail, lineEndText }) => {
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
                    articleGroupNum.value.text,
                    tail?.space ?? "",
                    tail?.inline.value ?? [],
                    lineEndText,
                ),
                errors,
            };
        })
    )
    ;

export default $articleGroupHeadLine;
