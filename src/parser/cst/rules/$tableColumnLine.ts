import factory from "../factory";
import $indents from "./$indents";
import { TableColumnLine } from "../../../node/cst/line";
import { $_, $_EOL } from "../../../parser/lexical";
import $squareAttr from "./$squareAttr";
import $columnsOrSentences from "./$columnsOrSentences";


export const $tableColumnLine = factory
    .withName("tableColumnLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        // eslint-disable-next-line no-irregular-whitespace
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(r => r.seqEqual("*" as const), "firstColumnIndicator")
                    .and(() => $_, "midIndicatorsSpace")
                    .action(({ firstColumnIndicator, midIndicatorsSpace }) => ({ firstColumnIndicator, midIndicatorsSpace }))
                )
            )
        , "firstColumnIndicatorStruct")
        .and(r => r.seqEqual("-" as const), "columnIndicator")
        .and(() => $_, "midSpace")
        .and(r => r
            .zeroOrMore(r => r
                .sequence(s => s
                    .and(() => $squareAttr, "entry")
                    .and(() => $_, "trailingSpace")
                    .action(({ entry, trailingSpace }) => ({ ...entry, trailingSpace }))
                )
            )
        , "attrEntries")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(() => $columnsOrSentences, "columns")
                )
            )
        , "columns")
        .and(() => $_EOL, "lineEndText")
        .action(({ indentsStruct, firstColumnIndicatorStruct, columnIndicator, midSpace, attrEntries, columns, lineEndText }) => {
            return new TableColumnLine(
                indentsStruct.indentDepth,
                indentsStruct.indentTexts,
                firstColumnIndicatorStruct?.firstColumnIndicator ?? "",
                firstColumnIndicatorStruct?.midIndicatorsSpace ?? "",
                columnIndicator,
                midSpace,
                attrEntries,
                columns ?? [],
                lineEndText,
            );
        })
    )
    ;

export default $tableColumnLine;
