import factory from "../factory";
import $sentenceChildren from "./$sentenceChildren";
import $indents from "./$indents";
import { AppdxItemHeadLine } from "../../../node/cst/line";
import { $_, $_EOL } from "./lexical";
import { mergeAdjacentTexts, WithErrorRule } from "../util";
import { Control } from "../../../node/cst/inline";
import { __Parentheses } from "../../../node/control";

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


export const appdxItemControl = {
    AppdxFig: ":appdx-fig:",
    AppdxStyle: ":appdx-style:",
    AppdxFormat: ":appdx-format:",
    AppdxTable: ":appdx-table:",
    AppdxNote: ":appdx-note:",
    Appdx: ":appdx:",
} as const;

export const appdxItemTitlePtn = {
    AppdxFig: /^[別付附]?図/,
    AppdxStyle: /^(?![付附]則)[^(（]*様式/,
    AppdxFormat: /^(?![付附]則)[^(（]*書式/,
    AppdxTable: /^[別付附]表/,
    AppdxNote: /^別[記紙]/,
    Appdx: /^[付附]録/,
} as const;

const $appdxControl = makeControlRule(new RegExp(`^${appdxItemControl.Appdx}`), "Appdx", "ArithFormulaNum");
const $appdxTableControl = makeControlRule(new RegExp(`^${appdxItemControl.AppdxTable}`), "AppdxTable", "AppdxTableTitle");
const $appdxStyleControl = makeControlRule(new RegExp(`^${appdxItemControl.AppdxStyle}`), "AppdxStyle", "AppdxTableTitle");
const $appdxFormatControl = makeControlRule(new RegExp(`^${appdxItemControl.AppdxFormat}`), "AppdxFormat", "AppdxFormatTitle");
const $appdxFigControl = makeControlRule(new RegExp(`^${appdxItemControl.AppdxFig}`), "AppdxFig", "AppdxFigTitle");
const $appdxNoteControl = makeControlRule(new RegExp(`^${appdxItemControl.AppdxNote}`), "AppdxNote", "AppdxNoteTitle");

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
                    .and(r => r.regExp(appdxItemTitlePtn.AppdxFig), "head")
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
                    .and(r => r.regExp(appdxItemTitlePtn.AppdxStyle), "head")
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
                    .and(r => r.regExp(appdxItemTitlePtn.AppdxFormat), "head")
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
                    .and(r => r.regExp(appdxItemTitlePtn.AppdxTable), "head")
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
                    .and(r => r.regExp(appdxItemTitlePtn.AppdxNote), "head")
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
                    .and(r => r.regExp(appdxItemTitlePtn.Appdx), "head")
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
            const lastItem = inline.length > 0 ? inline[inline.length - 1] : null;
            const [title, relatedArticleNum] = (
                lastItem instanceof __Parentheses
                && lastItem.attr.type === "round"
            ) ? [inline.slice(0, -1), inline.slice(-1)] : [inline, []];
            const errors = [...indentsStruct.errors, ...tail.errors];
            return {
                value: new AppdxItemHeadLine(
                    range(),
                    indentsStruct.value.indentDepth,
                    indentsStruct.value.indentTexts,
                    headStruct.mainTag,
                    headStruct.control ? [headStruct.control] : [],
                    title,
                    relatedArticleNum,
                    lineEndText,
                ),
                errors,
            };
        })
    )
    ;

export default $appdxItemHeadLine;
