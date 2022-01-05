import factory from "../factory";
import $indents from "./$indents";
import { ArticleLine } from "../../../node/cst/line";
import { $__, $_EOL } from "./lexical";
import $articleTitle from "./$articleTitle";
import $columnsOrSentences from "./$sentencesArray";
import makeRangesRule from "./makeRangesRule";
import { ValueRule } from "../util";

const { $ranges: $articleRanges } = makeRangesRule(() => $articleTitle);


export const $articleLine: ValueRule<ArticleLine> = factory
    .withName("articleLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and( r => r.asSlice(() => $articleRanges), "title")
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
            return new ArticleLine(
                range(),
                indentsStruct.indentDepth,
                indentsStruct.indentTexts,
                title,
                contentStruct?.midSpace ?? "",
                contentStruct?.columns ?? [],
                lineEndText,
            );
        })
    )
    ;

export default $articleLine;
