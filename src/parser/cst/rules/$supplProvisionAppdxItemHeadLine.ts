import factory from "../factory";
import $sentenceChildren from "./$sentenceChildren";
import $indents from "./$indents";
import { SupplProvisionAppdxItemHeadLine } from "../../../node/cst/line";
import { $_, $_EOL } from "./lexical";
import { mergeAdjacentTexts, WithErrorRule } from "../util";


export const $supplProvisionAppdxItemHeadLine: WithErrorRule<SupplProvisionAppdxItemHeadLine> = factory
    .withName("supplProvisionAppdxItemHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .choice(c => c
                .orSequence(s => s
                    .and(r => r.regExp(/^:suppl-provision-appdx:/), "control")
                    .and(() => $_, "trailingSpace")
                    .action(({ control, trailingSpace }) => {
                        return {
                            mainTag: "SupplProvisionAppdx",
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
                    .and(r => r.regExp(/^:suppl-provision-appdx-table:/), "control")
                    .and(() => $_, "trailingSpace")
                    .action(({ control, trailingSpace }) => {
                        return {
                            mainTag: "SupplProvisionAppdxTable",
                            titleTag: "SupplProvisionAppdxTableTitle",
                            control: {
                                control,
                                trailingSpace,
                            },
                            head: "",
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^:suppl-provision-appdx-style:/), "control")
                    .and(() => $_, "trailingSpace")
                    .action(({ control, trailingSpace }) => {
                        return {
                            mainTag: "SupplProvisionAppdxStyle",
                            titleTag: "SupplProvisionAppdxStyleTitle",
                            control: {
                                control,
                                trailingSpace,
                            },
                            head: "",
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^[付附]則[^(（]*様式/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "SupplProvisionAppdxStyle",
                            titleTag: "SupplProvisionAppdxStyleTitle",
                            control: null,
                            head,
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^[付附]則[別付附]表/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "SupplProvisionAppdxTable",
                            titleTag: "SupplProvisionAppdxTableTitle",
                            control: null,
                            head,
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^[付附]則[付附]録/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "SupplProvisionAppdx",
                            titleTag: "ArithFormulaNum",
                            control: null,
                            head,
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^[付附]則(?:別表)/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "SupplProvisionAppdxTable",
                            titleTag: "SupplProvisionAppdxTableTitle",
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
                value: new SupplProvisionAppdxItemHeadLine(
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

export default $supplProvisionAppdxItemHeadLine;
