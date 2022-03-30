import factory from "../factory";
import $sentenceChildren from "./$sentenceChildren";
import $indents from "./$indents";
import { SupplProvisionAppdxItemHeadLine } from "../../../node/cst/line";
import { $_, $_EOL } from "./lexical";
import { mergeAdjacentTexts, WithErrorRule } from "../util";
import { Control } from "../../../node/cst/inline";
import { __Parentheses } from "../../../node/control";

export const supplProvisionAppdxItemControl = {
    SupplProvisionAppdx: ":suppl-provision-appdx:",
    SupplProvisionAppdxTable: ":suppl-provision-appdx-table:",
    SupplProvisionAppdxStyle: ":suppl-provision-appdx-style:",
} as const;

export const supplProvisionAppdxItemTitlePtn = {
    SupplProvisionAppdx: /^[付附]則[付附]録/,
    SupplProvisionAppdxTable: /^[付附]則[別付附]表/,
    SupplProvisionAppdxStyle: /^[付附]則[^(（]*様式/,
} as const;

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

const $supplProvisionAppdxControl = makeControlRule(new RegExp(`^${supplProvisionAppdxItemControl.SupplProvisionAppdx}`), "SupplProvisionAppdx", "ArithFormulaNum");
const $supplProvisionAppdxTableControl = makeControlRule(new RegExp(`^${supplProvisionAppdxItemControl.SupplProvisionAppdxTable}`), "SupplProvisionAppdxTable", "SupplProvisionAppdxTableTitle");
const $supplProvisionAppdxStyleControl = makeControlRule(new RegExp(`^${supplProvisionAppdxItemControl.SupplProvisionAppdxStyle}`), "SupplProvisionAppdxStyle", "SupplProvisionAppdxTableTitle");


export const $supplProvisionAppdxItemHeadLine: WithErrorRule<SupplProvisionAppdxItemHeadLine> = factory
    .withName("supplProvisionAppdxItemHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .choice(c => c
                .or(() => $supplProvisionAppdxControl)
                .or(() => $supplProvisionAppdxTableControl)
                .or(() => $supplProvisionAppdxStyleControl)
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
                // .orSequence(s => s
                //     .and(r => r.regExp(/^[付附]則(?:別表)/), "head")
                //     .action(({ head }) => {
                //         return {
                //             mainTag: "SupplProvisionAppdxTable",
                //             titleTag: "SupplProvisionAppdxTableTitle",
                //             control: null,
                //             head,
                //         } as const;
                //     })
                // )
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
                value: new SupplProvisionAppdxItemHeadLine(
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

export default $supplProvisionAppdxItemHeadLine;
