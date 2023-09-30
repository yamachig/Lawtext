import factory from "../factory";
import $indents from "./$indents";
import { TOCHeadLine } from "../../../node/cst/line";
import { $_, $_EOL } from "./lexical";
import { WithErrorRule } from "../util";
import { Control } from "../../../node/cst/inline";
import { $sentenceChildrenWithoutToplevelInlineToken } from "./$sentenceChildren";

/**
 * The parser rule for {@link TOCHeadLine} that represents a head line of a TOC (Table Of Contents). Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/cst/rules/$tocHeadLine.spec.ts) for examples.
 */
export const $tocHeadLine: WithErrorRule<TOCHeadLine> = factory
    .withName("tocHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(r => r
                        .sequence(s => s
                            .and(r => r.regExp(/^:toc:/), "value")
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
        .and(r => r
            .assert(({ indentsStruct, control }) => {
                return (control !== null) || (indentsStruct.value.indentTexts.length === 0);
            })
        )
        .and(r => r
            .sequence(s => s
                .and(r => r
                    .choice(c => c
                        // eslint-disable-next-line no-irregular-whitespace
                        .or(r => r.regExp(/^目[ 　\t]*次/))
                        .orSequence(s => s
                            .andOmit(r => r
                                .assert(({ control }) => control)
                            )
                            .and(r => r
                                .asSlice(r => r
                                    .choice(c => c
                                        .or(() => $sentenceChildrenWithoutToplevelInlineToken)
                                        .or(r => r.nextIs(() => $_EOL))
                                    )
                                )
                            )
                        )
                    )
                , "label")
                .action(({ label }) => {
                    return {
                        contentText: label,
                    };
                })
            )
        , "contentStruct")
        .and(() => $_EOL, "lineEndText")
        .action(({ range, indentsStruct, control, contentStruct, lineEndText }) => {
            const errors = indentsStruct.errors;
            return {
                value: new TOCHeadLine({
                    range: range(),
                    indentTexts: indentsStruct.value.indentTexts,
                    title: contentStruct.contentText,
                    controls: control ? [control] : [],
                    lineEndText,
                }),
                errors,
            };
        })
    )
    ;

export default $tocHeadLine;
