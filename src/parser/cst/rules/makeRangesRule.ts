import factory from "../factory";
import { ValueRule } from "../util";

export const makeRangesRule = <TPointer>(lazyPointerRule: () => ValueRule<TPointer>) => {
    const $ranges: ValueRule<[TPointer, TPointer][]> = factory
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
                        return [first].concat(rest);
                    })
                )
            )
            .or(r => r
                .sequence(c => c
                    .and(() => $range, "range")
                    .action(({ range }) => {
                        return [range];
                    })
                )
            )
        )
        ;

    const $range = factory
        .withName("range")
        .choice(c => c
            .or(r => r
                .sequence(c => c
                    .and(lazyPointerRule, "from")
                    .and(r => r.seqEqual("から"))
                    .and(lazyPointerRule, "to")
                    .and(r => r.seqEqual("まで"))
                    .action(({ from, to }) => {
                        return [from, to] as [TPointer, TPointer];
                    })
                )
            )
            .or(r => r
                .sequence(c => c
                    .and(lazyPointerRule, "from")
                    .and(r => r.oneOf("・～"))
                    .and(lazyPointerRule, "to")
                    .action(({ from, to }) => {
                        return [from, to] as [TPointer, TPointer];
                    })
                )
            )
            .or(r => r
                .sequence(c => c
                    .and(lazyPointerRule, "pointer")
                    .action(({ pointer }) => {
                        return [pointer, pointer] as [TPointer, TPointer];
                    })
                )
            )
        )
        ;

    return { $ranges, $range };
};

export default makeRangesRule;
