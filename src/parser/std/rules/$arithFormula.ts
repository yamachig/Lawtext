import { factory } from "../factory";
import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { $blankLine, makeIndentBlockWithCaptureRule, WithErrorRule } from "../util";
import { newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { ErrorMessage } from "../../cst/error";
import { Control } from "../../../node/cst/inline";
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


const $arithFormulaChildrenBlock = makeIndentBlockWithCaptureRule(
    "$arithFormulaChildrenBlock",
    (factory.ref(() => $any)),
);

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
        .and(() => $arithFormulaChildrenBlock, "childrenBlock")
        .action(({ childrenBlock }) => {

            const children: std.ArithFormula["children"] = [];
            const errors: ErrorMessage[] = [];

            children.push(...childrenBlock.value.flat().map(v => v.value).flat());
            errors.push(...childrenBlock.value.flat().map(v => v.errors).flat());

            const arithFormula = newStdEL(
                "ArithFormula",
                {},
                children,
            );
            return {
                value: arithFormula.setRangeFromChildren(),
                errors,
            };
        })
    )
    ;

export default $arithFormula;
