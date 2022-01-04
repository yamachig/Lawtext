import { factory } from "../factory";
import { LineType } from "../../../node/cst/line";
import { $blankLine, $optBNK_DEDENT, $optBNK_INDENT, ValueRule } from "../util";
import { newStdEL } from "../../../law/std";
import * as std from "../../../law/std";


const $preambleChildren = factory
    .withName("preambleChildren")
    .oneOrMore(r => r
        .sequence(s => s
            .andOmit(r => r.zeroOrMore(() => $blankLine))
            .and(r => r
                .oneMatch(({ item }) => {
                    if (
                        item.type === "PhysicalLine"
                        && item.line.type === LineType.OTH
                        && item.line.columns.length > 0
                    ) {
                        const inline = item.line.columns.length === 1
                            ? item.line.columns[0].sentences
                            : item.line.columns.map(c =>
                                newStdEL(
                                    "Column",
                                    Object.fromEntries(c.attrEntries.map(e => e.entry)),
                                    c.sentences,
                                )
                            );
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
                    item.type === "PhysicalLine"
                    && item.line.type === LineType.OTH
                    && item.virtualIndentDepth === 0
                    && item.line.columns.length === 0
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
        .and(() => $optBNK_DEDENT)
        .action(({ children }) => {
            for (let i = 0; i < children.length; i++) {
                children[i].attr.Num = `${i + 1}`;
            }
            return newStdEL("Preamble", {}, children);
        })
    )
    ;

export default $preamble;
