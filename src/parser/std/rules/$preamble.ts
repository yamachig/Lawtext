import { factory } from "../factory";
import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { $blankLine, $optBNK_DEDENT, $optBNK_INDENT, WithErrorRule } from "../util";
import { newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import { columnsOrSentencesToSentencesArray, sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import CST from "../toCSTSettings";
import { ErrorMessage } from "../../cst/error";


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
                        return newStdEL(
                            "Paragraph",
                            {},
                            [
                                newStdEL("ParagraphNum"),
                                newStdEL(
                                    "ParagraphSentence",
                                    {},
                                    inline,
                                ),
                            ],
                        );
                    } else {
                        return null;
                    }
                })
            )
        )
    );

export const preambleToLines = (preamble: std.Preamble, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    lines.push(new OtherLine(
        null,
        indentTexts.length,
        indentTexts,
        [
            {
                control: ":前文:",
                trailingSpace: "",
            },
        ],
        [],
        CST.EOL,
    ));

    const childrenIndentTexts = [...indentTexts, CST.INDENT];

    for (const paragraph of preamble.children) {
        // TODO: Change to paragraphToCST
        const line = new OtherLine(
            null,
            childrenIndentTexts.length,
            childrenIndentTexts,
            [],
            [],
            CST.EOL,
        );
        for (const el of paragraph.children) {
            if (el.tag === "ParagraphSentence") {
                const columnsOrSentences = el.children;
                const sentencesArray = columnsOrSentencesToSentencesArray(columnsOrSentences);
                line.sentencesArray.push(...sentencesArray);
            }
        }
        lines.push(line);
    }

    return lines;
};

export const $preamble: WithErrorRule<std.Preamble> = factory
    .withName("preamble")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === LineType.OTH
                    && item.line.type === LineType.OTH
                    && item.virtualIndentDepth === 0
                    && item.line.sentencesArray.length === 0
                    && item.line.controls.length === 1
                    && item.line.controls.some(c => /^(?::前文:|:Preamble:|:preamble:)$/.exec(c.control))
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
            return {
                value: newStdEL("Preamble", {}, children),
                errors: error instanceof ErrorMessage ? [error] : [],
            };
        })
    )
    ;

export default $preamble;
