import factory from "../factory";
import $indents from "./$indents";
import { OtherLine } from "../../../node/cst/line";
import { $_, $_EOL } from "./lexical";
import $columnsOrSentences from "./$sentencesArray";
import { WithErrorRule } from "../util";


export const $otherLine: WithErrorRule<OtherLine> = factory
    .withName("otherLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .zeroOrMore(r => r
                .sequence(s => s
                    // eslint-disable-next-line no-irregular-whitespace
                    .and(r => r.regExp(/^:[^:\r\n]+:/), "control")
                    .and(() => $_, "trailingSpace")
                    .action(({ control, trailingSpace }) => ({ control, trailingSpace }))
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
