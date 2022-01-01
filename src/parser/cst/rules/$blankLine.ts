import factory from "../factory";
import { LineType, BlankLine } from "../../../node/line";

export const $blankLine = factory
    .withName("blankLine")
    .sequence(s => s
        .and(r => r.regExp(/^\s*\r?\n$/), "text")
        .action(({ text }) => ({
            type: LineType.BNK,
            text,
        } as BlankLine))
    )
    ;

export default $blankLine;

