/* eslint-disable no-irregular-whitespace */
import { __EL } from "../../../law/std";
import { __Parentheses, __Text } from "../../../node/control";
import { EL } from "../../../node/el";
import { NotImplementedError } from "../../../util";
import { factory } from "../factory";
import { ValueRule } from "../util";
import { $_EOL, $__ } from "./lexical";
import { $xmlElement } from "./$xml";


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

export const $sentenceChildren = factory
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
        return texts;
    }),
    )
;

export default $sentenceChildren;

export const $NOT_PARENTHESIS_CHAR = factory
    .withName("NOT_PARENTHESIS_CHAR")
    .regExp(/^[^\r\n<>()（）[\]［］{}｛｝「」]/)
;

export const $INLINE_FRAGMENT = factory
    .withName("INLINE_FRAGMENT")
    .action(r => r
        .sequence(c => c
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

export const $PERIOD_SENTENCE_FRAGMENT: ValueRule<__Text[]> = factory
    .withName("PERIOD_SENTENCE_FRAGMENT")
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
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
                            .or(r => r.nextIs(() => $_EOL)),
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
            .and(r => r
                .asSlice(r => r.oneOrMore(() => $NOT_PARENTHESIS_CHAR))
            , "plain"),
        )
    , (({ plain }) => {
        return new __Text(plain);
    }),
    )
;

export const $OUTSIDE_PARENTHESES_INLINE_EXCLUDE_TRAILING_SPACES = factory
    .withName("OUTSIDE_PARENTHESES_INLINE_EXCLUDE_TRAILING_SPACES")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .regExp(/^((?![ 　\t]*\r?\n)[^\r\n<>()（）[\]［］{}｛｝「」])+/)
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

export const $MISMATCH_START_PARENTHESIS: ValueRule<__EL> = factory
    .withName("MISMATCH_START_PARENTHESIS")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .asSlice(r => r.regExp(/^[<(（[［{｛「]/))
            , "mismatch"),
        )
    , (({ mismatch }) => {
    // console.error(`### line ${location().start.line}: Mismatch start parenthesis!`);
        return new EL("__MismatchStartParenthesis", {}, [mismatch]) as __EL;
    }),
    )
;

export const $MISMATCH_END_PARENTHESIS: ValueRule<__EL> = factory
    .withName("MISMATCH_END_PARENTHESIS")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .asSlice(r => r.regExp(/^[>)）\]］}｝」]/))
            , "mismatch"),
        )
    , (({ mismatch }) => {
    // console.error(`### line ${location().start.line}: Mismatch end parenthesis!`);
        return new EL("__MismatchEndParenthesis", {}, [mismatch]) as __EL;
    }),
    )
;

export const $PARENTHESES_INLINE: ValueRule<__Parentheses | EL> = factory
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

export const $PARENTHESES_INLINE_INNER: ValueRule<__Parentheses | EL> = factory
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

