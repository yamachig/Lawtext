/* eslint-disable no-irregular-whitespace */
import { __EL } from "../../../law/std";
import { __Parentheses, __Text } from "../../../node/control";
import { EL } from "../../../node/el";
import { NotImplementedError } from "../../../util";
import { factory } from "../factory";
import { ValueRule, WithErrorRule } from "../util";
import { $_EOL, $__ } from "./lexical";
import { $xmlElement } from "./$xml";
import { ErrorMessage } from "../error";


export const sentenceChildrenToString = ( els: (string | EL)[]): string => {
    const runs: string[] = [];

    for (const el of els) {
        if (typeof el === "string") {
            runs.push(/* $$$$$$ */el.replace(/\r|\n/g, "")/* $$$$$$ */);
        } else if (el.isControl) {
            runs.push(/* $$$$$$ */el.text.replace(/\r|\n/g, "")/* $$$$$$ */);

        } else if (el.tag === "Ruby" || el.tag === "Sub" || el.tag === "Sup" || el.tag === "QuoteStruct") {
            runs.push(/* $$$$$$ */el.outerXML()/* $$$$$$ */);

        } else if (el.tag === "ArithFormula") {
            runs.push(/* $$$$$$ */el.outerXML()/* $$$$$$ */);

        } else if (el.tag === "Line") {
            throw new NotImplementedError(el.tag);

        } else {
            throw new NotImplementedError(el.tag);

        }
    }

    return /* $$$$$$ */`${runs.join("")}`/* $$$$$$ */;
};

// export const $INLINE = factory
//     .withName("INLINE")
//     .action(r => r
//         .sequence(c => c
//             .and(r => r
//                 .oneOrMore(r => r
//                     .choice(c => c
//                         .or(() => $OUTSIDE_PARENTHESES_INLINE)
//                         .or(() => $PARENTHESES_INLINE)
//                         .or(() => $MISMATCH_END_PARENTHESIS),
//                     ),
//                 )
//             , "texts"),
//         )
//     , (({ texts }) => {
//         return texts;
//     }),
//     )
// ;

export const $sentenceChildren: WithErrorRule<(__Parentheses | __Text | __EL | EL)[]> = factory
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

export const $INLINE_FRAGMENT: WithErrorRule<(__Parentheses | __Text | __EL | EL)[]> = factory
    .withName("INLINE_FRAGMENT")
    .sequence(c => c
        .and(r => r
            .oneOrMore(r => r
                .choice(c => c
                    .or(r => r
                        .sequence(c => c
                            .and(r => r
                                .asSlice(r => r
                                    .oneOrMore(r => r.regExp(/^[^\r\n<>()（）[\]［］{}｛｝「」 　\t]/)),
                                )
                            , "plain")
                            .action(({ plain }) => {
                                return {
                                    value: new __Text(plain),
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

export const $PERIOD_SENTENCE_FRAGMENT: WithErrorRule<__Text[]> = factory
    .withName("PERIOD_SENTENCE_FRAGMENT")
    .choice(c => c
        .or(r => r
            .sequence(c => c
                .and(r => r
                    .oneOrMore(r => r
                        .sequence(c => c
                            .and(r => r
                                .choice(c => c
                                    .or(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .asSlice(r => r
                                                    .oneOrMore(r => r.regExp(/^[^\r\n<>()（）[\]［］{}｛｝「」 　\t。]/)),
                                                )
                                            , "plain")
                                            .action(({ plain }) => {
                                                return {
                                                    value: new __Text(plain),
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
                        .or(r => r.seqEqual("。"))
                        .or(r => r.nextIs(() => $__))
                        .or(r => r.nextIs(() => $_EOL)),
                    )
                , "tail")
                .action(({ texts, tail }) => {
                    const last = texts[texts.length - 1];
                    if (tail) {
                        if (last.value instanceof __Text) {
                            last.value.text += tail;
                        } else {
                            texts.push({ value: new __Text(tail), errors: [] });
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
            , (({ plain }) => {
                return { value: [new __Text(plain)], errors: [] };
            }),
            ),
        ),
    )
;

export const $OUTSIDE_PARENTHESES_INLINE: WithErrorRule<__Text> = factory
    .withName("OUTSIDE_PARENTHESES_INLINE")
    .sequence(c => c
        .and(r => r
            .asSlice(r => r.oneOrMore(() => $NOT_PARENTHESIS_CHAR))
        , "plain")
        .action(({ plain }) => {
            return {
                value: new __Text(plain),
                errors: [],
            };
        })
    )
;

export const $OUTSIDE_PARENTHESES_INLINE_EXCLUDE_TRAILING_SPACES: WithErrorRule<__Text> = factory
    .withName("OUTSIDE_PARENTHESES_INLINE_EXCLUDE_TRAILING_SPACES")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .regExp(/^((?![ 　\t]*\r?\n)[^\r\n<>()（）[\]［］{}｛｝「」])+/)
            , "plain"),
        )
    , (({ plain }) => {
        return {
            value: new __Text(plain),
            errors: [],
        };
    }),
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
        .action(({ mismatch, range }) => {
            const error = new ErrorMessage(
                "$MISMATCH_START_PARENTHESIS: この括弧に対応する閉じ括弧がありません。",
                range(),
            );
            return {
                value: new EL("__MismatchStartParenthesis", {}, [mismatch]) as __EL,
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
                value: new EL("__MismatchEndParenthesis", {}, [mismatch]) as __EL,
                errors: [error],
            };
        })
    )
;

export const $PARENTHESES_INLINE: WithErrorRule<__Parentheses | EL> = factory
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

export const $PARENTHESES_INLINE_INNER: WithErrorRule<__Parentheses | EL> = factory
    .withName("PARENTHESES_INLINE_INNER")
    .choice(c => c
        .or(() => $ROUND_PARENTHESES_INLINE)
        .or(() => $SQUARE_BRACKETS_INLINE)
        .or(() => $CURLY_BRACKETS_INLINE)
        .or(() => $SQUARE_PARENTHESES_INLINE)
        .or(() => $xmlElement)
        .or(() => $MISMATCH_START_PARENTHESIS),
    )
;

export const $ROUND_PARENTHESES_INLINE: WithErrorRule<__Parentheses> = factory
    .withName("ROUND_PARENTHESES_INLINE")
    .action(r => r
        .sequence(c => c
            .and(r => r.regExp(/^[(（]/), "start")
            .and(r => r
                .zeroOrMore(r => r
                    .choice(c => c
                        .or(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .asSlice(r => r.oneOrMore(() => $NOT_PARENTHESIS_CHAR))
                                    , "plain"),
                                )
                            , (({ plain }) => {
                                return {
                                    value: new __Text(plain),
                                    errors: [],
                                };
                            }),
                            ),
                        )
                        .or(() => $PARENTHESES_INLINE)
                        .or(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .nextIsNot(r => r.regExp(/^[)）]/)),
                                    )
                                    .and(() => $MISMATCH_END_PARENTHESIS, "target"),
                                )
                            , (({ target }) => {
                                return target;
                            }),
                            ),
                        ),
                    ),
                )
            , "content")
            .and(r => r.regExp(/^[)）]/), "end"),
        )
    , (({ text, start, content, end, state }) => {
        return {
            value: new __Parentheses(
                "round",
                state.parenthesesDepth,
                start,
                end,
                content.map(c => c.value),
                text(),
            ),
            errors: content.map(c => c.errors).flat(),
        };
    }),
    )
;

export const $SQUARE_BRACKETS_INLINE: WithErrorRule<__Parentheses> = factory
    .withName("SQUARE_BRACKETS_INLINE")
    .action(r => r
        .sequence(c => c
            .and(r => r.regExp(/^[[［]/), "start")
            .and(r => r
                .zeroOrMore(r => r
                    .choice(c => c
                        .or(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .asSlice(r => r.oneOrMore(() => $NOT_PARENTHESIS_CHAR))
                                    , "plain"),
                                )
                            , (({ plain }) => {
                                return {
                                    value: new __Text(plain),
                                    errors: [],
                                };
                            }),
                            ),
                        )
                        .or(() => $PARENTHESES_INLINE)
                        .or(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .nextIsNot(r => r.regExp(/^[\]］]/)),
                                    )
                                    .and(() => $MISMATCH_END_PARENTHESIS, "target"),
                                )
                            , (({ target }) => {
                                return target;
                            }),
                            ),
                        ),
                    ),
                )
            , "content")
            .and(r => r.regExp(/^[\]］]/), "end"),
        )
    , (({ text, start, content, end, state }) => {
        return {
            value: new __Parentheses(
                "squareb",
                state.parenthesesDepth,
                start,
                end,
                content.map(c => c.value),
                text(),
            ),
            errors: content.map(c => c.errors).flat(),
        };
    }),
    )
;

export const $CURLY_BRACKETS_INLINE: WithErrorRule<__Parentheses> = factory
    .withName("CURLY_BRACKETS_INLINE")
    .action(r => r
        .sequence(c => c
            .and(r => r.regExp(/^[{｛]/), "start")
            .and(r => r
                .zeroOrMore(r => r
                    .choice(c => c
                        .or(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .asSlice(r => r.oneOrMore(() => $NOT_PARENTHESIS_CHAR))
                                    , "plain"),
                                )
                            , (({ plain }) => {
                                return {
                                    value: new __Text(plain),
                                    errors: [],
                                };
                            }),
                            ),
                        )
                        .or(() => $PARENTHESES_INLINE)
                        .or(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .nextIsNot(r => r.regExp(/^[}｝]/)),
                                    )
                                    .and(() => $MISMATCH_END_PARENTHESIS, "target"),
                                )
                            , (({ target }) => {
                                return target;
                            }),
                            ),
                        ),
                    ),
                )
            , "content")
            .and(r => r.regExp(/^[}｝]/), "end"),
        )
    , (({ text, start, content, end, state }) => {
        return {
            value: new __Parentheses(
                "curly",
                state.parenthesesDepth,
                start,
                end,
                content.map(c => c.value),
                text(),
            ),
            errors: content.map(c => c.errors).flat(),
        };
    }),
    )
;

export const $SQUARE_PARENTHESES_INLINE: WithErrorRule<__Parentheses> = factory
    .withName("SQUARE_PARENTHESES_INLINE")
    .action(r => r
        .sequence(c => c
            .and(r => r.regExp(/^[「]/), "start")
            .and(r => r
                .zeroOrMore(r => r
                    .choice(c => c
                        .or(() => $xmlElement)
                        .or(r => r
                            .action(r => r
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
                                    , "text"),
                                )
                            , (({ text }) => {
                                return {
                                    value: new __Text(text),
                                    errors: [],
                                };
                            }),
                            ),
                        ),
                    ),
                )
            , "content")
            .and(r => r.regExp(/^[」]/), "end"),
        )
    , (({ text, start, content, end, state }) => {
        return {
            value: new __Parentheses(
                "square",
                state.parenthesesDepth,
                start,
                end,
                content.map(c => c.value),
                text(),
            ),
            errors: content.map(c => c.errors).flat(),
        };
    }),
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

