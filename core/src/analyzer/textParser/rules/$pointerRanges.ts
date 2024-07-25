/* eslint-disable no-irregular-whitespace */
import { typeCharsMap } from "../../../law/std/helpers";
import { irohaChars, parseKanjiNum } from "../../../law/num";
import type { SentenceChildEL } from "../../../node/cst/inline";
import type { __Parentheses } from "../../../node/el/controls";
import { RelPos, __Text, ____LawNum, ____PF, ____Pointer, ____PointerRange, ____PointerRanges } from "../../../node/el/controls";
import type { ErrorMessage } from "../../../parser/cst/error";
import { factory } from "../../../parser/cst/factory";
import { $kanjiDigits, arabicDigits, kanjiDigits, romanDigits } from "../../../parser/cst/rules/lexical";
import type { RangeMaker, RangesMaker } from "../../../parser/cst/rules/makeRangesRule";
import makeRangesRule from "../../../parser/cst/rules/makeRangesRule";
import { $ROUND_PARENTHESES_INLINE } from "../../../parser/cst/rules/$sentenceChildren";
import { type WithErrorRule, type WithErrorValue } from "../../../parser/cst/util";
import { ptnLawNumLike } from "../../../law/lawNum";
import type { Empty, MatchResult } from "generic-parser";
import { Rule } from "generic-parser";
import type { Env } from "../../../parser/cst/env";
import type { Container } from "../../../node/container";

const makeRange: RangeMaker<
    WithErrorValue<____Pointer>,
    WithErrorValue<____PointerRange>
> = (from, midText, to, trailingText, modifierParentheses, range) => {
    return {
        value: new ____PointerRange({
            from: from.value,
            midChildren: midText ? [new __Text(midText.text, midText.range)] : [],
            to: to?.value ?? null,
            trailingChildren: [
                ...(trailingText ? [new __Text(trailingText.text, trailingText.range)] : []),
                ...(modifierParentheses ? [modifierParentheses] : []),
            ],
            range,
        }),
        errors: [
            ...from.errors,
            ...(to?.errors ?? []),
        ],
    };
};

const makeRanges: RangesMaker<
    WithErrorValue<____PointerRange>,
    ____PointerRanges
> = (first, midText, rest, range) => {
    const children: (____PointerRange | SentenceChildEL)[] = [];
    const errors: ErrorMessage[] = [];

    children.push(first.value.value);
    errors.push(...first.value.errors);
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
export const pointerRangesCandidateChars = `${irohaChars}明大昭平令第前次こ本同付附iIｉＩvVｖＶxXｘＸ日`;


export const { $ranges: $pointerRanges, $range: $pointerRange } = makeRangesRule(
    (() => $pointer),
    makeRange,
    makeRanges,
);


export const $pointer: WithErrorRule<____Pointer> = factory
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
                    .sequence(s => s
                        .and(r => r
                            .zeroOrOne(() => $ROUND_PARENTHESES_INLINE)
                        , "prevModifierParentheses")
                        .and(r => r
                            .choice(c => c
                                .or(() => $anyWherePointerFragment)
                                .or(() => $secondaryOnlyPointerFragment)
                            )
                        , "fragment")
                        .action(({ prevModifierParentheses, fragment }) => {
                            return [
                                ...(prevModifierParentheses ? [prevModifierParentheses] : []),
                                { value: fragment, errors: [] },
                            ] as {
                                value: __Parentheses | ____PF,
                                errors: ErrorMessage[],
                            }[];
                        })
                    )
                )
            , "rest")
            .action(({ first, rest, range }) => {
                return {
                    value: new ____Pointer({
                        children: [
                            first,
                            ...rest.map(s => s.map(({ value }) => value)).flat(),
                        ],
                        range: range(),
                    }),
                    errors: [...rest.map(s => s.map(({ errors }) => errors)).flat(2)],
                };
            })
        )
        .orSequence(s => s
            .and(() => $singleOnlyPointerFragment, "single")
            .action(({ single, range }) => {
                return {
                    value: new ____Pointer({
                        children: [single],
                        range: range(),
                    }),
                    errors: [],
                };
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
                    .and(r => r.regExp(/^[編章節款目章条項号表]/), "type_char")
                )
            , (({ text, count, type_char, range }) => {
                const targetType = (type_char === "表")
                    ? "TableStruct"
                    : (typeCharsMap)[type_char as keyof typeof typeCharsMap];
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

class AppdxPointerRule<
        TPrevEnv extends Env
    > extends Rule<
        string,
        {
            pointerText: string,
            container: Container,
        },
        TPrevEnv,
        Empty
    > {
    public readonly classSignature = "AppdxPointerRule" as const;

    public constructor(
        name: string | null = null,
    ) {
        super(name);
    }

    protected __match__(
        offset: number,
        target: string,
        env: TPrevEnv,
    ): MatchResult<
            {
                pointerText: string,
                container: Container,
            },
            TPrevEnv
        > {
        const appdxPointers = env.options.appdxPointers as {
            pointerText: string,
            container: Container,
        }[] | undefined;

        if (Array.isArray(appdxPointers)) {
            loop: for (const appdxPointer of appdxPointers) {
                if (offset + appdxPointer.pointerText.length <= target.length) {
                    for (let i = 0; i < appdxPointer.pointerText.length; i++) {
                        if (target[offset + i] !== appdxPointer.pointerText[i]) {
                            continue loop;
                        }
                    }
                    return {
                        ok: true,
                        nextOffset: offset + appdxPointer.pointerText.length,
                        value: appdxPointer,
                        env,
                    };
                }
            }
        }

        return {
            ok: false,
            offset,
            expected: this,
            prevFail: null,
        };
    }

    public toString(): string { return this.name ?? "[AppdxPointerRule]"; }
}

export const $firstOnlyPointerFragment = factory
    .withName("firstOnlyPointerFragment")
    .choice(c => c
        .orSequence(s => s
            .and(new AppdxPointerRule())
            .action(({ text, range }) => {
                return new ____PF({
                    relPos: RelPos.NAMED,
                    targetType: "APPDX",
                    name: text(),
                    range: range(),
                });
            })
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.seqEqual("次"))
                    .and(r => r.regExp(/^[編章節款目章条項号表]/), "type_char")
                )
            , (({ text, type_char, range }) => {
                return new ____PF({
                    relPos: RelPos.NEXT,
                    targetType: (type_char === "表")
                        ? "TableStruct"
                        : typeCharsMap[type_char as keyof typeof typeCharsMap],
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
                    .and(r => r.regExp(/^[編章節款目章条項号表]/), "type_char")
                )
            , (({ text, type_char, range }) => {
                return new ____PF({
                    relPos: RelPos.PREV,
                    targetType: (type_char === "表")
                        ? "TableStruct"
                        : typeCharsMap[type_char as keyof typeof typeCharsMap],
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
                    .and(r => r.regExp(/^[編章節款目章条項号表]/), "type_char"),
                )
            , (({ text, type_char, range }) => {
                return new ____PF({
                    relPos: RelPos.HERE,
                    targetType: (type_char === "表")
                        ? "TableStruct"
                        : typeCharsMap[type_char as keyof typeof typeCharsMap],
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
                    .and(r => r.regExp(/^(?:法律|勅令|政令|規則|省令|府令|内閣官房令|命令|附則|別表)/), "type"),
                )
            , (({ text, type, range }) => {
                return new ____PF({
                    relPos: RelPos.HERE,
                    targetType: (
                        (type === "附則")
                            ? "SupplProvision"
                            : (type === "別表")
                                ? "APPDX"
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
                    .and(r => r.regExp(/^[法編章節款目章条項号表]/), "type_char"),
                )
            , (({ text, type_char, range }) => {
                return new ____PF({
                    relPos: RelPos.SAME,
                    targetType: (type_char === "表")
                        ? "TableStruct"
                        : typeCharsMap[type_char as keyof typeof typeCharsMap],
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
                    targetType: typeCharsMap[type_char],
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
        .or(r => r
            .action(r => r
                .seqEqual("各号")
            , (({ text, range }) => {
                return new ____PF({
                    relPos: RelPos.EACH,
                    targetType: "Item",
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
        .orSequence(c => c
            .and(r => r
                .regExpObj(new RegExp(`^第[${kanjiDigits}]+([編章節款目章条項号表])(?:[のノ][${kanjiDigits}]+)*`)) // e.g. "第十二条", "第一章の二", "第一号の二の三"
            , "match")
            .action(({ text, match, range }) => {
                const type_char = match[1];
                return new ____PF({
                    relPos: RelPos.NAMED,
                    targetType: typeCharsMap[type_char as keyof typeof typeCharsMap],
                    name: text(),
                    range: range(),
                });
            })
        )
        .orSequence(c => c
            .and(r => r
                .regExpObj(new RegExp(`^第[${arabicDigits}]+([編章節款目章条項号表])(?:[のノ][${arabicDigits}]+)*`)) // e.g. "第１２条", "第1章の2", "第１号の２の３"
            , "match")
            .action(({ text, match, range }) => {
                const type_char = match[1];
                return new ____PF({
                    relPos: RelPos.NAMED,
                    targetType: typeCharsMap[type_char as keyof typeof typeCharsMap],
                    name: text(),
                    range: range(),
                });
            })
        )
        .orSequence(s => s
            .and(r => r.regExp(new RegExp(`^(?:[${irohaChars}](?![${irohaChars}])|[${romanDigits}]+)`))) // e.g. "イ", "Ｖ", "IV"
            .action(({ text, range }) => {
                return new ____PF({
                    relPos: RelPos.NAMED,
                    targetType: "SUBITEM",
                    name: text(),
                    range: range(),
                });
            })
        )
    )
    ;


const reLawNumLike = new RegExp(`^${ptnLawNumLike}`);

export const $inlineWithPointerRanges = factory
    .withName("inlineWithPointerRanges")
    .choice(c => c
        .orSequence(s => s
            .and(r => r.regExp(reSuppressPointerRanges), "text")
            .action(({ text, range }) => ({
                value: new __Text(text, range()),
                errors: [],
            }))
        )
        .orSequence(s => s
            .and(r => r.regExp(reLawNumLike), "text")
            .action(({ text, range }) => ({
                value: new ____LawNum(text, range()),
                errors: [],
            }))
        )
        .or(() => $pointerRanges)
    )
    ;

export default $pointerRanges;
