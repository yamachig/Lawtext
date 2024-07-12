// import * as std from "../../../law/std";
import type { SentenceChildEL } from "../../../node/cst/inline";
import { __Text, ____PointerRanges } from "../../../node/el/controls";
import factory from "../factory";
import type { WithErrorRule } from "../util";

export const $ambiguousNameParenthesesContent: WithErrorRule<{
    valueELs: SentenceChildEL[],
    following: boolean,
    pointerRanges: ____PointerRanges | null,
}> = factory
    .withName("nameInline")
    .sequence(s => s
        .and(r => r
            .zeroOrMore(r => r
                .oneMatch(({ item }) => {
                    if (
                        !(
                            (item instanceof __Text)
                            && item.text().includes("をいう。")
                        )
                    ) { return item; } else { return null; }
                })
            )
        , "valueRest")
        .and(r => r
            .choice(c => c
                .orSequence(s => s
                    .and(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof __Text)
                            && /をいう。以下同じ。$/.test(item.text())
                            ) { return item; } else { return null; }
                        })
                    , "valueLast")
                    .action(({ valueLast }) => {
                        return {
                            valueLast,
                            following: true,
                            pointerRanges: null,
                        };
                    })
                )
                .orSequence(s => s
                    .and(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof __Text)
                                && /をいう。(?:以下)?$/.test(item.text())
                            ) { return item; } else { return null; }
                        })
                    , "valueLast")
                    .and(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof ____PointerRanges)
                            ) { return item; } else { return null; }
                        })
                    , "pointerRanges")
                    .andOmit(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof __Text)
                                && /^において同じ。$/.test(item.text())
                            ) { return item; } else { return null; }
                        })
                    )
                    .action(({ valueLast, pointerRanges }) => {
                        return {
                            valueLast,
                            following: valueLast.text().endsWith("以下"),
                            pointerRanges,
                        };
                    })
                )
            )
        , "rest")
        .action(({ valueRest, rest }) => {
            const value = {
                valueELs: [...valueRest, rest.valueLast],
                following: rest.following,
                pointerRanges: rest.pointerRanges,
            };
            return { value, errors: [] };
        })
    )
    ;

export default $ambiguousNameParenthesesContent;
