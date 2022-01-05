import factory from "../factory";
import $indents from "./$indents";
import { SupplProvisionHeadLine } from "../../../node/cst/line";
import { $_EOL } from "./lexical";
import { WithErrorRule } from "../util";


export const $supplProvisionHeadLine: WithErrorRule<SupplProvisionHeadLine> = factory
    .withName("supplProvisionHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        // eslint-disable-next-line no-irregular-whitespace
        .and(r => r.regExp(/^[附付][ 　\t]*則/), "head")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(r => r.oneOf("(（"), "openParen")
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
        .action(({ range, indentsStruct, head, amendLawNumStruct, extract, lineEndText }) => {
            const errors = indentsStruct.errors;
            return {
                value: new SupplProvisionHeadLine(
                    range(),
                    indentsStruct.value.indentDepth,
                    indentsStruct.value.indentTexts,
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
