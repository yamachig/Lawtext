import { factory } from "../factory";
import { LineType } from "../../../node/cst/line";
import { isSingleParentheses } from "../util";


export const $lawTitle = factory
    .withName("lawTitle")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === "PhysicalLine"
                    && item.line?.type === LineType.OTH
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
                        item.type === "PhysicalLine"
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
        .action(({ lawNameLine, lawNumLine }) => ({ lawNameLine, lawNumLine }))
    )
    ;

