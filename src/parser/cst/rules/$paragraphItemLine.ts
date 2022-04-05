import factory from "../factory";
import $indents from "./$indents";
import { ParagraphItemLine } from "../../../node/cst/line";
import { $__, $_EOL } from "./lexical";
import $columnsOrSentences from "./$sentencesArray";
import makeRangesRule from "./makeRangesRule";
import $paragraphItemTitle, { $stdItemTitle, $stdParagraphNum, $stdSubitem1Title, $stdSubitem2Title, $stdSubitem3Title } from "./$paragraphItemTitle";
import { WithErrorRule } from "../util";
import { $anonymItemControl, $anonymParagraphControl, $anonymSubitem10Control, $anonymSubitem1Control, $anonymSubitem2Control, $anonymSubitem3Control, $anonymSubitem4Control, $anonymSubitem5Control, $anonymSubitem6Control, $anonymSubitem7Control, $anonymSubitem8Control, $anonymSubitem9Control, $autoTagControl, $itemControl, $paragraphControl, $subitem10Control, $subitem1Control, $subitem2Control, $subitem3Control, $subitem4Control, $subitem5Control, $subitem6Control, $subitem7Control, $subitem8Control, $subitem9Control } from "./$tagControl";
import { Env, initialEnv } from "../env";
import { MatchResult } from "generic-parser/lib/core";
import { ErrorMessage } from "../error";
import $sentenceChildren from "./$sentenceChildren";

export const { $ranges: $paragraphItemRanges } = makeRangesRule(() => $paragraphItemTitle);
export const { $ranges: $stdParagraphRange } = makeRangesRule(() => $stdParagraphNum);
export const { $ranges: $stdItemRange } = makeRangesRule(() => $stdItemTitle);
export const { $ranges: $stdItem1Range } = makeRangesRule(() => $stdSubitem1Title);
export const { $ranges: $stdItem2Range } = makeRangesRule(() => $stdSubitem2Title);
export const { $ranges: $stdItem3Range } = makeRangesRule(() => $stdSubitem3Title);

export const paragraphItemTitleRule = {
    Paragraph: $stdParagraphRange,
    Item: $stdItemRange,
    Subitem1: $stdItem1Range,
    Subitem2: $stdItem2Range,
    Subitem3: $stdItem3Range,
} as const;

export const paragraphItemTitleMatch = Object.fromEntries(Object.entries(paragraphItemTitleRule).map(([tag, $rule]) => {
    const env = initialEnv({});
    return [
        tag,
        (target: string) => {
            const m = $rule.match(0, target, env);
            if (m.ok && m.nextOffset === target.length) {
                return m;
            } else {
                return {
                    ok: false,
                    offset: m.ok ? m.nextOffset : 0,
                    expected: "EOL",
                    prevFail: null,
                };
            }
        },
    ];
})) as {[tag in keyof typeof paragraphItemTitleRule]: (target: string) => MatchResult<{
    value: [string, string][];
    errors: ErrorMessage[];
}, Env>};

export const unknownParagraphItemTitleMatch = (() => {
    const env = initialEnv({});
    return (target: string) => {
        const m = $paragraphItemRanges.match(0, target, env);
        if (m.ok && m.nextOffset === target.length) {
            return m;
        } else {
            return {
                ok: false,
                offset: m.ok ? m.nextOffset : 0,
                expected: "EOL",
                prevFail: null,
            };
        }
    };
})();


export const $paragraphItemLine: WithErrorRule<ParagraphItemLine> = factory
    .withName("paragraphItemLine")
    .choice(c => c
        .orSequence(s => s
            .and(() => $indents, "indentsStruct")
            .and(r => r
                .zeroOrOne(r => r
                    .sequence(s => s
                        .and(r => r
                            .choice(c => c
                                .or(() => $paragraphControl)
                                .or(() => $itemControl)
                                .or(() => $subitem1Control)
                                .or(() => $subitem2Control)
                                .or(() => $subitem3Control)
                                .or(() => $subitem4Control)
                                .or(() => $subitem5Control)
                                .or(() => $subitem6Control)
                                .or(() => $subitem7Control)
                                .or(() => $subitem8Control)
                                .or(() => $subitem9Control)
                                .or(() => $subitem10Control)
                                .orSequence(s => s
                                    .and(() => $autoTagControl, "control")
                                    .and(r => r
                                        .choice(c => c
                                            .orSequence(s => s
                                                .and(r => r.nextIs(r => r
                                                    .sequence(s => s
                                                        .and(() => paragraphItemTitleRule.Paragraph)
                                                        .and(r => r
                                                            .choice(c => c
                                                                .or(() => $__)
                                                                .or(() => $_EOL)
                                                            )
                                                        )
                                                    )
                                                ))
                                                .action(() => "Paragraph" as const)
                                            )
                                            .orSequence(s => s
                                                .and(r => r.nextIs(r => r
                                                    .sequence(s => s
                                                        .and(() => paragraphItemTitleRule.Item)
                                                        .and(r => r
                                                            .choice(c => c
                                                                .or(() => $__)
                                                                .or(() => $_EOL)
                                                            )
                                                        )
                                                    )
                                                ))
                                                .action(() => "Item" as const)
                                            )
                                            .orSequence(s => s
                                                .and(r => r.nextIs(r => r
                                                    .sequence(s => s
                                                        .and(() => paragraphItemTitleRule.Subitem1)
                                                        .and(r => r
                                                            .choice(c => c
                                                                .or(() => $__)
                                                                .or(() => $_EOL)
                                                            )
                                                        )
                                                    )
                                                ))
                                                .action(() => "Subitem1" as const)
                                            )
                                            .orSequence(s => s
                                                .and(r => r.nextIs(r => r
                                                    .sequence(s => s
                                                        .and(() => paragraphItemTitleRule.Subitem2)
                                                        .and(r => r
                                                            .choice(c => c
                                                                .or(() => $__)
                                                                .or(() => $_EOL)
                                                            )
                                                        )
                                                    )
                                                ))
                                                .action(() => "Subitem2" as const)
                                            )
                                            .orSequence(s => s
                                                .and(r => r.nextIs(r => r
                                                    .sequence(s => s
                                                        .and(() => paragraphItemTitleRule.Subitem3)
                                                        .and(r => r
                                                            .choice(c => c
                                                                .or(() => $__)
                                                                .or(() => $_EOL)
                                                            )
                                                        )
                                                    )
                                                ))
                                                .action(() => "Subitem3" as const)
                                            )
                                            .orSequence(s => s
                                                .and(r => r.assert(() => true))
                                                .action(() => null)
                                            )
                                        )
                                    , "tag")
                                    .action(({ tag, control }) => {
                                        return { tag, control };
                                    })
                                )
                            )
                        )
                    )
                )
            , "tagControl")
            .and(r => r
                .sequence(s => s
                    .and(() => $paragraphItemRanges, "title")
                    .action(({ title, text }) => {
                        return {
                            value: text(),
                            errors: title.errors,
                        };
                    })
                )
            , "title")
            .and(r => r
                .zeroOrOne(r => r
                    .sequence(c => c
                        .and(() => $__, "midSpace")
                        .and(() => $columnsOrSentences, "columns")
                        .action(({ midSpace, columns }) => {
                            return { midSpace, columns };
                        })
                    )
                )
            , "contentStruct")
            .and(() => $_EOL, "lineEndText")
            .action(({ range, indentsStruct, tagControl, title, contentStruct, lineEndText }) => {
                const errors = [
                    ...indentsStruct.errors,
                    ...title.errors,
                    ...(contentStruct?.columns.errors ?? []),
                ];
                const tag = tagControl?.tag ?? null;
                return {
                    value: new ParagraphItemLine(
                        range(),
                        indentsStruct.value.indentDepth,
                        indentsStruct.value.indentTexts,
                        tag,
                        tagControl ? [tagControl.control] : [],
                        title.value,
                        contentStruct?.midSpace ?? "",
                        contentStruct?.columns.value ?? [],
                        lineEndText,
                    ),
                    errors,
                };
            })
        )
        .orSequence(s => s
            .and(() => $indents, "indentsStruct")
            .and(r => r
                .sequence(s => s
                    .and(r => r
                        .choice(c => c
                            .or(() => $paragraphControl)
                            .or(() => $itemControl)
                            .or(() => $subitem1Control)
                            .or(() => $subitem2Control)
                            .or(() => $subitem3Control)
                            .or(() => $subitem4Control)
                            .or(() => $subitem5Control)
                            .or(() => $subitem6Control)
                            .or(() => $subitem7Control)
                            .or(() => $subitem8Control)
                            .or(() => $subitem9Control)
                            .or(() => $subitem10Control)
                        )
                    )
                )
            , "tagControl")
            .and(r => r
                .sequence(s => s
                    .and(() => $sentenceChildren, "title")
                    .action(({ title, text }) => {
                        return {
                            value: text(),
                            errors: title.errors,
                        };
                    })
                )
            , "title")
            .and(r => r
                .zeroOrOne(r => r
                    .sequence(c => c
                        .and(() => $__, "midSpace")
                        .and(() => $columnsOrSentences, "columns")
                        .action(({ midSpace, columns }) => {
                            return { midSpace, columns };
                        })
                    )
                )
            , "contentStruct")
            .and(() => $_EOL, "lineEndText")
            .action(({ range, indentsStruct, tagControl, title, contentStruct, lineEndText }) => {
                const errors = [
                    ...indentsStruct.errors,
                    ...title.errors,
                    ...(contentStruct?.columns.errors ?? []),
                ];
                return {
                    value: new ParagraphItemLine(
                        range(),
                        indentsStruct.value.indentDepth,
                        indentsStruct.value.indentTexts,
                        tagControl.tag,
                        [tagControl.control],
                        title.value,
                        contentStruct?.midSpace ?? "",
                        contentStruct?.columns.value ?? [],
                        lineEndText,
                    ),
                    errors,
                };
            })
        )
        .orSequence(s => s
            .and(() => $indents, "indentsStruct")
            .and(r => r
                .choice(c => c
                    .or(() => $anonymParagraphControl)
                    .or(() => $anonymItemControl)
                    .or(() => $anonymSubitem1Control)
                    .or(() => $anonymSubitem2Control)
                    .or(() => $anonymSubitem3Control)
                    .or(() => $anonymSubitem4Control)
                    .or(() => $anonymSubitem5Control)
                    .or(() => $anonymSubitem6Control)
                    .or(() => $anonymSubitem7Control)
                    .or(() => $anonymSubitem8Control)
                    .or(() => $anonymSubitem9Control)
                    .or(() => $anonymSubitem10Control)
                )
            , "tagControl")
            .and(r => r
                .zeroOrOne(() => $columnsOrSentences)
            , "columns")
            .and(() => $_EOL, "lineEndText")
            .action(({ range, indentsStruct, tagControl, columns, lineEndText }) => {
                const errors = [
                    ...indentsStruct.errors,
                    ...(columns?.errors ?? []),
                ];
                return {
                    value: new ParagraphItemLine(
                        range(),
                        indentsStruct.value.indentDepth,
                        indentsStruct.value.indentTexts,
                        tagControl.tag,
                        [tagControl.control],
                        "",
                        "",
                        columns?.value ?? [],
                        lineEndText,
                    ),
                    errors,
                };
            })
        )
    )
    ;

export default $paragraphItemLine;
