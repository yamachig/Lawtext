import { factory } from "../factory";
import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { $blankLine, $optBNK_DEDENT, $optBNK_INDENT, WithErrorRule } from "../util";
import { isSentence, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { ErrorMessage } from "../../cst/error";
import $paragraphItem from "./$paragraphItem";
import { Control, Sentences } from "../../../node/cst/inline";
import { rangeOfELs } from "../../../node/el";
import { NotImplementedError } from "../../../util";


const $arithFormulaChildren: WithErrorRule<(std.Sentence | std.ParagraphItem)[]> = factory
    .withName("arithFormulaChildren")
    .sequence(s => s
        .and(r => r
            .oneOrMore(r => r
                .sequence(s => s
                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                    .and(r => r
                        .choice(c => c
                            .orSequence(s => s
                                .and(() => $paragraphItem, "paragraphItem")
                                .action(({ paragraphItem }) => {
                                    return {
                                        value: [paragraphItem.value],
                                        errors: paragraphItem.errors,
                                    };
                                })
                            )
                            .or(r => r
                                .oneMatch(({ item }) => {
                                    if (
                                        item.type === LineType.OTH
                                && item.line.type === LineType.OTH
                                && item.line.sentencesArray.length > 0
                                    ) {
                                        return {
                                            value: item.line.sentencesArray.flat().map(ss => ss.sentences).flat(),
                                            errors: [],
                                        };
                                    } else {
                                        return null;
                                    }
                                })
                            )
                        )
                    )
                )
            )
        , "children")
        .action(({ children }) => {
            return {
                value: children.map(c => c.value).flat(),
                errors: children.map(c => c.errors).flat(),
            };
        })
    );

export const arithFormulaToLines = (arithFormula: std.ArithFormula, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    lines.push(new OtherLine(
        null,
        indentTexts.length,
        indentTexts,
        [
            new Control(
                ":arith-formula:",
                null,
                "",
                null,
            ),
        ],
        [],
        CST.EOL,
    ));

    const childrenIndentTexts = [...indentTexts, CST.INDENT];

    for (const child of arithFormula.children) {

        if (typeof child === "string") {
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
                        [newStdEL("Sentence", {}, [child])]
                    ),
                ],
                CST.EOL,
            ));

        } else if (isSentence(child)) {
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
                        [child]
                    ),
                ],
                CST.EOL,
            ));
        }
        else {
            throw new NotImplementedError(`arithFormulaToLines: ${child.tag}`);
        }
    }

    return lines;
};

export const $arithFormula: WithErrorRule<std.ArithFormula> = factory
    .withName("arithFormula")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === LineType.OTH
                    && item.line.type === LineType.OTH
                    && item.virtualIndentDepth === 0
                    && item.line.sentencesArray.length === 0
                    && item.line.controls.some(c => /^:arith-formula:$/.exec(c.control))
                ) {
                    return item;
                } else {
                    return null;
                }
            })
        , "labelLine")
        .and(r => r.zeroOrMore(() => $blankLine))
        .and(() => $optBNK_INDENT)
        .and(() => $arithFormulaChildren, "children")
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
                                    "$arithFormula: この前にある数式の終了時にインデント解除が必要です。",
                                    unexpected.virtualRange,
                                );
                            })
                        )
                    )
                )
            )
        , "error")
        .action(({ children, error }) => {
            // for (let i = 0; i < children.value.length; i++) {
            //     children.value[i].attr.Num = `${i + 1}`;
            // }
            const arithFormula = newStdEL(
                "ArithFormula",
                {},
                children.value,
            );
            arithFormula.range = rangeOfELs(arithFormula.children);
            return {
                value: arithFormula,
                errors: [
                    ...children.errors,
                    ...(error instanceof ErrorMessage ? [error] : []),
                ],
            };
        })
    )
    ;

export default $arithFormula;
