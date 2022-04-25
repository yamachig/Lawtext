import { __Parentheses, __Text, ____LawNum, ____PointerRanges } from "../../../node/el/controls";
import { initialEnv } from "../env";
import factory from "../factory";
import { WithErrorRule } from "../util";

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
    lawNameCandidate: __Text,
    lawRefInfo: LawRefInfo,
}> = factory
    .withName("lawRef")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    (item instanceof __Text)
                ) { return item; } else { return null; }
            })
        , "lawNameCandidate")
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
                        },
                        errors: match.value.errors,
                    };

                } else { return null; }
            })
        , "lawRefInfo")
        .action(({ lawNameCandidate, lawRefInfo }) => {
            const value = {
                lawNameCandidate,
                lawRefInfo: lawRefInfo.value,
            };
            return { value, errors: [...lawRefInfo.errors] };
        })
    )
    ;

export default $lawRef;
