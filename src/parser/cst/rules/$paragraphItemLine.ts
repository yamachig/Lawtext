import factory from "../factory";
import $indents from "./$indents";
import { ParagraphItemLine } from "../../../node/cst/line";
import { $__, $_EOL } from "./lexical";
import $columnsOrSentences from "./$sentencesArray";
import makeRangesRule from "./makeRangesRule";
import $paragraphItemTitle from "./$paragraphItemTitle";

const { $ranges: $paragraphItemRanges } = makeRangesRule(() => $paragraphItemTitle);


export const $paragraphItemLine = factory
    .withName("paragraphItemLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and( r => r.asSlice(() => $paragraphItemRanges), "title")
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
            return new ParagraphItemLine(
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

export default $paragraphItemLine;
