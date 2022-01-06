import factory from "../factory";
import $indents from "./$indents";
import { OtherLine } from "../../../node/cst/line";
import { $_, $_EOL } from "./lexical";
import $columnsOrSentences from "./$sentencesArray";
import { WithErrorRule } from "../util";
import { Control } from "../../../node/cst/inline";


export const $otherLine: WithErrorRule<OtherLine> = factory
    .withName("otherLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .zeroOrMore(r => r
                .sequence(s => s
                    // eslint-disable-next-line no-irregular-whitespace
                    .and(r => r
                        .sequence(s => s
                            .and(r => r.regExp(/^:[^:\r\n]+:/), "value")
                            .action(({ value, range }) => ({ value, range: range() }))
                        )
                    , "control")
                    .and(r => r
                        .sequence(s => s
                            .and(() => $_, "value")
                            .action(({ value, range }) => ({ value, range: range() }))
                        )
                    , "trailingSpace")
                    .action(({ control, trailingSpace }) => new Control(
                        control.value,
                        control.range,
                        trailingSpace.value,
                        trailingSpace.range,
                    ))
                )
            )
        , "controls")
        .and(r => r
            .zeroOrOne(() => $columnsOrSentences)
        , "columns")
        .and(() => $_EOL, "lineEndText")
        .action(({ range, indentsStruct, controls, columns, lineEndText }) => {
            const errors = [
                ...indentsStruct.errors,
                ...(columns?.errors ?? []),
            ];
            return {
                value: new OtherLine(
                    range(),
                    indentsStruct.value.indentDepth,
                    indentsStruct.value.indentTexts,
                    controls,
                    columns?.value ?? [],
                    lineEndText,
                ),
                errors,
            };
        })
    )
    ;

export default $otherLine;
