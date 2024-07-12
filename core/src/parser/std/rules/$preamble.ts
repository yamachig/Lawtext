import { factory } from "../factory";
import type { Line } from "../../../node/cst/line";
import { LineType, OtherLine } from "../../../node/cst/line";
import type { WithErrorRule } from "../util";
import { $blankLine, makeIndentBlockWithCaptureRule } from "../util";
import { isParagraph, isParagraphItemTitle, newStdEL } from "../../../law/std";
import type * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { Control } from "../../../node/cst/inline";
import type { ErrorMessage } from "../../cst/error";
import $paragraphItem, { $noControlAnonymParagraph, paragraphItemToLines } from "./$paragraphItem";
import { rangeOfELs } from "../../../node/el";

export const preambleControl = ":preamble:";

/**
 * The renderer for {@link std.Preamble}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$preamble.spec.ts) for examples.
 */
export const preambleToLines = (preamble: std.Preamble, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    lines.push(new OtherLine({
        range: null,
        indentTexts,
        controls: [
            new Control(
                preambleControl,
                null,
                "",
                null,
            ),
        ],
        sentencesArray: [],
        lineEndText: CST.EOL,
    }));

    const childrenIndentTexts = [...indentTexts, CST.INDENT];

    for (const paragraph of preamble.children) {

        if (paragraph.children.filter(isParagraphItemTitle).some(el => el.text() !== "")) {
            lines.push(...paragraphItemToLines(paragraph, childrenIndentTexts, { defaultTag: "Paragraph" }));
        } else {
            lines.push(...paragraphItemToLines(paragraph, childrenIndentTexts, { noControl: true }));
        }
    }

    return lines;
};


const $preambleChildrenBlock = makeIndentBlockWithCaptureRule(
    "$preambleChildrenBlock",
    (factory
        .choice(c => c
            .orSequence(s => s
                .and(() => $paragraphItem("Paragraph"), "paragraphItem")
                .andOmit(r => r.assert(({ paragraphItem }) => isParagraph(paragraphItem.value)))
            )
            .or(() => $noControlAnonymParagraph)
        )
    ),
);

/**
 * The parser rule for {@link std.Preamble}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$preamble.spec.ts) for examples.
 */
export const $preamble: WithErrorRule<std.Preamble> = factory
    .withName("preamble")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === LineType.OTH
                    && item.line.type === LineType.OTH
                    // && item.virtualIndentDepth === 0
                    && item.line.sentencesArray.length === 0
                    && item.line.controls.length === 1
                    && item.line.controls.some(c => c.control === preambleControl)
                ) {
                    return item;
                } else {
                    return null;
                }
            })
        , "headLine")
        .and(r => r.zeroOrMore(() => $blankLine))
        .and(r => r
            .zeroOrOne(() => $preambleChildrenBlock)
        , "childrenBlock")
        .action(({ headLine, childrenBlock }) => {

            const children: std.Preamble["children"] = [];
            const errors: ErrorMessage[] = [];

            if (childrenBlock) {
                children.push(...childrenBlock.value.map(c => c.value as std.Paragraph));
                errors.push(...childrenBlock.value.map(c => c.errors).flat());
                errors.push(...childrenBlock.errors);
                for (let i = 0; i < children.length; i++) {
                    children[i].attr.Num = `${i + 1}`;
                }
            }

            const pos = headLine.line.indentsEndPos;
            const range = rangeOfELs(children) ?? (pos !== null ? [pos, pos] : null);
            if (range && pos !== null) {
                range[0] = pos;
            }
            const preamble = newStdEL("Preamble", {}, children, range);
            return {
                value: preamble,
                errors,
            };
        })
    )
    ;

export default $preamble;
