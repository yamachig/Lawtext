import { factory } from "../factory";
import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { WithErrorRule } from "../util";
import { newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { Control, Sentences } from "../../../node/cst/inline";
export const supplNoteControl = ":suppl-note:";

export const supplNoteToLines = (supplNote: std.SupplNote, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    lines.push(new OtherLine(
        null,
        indentTexts.length,
        indentTexts,
        [
            new Control(
                supplNoteControl,
                null,
                "",
                null,
            ),
        ],
        [
            new Sentences(
                "",
                null,
                [],
                [newStdEL("Sentence", {}, supplNote.children)],
            ),
        ],
        CST.EOL,
    ));

    return lines;
};

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
            const supplNote = newStdEL(
                "SupplNote",
                {},
                line.line.sentencesArray.flat().map(s => s.sentences).flat().map(s => s.children).flat(),
            );
            return {
                value: supplNote.setRangeFromChildren(),
                errors: [],
            };
        })
    )
    ;

export default $supplNote;
