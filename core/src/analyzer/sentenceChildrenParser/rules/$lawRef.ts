import * as std from "../../../law/std";
import { __Parentheses, __Text, ____LawNum, ____PointerRanges } from "../../../node/el/controls";
import { initialEnv } from "../env";
import factory from "../factory";
import type { WithErrorRule } from "../util";

interface LawRefInfo {
    lawNum: ____LawNum,
    aliasInfo: {
        nameSquareParentheses: __Parentheses,
        following: boolean,
        pointerRanges: ____PointerRanges | null,
    } | null,
}

export const $lawNum: WithErrorRule<LawRefInfo> = factory
    .withName("nameInline")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    (item instanceof ____LawNum)
                ) { return item; } else { return null; }
            })
        , "lawNum")
        .and(r => r
            .zeroOrOne(r => r
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
            )
        , "aliasInfo")
        .action(({ lawNum, aliasInfo }) => {
            const value = {
                lawNum,
                aliasInfo: aliasInfo?.value ?? null,
            };
            return { value, errors: [...(aliasInfo?.errors ?? [])] };
        })
    )
    ;

export const $lawRef: WithErrorRule<{
    lawTitleCandidates: (std.Ruby | std.Sup | std.Sub | __Text)[],
    lawRefInfo: LawRefInfo & {lawRefParentheses: __Parentheses},
}> = factory
    .withName("lawRef")
    .sequence(s => s
        .and(r => r
            .oneOrMore(r => r
                .choice(c => c
                    .or(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof __Text)
                            ) { return item; } else { return null; }
                        })
                    )
                    .or(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (std.isRuby(item) || std.isSup(item) || std.isSub(item))
                            ) { return item; } else { return null; }
                        })
                    )
                )
            )
        , "lawTitleCandidates")
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    (item instanceof __Parentheses)
                    && item.attr.type === "round"
                ) {
                    const match = $lawNum.match(
                        0,
                        item.content.children,
                        initialEnv({ target: "" })
                    );
                    if (!match.ok) return null;
                    return {
                        value: {
                            ...match.value.value,
                            lawRefParentheses: item,
                        },
                        errors: match.value.errors,
                    };

                } else { return null; }
            })
        , "lawRefInfo")
        .action(({ lawTitleCandidates, lawRefInfo }) => {
            const value = {
                lawTitleCandidates,
                lawRefInfo: lawRefInfo.value,
            };
            return { value, errors: [...lawRefInfo.errors] };
        })
    )
    ;

export default $lawRef;
