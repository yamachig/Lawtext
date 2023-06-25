import factory from "../factory";
import { newStdEL } from "../../../law/std";
import $indents from "./$indents";
import { TOCHeadLine } from "../../../node/cst/line";
import { __Text } from "../../../node/el/controls";
import { $_EOL } from "./lexical";
import { WithErrorRule } from "../util";

/**
 * The parser rule for {@link TOCHeadLine} that represents a head line of a TOC (Table Of Contents). Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/cst/rules/$tocHeadLine.spec.ts) for examples.
 */
export const $tocHeadLine: WithErrorRule<TOCHeadLine> = factory
    .withName("tocHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .sequence(s => s
                // eslint-disable-next-line no-irregular-whitespace
                .and(r => r.regExp(/^目[ 　\t]*次/), "label")
                .action(({ label, range }) => {
                    return {
                        content: newStdEL(
                            "TOC",
                            {},
                            [newStdEL("TOCLabel", {}, [new __Text(label, range())], range())],
                        ),
                        contentText: label,
                    };
                })
            )
        , "contentStruct")
        .and(() => $_EOL, "lineEndText")
        .action(({ range, indentsStruct, contentStruct, lineEndText }) => {
            const errors = indentsStruct.errors;
            return {
                value: new TOCHeadLine({
                    range: range(),
                    indentTexts: indentsStruct.value.indentTexts,
                    title: contentStruct.contentText,
                    lineEndText,
                }),
                errors,
            };
        })
    )
    ;

export default $tocHeadLine;
