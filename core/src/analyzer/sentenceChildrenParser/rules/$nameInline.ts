// import * as std from "../../../law/std";
import { __Parentheses, __Text, ____PointerRanges } from "../../../node/el/controls";
import factory from "../factory";
import type { WithErrorRule } from "../util";

export const $nameInline: WithErrorRule<{
    nameSquareParentheses: __Parentheses,
    following: boolean,
    pointerRanges: ____PointerRanges | null,
}> = factory
    .withName("nameInline")
    .sequence(s => s
        .and(r => r
            .zeroOrOne(r => r
                .oneMatch(({ item }) => {
                    if (
                        (item instanceof __Text)
                        && /以下(?:単に)?$/.test(item.text())
                    ) { return item; } else { return null; }
                })
            )
        , "following")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof ____PointerRanges)
                            ) { return item; } else { return null; }
                        })
                    )
                    .andOmit(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof __Text)
                                && /^において(?:単に)?$/.test(item.text())
                            ) { return item; } else { return null; }
                        })
                    )
                )
            )
        , "pointerRanges")
        .andOmit(r => r
            .assert(({ following, pointerRanges }) => following || pointerRanges)
        )
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    (item instanceof __Parentheses)
                    && item.attr.type === "square"
                    && item.content.children.every(c => c instanceof __Text)
                ) { return item; } else { return null; }
            })
        , "nameSquareParentheses")
        .andOmit(r => r
            .zeroOrOne(r => r
                .oneMatch(({ item }) => {
                    if (
                        (item instanceof __Text)
                        && /^という。/.test(item.text())
                    ) { return item; } else { return null; }
                })
            )
        )
        .action(({ following, pointerRanges, nameSquareParentheses }) => {
            const value = {
                following: Boolean(following),
                pointerRanges,
                nameSquareParentheses,
            };
            return { value, errors: [] };
        })
    )
    ;

export default $nameInline;
