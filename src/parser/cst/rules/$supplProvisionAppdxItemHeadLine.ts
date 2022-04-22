import factory from "../factory";
import $sentenceChildren from "./$sentenceChildren";
import $indents from "./$indents";
import { SupplProvisionAppdxItemHeadLine } from "../../../node/cst/line";
import { $_EOL } from "./lexical";
import { mergeAdjacentTexts, WithErrorRule } from "../util";
import { __Parentheses } from "../../../node/el/control";
import { $autoTagControl, $supplProvisionAppdxControl, $supplProvisionAppdxStyleControl, $supplProvisionAppdxTableControl } from "./$tagControl";
import { ChoiceRule } from "generic-parser/lib/rules/choice";
import { ErrorMessage } from "../error";
import { Control } from "../../../node/cst/inline";
import { supplProvisionAppdxItemTags } from "../../../law/std";
import { Env } from "../env";

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
            .zeroOrOne(() => $sentenceChildren)
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
