import { factory } from "../factory";
import { LineType } from "../../../node/cst/line";
import { $blankLine, $optBNK_DEDENT, $optBNK_INDENT, ValueRule } from "../util";
import { newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import { sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";


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

export const $preamble: ValueRule<std.Preamble> = factory
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
                    .nextIs(r => r
                        .sequence(s => s
                            .and(r => r.zeroOrMore(() => $blankLine))
                            .and(r => r.anyOne(), "unexpected")
                            .and(r => r
                                .assert(({ addError, unexpected }) => {
                                    addError({
                                        message: "$preamble: この前にある前文の終了時にインデント解除が必要です。",
                                        range: unexpected.virtualRange,
                                    });
                                    return true;
                                })
                            )
                        )
                    )
                )
            )
        )
        .action(({ children }) => {
            for (let i = 0; i < children.length; i++) {
                children[i].attr.Num = `${i + 1}`;
            }
            return newStdEL("Preamble", {}, children);
        })
    )
    ;

export default $preamble;
