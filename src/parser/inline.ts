/* eslint-disable no-irregular-whitespace */
import { EL, __Parentheses, __Text } from "@coresrc/util";
import { factory, ValueRule } from "./common";
import { $INDENT, $DEDENT, $__, $NEWLINE } from "./lexical";
import { $xml_element } from "./xml";

export const $INLINE = factory
    .withName("INLINE")
    .action(r => r
        .sequence(c => c
            .and(r => r.nextIsNot(() => $INDENT))
            .and(r => r.nextIsNot(() => $DEDENT))
            .and(r => r
                .oneOrMore(r => r
                    .choice(c => c
                        .or(() => $OUTSIDE_PARENTHESES_INLINE)
                        .or(() => $PARENTHESES_INLINE)
                        .or(() => $MISMATCH_END_PARENTHESIS),
                    ),
                )
            , "texts"),
        )
    , (({ texts }) => {
        return texts;
    }),
    )
;

export const $NEXTINLINE = factory
    .withName("NEXTINLINE")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .zeroOrMore(r => r
                    .choice(c => c
                        .or(() => $INDENT)
                        .or(() => $DEDENT)
                        .or(r => r.regExp(/^[\r\n]/)),
                    ),
                ),
            )
            .and(() => $INLINE, "inline"),
        )
    , (({ text, inline }) => {
        return {
            text: text(),
            inline: inline,
        };
    }),
    )
;

export const $NOT_PARENTHESIS_CHAR = factory
    .withName("NOT_PARENTHESIS_CHAR")
    .regExp(/^[^\r\n<>()（）[\]［］{}｛｝「」]/)
;

export const $INLINE_FRAGMENT = factory
    .withName("INLINE_FRAGMENT")
    .action(r => r
        .sequence(c => c
            .and(r => r.nextIsNot(() => $INDENT))
            .and(r => r.nextIsNot(() => $DEDENT))
            .and(r => r
                .oneOrMore(r => r
                    .choice(c => c
                        .or(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .asSlice(r => r
                                            .oneOrMore(r => r.regExp(/^[^\r\n<>()（）[\]［］{}｛｝「」 　\t]/)),
                                        )
                                    , "plain"),
                                )
                            , (({ plain }) => {
                                return new __Text(plain);
                            }),
                            ),
                        )
                        .or(() => $PARENTHESES_INLINE)
                        .or(() => $MISMATCH_END_PARENTHESIS),
                    ),
                )
            , "texts"),
        )
    , (({ texts }) => {
        return texts;
    }),
    )
;

export const $PERIOD_SENTENCE_FRAGMENT = factory
    .withName("PERIOD_SENTENCE_FRAGMENT")
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.nextIsNot(() => $INDENT))
                    .and(r => r.nextIsNot(() => $DEDENT))
                    .and(r => r
                        .oneOrMore(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .choice(c => c
                                            .or(r => r
                                                .action(r => r
                                                    .sequence(c => c
                                                        .and(r => r
                                                            .asSlice(r => r
                                                                .oneOrMore(r => r.regExp(/^[^\r\n<>()（）[\]［］{}｛｝「」 　\t。]/)),
                                                            )
                                                        , "plain"),
                                                    )
                                                , (({ plain }) => {
                                                    return new __Text(plain);
                                                }),
                                                ),
                                            )
                                            .or(() => $PARENTHESES_INLINE)
                                            .or(() => $MISMATCH_END_PARENTHESIS),
                                        )
                                    , "target"),
                                )
                            , (({ target }) => {
                                return target;
                            }),
                            ),
                        )
                    , "texts")
                    .and(r => r
                        .choice(c => c
                            .or(r => r.seqEqual("。"))
                            .or(r => r.nextIs(() => $__))
                            .or(r => r.nextIs(() => $NEWLINE)),
                        )
                    , "tail"),
                )
            , (({ texts, tail }) => {
                const last = texts[texts.length - 1];
                if (tail) {
                    if (last instanceof __Text) {
                        last.text += tail;
                    } else {
                        texts.push(new __Text(tail));
                    }
                }
                return texts;
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.seqEqual("。"), "plain"),
                )
            , (({ plain }) => {
                return [new __Text(plain)];
            }),
            ),
        ),
    )
;

export const $OUTSIDE_PARENTHESES_INLINE = factory
    .withName("OUTSIDE_PARENTHESES_INLINE")
    .action(r => r
        .sequence(c => c
            .and(r => r.nextIsNot(() => $INDENT))
            .and(r => r.nextIsNot(() => $DEDENT))
            .and(r => r
                .asSlice(r => r.oneOrMore(() => $NOT_PARENTHESIS_CHAR))
            , "plain"),
        )
    , (({ plain }) => {
        return new __Text(plain);
    }),
    )
;

export const $OUTSIDE_ROUND_PARENTHESES_INLINE = factory
    .withName("OUTSIDE_ROUND_PARENTHESES_INLINE")
    .action(r => r
        .sequence(c => c
            .and(r => r.nextIsNot(() => $INDENT))
            .and(r => r.nextIsNot(() => $DEDENT))
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
        return { text: text(), content: target };
    }),
    )
;

export const $MISMATCH_START_PARENTHESIS = factory
    .withName("MISMATCH_START_PARENTHESIS")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .asSlice(r => r.regExp(/^[<(（[［{｛「]/))
            , "mismatch"),
        )
    , (({ mismatch }) => {
    // console.error(`### line ${location().start.line}: Mismatch start parenthesis!`);
        return new EL("__MismatchStartParenthesis", {}, [mismatch]);
    }),
    )
;

export const $MISMATCH_END_PARENTHESIS = factory
    .withName("MISMATCH_END_PARENTHESIS")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .asSlice(r => r.regExp(/^[>)）\]］}｝」]/))
            , "mismatch"),
        )
    , (({ mismatch }) => {
    // console.error(`### line ${location().start.line}: Mismatch end parenthesis!`);
        return new EL("__MismatchEndParenthesis", {}, [mismatch]);
    }),
    )
;

export const $PARENTHESES_INLINE: ValueRule<EL> = factory
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

export const $PARENTHESES_INLINE_INNER: ValueRule<EL> = factory
    .withName("PARENTHESES_INLINE_INNER")
    .choice(c => c
        .or(() => $ROUND_PARENTHESES_INLINE)
        .or(() => $SQUARE_BRACKETS_INLINE)
        .or(() => $CURLY_BRACKETS_INLINE)
        .or(() => $SQUARE_PARENTHESES_INLINE)
        .or(() => $xml_element)
        .or(() => $MISMATCH_START_PARENTHESIS),
    )
;

export const $ROUND_PARENTHESES_INLINE = factory
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
                                return new __Text(plain);
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
        return new __Parentheses("round", state.parenthesesDepth, start, end, content, text());
    }),
    )
;

export const $SQUARE_BRACKETS_INLINE = factory
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
                                return new __Text(plain);
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
        return new __Parentheses("squareb", state.parenthesesDepth, start, end, content, text());
    }),
    )
;

export const $CURLY_BRACKETS_INLINE = factory
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
                                return new __Text(plain);
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
        return new __Parentheses("curly", state.parenthesesDepth, start, end, content, text());
    }),
    )
;

export const $SQUARE_PARENTHESES_INLINE: ValueRule<__Parentheses> = factory
    .withName("SQUARE_PARENTHESES_INLINE")
    .action(r => r
        .sequence(c => c
            .and(r => r.regExp(/^[「]/), "start")
            .and(r => r
                .zeroOrMore(r => r
                    .choice(c => c
                        .or(() => $xml_element)
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
                                return new __Text(text);
                            }),
                            ),
                        ),
                    ),
                )
            , "content")
            .and(r => r.regExp(/^[」]/), "end"),
        )
    , (({ text, start, content, end, state }) => {
        return new __Parentheses("square", state.parenthesesDepth, start, end, content, text());
    }),
    )
;

export const rules = {
    INLINE: $INLINE,
    NEXTINLINE: $NEXTINLINE,
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

