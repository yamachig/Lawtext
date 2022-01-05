import factory from "../factory";
import { BlankLine } from "../../../node/cst/line";
import { WithErrorRule } from "../util";

export const $blankLine: WithErrorRule<BlankLine> = factory
    .withName("blankLine")
    .sequence(s => s
        // eslint-disable-next-line no-irregular-whitespace
        .and(r => r.regExp(/^[ 　\t]*\r?\n/), "text")
        .action(({ range, text }) => {
            return { value: new BlankLine(range(), text), errors: [] };
        })
    )
    ;

export default $blankLine;

