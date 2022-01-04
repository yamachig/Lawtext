import factory from "../factory";
import $indents from "./$indents";
import { OtherLine } from "../../../node/cst/line";
import { $_, $_EOL } from "./lexical";
import $columnsOrSentences from "./$columnsOrSentences";


export const $otherLine = factory
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
            return new OtherLine(
                range(),
                indentsStruct.indentDepth,
                indentsStruct.indentTexts,
                controls,
                columns ?? [],
                lineEndText,
            );
        })
    )
    ;

export default $otherLine;
