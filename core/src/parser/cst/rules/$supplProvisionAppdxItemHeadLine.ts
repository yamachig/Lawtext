import factory from "../factory";
import { $sentenceChildrenWithoutToplevelInlineToken } from "./$sentenceChildren";
import $indents from "./$indents";
import { SupplProvisionAppdxItemHeadLine } from "../../../node/cst/line";
import { $_EOL } from "./lexical";
import type { WithErrorRule } from "../util";
import { mergeAdjacentTexts } from "../util";
import { __Parentheses } from "../../../node/el/controls";
import { $autoTagControl, $supplProvisionAppdxControl, $supplProvisionAppdxStyleControl, $supplProvisionAppdxTableControl } from "./$tagControl";
import type { ChoiceRule } from "generic-parser/lib/rules/choice";
import type { ErrorMessage } from "../error";
import type { Control } from "../../../node/cst/inline";
import type { supplProvisionAppdxItemTags } from "../../../law/std";
import type { Env } from "../env";

export const supplProvisionAppdxItemTitlePtns = [
    ["SupplProvisionAppdx", /^[付附]則[付附]録/],
    ["SupplProvisionAppdxTable", /^[付附]則[別付附]表/],
    // eslint-disable-next-line no-irregular-whitespace
    ["SupplProvisionAppdxStyle", /^[付附]則[^(（ 　\t\r\n]*様式/],
] as const;

export const detectSupplProvisionAppdxItemTitle = (text: string) => {
    for (const [name, ptn] of supplProvisionAppdxItemTitlePtns) {
        if (ptn.test(text)) {
            return name;
        }
    }
    return null;
};

/**
 * The parser rule for {@link SupplProvisionAppdxItemHeadLine} that represents a head line of an appended item in a supplementary provision. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/cst/rules/$supplProvisionAppdxItemHeadLine.spec.ts) for examples.
 */
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
                    .and(() => $autoTagControl, "control")
                    .and(r => r
                        .choice(c => {
                            let choice = c as unknown as ChoiceRule<string, typeof supplProvisionAppdxItemTags[number], Env & {
                                indentsStruct: {
                                    value: {
                                        indentTexts: string[];
                                        indentDepth: number;
                                    };
                                    errors: ErrorMessage[];
                                    control: Control;
                                };
                                control: Control;
                            }>;
                            for (const [name, ptn] of supplProvisionAppdxItemTitlePtns) {
                                choice = choice
                                    .orSequence(s => s
                                        .and(r => r.nextIs(r => r.regExp(ptn)))
                                        .action(() => name)
                                    );
                            }
                            return choice;
                        })
                    , "tag")
                    .action(({ tag, control }) => {
                        return { tag, control };
                    })
                )
            )
        , "tagControl")
        .and(r => r
            .zeroOrOne(() => $sentenceChildrenWithoutToplevelInlineToken)
        , "tail")
        .and(() => $_EOL, "lineEndText")
        .action(({ range, indentsStruct, tagControl: { tag, control }, tail, lineEndText }) => {
            const inline = mergeAdjacentTexts(tail?.value ?? []);
            const lastItem = inline.length > 0 ? inline[inline.length - 1] : null;
            const [title, relatedArticleNum] = (
                lastItem instanceof __Parentheses
                && lastItem.attr.type === "round"
            ) ? [inline.slice(0, -1), inline.slice(-1)] : [inline, []];
            const errors = [
                ...indentsStruct.errors,
                ...(tail?.errors ?? []),
            ];
            return {
                value: new SupplProvisionAppdxItemHeadLine({
                    range: range(),
                    indentTexts: indentsStruct.value.indentTexts,
                    mainTag: tag,
                    controls: control ? [control] : [],
                    title,
                    relatedArticleNum,
                    lineEndText,
                }),
                errors,
            };
        })
    )
    ;

export default $supplProvisionAppdxItemHeadLine;
