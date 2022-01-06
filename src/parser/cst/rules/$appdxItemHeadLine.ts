import factory from "../factory";
import $sentenceChildren from "./$sentenceChildren";
import $indents from "./$indents";
import { AppdxItemHeadLine } from "../../../node/cst/line";
import { $_, $_EOL } from "./lexical";
import { mergeAdjacentTexts, WithErrorRule } from "../util";
import { Control } from "../../../node/cst/inline";

const makeControlRule = <
    TMainTag extends string,
    TTitleTag extends string,
>(
        controlPtn: RegExp,
        mainTag: TMainTag,
        titleTag: TTitleTag,
    ) => {
    return factory
        .sequence(s => s
            .and(r => r
                .sequence(s => s
                    .and(r => r.regExp(controlPtn), "value")
                    .action(({ value, range }) => ({ value, range: range() }))
                )
            , "control")
            .and(r => r
                .sequence(s => s
                    .and(() => $_, "value")
                    .action(({ value, range }) => ({ value, range: range() }))
                )
            , "trailingSpace")
            .action(({ control, trailingSpace }) => {
                return {
                    mainTag,
                    titleTag,
                    control: new Control(
                        control.value,
                        control.range,
                        trailingSpace.value,
                        trailingSpace.range,
                    ),
                    head: "",
                } as const;
            })
        );
};

const $appdxControl = makeControlRule(/^:appdx:/, "Appdx", "ArithFormulaNum");
const $appdxTableControl = makeControlRule(/^:appdx-table:/, "AppdxTable", "AppdxTableTitle");
const $appdxStyleControl = makeControlRule(/^:appdx-style:/, "AppdxStyle", "AppdxTableTitle");
const $appdxFormatControl = makeControlRule(/^:appdx-format:/, "AppdxFormat", "AppdxFormatTitle");
const $appdxFigControl = makeControlRule(/^:appdx-fig:/, "AppdxFig", "AppdxFigTitle");
const $appdxNoteControl = makeControlRule(/^:appdx-note:/, "AppdxNote", "AppdxNoteTitle");

export const $appdxItemHeadLine: WithErrorRule<AppdxItemHeadLine> = factory
    .withName("appdxItemHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .choice(c => c
                .or(() => $appdxControl)
                .or(() => $appdxTableControl)
                .or(() => $appdxStyleControl)
                .or(() => $appdxFormatControl)
                .or(() => $appdxFigControl)
                .or(() => $appdxNoteControl)
                .orSequence(s => s
                    .and(r => r.regExp(/^[別付附]?図/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "AppdxFig",
                            titleTag: "AppdxFigTitle",
                            control: null,
                            head,
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^(?![付附]則)[^(（]*様式/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "AppdxStyle",
                            titleTag: "AppdxStyleTitle",
                            control: null,
                            head,
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^(?![付附]則)[^(（]*書式/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "AppdxFormat",
                            titleTag: "AppdxFormatTitle",
                            control: null,
                            head,
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^[別付附]表/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "AppdxTable",
                            titleTag: "AppdxTableTitle",
                            control: null,
                            head,
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^別[記紙]/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "AppdxNote",
                            titleTag: "AppdxNoteTitle",
                            control: null,
                            head,
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^[付附]録/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "Appdx",
                            titleTag: "ArithFormulaNum",
                            control: null,
                            head,
                        } as const;
                    })
                )
            )
        , "headStruct")
        .and(() => $sentenceChildren, "tail")
        .and(() => $_EOL, "lineEndText")
        .action(({ range, indentsStruct, headStruct, tail, lineEndText }) => {
            const inline = mergeAdjacentTexts([headStruct.head, ...tail.value]);
            const errors = [...indentsStruct.errors, ...tail.errors];
            return {
                value: new AppdxItemHeadLine(
                    range(),
                    indentsStruct.value.indentDepth,
                    indentsStruct.value.indentTexts,
                    headStruct.mainTag,
                    headStruct.control ? [headStruct.control] : [],
                    inline,
                    lineEndText,
                ),
                errors,
            };
        })
    )
    ;

export default $appdxItemHeadLine;
