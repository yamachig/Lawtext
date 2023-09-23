import { __Parentheses } from "../../../node/el/controls";
import { WithErrorValue } from "../../std/util";
import factory from "../factory";
import { ValueRule, WithErrorRule } from "../util";
import { $ROUND_PARENTHESES_INLINE } from "./$sentenceChildren";

export type RangeMaker<TPointer, TRange> = (
    from: TPointer,
    midText: {text: string, range: [number, number]} | null,
    to: TPointer | null,
    trailingText: {text: string, range: [number, number]} | null,
    modifierParentheses: __Parentheses | null,
    range: [number, number],
) => TRange;

const simpleRangeMaker = <TPointer>(
    from: TPointer,
    midText: {text: string, range: [number, number]} | null,
    to: TPointer | null,
) => {
    void midText;
    return [from, to ?? from] as [TPointer, TPointer];
};

export type RangesMaker<TRange, TRanges> = (
    first: WithErrorValue<TRange>,
    midText: {text: string, range: [number, number]} | null,
    rest: WithErrorValue<TRanges> | null,
    range: [number, number],
) => WithErrorValue<TRanges>;

const simpleRangesMaker = <TPointer>(
    first: WithErrorValue<[TPointer, TPointer]>,
    midText: {text: string, range: [number, number]} | null,
    rest: WithErrorValue<[TPointer, TPointer][]> | null,
) => {
    void midText;
    return {
        value: [first.value, ...(rest?.value ?? [])],
        errors: [...first.errors, ...(rest?.errors ?? [])],
    };
};

export const ptnRangesConnectors = ["、", "及び", "及ビ", "及(?!至)", "並びに", "ならびに", "又は", "または", "若しくは", "もしくは"];

const reRangesConnector = new RegExp(`^(${ptnRangesConnectors.join("|")})`); // no $

export const makeRangesRule = <TPointer, TRange = [TPointer, TPointer], TRanges = [TPointer, TPointer][]>(
    lazyPointerRule: () => ValueRule<TPointer>,
    rangeMaker: RangeMaker<TPointer, TRange> = simpleRangeMaker as unknown as RangeMaker<TPointer, TRange>,
    rangesMaker: RangesMaker<TRange, TRanges> = simpleRangesMaker as unknown as RangesMaker<TRange, TRanges>,
) => {
    const $ranges: WithErrorRule<TRanges> = factory
        .withName("ranges")
        .choice(c => c
            .or(r => r
                .sequence(c => c
                    .and(() => $range, "first")
                    .and(r => r
                        .sequence(s => s
                            .and(r => r.regExp(reRangesConnector))
                            .action(({ text, range }) => ({ text: text(), range: range() }))
                        )
                    , "midText")
                    .and(() => $ranges, "rest")
                    .action(({ first, midText, rest, range }) => {
                        return rangesMaker(first, midText, rest, range());
                    })
                )
            )
            .or(r => r
                .sequence(c => c
                    .and(() => $range, "singleRange")
                    .action(({ singleRange, range }) => {
                        return rangesMaker(singleRange, null, null, range());
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
                        .sequence(s => s
                            .and(r => r.seqEqual("から"))
                            .action(({ text, range }) => ({ text: text(), range: range() }))
                        )
                    , "midText")
                    .and(lazyPointerRule, "to")
                    .and(r => r
                        .sequence(s => s
                            .and(r => r.seqEqual("まで"))
                            .action(({ text, range }) => ({ text: text(), range: range() }))
                        )
                    , "trailingText")
                    .and(r => r
                        .zeroOrOne(() => $ROUND_PARENTHESES_INLINE)
                    , "modifierParentheses")
                    .action(({ from, midText, to, trailingText, modifierParentheses, range }) => {
                        return {
                            value: rangeMaker(from, midText, to, trailingText, modifierParentheses?.value ?? null, range()),
                            errors: [...(modifierParentheses?.errors ?? [])],
                        };
                    })
                )
            )
            .or(r => r
                .sequence(c => c
                    .and(lazyPointerRule, "from")
                    .and(r => r
                        .sequence(s => s
                            .and(r => r.regExp(/^(?:・|～|乃至)/))
                            .action(({ text, range }) => ({ text: text(), range: range() }))
                        )
                    , "midText")
                    .and(lazyPointerRule, "to")
                    .and(r => r
                        .zeroOrOne(() => $ROUND_PARENTHESES_INLINE)
                    , "modifierParentheses")
                    .action(({ from, midText, to, modifierParentheses, range }) => {
                        return {
                            value: rangeMaker(from, midText, to, null, modifierParentheses?.value ?? null, range()),
                            errors: [...(modifierParentheses?.errors ?? [])],
                        };
                    })
                )
            )
            .or(r => r
                .sequence(c => c
                    .and(lazyPointerRule, "pointer")
                    .and(r => r
                        .zeroOrOne(() => $ROUND_PARENTHESES_INLINE)
                    , "modifierParentheses")
                    .action(({ pointer, modifierParentheses, range }) => {
                        return {
                            value: rangeMaker(pointer, null, null, null, modifierParentheses?.value ?? null, range()),
                            errors: [...(modifierParentheses?.errors ?? [])],
                        };
                    })
                )
            )
        )
        ;

    return { $ranges, $range };
};

export default makeRangesRule;
