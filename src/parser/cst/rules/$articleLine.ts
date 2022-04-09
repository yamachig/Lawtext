import factory from "../factory";
import $indents from "./$indents";
import { ArticleLine } from "../../../node/cst/line";
import { $__, $_EOL } from "./lexical";
import $articleTitle from "./$articleTitle";
import $columnsOrSentences from "./$sentencesArray";
import makeRangesRule from "./makeRangesRule";
import { WithErrorRule } from "../util";

const { $ranges: $articleRanges } = makeRangesRule(() => $articleTitle);


export const $articleLine: WithErrorRule<ArticleLine> = factory
    .withName("articleLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and( r => r
            .sequence(s => s
                .and(() => $articleRanges, "title")
                .action(({ title, text }) => {
                    return {
                        value: text(),
                        errors: title.errors,
                    };
                })
            )
        , "title")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(c => c
                    .and(() => $__, "midSpace")
                    .and(() => $columnsOrSentences, "columns")
                    .action(({ midSpace, columns }) => {
                        return { midSpace, columns };
                    })
                )
            )
        , "contentStruct")
        .and(() => $_EOL, "lineEndText")
        .action(({ range, indentsStruct, title, contentStruct, lineEndText }) => {
            const errors = [
                ...indentsStruct.errors,
                ...title.errors,
                ...(contentStruct?.columns.errors ?? []),
            ];
            return {
                value: new ArticleLine({
                    range: range(),
                    indentTexts: indentsStruct.value.indentTexts,
                    title: title.value,
                    midSpace: contentStruct?.midSpace ?? "",
                    sentencesArray: contentStruct?.columns.value ?? [],
                    lineEndText,
                }),
                errors,
            };
        })
    )
    ;

export default $articleLine;
