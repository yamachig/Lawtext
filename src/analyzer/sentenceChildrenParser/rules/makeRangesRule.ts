import { SentenceChildEL } from "../../../node/cst/inline";
import { __Parentheses, __Text } from "../../../node/el/controls";
import { ptnRangesConnectors } from "../../../parser/cst/rules/makeRangesRule";
import { WithErrorValue } from "../../../parser/std/util";
import factory from "../factory";
import { ValueRule, WithErrorRule } from "../util";

export type RangeMaker<TPointer, TRange> = (
    from: TPointer,
    midText: SentenceChildEL[],
    to: TPointer | null,
    trailingText: SentenceChildEL[],
) => TRange;

export type RangesMaker<TRange, TRanges> = (
    first: WithErrorValue<TRange>,
    midText: SentenceChildEL[],
    rest: WithErrorValue<TRanges> | null,
) => WithErrorValue<TRanges>;

const reRangesConnector = new RegExp(`^(${ptnRangesConnectors.join("|")})$`); // need $

export const makeRangesRule = <TPointer, TRange = [TPointer, TPointer], TRanges = [TPointer, TPointer][]>(
    lazyPointerRule: () => ValueRule<TPointer>,
    rangeMaker: RangeMaker<TPointer, TRange>,
    rangesMaker: RangesMaker<TRange, TRanges>,
) => {
    const $ranges: WithErrorRule<TRanges> = factory
        .withName("ranges")
        .choice(c => c
            .or(r => r
                .sequence(c => c
                    .and(() => $range, "first")
                    .and(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof __Text)
                                && reRangesConnector.test(item.text())
                            ) { return item; } else { return null; }
                        })
                    , "midText")
                    .and(() => $ranges, "rest")
                    .action(({ first, midText, rest }) => {
                        return rangesMaker(first, [midText], rest);
                    })
                )
            )
            .or(r => r
                .sequence(c => c
                    .and(() => $range, "singleRange")
                    .action(({ singleRange }) => {
                        return rangesMaker(singleRange, [], null);
                    })
                )
            )
        )
        ;

    const $range: WithErrorRule<TRange> = factory
        .withName("range")
        .choice(c => c
            .or(r => r
                .sequence(c => c
                    .and(lazyPointerRule, "from")
                    .and(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof __Text)
                                && (item.text() === "から")
                            ) { return item; } else { return null; }
                        })
                    , "midText")
                    .and(lazyPointerRule, "to")
                    .and(r => r
                        .asSlice(r => r
                            .sequence(s => s
                                .and(r => r
                                    .oneMatch(({ item }) => {
                                        if (
                                            (item instanceof __Text)
                                            && (item.text() === "まで")
                                        ) { return item; } else { return null; }
                                    })
                                )
                                .and(r => r
                                    .zeroOrOne(r => r
                                        .oneMatch(({ item }) => {
                                            if (
                                                (item instanceof __Parentheses)
                                            ) { return item; } else { return null; }
                                        })
                                    )
                                )
                            )
                        )
                    , "trailingText")
                    .action(({ from, midText, to, trailingText }) => {
                        return { value: rangeMaker(from, [midText], to, trailingText), errors: [] };
                    })
                )
            )
            .or(r => r
                .sequence(c => c
                    .and(lazyPointerRule, "from")
                    .and(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof __Text)
                                && /^(?:・|～|乃至)$/.test(item.text())
                            ) { return item; } else { return null; }
                        })
                    , "midText")
                    .and(lazyPointerRule, "to")
                    .and(r => r
                        .asSlice(r => r
                            .sequence(s => s
                                .and(r => r
                                    .zeroOrOne(r => r
                                        .oneMatch(({ item }) => {
                                            if (
                                                (item instanceof __Parentheses)
                                            ) { return item; } else { return null; }
                                        })
                                    )
                                )
                            )
                        )
                    , "trailingText")
                    .action(({ from, midText, to, trailingText }) => {
                        return { value: rangeMaker(from, [midText], to, trailingText), errors: [] };
                    })
                )
            )
            .or(r => r
                .sequence(c => c
                    .and(lazyPointerRule, "pointer")
                    .and(r => r
                        .asSlice(r => r
                            .sequence(s => s
                                .and(r => r
                                    .zeroOrOne(r => r
                                        .oneMatch(({ item }) => {
                                            if (
                                                (item instanceof __Parentheses)
                                            ) { return item; } else { return null; }
                                        })
                                    )
                                )
                            )
                        )
                    , "trailingText")
                    .action(({ pointer, trailingText }) => {
                        return { value: rangeMaker(pointer, [], null, trailingText), errors: [] };
                    })
                )
            )
        )
        ;

    return { $ranges, $range };
};

export default makeRangesRule;
