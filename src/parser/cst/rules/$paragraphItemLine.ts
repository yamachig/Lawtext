import factory from "../factory";
import $indents from "./$indents";
import { ParagraphItemLine } from "../../../node/cst/line";
import { $__, $_EOL } from "./lexical";
import $columnsOrSentences from "./$sentencesArray";
import makeRangesRule from "./makeRangesRule";
import $paragraphItemTitle from "./$paragraphItemTitle";
import { WithErrorRule } from "../util";

const { $ranges: $paragraphItemRanges } = makeRangesRule(() => $paragraphItemTitle);


export const $paragraphItemLine: WithErrorRule<ParagraphItemLine> = factory
    .withName("paragraphItemLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and( r => r
            .sequence(s => s
                .and(() => $paragraphItemRanges, "title")
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
                value: new ParagraphItemLine(
                    range(),
                    indentsStruct.value.indentDepth,
                    indentsStruct.value.indentTexts,
                    title.value,
                    contentStruct?.midSpace ?? "",
                    contentStruct?.columns.value ?? [],
                    lineEndText,
                ),
                errors,
            };
        })
    )
    ;

export default $paragraphItemLine;
