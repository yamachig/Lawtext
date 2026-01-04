import factory from "../factory";
import $indents from "./$indents";
import { TableColumnLine } from "../../../node/cst/line";
import { $_, $_EOL } from "./lexical";
import $squareAttr from "./$squareAttr";
import $columnsOrSentences from "./$sentencesArray";
import type { WithErrorRule } from "../util";


/**
 * The parser rule for {@link TableColumnLine} that represents a line of table column. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/cst/rules/$tableColumnLine.spec.ts) for examples.
 */
export const $tableColumnLine: WithErrorRule<TableColumnLine> = factory
    .withName("tableColumnLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(r => r.seqEqual("*" as const), "firstColumnIndicator")
                    .and(() => $_, "midIndicatorsSpace")
                    .and(r => r.nextIs(r => r.regExp(/^[-*]/)))
                    .action(({ firstColumnIndicator, midIndicatorsSpace }) => ({ firstColumnIndicator, midIndicatorsSpace }))
                )
            )
        , "firstColumnIndicatorStruct")
        .and(r => r.regExp(/^[-*]/), "columnIndicator")
        .and(() => $_, "midSpace")
        .and(r => r
            .zeroOrMore(r => r
                .sequence(s => s
                    .and(() => $squareAttr, "entry")
                    .and(() => $_, "trailingSpace")
                    .action(({ entry, trailingSpace }) => {
                        const attrEntry = entry.value;
                        attrEntry.trailingSpace += trailingSpace;
                        if (attrEntry.trailingSpaceRange) attrEntry.trailingSpaceRange[1] += trailingSpace.length;
                        return {
                            value: attrEntry,
                            errors: entry.errors,
                        };
                    })
                )
            )
        , "attrEntries")
        .and(r => r
            .choice(c => c
                .orSequence(r => r
                    .and(r => r.seqEqual("|"))
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
                value: new TableColumnLine({
                    range: range(),
                    indentTexts: indentsStruct.value.indentTexts,
                    firstColumnIndicator: firstColumnIndicatorStruct?.firstColumnIndicator ?? "",
                    midIndicatorsSpace: firstColumnIndicatorStruct?.midIndicatorsSpace ?? "",
                    columnIndicator: columnIndicator as "*" | "-",
                    midSpace,
                    attrEntries: attrEntries.map(e => e.value),
                    multilineIndicator: (multilineIndicator as "|" | null) ?? "",
                    sentencesArray: columns?.value ?? [],
                    lineEndText,
                }),
                errors,
            };
        })
    )
    ;

export default $tableColumnLine;
