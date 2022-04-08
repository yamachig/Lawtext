import { factory } from "../factory";
import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { $blankLine, makeIndentBlockWithCaptureRule, WithErrorRule } from "../util";
import { isParagraph, isParagraphItemTitle, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { Control } from "../../../node/cst/inline";
import { ErrorMessage } from "../../cst/error";
import $paragraphItem, { $noControlAnonymParagraph, paragraphItemToLines } from "./$paragraphItem";
import { rangeOfELs } from "../../../node/el";

export const preambleControl = ":preamble:";

export const preambleToLines = (preamble: std.Preamble, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    lines.push(new OtherLine(
        null,
        indentTexts.length,
        indentTexts,
        [
            new Control(
                preambleControl,
                null,
                "",
                null,
            ),
        ],
        [],
        CST.EOL,
    ));

    const childrenIndentTexts = [...indentTexts, CST.INDENT];

    for (const paragraph of preamble.children) {

        if (paragraph.children.filter(isParagraphItemTitle).some(el => el.text !== "")) {
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
            const pos = headLine.line.range ? headLine.line.range[1] - headLine.line.lineEndText.length : null;
            const preamble = newStdEL("Preamble", {}, children, rangeOfELs(children) ?? (pos ? [pos, pos] : null));
            return {
                value: preamble,
                errors,
            };
        })
    )
    ;

export default $preamble;
