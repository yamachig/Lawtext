import factory from "../factory";
import { BlankLine } from "../../../node/cst/line";
import type { WithErrorRule } from "../util";

/**
 * The parser rule for {@link BlankLine} that represents a blank line. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/cst/rules/$blankLine.spec.ts) for examples.
 */
export const $blankLine: WithErrorRule<BlankLine> = factory
    .withName("blankLine")
    .sequence(s => s
        // eslint-disable-next-line no-irregular-whitespace
        .and(r => r.regExp(/^[ 　\t]*\r?\n/), "text")
        .action(({ range, text }) => {
            return { value: new BlankLine({ range: range(), lineEndText: text }), errors: [] };
        })
    )
    ;

export default $blankLine;

