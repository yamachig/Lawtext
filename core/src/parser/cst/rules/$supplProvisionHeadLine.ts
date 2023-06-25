import factory from "../factory";
import $indents from "./$indents";
import { SupplProvisionHeadLine } from "../../../node/cst/line";
import { $_, $_EOL } from "./lexical";
import { WithErrorRule } from "../util";
import { Control } from "../../../node/cst/inline";

// eslint-disable-next-line no-irregular-whitespace
export const supplProvisionLabelPtn = /^[附付][ 　\t\r\n]*則/;
export const supplProvisionControl = ":suppl-provision:";

/**
 * The parser rule for {@link SupplProvisionHeadLine} that represents a head line of a supplementary provision. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/cst/rules/$supplProvisionHeadLine.spec.ts) for examples.
 */
export const $supplProvisionHeadLine: WithErrorRule<SupplProvisionHeadLine> = factory
    .withName("supplProvisionHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .zeroOrMore(r => r
                .sequence(s => s
                    .and(r => r
                        .sequence(s => s
                            .and(r => r
                                .choice(c => c
                                    .or(r => r.regExp(/^:keep-indents:/))
                                    .or(r => r.regExp(new RegExp(`^${supplProvisionControl}`)))
                                )
                            , "value")
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
        , "controls")
        .and(r => r
            .choice(c => c
                .orSequence(r => r
                    .and(r => r.regExp(supplProvisionLabelPtn), "text")
                    .action(({ text, range }) => ({ text, range: range() }))
                )
                .orSequence(s => s
                    .andOmit(r => r.assert(({ controls }) => controls.some(c => c.control === supplProvisionControl)))
                    .and(r => r.regExp(/^[^(（\r\n]+/), "text")
                    .action(({ text, range }) => ({ text, range: range() }))
                )
            )
        , "head")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(r => r
                        .asSlice(r => r
                            .sequence(s => s
                                .and(() => $_)
                                .and(r => r.regExp(/^[(（]/))
                            )
                        )
                    , "openParen")
                    .and(r => r.regExp(/^[^)）\r\n]+/), "amendLawNum")
                    .and(r => r.regExp(/^[)）]/), "closeParen")
                    .action(({ openParen, amendLawNum, closeParen }) => ({ openParen, amendLawNum, closeParen }))
                )
            )
        , "amendLawNumStruct")
        .and(r => r
            // eslint-disable-next-line no-irregular-whitespace
            .zeroOrOne(r => r.regExp(/^[ 　\t\r\n]*抄/))
        , "extract")
        .and(() => $_EOL, "lineEndText")
        .action(({ range, controls, indentsStruct, head, amendLawNumStruct, extract, lineEndText }) => {
            const errors = indentsStruct.errors;
            return {
                value: new SupplProvisionHeadLine({
                    range: range(),
                    indentTexts: indentsStruct.value.indentTexts,
                    controls,
                    title: head.text,
                    titleRange: head.range,
                    openParen: amendLawNumStruct?.openParen ?? "",
                    amendLawNum: amendLawNumStruct?.amendLawNum ?? "",
                    closeParen: amendLawNumStruct?.closeParen ?? "",
                    extractText: extract ?? "",
                    lineEndText,
                }),
                errors,
            };
        })
    )
    ;

export default $supplProvisionHeadLine;
