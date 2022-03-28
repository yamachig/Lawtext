import { factory } from "../factory";
import { LineType } from "../../../node/cst/line";
import { isSingleParentheses, WithErrorRule } from "../util";
import { VirtualLine, VirtualOnlyLineType } from "../virtualLine";


export const $lawTitle: WithErrorRule<{
    lawNameLine: VirtualLine & {
        type: LineType.OTH | VirtualOnlyLineType.CAP;
    };
    lawNumLine: VirtualLine & {
        type: LineType.OTH | VirtualOnlyLineType.CAP;
    } | null;
}> = factory
    .withName("lawTitle")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === LineType.OTH
                    && item.line.type === LineType.OTH
                    && item.virtualIndentDepth === 0
                ) {
                    return item;
                } else {
                    return null;
                }
            })
        , "lawNameLine")
        .and(r => r
            .zeroOrOne(r => r
                .oneMatch(({ item }) => {
                    if (
                        item.type === LineType.OTH
                        && item.line.type === LineType.OTH
                        && item.virtualIndentDepth === 0
                        && isSingleParentheses(item)
                    ) {
                        return item;
                    } else {
                        return null;
                    }
                })
            )
        , "lawNumLine")
        .action(({ lawNameLine, lawNumLine }) => {
            return {
                value: { lawNameLine, lawNumLine },
                errors: [],
            };
        })
    )
    ;

