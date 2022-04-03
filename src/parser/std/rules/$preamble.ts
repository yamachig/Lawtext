import { factory } from "../factory";
import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { $blankLine, makeIndentBlockWithCaptureRule, WithErrorRule } from "../util";
import { isParagraph, isParagraphNum, isParagraphSentence, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import { sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import CST from "../toCSTSettings";
import { Control, Sentences } from "../../../node/cst/inline";
import { rangeOfELs } from "../../../node/el";
import { assertNever, NotImplementedError } from "../../../util";

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
        if (
            (paragraph.children.filter(isParagraphNum).every(p => p.text === ""))
            && (paragraph.children.every(c => isParagraphNum(c) || isParagraphSentence(c)))
        ) {
            lines.push(new OtherLine(
                null,
                childrenIndentTexts.length,
                childrenIndentTexts,
                [],
                [
                    new Sentences(
                        "",
                        null,
                        [],
                        paragraph.children.filter(isParagraphSentence).map(c => c.children).flat(),
                    )
                ],
                CST.EOL,
            ));
        } else if (isParagraph(paragraph)) {
            throw new NotImplementedError(`preambleToLines: ${paragraph.tag} with is not single non-nmmbered`);
        }
        else { assertNever(paragraph); }
    }

    return lines;
};


const $preambleChildrenBlock = makeIndentBlockWithCaptureRule(
    "$preambleChildrenBlock",
    (factory
        .oneMatch(({ item }) => {
            if (
                item.type === LineType.OTH
            ) {
                const inline = sentencesArrayToColumnsOrSentences(item.line.sentencesArray);
                const firstRange = inline[0].range;
                const lastRange = inline.slice(-1)[0].range;
                const range = firstRange && lastRange
                    ? [firstRange[0], lastRange[1]] as [number, number]
                    : null;
                return newStdEL(
                    "Paragraph",
                    {},
                    [
                        newStdEL("ParagraphNum", {}, [], range ? [range[0], range[0]] : null),
                        newStdEL(
                            "ParagraphSentence",
                            {},
                            inline,
                            range,
                        ),
                    ],
                    range,
                );
            } else {
                return null;
            }
        })
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
        )
        .and(r => r.zeroOrMore(() => $blankLine))
        .and(() => $preambleChildrenBlock, "children")
        .action(({ children: { value: children, errors } }) => {
            for (let i = 0; i < children.length; i++) {
                children[i].attr.Num = `${i + 1}`;
            }
            const preamble = newStdEL("Preamble", {}, children);
            preamble.range = rangeOfELs(preamble.children);
            return {
                value: preamble,
                errors,
            };
        })
    )
    ;

export default $preamble;
