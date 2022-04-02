import factory from "../factory";
import $sentenceChildren from "./$sentenceChildren";
import $indents from "./$indents";
import { AppdxItemHeadLine } from "../../../node/cst/line";
import { $_EOL } from "./lexical";
import { mergeAdjacentTexts, WithErrorRule } from "../util";
import { __Parentheses } from "../../../node/control";
import { $appdxControl, $appdxFigControl, $appdxFormatControl, $appdxNoteControl, $appdxStyleControl, $appdxTableControl, $autoTagControl } from "./$tagControl";

export const appdxItemTitlePtn = {
    AppdxFig: /^[別付附]?図/,
    AppdxStyle: /^(?![付附]則)[^(（]*様式/,
    AppdxFormat: /^(?![付附]則)[^(（]*書式/,
    AppdxTable: /^[別付附]表/,
    AppdxNote: /^別[記紙]/,
    Appdx: /^[付附]録/,
} as const;

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
                        .choice(c => c
                            .orSequence(s => s
                                .and(r => r.nextIs(r => r.regExp(appdxItemTitlePtn.AppdxFig)))
                                .action(() => "AppdxFig" as const)
                            )
                            .orSequence(s => s
                                .and(r => r.nextIs(r => r.regExp(appdxItemTitlePtn.AppdxStyle)))
                                .action(() => "AppdxStyle" as const)
                            )
                            .orSequence(s => s
                                .and(r => r.nextIs(r => r.regExp(appdxItemTitlePtn.AppdxFormat)))
                                .action(() => "AppdxFormat" as const)
                            )
                            .orSequence(s => s
                                .and(r => r.nextIs(r => r.regExp(appdxItemTitlePtn.AppdxTable)))
                                .action(() => "AppdxTable" as const)
                            )
                            .orSequence(s => s
                                .and(r => r.nextIs(r => r.regExp(appdxItemTitlePtn.AppdxNote)))
                                .action(() => "AppdxNote" as const)
                            )
                            .orSequence(s => s
                                .and(r => r.nextIs(r => r.regExp(appdxItemTitlePtn.Appdx)))
                                .action(() => "Appdx" as const)
                            )
                        )
                    , "tag")
                    .action(({ tag, control }) => {
                        return { tag, control };
                    })
                )
            )
        , "tagControl")
        .and(() => $sentenceChildren, "tail")
        .and(() => $_EOL, "lineEndText")
        .action(({ range, indentsStruct, tagControl: { tag, control }, tail, lineEndText }) => {
            const inline = mergeAdjacentTexts(tail.value);
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
                    tag,
                    control ? [control] : [],
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
