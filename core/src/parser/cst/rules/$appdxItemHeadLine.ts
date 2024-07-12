import factory from "../factory";
import { $sentenceChildrenWithoutToplevelInlineToken } from "./$sentenceChildren";
import $indents from "./$indents";
import { AppdxItemHeadLine } from "../../../node/cst/line";
import { $_EOL } from "./lexical";
import type { WithErrorRule } from "../util";
import { mergeAdjacentTexts } from "../util";
import { __Parentheses } from "../../../node/el/controls";
import { $appdxControl, $appdxFigControl, $appdxFormatControl, $appdxNoteControl, $appdxStyleControl, $appdxTableControl, $autoTagControl } from "./$tagControl";
import type { ChoiceRule } from "generic-parser/lib/rules/choice";
import type { Env } from "../env";
import type { ErrorMessage } from "../error";
import type { Control } from "../../../node/cst/inline";
import type { appdxItemTags } from "../../../law/std";

export const appdxItemTitlePtns = [
    ["AppdxFig", /^[別付附]?図/],
    // eslint-disable-next-line no-irregular-whitespace
    ["AppdxStyle", /^(?![付附]則)[^(（ 　\t\r\n]*様式/],
    // eslint-disable-next-line no-irregular-whitespace
    ["AppdxFormat", /^(?![付附]則)[^(（ 　\t\r\n]*書式/],
    ["AppdxTable", /^[別付附]表/],
    ["AppdxNote", /^別[記紙]/],
    ["Appdx", /^[付附]録/],
] as const;

export const detectAppdxItemTitle = (text: string) => {
    for (const [name, ptn] of appdxItemTitlePtns) {
        if (ptn.test(text)) {
            return name;
        }
    }
    return null;
};

/**
 * The parser rule for {@link AppdxItemHeadLine} that represents a head line of an appended item such as an appended table. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/cst/rules/$appdxItemHeadLine.spec.ts) for examples.
 */
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
                    .and(() => $autoTagControl, "control")
                    .and(r => r
                        .choice(c => {
                            let choice = c as unknown as ChoiceRule<string, typeof appdxItemTags[number], Env & {
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
                            for (const [name, ptn] of appdxItemTitlePtns) {
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
                value: new AppdxItemHeadLine({
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

export default $appdxItemHeadLine;
