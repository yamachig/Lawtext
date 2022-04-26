/* eslint-disable no-irregular-whitespace */
import { isSub, __EL } from "../../../law/std";
import { ParenthesesType, __MismatchEndParenthesis, __MismatchStartParenthesis, __Parentheses, __Text } from "../../../node/el/controls";
import { EL } from "../../../node/el";
import { assertNever, NotImplementedError } from "../../../util";
import { factory } from "../factory";
import { ValueRule, WithErrorRule } from "../util";
import { $_EOL, $__ } from "./lexical";
import { SentenceChildEL } from "../../../node/cst/inline";
import * as std from "../../../law/std";
import $xml from "./$xml";


export const sentenceChildrenToString = ( els: (string | SentenceChildEL)[]): string => {
    const runs: string[] = [];

    for (const el of els) {
        if (typeof el === "string") {
            runs.push(/* $$$$$$ */el.replace(/\r|\n/g, "")/* $$$$$$ */);
        } else if (el.tag === "__CapturedXML" || el.tag === "__UnexpectedXML") {
            runs.push(/* $$$$$$ */el.children.map(c => typeof c === "string" ? c : c.outerXML()).join("")/* $$$$$$ */);
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

export const $sentenceChildren: WithErrorRule<SentenceChildEL[]> = factory
    .withName("sentenceChildren")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .oneOrMore(r => r
                    .choice(c => c
                        .or(() => $OUTSIDE_PARENTHESES_INLINE_EXCLUDE_TRAILING_SPACES)
                        .or(() => $PARENTHESES_INLINE)
                        .or(() => $MISMATCH_END_PARENTHESIS),
                    ),
                )
            , "texts"),
        )
    , (({ texts }) => {
        return {
            value: texts.map(t => t.value),
            errors: texts.map(t => t.errors).flat(),
        };
    }),
    )
;

export default $sentenceChildren;

export const $NOT_PARENTHESIS_CHAR = factory
    .withName("NOT_PARENTHESIS_CHAR")
    .regExp(/^[^\r\n<>()（）[\]［］{}｛｝「」]/)
;

export const $INLINE_FRAGMENT: WithErrorRule<SentenceChildEL[]> = factory
    .withName("INLINE_FRAGMENT")
    .sequence(c => c
        .and(r => r
            .oneOrMore(r => r
                .choice(c => c
                    // .or(() => $pointerRanges)
                    .or(r => r
                        .sequence(c => c
                            .and(r => r
                                .asSlice(r => r
                                    .oneOrMore(r => r.regExp(/^[^\r\n<>()（）[\]［］{}｛｝「」 　\t]/)),
                                )
                            , "plain")
                            .action(({ plain, range }) => {
                                return {
                                    value: new __Text(plain, range()),
                                    errors: [],
                                };
                            })
                        )
                    )
                    .or(() => $PARENTHESES_INLINE)
                    .or(() => $MISMATCH_END_PARENTHESIS),
                ),
            )
        , "texts")
        .action(({ texts }) => {
            return {
                value: texts.map(t => t.value),
                errors: texts.map(t => t.errors).flat(),
            };
        })
    )
;

export const $PERIOD_SENTENCE_FRAGMENT: WithErrorRule<SentenceChildEL[]> = factory
    .withName("PERIOD_SENTENCE_FRAGMENT")
    .choice(c => c
        .or(r => r
            .sequence(c => c
                .and(r => r
                    .oneOrMore(r => r
                        .sequence(c => c
                            .and(r => r
                                .choice(c => c
                                    // .or(() => $pointerRanges)
                                    .or(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .asSlice(r => r
                                                    .oneOrMore(r => r.regExp(/^[^\r\n<>()（）[\]［］{}｛｝「」 　\t。]/)),
                                                )
                                            , "plain")
                                            .action(({ plain, range }) => {
                                                return {
                                                    value: new __Text(plain, range()),
                                                    errors: [],
                                                };
                                            })
                                        )
                                    )
                                    .or(() => $PARENTHESES_INLINE)
                                    .or(() => $MISMATCH_END_PARENTHESIS),
                                )
                            , "target")
                            .action(({ target }) => {
                                return target;
                            })
                        )
                    )
                , "texts")
                .and(r => r
                    .choice(c => c
                        .orSequence(s => s
                            .and(r => r.seqEqual("。"), "period")
                            .action(({ period, range }) => ({ text: period, range: range() }))
                        )
                        .or(r => r.nextIs(() => $__))
                        .or(r => r.nextIs(() => $_EOL)),
                    )
                , "tail")
                .action(({ texts, tail }) => {
                    const last = texts[texts.length - 1];
                    if (tail) {
                        if (last.value instanceof __Text) {
                            last.value.children.splice(0, last.value.children.length, last.value.text() + tail.text);
                            if (last.value.range) last.value.range[1] += tail.text.length;
                        } else {
                            texts.push({ value: new __Text(tail.text, tail.range), errors: [] });
                        }
                    }
                    return {
                        value: texts.map(t => t.value),
                        errors: texts.map(t => t.errors).flat(),
                    };
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

export const $OUTSIDE_PARENTHESES_INLINE: WithErrorRule<__Text> = factory
    .withName("OUTSIDE_PARENTHESES_INLINE")
    .choice(c => c
        // .or(() => $pointerRanges)
        .orSequence(s => s
            .and(r => r
                .asSlice(r => r.oneOrMore(() => $NOT_PARENTHESIS_CHAR))
            , "plain")
            .action(({ plain, range }) => {
                return {
                    value: new __Text(plain, range()),
                    errors: [],
                };
            })
        )
    )
;

export const $OUTSIDE_PARENTHESES_INLINE_EXCLUDE_TRAILING_SPACES: WithErrorRule<__Text> = factory
    .withName("OUTSIDE_PARENTHESES_INLINE_EXCLUDE_TRAILING_SPACES")
    .choice(c => c
        // .or(() => $pointerRanges)
        .orSequence(s => s
            .and(r => r
                .regExp(/^((?![ 　\t]*\r?\n)[^\r\n<>()（）[\]［］{}｛｝「」])+/)
            , "plain")
            .action(({ plain, range }) => {
                return {
                    value: new __Text(plain, range()),
                    errors: [],
                };
            })
        )
    )
;

export const $OUTSIDE_ROUND_PARENTHESES_INLINE = factory
    .withName("OUTSIDE_ROUND_PARENTHESES_INLINE")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .oneOrMore(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r.nextIsNot(() => $ROUND_PARENTHESES_INLINE))
                            .and(r => r
                                .choice(c => c
                                    .or(() => $OUTSIDE_PARENTHESES_INLINE)
                                    .or(() => $PARENTHESES_INLINE)
                                    .or(() => $MISMATCH_END_PARENTHESIS),
                                )
                            , "_target"),
                        )
                    , (({ _target }) => {
                        return _target;
                    }),
                    ),
                )
            , "target"),
        )
    , (({ text, target }) => {
        const content = {
            value: target.map(t => t.value),
            errors: target.map(t => t.errors).flat(),
        };
        return { text: text(), content };
    }),
    )
;

export const $MISMATCH_START_PARENTHESIS: WithErrorRule<__EL> = factory
    .withName("MISMATCH_START_PARENTHESIS")
    .sequence(c => c
        .and(r => r
            .asSlice(r => r.regExp(/^[<(（[［{｛「]/))
        , "mismatch")
        .action(({ mismatch, range, newErrorMessage }) => {
            const error = newErrorMessage(
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
        .action(({ mismatch, range, newErrorMessage }) => {
            const error = newErrorMessage(
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

export const $PARENTHESES_INLINE: WithErrorRule<SentenceChildEL> = factory
    .withName("PARENTHESES_INLINE")
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .nextIs(r => r
                            .sequence(c => c
                                .and(r => r.seqEqual(""))
                                .and(r => r
                                    .assert(({ state }) => {
                                        state.parenthesesDepth++; return true;
                                    }),
                                ),
                            ),
                        ),
                    )
                    .and(() => $PARENTHESES_INLINE_INNER, "target")
                    .and(r => r
                        .nextIs(r => r
                            .sequence(c => c
                                .and(r => r.seqEqual(""))
                                .and(r => r
                                    .assert(({ state }) => {
                                        state.parenthesesDepth--; return true;
                                    }),
                                ),
                            ),
                        ),
                    ),
                )
            , (({ target }) => {
                return target;
            }),
            ),
        )
        .or(r => r
            .sequence(c => c
                .and(r => r
                    .nextIs(r => r
                        .sequence(c => c
                            .and(r => r.seqEqual(""))
                            .and(r => r
                                .assert(({ state }) => {
                                    state.parenthesesDepth--; return false;
                                }),
                            ),
                        ),
                    ),
                )
                .and(r => r.seqEqual("DUMMY")),
            ) as unknown as ValueRule<never>,
        ),
    )
;

export const $PARENTHESES_INLINE_INNER: WithErrorRule<SentenceChildEL> = factory
    .withName("PARENTHESES_INLINE_INNER")
    .choice(c => c
        .or(() => $ROUND_PARENTHESES_INLINE)
        .or(() => $SQUARE_BRACKETS_INLINE)
        .or(() => $CURLY_BRACKETS_INLINE)
        .or(() => $SQUARE_PARENTHESES_INLINE)
        .orSequence(s => s
            .and(() => $xml, "elWithError")
            .action(({ elWithError, range, newErrorMessage }) => {
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
                            newErrorMessage(
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

export const makeParenthesesInline = (
    parenthesisType: ParenthesesType,
    startPtn: RegExp,
    endPtn: RegExp,
): WithErrorRule<__Parentheses> => {
    return factory
        .sequence(c => c
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
                                .or(r => r
                                    .sequence(c => c
                                        .and(r => r
                                            .asSlice(r => r.oneOrMore(() => $NOT_PARENTHESIS_CHAR))
                                        , "plain")
                                        .action(({ plain, range }) => {
                                            return {
                                                value: new __Text(plain, range()),
                                                errors: [],
                                            };
                                        })
                                    )
                                )
                                .or(() => $PARENTHESES_INLINE)
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
                    , "value")
                    .action(({ value, range }) => ({ value, range: range() }))
                )
            , "content")
            .and(r => r
                .sequence(s => s
                    .and(r => r.regExp(endPtn))
                    .action(({ text, range }) => ({ text: text(), range: range() }))
                )
            , "end")
            .action(({ start, content, end, state }) => {
                return {
                    value: new __Parentheses({
                        type: parenthesisType,
                        depth: state.parenthesesDepth,
                        start: start.text,
                        end: end.text,
                        content: content.value.map(c => c.value),
                        range: {
                            start: start.range,
                            end: end.range,
                            content: content.range,
                        },
                    }),
                    errors: content.value.map(c => c.errors).flat(),
                };
            })
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
    .sequence(c => c
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
        .action(({ start, content, end, state }) => {
            return {
                value: new __Parentheses({
                    type: "square",
                    depth: state.parenthesesDepth,
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
;

export const rules = {
    INLINE: $sentenceChildren,
    NOT_PARENTHESIS_CHAR: $NOT_PARENTHESIS_CHAR,
    INLINE_FRAGMENT: $INLINE_FRAGMENT,
    PERIOD_SENTENCE_FRAGMENT: $PERIOD_SENTENCE_FRAGMENT,
    OUTSIDE_PARENTHESES_INLINE: $OUTSIDE_PARENTHESES_INLINE,
    OUTSIDE_ROUND_PARENTHESES_INLINE: $OUTSIDE_ROUND_PARENTHESES_INLINE,
    MISMATCH_START_PARENTHESIS: $MISMATCH_START_PARENTHESIS,
    MISMATCH_END_PARENTHESIS: $MISMATCH_END_PARENTHESIS,
    PARENTHESES_INLINE: $PARENTHESES_INLINE,
    PARENTHESES_INLINE_INNER: $PARENTHESES_INLINE_INNER,
    ROUND_PARENTHESES_INLINE: $ROUND_PARENTHESES_INLINE,
    SQUARE_BRACKETS_INLINE: $SQUARE_BRACKETS_INLINE,
    CURLY_BRACKETS_INLINE: $CURLY_BRACKETS_INLINE,
    SQUARE_PARENTHESES_INLINE: $SQUARE_PARENTHESES_INLINE,
};

