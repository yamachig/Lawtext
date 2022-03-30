import { factory } from "../factory";
import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { $blankLine, $optBNK_DEDENT, $optBNK_INDENT, WithErrorRule } from "../util";
import { newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import { sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import CST from "../toCSTSettings";
import { ErrorMessage } from "../../cst/error";
import { paragraphItemToLines } from "./$paragraphItem";
import { Control } from "../../../node/cst/inline";
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
        const paragraphLines = paragraphItemToLines(paragraph, childrenIndentTexts);
        lines.push(...paragraphLines);
    }

    return lines;
};


const $preambleChildren = factory
    .withName("preambleChildren")
    .oneOrMore(r => r
        .sequence(s => s
            .andOmit(r => r.zeroOrMore(() => $blankLine))
            .and(r => r
                .oneMatch(({ item }) => {
                    if (
                        item.type === LineType.OTH
                        && item.line.type === LineType.OTH
                        && item.line.sentencesArray.length > 0
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
            )
        )
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
        .and(() => $optBNK_INDENT)
        .and(() => $preambleChildren, "children")
        .and(r => r
            .choice(c => c
                .or(() => $optBNK_DEDENT)
                .or(r => r
                    .noConsumeRef(r => r
                        .sequence(s => s
                            .and(r => r.zeroOrMore(() => $blankLine))
                            .and(r => r.anyOne(), "unexpected")
                            .action(({ unexpected }) => {
                                return new ErrorMessage(
                                    "$preamble: この前にある前文の終了時にインデント解除が必要です。",
                                    unexpected.virtualRange,
                                );
                            })
                        )
                    )
                )
            )
        , "error")
        .action(({ children, error }) => {
            for (let i = 0; i < children.length; i++) {
                children[i].attr.Num = `${i + 1}`;
            }
            const preamble = newStdEL("Preamble", {}, children);
            preamble.range = rangeOfELs(preamble.children);
            return {
                value: preamble,
                errors: error instanceof ErrorMessage ? [error] : [],
            };
        })
    )
    ;

export default $preamble;
