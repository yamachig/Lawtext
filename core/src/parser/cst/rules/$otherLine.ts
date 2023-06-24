import factory from "../factory";
import $indents from "./$indents";
import { OtherLine } from "../../../node/cst/line";
import { $_, $_EOL } from "./lexical";
import $columnsOrSentences from "./$sentencesArray";
import { WithErrorRule } from "../util";
import { Control, Sentences } from "../../../node/cst/inline";
import $xml from "./$xml";
import { newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import { EL } from "../../../node/el";


/**
 * The parser rule for [OtherLine](../../../node/cst/line.ts) that represents a line of other types. Please see the source code for the detailed syntax, and the [test code](./$otherLine.spec.ts) for examples.
 */
export const $otherLine: WithErrorRule<OtherLine> = factory
    .withName("otherLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .zeroOrMore(r => r
                .sequence(s => s
                    // eslint-disable-next-line no-irregular-whitespace
                    .and(r => r
                        .sequence(s => s
                            .and(r => r.regExp(/^:[^:\r\n]+:/), "value")
                            .action(({ value, range }) => ({ value, range: range() }))
                        )
                    , "control")
                    .and(r => r
                        .sequence(s => s
                            .and(() => $_, "value")
                            .action(({ value, range }) => ({ value, range: range() }))
                        )
                    , "trailingSpace")
                    .action(({ control, trailingSpace }) => new Control(
                        control.value,
                        control.range,
                        trailingSpace.value,
                        trailingSpace.range,
                    ))
                )
            )
        , "controls")
        .and(r => r
            .zeroOrOne(r => r
                .choice(c => c
                    .orSequence(s => s
                        // .andOmit(r => r.assert(({ controls }) => controls.some(c => c.control === ":xml:")))
                        .and(() => $xml, "xml")
                        .andOmit(r => r.nextIs(() => $_EOL))
                        .action(({ range, xml }) => {
                            const [start, end] = xml.value.range ?? range();
                            const el = xml.value;
                            const capturedEl = (
                                std.isLine(el) || std.isQuoteStruct(el) || std.isArithFormula(el) || std.isRuby(el) || std.isSup(el) || std.isSub(el) || std.isControl(el)
                            )
                                ? el
                                : new EL("__CapturedXML", {}, [el], [start, end]);
                            return {
                                value: [
                                    new Sentences(
                                        "",
                                        [start, start],
                                        [],
                                        [newStdEL("Sentence", {}, [capturedEl], [start, end])]
                                    )
                                ],
                                errors: xml.errors,
                            };
                        })
                    )
                    .or(() => $columnsOrSentences)
                )
            )
        , "columns")
        .and(() => $_EOL, "lineEndText")
        .action(({ range, indentsStruct, controls, columns, lineEndText }) => {
            const errors = [
                ...indentsStruct.errors,
                ...(columns?.errors ?? []),
            ];
            return {
                value: new OtherLine({
                    range: range(),
                    indentTexts: indentsStruct.value.indentTexts,
                    controls,
                    sentencesArray: columns?.value ?? [],
                    lineEndText,
                }),
                errors,
            };
        })
    )
    ;

export default $otherLine;
