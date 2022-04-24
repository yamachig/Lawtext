/* eslint-disable no-irregular-whitespace */
import { articleGroupType, parseNamedNum } from "../../../law/num";
import { SentenceChildEL } from "../../../node/cst/inline";
import { __Text } from "../../../node/el/controls";
import { RelPos, ____PF, ____Pointer, ____PointerRange, ____PointerRanges } from "../../../node/el/controls/pointer";
import { ErrorMessage } from "../../../parser/cst/error";
import { factory } from "../../../parser/cst/factory";
import { $irohaChar, $kanjiDigits, $romanDigits } from "../../../parser/cst/rules/lexical";
import makeRangesRule, { RangeMaker, RangesMaker } from "../../../parser/cst/rules/makeRangesRule";

const makeRange: RangeMaker<____Pointer, ____PointerRange> = (from, midText, to, trailingText, range) => {
    return new ____PointerRange({
        from,
        midChildren: midText ? [new __Text(midText.text, midText.range)] : [],
        to,
        trailingChildren: trailingText ? [new __Text(trailingText.text, trailingText.range)] : [],
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


export const { $ranges: $pointerRanges, $range: $pointerRange } = makeRangesRule(
    (() => $pointer),
    makeRange,
    makeRanges,
);


export const $pointer = factory
    .withName("pointer")
    .sequence(s => s
        .and(r => r.oneOrMore(() => $pointerFragment), "fragments")
        .action(({ fragments, range }) => {
            return new ____Pointer({
                children: fragments,
                range: range(),
            });
        })
    )
    ;

export const $pointerFragment = factory
    .withName("pointerFragment")
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
                                .and(r => r.seqEqual("の"))
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
                    num: parseNamedNum(text()),
                    range: range(),
                });
            })
            )
        )
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
                    num: null,
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
                    num: null,
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
                    num: null,
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
                    num: null,
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
                    num: null,
                    range: range(),
                });
            })
            )
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.seqEqual("別表"))
                    .and(r => r
                        .zeroOrOne(r => r
                            .sequence(c => c
                                .and(r => r.seqEqual("第"))
                                .and(() => $kanjiDigits),
                            )
                        )
                    )
                )
            , (({ text, range }) => {
                return new ____PF({
                    relPos: RelPos.NAMED,
                    targetType: "AppdxTable",
                    name: text(),
                    num: parseNamedNum(text()),
                    range: range(),
                });
            })
            )
        )
        .or(r => r
            .action(r => r
                .seqEqual("前段")
            , (({ text, range }) => {
                return new ____PF({
                    relPos: RelPos.NAMED,
                    targetType: "FIRSTPART",
                    name: text(),
                    num: null,
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
                    num: null,
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
                    num: null,
                    range: range(),
                });
            })
            )
        )
        .or(r => r
            .action(r => r
                .choice(c => c
                    .or(() => $irohaChar)
                    .or(() => $romanDigits),
                )
            , (({ text, range }) => {
                return new ____PF({
                    relPos: RelPos.NAMED,
                    targetType: "SUBITEM",
                    name: text(),
                    num: parseNamedNum(text()),
                    range: range(),
                });
            })
            )
        )
    )
    ;

export default $pointerRanges;
