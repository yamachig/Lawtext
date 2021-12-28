/* eslint-disable no-irregular-whitespace */
import { articleGroupType, parseNamedNum, PointerFragment, RelPos } from "../util";
import { factory, ValueRule } from "./common";
import { $iroha_char, $kanji_digit, $roman_digit } from "./lexical";

export const makeRangesRule = (lazyPointerRule: () => ValueRule<PointerFragment[]>) => {
    const $ranges: ValueRule<[PointerFragment[], PointerFragment[]][]> = factory
        .withName("ranges")
        .choice(c => c
            .or(r => r
                .sequence(c => c
                    .and(() => $range, "first")
                    .and(r => r
                        .choice(c => c
                            .or(r => r.seqEqual("、"))
                            .or(r => r.seqEqual("及び"))
                            .or(r => r.seqEqual("並びに")),
                        ),
                    )
                    .and(() => $ranges, "rest")
                    .action(({ first, rest }) => {
                        return [first].concat(rest);
                    }),
                ),
            )
            .or(r => r
                .sequence(c => c
                    .and(() => $range, "range")
                    .action(({ range }) => {
                        return [range];
                    }),
                ),
            ),
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
                        return [from, to] as [PointerFragment[], PointerFragment[]];
                    }),
                ),
            )
            .or(r => r
                .sequence(c => c
                    .and(lazyPointerRule, "from")
                    .and(r => r.oneOf("・～"))
                    .and(lazyPointerRule, "to")
                    .action(({ from, to }) => {
                        return [from, to] as [PointerFragment[], PointerFragment[]];
                    }),
                ),
            )
            .or(r => r
                .sequence(c => c
                    .and(lazyPointerRule, "pointer")
                    .action(({ pointer }) => {
                        return [pointer, pointer] as [PointerFragment[], PointerFragment[]];
                    }),
                ),
            ),
        )
        ;

    return { $ranges, $range };
};

export const { $ranges, $range } = makeRangesRule(() => $pointer);


export const $pointer = factory
    .withName("pointer")
    .oneOrMore(() => $pointer_fragment)
    ;

export const $pointer_fragment = factory
    .withName("pointer_fragment")
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.seqEqual("第"))
                    .and(r => r.oneOrMore(() => $kanji_digit))
                    .and(r => r.oneOf(["編", "章", "節", "款", "目", "章", "条", "項", "号"] as const), "type_char")
                    .and(r => r
                        .zeroOrMore(r => r
                            .sequence(c => c
                                .and(r => r.seqEqual("の"))
                                .and(r => r.oneOrMore(() => $kanji_digit)),
                            ),
                        ),
                    ),
                )
            , (({ text, type_char }) => {
                return new PointerFragment(
                    RelPos.NAMED,
                    articleGroupType[type_char],
                    text(),
                    parseNamedNum(text()),
                );
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.seqEqual("次"))
                    .and(r => r.oneOf(["編", "章", "節", "款", "目", "章", "条", "項", "号", "表"] as const), "type_char"),
                )
            , (({ text, type_char }) => {
                return new PointerFragment(
                    RelPos.NEXT,
                    (type_char === "表")
                        ? "TableStruct"
                        : articleGroupType[type_char],
                    text(),
                    null,
                );
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.seqEqual("前"))
                    .and(r => r.oneOf(["編", "章", "節", "款", "目", "章", "条", "項", "号", "表"] as const), "type_char"),
                )
            , (({ text, type_char }) => {
                return new PointerFragment(
                    RelPos.PREV,
                    (type_char === "表")
                        ? "TableStruct"
                        : articleGroupType[type_char],
                    text(),
                    null,
                );
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .choice(c => c
                            .or(r => r.seqEqual("この"))
                            .or(r => r.seqEqual("本")),
                        ),
                    )
                    .and(r => r.oneOf(["編", "章", "節", "款", "目", "章", "条", "項", "号", "表"] as const), "type_char"),
                )
            , (({ text, type_char }) => {
                return new PointerFragment(
                    RelPos.HERE,
                    (type_char === "表")
                        ? "TableStruct"
                        : articleGroupType[type_char],
                    text(),
                    null,
                );
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.seqEqual("同"))
                    .and(r => r.oneOf(["編", "章", "節", "款", "目", "章", "条", "項", "号", "表"] as const), "type_char"),
                )
            , (({ text, type_char }) => {
                return new PointerFragment(
                    RelPos.SAME,
                    (type_char === "表")
                        ? "TableStruct"
                        : articleGroupType[type_char],
                    text(),
                    null,
                );
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.regExp(/^[付附]/))
                    .and(r => r.seqEqual("則" as const), "type_char"),
                )
            , (({ text, type_char }) => {
                return new PointerFragment(
                    RelPos.NAMED,
                    articleGroupType[type_char],
                    text(),
                    null,
                );
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.seqEqual("別表"))
                    .and(r => r
                        .zeroOrOne(r => r
                            .sequence(c => c
                                .and(r => r.seqEqual("第"))
                                .and(r => r.oneOrMore(() => $kanji_digit)),
                            ),
                        ),
                    ),
                )
            , (({ text }) => {
                return new PointerFragment(
                    RelPos.NAMED,
                    "AppdxTable",
                    text(),
                    parseNamedNum(text()),
                );
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .seqEqual("前段")
            , (({ text }) => {
                return new PointerFragment(
                    RelPos.NAMED,
                    "FIRSTPART",
                    text(),
                    null,
                );
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .seqEqual("後段")
            , (({ text }) => {
                return new PointerFragment(
                    RelPos.NAMED,
                    "LATTERPART",
                    text(),
                    null,
                );
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .seqEqual("ただし書")
            , (({ text }) => {
                return new PointerFragment(
                    RelPos.NAMED,
                    "PROVISO",
                    text(),
                    null,
                );
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .choice(c => c
                    .or(() => $iroha_char)
                    .or(r => r.oneOrMore(() => $roman_digit)),
                )
            , (({ text }) => {
                return new PointerFragment(
                    RelPos.NAMED,
                    "SUBITEM",
                    text(),
                    parseNamedNum(text()),
                );
            }),
            ),
        ),
    )
    ;

export const rules = {
    ranges: $ranges,
    range: $range,
    pointer: $pointer,
    pointer_fragment: $pointer_fragment,
};
