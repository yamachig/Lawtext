import factory from "../factory";
import $sentenceChildren from "./$sentenceChildren";
import $indents from "./$indents";
import { AppdxItemHeadLine } from "../../../node/cst/line";
import { $_, $_EOL } from "./lexical";
import { mergeAdjacentTexts } from "../util";


export const $appdxItemHeadLine = factory
    .withName("appdxItemHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .choice(c => c
                .orSequence(s => s
                    .and(r => r.regExp(/^:appdx:/), "control")
                    .and(() => $_, "trailingSpace")
                    .action(({ control, trailingSpace }) => {
                        return {
                            mainTag: "Appdx",
                            titleTag: "ArithFormulaNum",
                            control: {
                                control,
                                trailingSpace,
                            },
                            head: "",
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^:appdx-table:/), "control")
                    .and(() => $_, "trailingSpace")
                    .action(({ control, trailingSpace }) => {
                        return {
                            mainTag: "AppdxTable",
                            titleTag: "AppdxTableTitle",
                            control: {
                                control,
                                trailingSpace,
                            },
                            head: "",
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^:appdx-style:/), "control")
                    .and(() => $_, "trailingSpace")
                    .action(({ control, trailingSpace }) => {
                        return {
                            mainTag: "AppdxStyle",
                            titleTag: "AppdxStyleTitle",
                            control: {
                                control,
                                trailingSpace,
                            },
                            head: "",
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^:appdx-format:/), "control")
                    .and(() => $_, "trailingSpace")
                    .action(({ control, trailingSpace }) => {
                        return {
                            mainTag: "AppdxFormat",
                            titleTag: "AppdxFormatTitle",
                            control: {
                                control,
                                trailingSpace,
                            },
                            head: "",
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^:appdx-fig:/), "control")
                    .and(() => $_, "trailingSpace")
                    .action(({ control, trailingSpace }) => {
                        return {
                            mainTag: "AppdxFig",
                            titleTag: "AppdxFigTitle",
                            control: {
                                control,
                                trailingSpace,
                            },
                            head: "",
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^:appdx-note:/), "control")
                    .and(() => $_, "trailingSpace")
                    .action(({ control, trailingSpace }) => {
                        return {
                            mainTag: "AppdxNote",
                            titleTag: "AppdxNoteTitle",
                            control: {
                                control,
                                trailingSpace,
                            },
                            head: "",
                        } as const;
                    })
                )
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
            const inline = mergeAdjacentTexts([headStruct.head, ...tail]);
            return new AppdxItemHeadLine(
                range(),
                indentsStruct.indentDepth,
                indentsStruct.indentTexts,
                headStruct.mainTag,
                headStruct.control ? [headStruct.control] : [],
                inline,
                lineEndText,
            );
        })
    )
    ;

export default $appdxItemHeadLine;
