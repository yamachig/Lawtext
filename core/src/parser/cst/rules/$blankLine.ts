import factory from "../factory";
import { BlankLine } from "../../../node/cst/line";
import { WithErrorRule } from "../util";

/**
 * The parser rule for [BlankLine](../../../node/cst/line.ts) that represents a blank line. Please see the source code for the detailed syntax, and the [test code](./$blankLine.spec.ts) for examples.
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

