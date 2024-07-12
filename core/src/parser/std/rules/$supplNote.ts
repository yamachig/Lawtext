import { factory } from "../factory";
import type { Line } from "../../../node/cst/line";
import { LineType, OtherLine } from "../../../node/cst/line";
import type { WithErrorRule } from "../util";
import { newStdEL } from "../../../law/std";
import type * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { Control, Sentences } from "../../../node/cst/inline";
import { forceSentencesArrayToSentenceChildren } from "../../cst/rules/$sentencesArray";
import { rangeOfELs } from "../../../node/el";

export const supplNoteControl = ":suppl-note:";

/**
 * The renderer for {@link std.SupplNote}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$supplNote.spec.ts) for examples.
 */
export const supplNoteToLines = (supplNote: std.SupplNote, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    lines.push(new OtherLine({
        range: null,
        indentTexts,
        controls: [
            new Control(
                supplNoteControl,
                null,
                "",
                null,
            ),
        ],
        sentencesArray: [
            new Sentences(
                "",
                null,
                [],
                [newStdEL("Sentence", {}, supplNote.children)],
            ),
        ],
        lineEndText: CST.EOL,
    }));

    return lines;
};

/**
 * The parser rule for {@link std.SupplNote}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$supplNote.spec.ts) for examples.
 */
export const $supplNote: WithErrorRule<std.SupplNote> = factory
    .withName("supplNote")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === LineType.OTH
                    && item.line.controls.some(c => c.control === supplNoteControl)
                ) {
                    return item;
                } else {
                    return null;
                }
            })
        , "line")
        .action(({ line }) => {
            // for (let i = 0; i < children.value.length; i++) {
            //     children.value[i].attr.Num = `${i + 1}`;
            // }
            const children = forceSentencesArrayToSentenceChildren(line.line.sentencesArray);
            const pos = line.line.indentsEndPos;
            const range = rangeOfELs(children) ?? (pos !== null ? [pos, pos] : null);
            if (range && pos !== null) {
                range[0] = pos;
            }
            const supplNote = newStdEL(
                "SupplNote",
                {},
                children,
                range,
            );
            return {
                value: supplNote,
                errors: [],
            };
        })
    )
    ;

export default $supplNote;
