import factory from "../factory";
import $indents from "./$indents";
import { TableColumnLine } from "../../../node/cst/line";
import { $_, $_EOL } from "./lexical";
import $squareAttr from "./$squareAttr";
import $columnsOrSentences from "./$sentencesArray";
import { WithErrorRule } from "../util";


export const $tableColumnLine: WithErrorRule<TableColumnLine> = factory
    .withName("tableColumnLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        // eslint-disable-next-line no-irregular-whitespace
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(r => r.seqEqual("*" as const), "firstColumnIndicator")
                    .and(() => $_, "midIndicatorsSpace")
                    .and(r => r.nextIs(r => r.oneOf(["-", "*"] as const)))
                    .action(({ firstColumnIndicator, midIndicatorsSpace }) => ({ firstColumnIndicator, midIndicatorsSpace }))
                )
            )
        , "firstColumnIndicatorStruct")
        .and(r => r.oneOf(["-", "*"] as const), "columnIndicator")
        .and(() => $_, "midSpace")
        .and(r => r
            .zeroOrMore(r => r
                .sequence(s => s
                    .and(() => $squareAttr, "entry")
                    .and(() => $_, "trailingSpace")
                    .action(({ entry, trailingSpace }) => {
                        return {
                            value: {
                                ...entry.value,
                                trailingSpace
                            },
                            errors: entry.errors,
                        };
                    })
                )
            )
        , "attrEntries")
        .and(r => r
            .choice(c => c
                .orSequence(r => r
                    .and(r => r.oneOf(["|"] as const))
                    .andOmit(r => r.nextIs(() => $_EOL))
                )
                .or(r => r
                    .zeroOrOne(r => r
                        .sequence(s => s
                            .and(() => $columnsOrSentences)
                        )
                    )
                )
            )
        , "columnsOrMultilineIndicator")
        .and(() => $_EOL, "lineEndText")
        .action(({ range, indentsStruct, firstColumnIndicatorStruct, columnIndicator, midSpace, attrEntries, columnsOrMultilineIndicator, lineEndText }) => {
            const [columns, multilineIndicator] = typeof columnsOrMultilineIndicator === "string"
                ? [null, columnsOrMultilineIndicator]
                : [columnsOrMultilineIndicator, null];
            const errors = [
                ...indentsStruct.errors,
                ...attrEntries.map(e => e.errors).flat(),
                ...(columns?.errors ?? []),
            ];
            return {
                value: new TableColumnLine(
                    range(),
                    indentsStruct.value.indentDepth,
                    indentsStruct.value.indentTexts,
                    firstColumnIndicatorStruct?.firstColumnIndicator ?? "",
                    firstColumnIndicatorStruct?.midIndicatorsSpace ?? "",
                    columnIndicator,
                    midSpace,
                    attrEntries.map(e => e.value),
                    multilineIndicator ?? "",
                    columns?.value ?? [],
                    lineEndText,
                ),
                errors,
            };
        })
    )
    ;

export default $tableColumnLine;
