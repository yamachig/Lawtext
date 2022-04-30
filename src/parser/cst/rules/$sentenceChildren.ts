/* eslint-disable no-irregular-whitespace */
import { isSub, __EL } from "../../../law/std";
import { ParenthesesType, __MismatchEndParenthesis, __MismatchStartParenthesis, __Parentheses, __Text, ____LawNum } from "../../../node/el/controls";
import { EL } from "../../../node/el";
import { assertNever, NotImplementedError } from "../../../util";
import { factory } from "../factory";
import { ValueRule, WithErrorRule } from "../util";
import { $_EOL, $__ } from "./lexical";
import { SentenceChildEL } from "../../../node/cst/inline";
import * as std from "../../../law/std";
import $xml from "./$xml";
import $pointerRanges, { pointerRangesCandidateChars, reSuppressPointerRanges } from "./$pointerRanges";
import { ptnLawNum } from "../../../law/num";
import { ErrorMessage } from "../error";


export const sentenceChildrenToString = ( els: (string | SentenceChildEL)[]): string => {
    const runs: string[] = [];

    for (const el of els) {
        if (typeof el === "string") {
            runs.push(/* $$$$$$ */el.replace(/\r|\n/g, "")/* $$$$$$ */);
        } else if (el.tag === "__CapturedXML" || el.tag === "__UnexpectedXML") {
            runs.push(/* $$$$$$ */el.children.map(c => typeof c === "string" ? c : c.outerXML()).join("")/* $$$$$$ */);
        } else if (el instanceof __Parentheses) {
            runs.push(/* $$$$$$ */[el.start.text(), ...sentenceChildrenToString(el.content.children), el.end.text()].join("")/* $$$$$$ */);
        } else if (el.isControl) {
            runs.push(/* $$$$$$ */el.text().replace(/\r|\n/g, "")/* $$$$$$ */);

        } else if (el.tag === "Ruby" || el.tag === "Sub" || el.tag === "Sup" || el.tag === "QuoteStruct") {
            runs.push(/* $$$$$$ */el.outerXML()/* $$$$$$ */);

        } else if (el.tag === "ArithFormula") {
            runs.push(/* $$$$$$ */el.outerXML()/* $$$$$$ */);

        } else if (el.tag === "Line") {
            throw new NotImplementedError(el.tag);

        } else {
            throw assertNever(el);
        }
    }

    return /* $$$$$$ */`${runs.join("")}`/* $$$$$$ */;
};

const reLawNum = new RegExp(`^${ptnLawNum}`);

export const $sentenceChildren: WithErrorRule<SentenceChildEL[]> = factory
    .withName("sentenceChildren")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .oneOrMore(r => r
                    .choice(c => c
                        .or(() => $OUTSIDE_PARENTHESES_INLINE_EXCLUDE_TRAILING_SPACES)
                        .or(() => ANY_PARENTHESES_INLINE)
                        .or(() => $MISMATCH_END_PARENTHESIS),
                    ),
                )
            , "texts"),
        )
    , (({ texts }) => {
        return {
            value: texts.map(t => t.value).flat(),
            errors: texts.map(t => t.errors).flat(),
        };
    }),
    )
;

export const $sentenceChildrenWithoutToplevelInlineToken: WithErrorRule<SentenceChildEL[]> = factory
    .withName("sentenceChildrenWithoutToplevelInlineToken")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .oneOrMore(r => r
                    .choice(c => c
                        .or(() => $OUTSIDE_PARENTHESES_INLINE_EXCLUDE_TRAILING_SPACES_WITHOUT_TOPLEVEL_INLINE_TOKEN)
                        .or(() => ANY_PARENTHESES_INLINE)
                        .or(() => $MISMATCH_END_PARENTHESIS),
                    ),
                )
            , "texts"),
        )
    , (({ texts }) => {
        return {
            value: texts.map(t => t.value).flat(),
            errors: texts.map(t => t.errors).flat(),
        };
    }),
    )
;

export default $sentenceChildren;

export const $inlineToken = factory
    .withName("inlineToken")
    .choice(c => c
        .orSequence(s => s
            .and(r => r.regExp(reSuppressPointerRanges), "text")
            .action(({ text, range }) => ({
                value: new __Text(text, range()),
                errors: [],
            }))
        )
        .orSequence(s => s
            .and(r => r.regExp(reLawNum), "text")
            .action(({ text, range }) => ({
                value: new ____LawNum(text, range()),
                errors: [],
            }))
        )
        .or(() => $pointerRanges)
    )
    ;

const rePeriodSentenceTextChars = new RegExp(`^(?:(?![${pointerRangesCandidateChars}])[^\r\n<>()（）[\\]［］{}｛｝「」 　\t。])+`);

export const $PERIOD_SENTENCE_FRAGMENT: WithErrorRule<SentenceChildEL[]> = factory
    .withName("PERIOD_SENTENCE_FRAGMENT")
    .choice(c => c
        .or(r => r
            .sequence(c => c
                .and(r => r
                    .oneOrMore(r => r
                        .choice(c => c
                            .or(r => r.regExp(rePeriodSentenceTextChars))
                            .or(() => $inlineToken)
                            .or(r => r.regExp(/^[^\r\n<>()（）[\]［］{}｛｝「」 　\t。]/))
                            .or(() => ANY_PARENTHESES_INLINE)
                            .or(() => $MISMATCH_END_PARENTHESIS),
                        )
                    )
                , "texts")
                .and(r => r
                    .choice(c => c
                        .or(r => r.seqEqual("。"))
                        .or(r => r.nextIs(() => $__))
                        .or(r => r.nextIs(() => $_EOL)),
                    )
                , "tail")
                .action(({ texts, tail, offset }) => {
                    const target = [...texts, ...(tail ? [tail] : [])];
                    const value: SentenceChildEL[] = [];
                    const errors: ErrorMessage[] = [];
                    let lastOffset = offset();
                    for (const t of target) {
                        const lastEL = value[value.length - 1];
                        if (typeof t === "string") {
                            if (lastEL instanceof __Text) {
                                lastEL.children.splice(0, 1, lastEL.children[0] + t);
                                if (lastEL.range) lastEL.range[1] += t.length;
                            } else {
                                value.push(new __Text(t, [lastOffset, lastOffset += t.length]));
                                lastOffset += t.length;
                            }
                        } else if (lastEL instanceof __Text && t.value instanceof __Text) {
                            lastEL.children.splice(0, 1, lastEL.children[0] + t.value.children[0]);
                            if (lastEL.range) lastEL.range[1] += t.value.children[0].length;
                            errors.push(...t.errors);
                        } else {
                            lastOffset = t.value.range?.[1] ?? lastOffset;
                            value.push(t.value);
                            errors.push(...t.errors);
                        }
                    }
                    return { value, errors };
                })
            )
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.seqEqual("。"), "plain"),
                )
            , (({ plain, range }) => {
                return { value: [new __Text(plain, range())], errors: [] };
            }),
            ),
        ),
    )
;

export const $OUTSIDE_PARENTHESES_INLINE_EXCLUDE_TRAILING_SPACES_WITHOUT_TOPLEVEL_INLINE_TOKEN: WithErrorRule<SentenceChildEL[]> = factory
    .withName("OUTSIDE_PARENTHESES_INLINE_EXCLUDE_TRAILING_SPACES_WITHOUT_TOPLEVEL_INLINE_TOKEN")
    .sequence(s => s
        .and(r => r
            .oneOrMore(r => r
                .choice(c => c
                    .orSequence(s => s
                        .and(r => r
                            .regExp(/^(?:(?![ 　\t]*\r?\n)[^\r\n<>()（）[\]［］{}｛｝「」])+/)
                        , "plain")
                        .action(({ plain, range }) => {
                            return {
                                value: new __Text(plain, range()),
                                errors: [],
                            };
                        })
                    )
                )
            )
        , "target")
        .action(({ target }) => {
            return {
                value: target.map(t => t.value),
                errors: target.map(t => t.errors).flat(),
            };
        })
    )
;

const reOutsideParenthesesTextChars = new RegExp(`^(?:(?![${pointerRangesCandidateChars}]|[ 　\t]*\r?\n)[^\r\n<>()（）[\\]［］{}｛｝「」])+`);

export const $OUTSIDE_PARENTHESES_INLINE_EXCLUDE_TRAILING_SPACES: WithErrorRule<SentenceChildEL[]> = factory
    .withName("OUTSIDE_PARENTHESES_INLINE_EXCLUDE_TRAILING_SPACES")
    .sequence(s => s
        .and(r => r
            .oneOrMore(r => r
                .choice(c => c
                    .or(r => r.regExp(reOutsideParenthesesTextChars))
                    .or(() => $inlineToken)
                    .or(r => r.regExp(/^(?![ 　\t]*\r?\n)[^\r\n<>()（）[\]［］{}｛｝「」]/))
                )
            )
        , "target")
        .action(({ target, offset }) => {
            const value: SentenceChildEL[] = [];
            const errors: ErrorMessage[] = [];
            let lastOffset = offset();
            for (const t of target) {
                const lastEL = value[value.length - 1];
                if (typeof t === "string") {
                    const lastEL = value[value.length - 1];
                    if (lastEL instanceof __Text) {
                        lastEL.children.splice(0, 1, lastEL.children[0] + t);
                        if (lastEL.range) lastEL.range[1] += t.length;
                    } else {
                        value.push(new __Text(t, [lastOffset, lastOffset += t.length]));
                        lastOffset += t.length;
                    }
                } else if (lastEL instanceof __Text && t.value instanceof __Text) {
                    lastEL.children.splice(0, 1, lastEL.children[0] + t.value.children[0]);
                    if (lastEL.range) lastEL.range[1] += t.value.children[0].length;
                    errors.push(...t.errors);
                } else {
                    lastOffset = t.value.range?.[1] ?? lastOffset;
                    value.push(t.value);
                    errors.push(...t.errors);
                }
            }
            return { value, errors };
        })
    )
;

export const $MISMATCH_START_PARENTHESIS: WithErrorRule<__EL> = factory
    .withName("MISMATCH_START_PARENTHESIS")
    .sequence(c => c
        .and(r => r
            .asSlice(r => r.regExp(/^[<(（[［{｛「]/))
        , "mismatch")
        .action(({ mismatch, range }) => {
            const error = new ErrorMessage(
                "$MISMATCH_START_PARENTHESIS: この括弧に対応する閉じ括弧がありません。",
                range(),
            );
            return {
                value: new __MismatchStartParenthesis(mismatch, range()),
                errors: [error],
            };
        })
    )
;

export const $MISMATCH_END_PARENTHESIS: WithErrorRule<__EL> = factory
    .withName("MISMATCH_END_PARENTHESIS")
    .sequence(c => c
        .and(r => r
            .asSlice(r => r.regExp(/^[>)）\]］}｝」]/))
        , "mismatch")
        .action(({ mismatch, range }) => {
            const error = new ErrorMessage(
                "$MISMATCH_END_PARENTHESIS: この括弧に対応する開き括弧がありません。",
                range(),
            );
            return {
                value: new __MismatchEndParenthesis(mismatch, range()),
                errors: [error],
            };
        })
    )
;

export const ANY_PARENTHESES_INLINE: WithErrorRule<SentenceChildEL> = factory
    .withName("ANY_PARENTHESES_INLINE")
    .choice(c => c
        .or(() => $ROUND_PARENTHESES_INLINE)
        .or(() => $SQUARE_BRACKETS_INLINE)
        .or(() => $CURLY_BRACKETS_INLINE)
        .or(() => $SQUARE_PARENTHESES_INLINE)
        .orSequence(s => s
            .and(() => $xml, "elWithError")
            .action(({ elWithError, range }) => {
                const el = elWithError.value;
                if (std.isLine(el) || std.isQuoteStruct(el) || std.isArithFormula(el) || std.isRuby(el) || std.isSup(el) || isSub(el) || std.isControl(el)) {
                    return {
                        value: el,
                        errors: elWithError.errors,
                    };
                } else if (std.isFig(el)) {
                    // Not a child of Sentence in stdLaw.xsd
                    return {
                        value: new EL("__CapturedXML", {}, [el], range()) as __EL,
                        errors: elWithError.errors,
                    };
                } else {
                    return {
                        value: new EL("__UnexpectedXML", {}, [el], range()) as __EL,
                        errors: [
                            ...elWithError.errors,
                            new ErrorMessage(
                                `$PARENTHESES_INLINE_INNER: タグ <${el.tag}> はこの場所では使用できません。`,
                                range(),
                            ),
                        ],
                    };
                }
            })
        )
        .or(() => $MISMATCH_START_PARENTHESIS),
    )
;

const reParenthesesInlineTextChars = new RegExp(`^(?:(?![${pointerRangesCandidateChars}])[^\r\n<>()（）[\\]［］{}｛｝「」])+`);

export const makeParenthesesInline = (
    parenthesisType: ParenthesesType,
    startPtn: RegExp,
    endPtn: RegExp,
): WithErrorRule<__Parentheses> => {
    return factory
        .choice(c => c
            .orSequence(r => r
                .andOmit(r => r
                    .assert(({ state }) => {
                        state.parenthesesDepth++; return true;
                    }),
                )
                .and(r => r
                    .sequence(s => s
                        .and(r => r.regExp(startPtn))
                        .action(({ text, range }) => ({ text: text(), range: range() }))
                    )
                , "start")
                .and(r => r
                    .sequence(s => s
                        .and(r => r
                            .zeroOrMore(r => r
                                .choice(c => c
                                    .or(r => r.regExp(reParenthesesInlineTextChars))
                                    .or(() => $inlineToken)
                                    .or(r => r.regExp(/^[^\r\n<>()（）[\]［］{}｛｝「」]/))
                                    .or(() => ANY_PARENTHESES_INLINE)
                                    .or(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .nextIsNot(r => r.regExp(endPtn)),
                                            )
                                            .and(() => $MISMATCH_END_PARENTHESIS, "target")
                                            .action(({ target }) => {
                                                return target;
                                            })
                                        )
                                    )
                                )
                            )
                        , "target")
                        .action(({ target, offset, range }) => {
                            const value: SentenceChildEL[] = [];
                            const errors: ErrorMessage[] = [];
                            let lastOffset = offset();
                            for (const t of target) {
                                const lastEL = value[value.length - 1];
                                if (typeof t === "string") {
                                    if (lastEL instanceof __Text) {
                                        lastEL.children.splice(0, 1, lastEL.children[0] + t);
                                        if (lastEL.range) lastEL.range[1] += t.length;
                                    } else {
                                        value.push(new __Text(t, [lastOffset, lastOffset += t.length]));
                                        lastOffset += t.length;
                                    }
                                } else if (lastEL instanceof __Text && t.value instanceof __Text) {
                                    lastEL.children.splice(0, 1, lastEL.children[0] + t.value.children[0]);
                                    if (lastEL.range) lastEL.range[1] += t.value.children[0].length;
                                    errors.push(...t.errors);
                                } else {
                                    lastOffset = t.value.range?.[1] ?? lastOffset;
                                    value.push(t.value);
                                    errors.push(...t.errors);
                                }
                            }
                            return { value, errors, range: range() };
                        })
                    )
                , "content")
                .and(r => r
                    .sequence(s => s
                        .and(r => r.regExp(endPtn))
                        .action(({ text, range }) => ({ text: text(), range: range() }))
                    )
                , "end")
                .andOmit(r => r
                    .assert(({ state }) => {
                        state.parenthesesDepth--; return true;
                    }),
                )
                .action(({ start, content, end, state }) => {
                    return {
                        value: new __Parentheses({
                            type: parenthesisType,
                            depth: state.parenthesesDepth + 1,
                            start: start.text,
                            end: end.text,
                            content: content.value,
                            range: {
                                start: start.range,
                                end: end.range,
                                content: content.range,
                            },
                        }),
                        errors: content.errors,
                    };
                })
            )
            .or(r => r
                .sequence(c => c
                    .and(r => r
                        .assert(({ state }) => {
                            state.parenthesesDepth--; return false;
                        })
                    )
                ) as unknown as ValueRule<never>
            )
        );
};

export const $ROUND_PARENTHESES_INLINE = makeParenthesesInline(
    "round",
    /^[(（]/,
    /^[)）]/,
);
$ROUND_PARENTHESES_INLINE.name = "ROUND_PARENTHESES_INLINE";

export const $SQUARE_BRACKETS_INLINE = makeParenthesesInline(
    "squareb",
    /^[[［]/,
    /^[\]］]/,
);
$SQUARE_BRACKETS_INLINE.name = "SQUARE_BRACKETS_INLINE";

export const $CURLY_BRACKETS_INLINE = makeParenthesesInline(
    "curly",
    /^[{｛]/,
    /^[}｝]/,
);
$CURLY_BRACKETS_INLINE.name = "CURLY_BRACKETS_INLINE";


export const $SQUARE_PARENTHESES_INLINE: WithErrorRule<__Parentheses> = factory
    .withName("SQUARE_PARENTHESES_INLINE")
    .choice(c => c
        .orSequence(c => c
            .andOmit(r => r
                .assert(({ state }) => {
                    state.parenthesesDepth++; return true;
                }),
            )
            .and(r => r
                .sequence(s => s
                    .and(r => r.regExp(/^[「]/))
                    .action(({ text, range }) => ({ text: text(), range: range() }))
                )
            , "start")
            .and(r => r
                .sequence(s => s
                    .and(r => r
                        .zeroOrMore(r => r
                            .choice(c => c
                                .or(() => $xml)
                                .or(r => r
                                    .sequence(c => c
                                        .and(r => r
                                            .asSlice(r => r
                                                .choice(c => c
                                                    .or(r => r
                                                        .oneOrMore(r => r.regExp(/^[^\r\n<>「」]/)),
                                                    )
                                                    .or(() => $SQUARE_PARENTHESES_INLINE),
                                                ),
                                            )
                                        , "text")
                                        .action(({ text, range }) => {
                                            return {
                                                value: new __Text(text, range()),
                                                errors: [],
                                            };
                                        })
                                    )
                                ),
                            ),
                        )
                    , "value")
                    .action(({ value, range }) => ({ value, range: range() }))
                )
            , "content")
            .and(r => r
                .sequence(s => s
                    .and(r => r.regExp(/^[」]/))
                    .action(({ text, range }) => ({ text: text(), range: range() }))
                )
            , "end")
            .andOmit(r => r
                .assert(({ state }) => {
                    state.parenthesesDepth--; return true;
                }),
            )
            .action(({ start, content, end, state }) => {
                return {
                    value: new __Parentheses({
                        type: "square",
                        depth: state.parenthesesDepth + 1,
                        start: start.text,
                        end: end.text,
                        content: content.value.map(c => c.value as SentenceChildEL),
                        range: {
                            start: start.range,
                            end: end.range,
                            content: content.range,
                        },
                    }),
                    errors: content.value.map(c => c.errors).flat(),
                };
            })
        )
        .or(r => r
            .sequence(c => c
                .and(r => r
                    .assert(({ state }) => {
                        state.parenthesesDepth--; return false;
                    })
                )
            ) as unknown as ValueRule<never>
        )
    )
;

