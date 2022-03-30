import { factory } from "../factory";
import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { $blankLine, $optBNK_DEDENT, $optBNK_INDENT, WithErrorRule } from "../util";
import { newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { ErrorMessage } from "../../cst/error";
import { Control } from "../../../node/cst/inline";
import { rangeOfELs } from "../../../node/el";
import $any, { anyToLines } from "./$any";

export const arithFormulaControl = ":arith-formula:";

export const arithFormulaToLines = (arithFormula: std.ArithFormula, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    lines.push(new OtherLine(
        null,
        indentTexts.length,
        indentTexts,
        [
            new Control(
                arithFormulaControl,
                null,
                "",
                null,
            ),
        ],
        [],
        CST.EOL,
    ));

    const childrenIndentTexts = [...indentTexts, CST.INDENT];

    lines.push(...arithFormula.children.map(c => anyToLines(c, childrenIndentTexts)).flat());

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
                    && item.line.sentencesArray.length === 0
                    && item.line.controls.some(c => c.control === arithFormulaControl)
                ) {
                    return item;
                } else {
                    return null;
                }
            })
        , "labelLine")
        .and(r => r.zeroOrMore(() => $blankLine))
        .and(() => $optBNK_INDENT)
        .and(() => $any, "any")
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
        .action(({ any, error }) => {
            // for (let i = 0; i < children.value.length; i++) {
            //     children.value[i].attr.Num = `${i + 1}`;
            // }
            const arithFormula = newStdEL(
                "ArithFormula",
                {},
                any.value,
            );
            arithFormula.range = rangeOfELs(arithFormula.children);
            return {
                value: arithFormula,
                errors: [
                    ...any.errors,
                    ...(error instanceof ErrorMessage ? [error] : []),
                ],
            };
        })
    )
    ;

export default $arithFormula;
