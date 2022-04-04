import factory from "../factory";
import $sentenceChildren from "./$sentenceChildren";
import $indents from "./$indents";
import { SupplProvisionAppdxItemHeadLine } from "../../../node/cst/line";
import { $_EOL } from "./lexical";
import { mergeAdjacentTexts, WithErrorRule } from "../util";
import { __Parentheses } from "../../../node/control";
import { $autoTagControl, $supplProvisionAppdxControl, $supplProvisionAppdxStyleControl, $supplProvisionAppdxTableControl } from "./$tagControl";

export const supplProvisionAppdxItemTitlePtn = {
    SupplProvisionAppdx: /^[付附]則[付附]録/,
    SupplProvisionAppdxTable: /^[付附]則[別付附]表/,
    SupplProvisionAppdxStyle: /^[付附]則[^(（]*様式/,
} as const;


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
                        .choice(c => c
                            .orSequence(s => s
                                .and(r => r.nextIs(r => r.regExp(supplProvisionAppdxItemTitlePtn.SupplProvisionAppdxStyle)))
                                .action(() => "SupplProvisionAppdxStyle" as const)
                            )
                            .orSequence(s => s
                                .and(r => r.nextIs(r => r.regExp(supplProvisionAppdxItemTitlePtn.SupplProvisionAppdxTable)))
                                .action(() => "SupplProvisionAppdxTable" as const)
                            )
                            .orSequence(s => s
                                .and(r => r.nextIs(r => r.regExp(supplProvisionAppdxItemTitlePtn.SupplProvisionAppdx)))
                                .action(() => "SupplProvisionAppdx" as const)
                            )
                        )
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
                value: new SupplProvisionAppdxItemHeadLine(
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

export default $supplProvisionAppdxItemHeadLine;
