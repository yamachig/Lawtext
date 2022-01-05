import factory from "../factory";
import { ValueRule, WithErrorRule } from "../util";

export const makeRangesRule = <TPointer>(lazyPointerRule: () => ValueRule<TPointer>) => {
    const $ranges: WithErrorRule<[TPointer, TPointer][]> = factory
        .withName("ranges")
        .choice(c => c
            .or(r => r
                .sequence(c => c
                    .and(() => $range, "first")
                    .and(r => r
                        .choice(c => c
                            .or(r => r.seqEqual("、"))
                            .or(r => r.seqEqual("及び"))
                            .or(r => r.seqEqual("並びに"))
                        )
                    )
                    .and(() => $ranges, "rest")
                    .action(({ first, rest }) => {
                        return {
                            value: [first.value, ...rest.value],
                            errors: [...first.errors, ...rest.errors],
                        };
                    })
                )
            )
            .or(r => r
                .sequence(c => c
                    .and(() => $range, "range")
                    .action(({ range }) => {
                        return { value: [range.value], errors: range.errors };
                    })
                )
            )
        )
        ;

    const $range: WithErrorRule<[TPointer, TPointer]> = factory
        .withName("range")
        .choice(c => c
            .or(r => r
                .sequence(c => c
                    .and(lazyPointerRule, "from")
                    .and(r => r.seqEqual("から"))
                    .and(lazyPointerRule, "to")
                    .and(r => r.seqEqual("まで"))
                    .action(({ from, to }) => {
                        return { value: [from, to] as [TPointer, TPointer], errors: [] };
                    })
                )
            )
            .or(r => r
                .sequence(c => c
                    .and(lazyPointerRule, "from")
                    .and(r => r.oneOf("・～"))
                    .and(lazyPointerRule, "to")
                    .action(({ from, to }) => {
                        return { value: [from, to] as [TPointer, TPointer], errors: [] };
                    })
                )
            )
            .or(r => r
                .sequence(c => c
                    .and(lazyPointerRule, "pointer")
                    .action(({ pointer }) => {
                        return { value: [pointer, pointer] as [TPointer, TPointer], errors: [] };
                    })
                )
            )
        )
        ;

    return { $ranges, $range };
};

export default makeRangesRule;
