/* eslint-disable no-irregular-whitespace */
import { articleGroupType, parseKanjiNum } from "../../../law/num";
import { SentenceChildEL } from "../../../node/cst/inline";
import { RelPos, __Text, ____PF, ____Pointer, ____PointerRange, ____PointerRanges } from "../../../node/el/controls";
import { ErrorMessage } from "../error";
import { factory } from "../factory";
import { $irohaChar, $kanjiDigits, $romanDigits } from "./lexical";
import makeRangesRule, { RangeMaker, RangesMaker } from "./makeRangesRule";

const makeRange: RangeMaker<____Pointer, ____PointerRange> = (from, midText, to, trailingText, modifierParentheses, range) => {
    return new ____PointerRange({
        from,
        midChildren: midText ? [new __Text(midText.text, midText.range)] : [],
        to,
        trailingChildren: [
            ...(trailingText ? [new __Text(trailingText.text, trailingText.range)] : []),
            ...(modifierParentheses ? [modifierParentheses] : []),
        ],
        range,
    });
};

const makeRanges: RangesMaker<____PointerRange, ____PointerRanges> = (first, midText, rest, range) => {
    const children: (____PointerRange | SentenceChildEL)[] = [];
    const errors: ErrorMessage[] = [];

    children.push(first.value);
    errors.push(...first.errors);

    if (midText) children.push(new __Text(midText.text, midText.range));

    if (rest) {
        children.push(...rest.value.children);
        errors.push(...rest.errors);
    }

    return {
        value: new ____PointerRanges({
            children,
            range,
        }),
        errors,
    };
};


export const reSuppressPointerRanges = /^[ァ-ヿ]{2,}/;


export const { $ranges: $pointerRanges, $range: $pointerRange } = makeRangesRule(
    (() => $pointer),
    makeRange,
    makeRanges,
);


export const $pointer = factory
    .withName("pointer")
    .choice(c => c
        .orSequence(s => s
            .and(r => r
                .choice(c => c
                    .or(() => $anyWherePointerFragment)
                    .or(() => $firstOnlyPointerFragment)
                )
            , "first")
            .and(r => r
                .zeroOrMore(r => r
                    .choice(c => c
                        .or(() => $anyWherePointerFragment)
                        .or(() => $secondaryOnlyPointerFragment)
                    )
                )
            , "rest")
            .action(({ first, rest, range }) => {
                return new ____Pointer({
                    children: [first, ...rest],
                    range: range(),
                });
            })
        )
        .orSequence(s => s
            .and(() => $singleOnlyPointerFragment, "single")
            .action(({ single, range }) => {
                return new ____Pointer({
                    children: [single],
                    range: range(),
                });
            })
        )
    )
    ;

export const $singleOnlyPointerFragment = factory
    .withName("firstOnlyPointerFragment")
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.seqEqual("前"))
                    .and(r => r
                        .choice(c => c
                            .or(r => r.seqEqual("各" as const))
                            .or(() => $kanjiDigits)
                        )
                    , "count")
                    .and(r => r.oneOf(["編", "章", "節", "款", "目", "章", "条", "項", "号", "表"] as const), "type_char"),
                )
            , (({ text, count, type_char, range }) => {
                const targetType = (type_char === "表")
                    ? "TableStruct"
                    : articleGroupType[type_char];
                if (count === "各") {
                    return new ____PF({
                        relPos: RelPos.PREV,
                        targetType,
                        count: "all",
                        name: text(),
                        range: range(),
                    });
                } else {
                    const digits = count ? parseKanjiNum(count) : null;
                    return new ____PF({
                        relPos: RelPos.PREV,
                        targetType,
                        count: digits ? `${digits}` : null,
                        name: text(),
                        range: range(),
                    });
                }
            })
            )
        )
    )
    ;

export const $firstOnlyPointerFragment = factory
    .withName("firstOnlyPointerFragment")
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.seqEqual("次"))
                    .and(r => r.oneOf(["編", "章", "節", "款", "目", "章", "条", "項", "号", "表"] as const), "type_char")
                )
            , (({ text, type_char, range }) => {
                return new ____PF({
                    relPos: RelPos.NEXT,
                    targetType: (type_char === "表")
                        ? "TableStruct"
                        : articleGroupType[type_char],
                    name: text(),
                    range: range(),
                });
            })
            )
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.seqEqual("前"))
                    .and(r => r.oneOf(["編", "章", "節", "款", "目", "章", "条", "項", "号", "表"] as const), "type_char"),
                )
            , (({ text, type_char, range }) => {
                return new ____PF({
                    relPos: RelPos.PREV,
                    targetType: (type_char === "表")
                        ? "TableStruct"
                        : articleGroupType[type_char],
                    name: text(),
                    range: range(),
                });
            })
            )
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .choice(c => c
                            .or(r => r.seqEqual("この"))
                            .or(r => r.seqEqual("本"))
                        )
                    )
                    .and(r => r.oneOf(["編", "章", "節", "款", "目", "章", "条", "項", "号", "表"] as const), "type_char")
                )
            , (({ text, type_char, range }) => {
                return new ____PF({
                    relPos: RelPos.HERE,
                    targetType: (type_char === "表")
                        ? "TableStruct"
                        : articleGroupType[type_char],
                    name: text(),
                    range: range(),
                });
            })
            )
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .choice(c => c
                            .or(r => r.seqEqual("この"))
                        )
                    )
                    .and(r => r
                        .choice(c => c
                            .or(r => r.regExp(/^法律|勅令|政令|規則|省令|府令|内閣官房令|命令/))
                            .or(r => r.seqEqual("附則"))
                            .or(r => r.seqEqual("別表"))
                        )
                    , "type")
                )
            , (({ text, type, range }) => {
                return new ____PF({
                    relPos: RelPos.HERE,
                    targetType: (
                        (type === "附則")
                            ? "SupplProvision"
                            : (type === "別表")
                                ? "AppdxTable"
                                : "Law"
                    ),
                    name: text(),
                    range: range(),
                });
            })
            )
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.seqEqual("同"))
                    .and(r => r.oneOf(["編", "章", "節", "款", "目", "章", "条", "項", "号", "表"] as const), "type_char")
                )
            , (({ text, type_char, range }) => {
                return new ____PF({
                    relPos: RelPos.SAME,
                    targetType: (type_char === "表")
                        ? "TableStruct"
                        : articleGroupType[type_char],
                    name: text(),
                    range: range(),
                });
            })
            )
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.regExp(/^[付附]/))
                    .and(r => r.seqEqual("則" as const), "type_char"),
                )
            , (({ text, type_char, range }) => {
                return new ____PF({
                    relPos: RelPos.NAMED,
                    targetType: articleGroupType[type_char],
                    name: text(),
                    range: range(),
                });
            })
            )
        )
    )
    ;

export const $secondaryOnlyPointerFragment = factory
    .withName("secondaryOnlyPointerFragment")
    .choice(c => c
        .or(r => r
            .action(r => r
                .seqEqual("前段")
            , (({ text, range }) => {
                return new ____PF({
                    relPos: RelPos.NAMED,
                    targetType: "FIRSTPART",
                    name: text(),
                    range: range(),
                });
            })
            )
        )
        .or(r => r
            .action(r => r
                .seqEqual("後段")
            , (({ text, range }) => {
                return new ____PF({
                    relPos: RelPos.NAMED,
                    targetType: "LATTERPART",
                    name: text(),
                    range: range(),
                });
            })
            )
        )
        .or(r => r
            .action(r => r
                .seqEqual("ただし書")
            , (({ text, range }) => {
                return new ____PF({
                    relPos: RelPos.NAMED,
                    targetType: "PROVISO",
                    name: text(),
                    range: range(),
                });
            })
            )
        )
        .or(r => r
            .action(r => r
                .seqEqual("に基づく命令")
            , (({ text, range }) => {
                return new ____PF({
                    relPos: RelPos.NAMED,
                    targetType: "INFERIOR",
                    name: text(),
                    range: range(),
                });
            })
            )
        )
    )
    ;

export const $anyWherePointerFragment = factory
    .withName("anyWherePointerFragment")
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.seqEqual("第"))
                    .and(() => $kanjiDigits)
                    .and(r => r.oneOf(["編", "章", "節", "款", "目", "章", "条", "項", "号"] as const), "type_char")
                    .and(r => r
                        .zeroOrMore(r => r
                            .sequence(c => c
                                .and(r => r.oneOf(["の", "ノ"]))
                                .and(() => $kanjiDigits)
                            )
                        )
                    )
                )
            , (({ text, type_char, range }) => {
                return new ____PF({
                    relPos: RelPos.NAMED,
                    targetType: articleGroupType[type_char],
                    name: text(),
                    // num: parseNamedNum(text()),
                    range: range(),
                });
            })
            )
        )
        .or(r => r
            .action(r => r
                .choice(c => c
                    .orSequence(s => s
                        .and(() => $irohaChar)
                        .andOmit(r => r.nextIsNot(() => $irohaChar))
                    )
                    .or(() => $romanDigits),
                )
            , (({ text, range }) => {
                return new ____PF({
                    relPos: RelPos.NAMED,
                    targetType: "SUBITEM",
                    name: text(),
                    // num: parseNamedNum(text()),
                    range: range(),
                });
            })
            )
        )
        // .or(r => r
        //     .action(r => r
        //         .sequence(c => c
        //             .and(r => r.seqEqual("別表"))
        //             .and(r => r
        //                 .zeroOrOne(r => r
        //                     .sequence(c => c
        //                         .and(r => r.seqEqual("第"))
        //                         .and(() => $kanjiDigits),
        //                     )
        //                 )
        //             )
        //         )
        //     , (({ text, range }) => {
        //         return new ____PF({
        //             relPos: RelPos.NAMED,
        //             targetType: "AppdxTable",
        //             name: text(),
        //             num: parseNamedNum(text()),
        //             range: range(),
        //         });
        //     })
        //     )
        // )
    )
    ;

export default $pointerRanges;
