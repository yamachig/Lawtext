import factory from "../factory";
import { BlankLine } from "../../../node/cst/line";

export const $blankLine = factory
    .withName("blankLine")
    .sequence(s => s
        .and(r => r.regExp(/^\s*\r?\n$/), "text")
        .action(({ text }) => new BlankLine(text))
    )
    ;

export default $blankLine;

