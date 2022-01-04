import factory from "../factory";
import { BlankLine } from "../../../node/cst/line";

export const $blankLine = factory
    .withName("blankLine")
    .sequence(s => s
        // eslint-disable-next-line no-irregular-whitespace
        .and(r => r.regExp(/^[ 　\t]*\r?\n/), "text")
        .action(({ text }) => new BlankLine(text))
    )
    ;

export default $blankLine;

