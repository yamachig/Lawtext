import { factory } from "../factory";
import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { $blankLine, makeIndentBlockWithCaptureRule, WithErrorRule } from "../util";
import { newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { ErrorMessage } from "../../cst/error";
import { Control } from "../../../node/cst/inline";
import $any, { anyToLines } from "./$any";
import { rangeOfELs } from "../../../node/el";

export const arithFormulaControl = ":arith-formula:";

/**
 * The renderer for {@link std.ArithFormula}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$arithFormula.spec.ts) for examples.
 */
export const arithFormulaToLines = (arithFormula: std.ArithFormula, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    lines.push(new OtherLine({
        range: null,
        indentTexts,
        controls: [
            new Control(
                arithFormulaControl,
                null,
                "",
                null,
            ),
        ],
        sentencesArray: [],
        lineEndText: CST.EOL,
    }));

    const childrenIndentTexts = [...indentTexts, CST.INDENT];

    lines.push(...arithFormula.children.map(c => anyToLines(c, childrenIndentTexts)).flat());

    return lines;
};


const $arithFormulaChildrenBlock = makeIndentBlockWithCaptureRule(
    "$arithFormulaChildrenBlock",
    (factory.ref(() => $any)),
);

/**
 * The parser rule for {@link std.ArithFormula}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$arithFormula.spec.ts) for examples.
 */
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
        .and(r => r
            .zeroOrOne(() => $arithFormulaChildrenBlock)
        , "childrenBlock")
        .action(({ labelLine, childrenBlock }) => {

            const children: std.ArithFormula["children"] = [];
            const errors: ErrorMessage[] = [];

            if (childrenBlock) {
                children.push(...childrenBlock.value.flat().map(v => v.value).flat());
                errors.push(...childrenBlock.value.flat().map(v => v.errors).flat());
                errors.push(...childrenBlock.errors);
            }

            const pos = labelLine.line.indentsEndPos;
            const range = rangeOfELs(children) ?? (pos !== null ? [pos, pos] : null);
            if (range && pos !== null) {
                range[0] = pos;
            }
            const arithFormula = newStdEL(
                "ArithFormula",
                {},
                children,
                range,
            );
            return {
                value: arithFormula,
                errors,
            };
        })
    )
    ;

export default $arithFormula;
