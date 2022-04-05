import factory from "../factory";
import $indents from "./$indents";
import { SupplProvisionHeadLine } from "../../../node/cst/line";
import { $_, $_EOL } from "./lexical";
import { WithErrorRule } from "../util";
import { Control } from "../../../node/cst/inline";


export const $supplProvisionHeadLine: WithErrorRule<SupplProvisionHeadLine> = factory
    .withName("supplProvisionHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(r => r
                        .sequence(s => s
                            .and(r => r.regExp(/^:keep-indents:/), "value")
                            .action(({ value, range }) => ({ value, range: range() }))
                        )
                    , "control")
                    .and(r => r
                        .sequence(s => s
                            .and(() => $_, "value")
                            .action(({ value, range }) => ({ value, range: range() }))
                        )
                    , "trailingSpace")
                    .action(({ control, trailingSpace }) => {
                        return new Control(
                            control.value,
                            control.range,
                            trailingSpace.value,
                            trailingSpace.range,
                        );
                    })
                )
            )
        , "control")
        // eslint-disable-next-line no-irregular-whitespace
        .and(r => r.regExp(/^[附付][ 　\t]*則/), "head")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(r => r
                        .asSlice(r => r
                            .sequence(s => s
                                .and(() => $_)
                                .and(r => r.oneOf("(（"))
                            )
                        )
                    , "openParen")
                    .and(r => r.regExp(/^[^)）\r\n]+/), "amendLawNum")
                    .and(r => r.oneOf(")）"), "closeParen")
                    .action(({ openParen, amendLawNum, closeParen }) => ({ openParen, amendLawNum, closeParen }))
                )
            )
        , "amendLawNumStruct")
        .and(r => r
            // eslint-disable-next-line no-irregular-whitespace
            .zeroOrOne(r => r.regExp(/^[ 　\t]*抄/))
        , "extract")
        .and(() => $_EOL, "lineEndText")
        .action(({ range, control, indentsStruct, head, amendLawNumStruct, extract, lineEndText }) => {
            const errors = indentsStruct.errors;
            return {
                value: new SupplProvisionHeadLine(
                    range(),
                    indentsStruct.value.indentDepth,
                    indentsStruct.value.indentTexts,
                    control ? [control] : [],
                    head,
                    amendLawNumStruct?.openParen ?? "",
                    amendLawNumStruct?.amendLawNum ?? "",
                    amendLawNumStruct?.closeParen ?? "",
                    extract ?? "",
                    lineEndText,
                ),
                errors,
            };
        })
    )
    ;

export default $supplProvisionHeadLine;
