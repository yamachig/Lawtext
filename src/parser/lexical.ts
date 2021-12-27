/* eslint-disable no-irregular-whitespace */
import { factory, ValueRule } from "./common";

export const $INDENT = factory
    .withName("INDENT")
    .action(r => r
        .sequence(c => c
            .and(r => r.seqEqual("<INDENT str=\""))
            .and(r => r
                .oneOrMore(r => r.regExp(/^[^"]/))
            , "str")
            .and(r => r.seqEqual("\">")),
        )
    , (({ str }) => {
        return str;
    }),
    )
;

export const $DEDENT = factory
    .withName("DEDENT")
    .seqEqual("<DEDENT>")
;

export const $_ = factory
    .withName("OPTIONAL_WHITESPACES")
    .zeroOrMore(r => r.regExp(/^[ 　\t]/))
;

export const $__ = factory
    .withName("WHITESPACES")
    .oneOrMore(r => r.regExp(/^[ 　\t]/))
;

export const $CHAR = factory
    .withName("CHAR")
    .regExp(/^[^ 　\t\r\n]/)
;

export const $NEWLINE: ValueRule<unknown> = factory
    .withName("NEWLINE")
    .sequence(c => c
        .and(r => r
            .zeroOrOne(r => r.regExp(/^[\r]/)),
        )
        .and(r => r.regExp(/^[\n]/))
        .and(r => r
            .zeroOrOne(r => r
                .sequence(c => c
                    .and(() => $_)
                    .and(r => r
                        .nextIs(() => $NEWLINE),
                    ),
                ),
            ),
        ),
    )
;

export const $kanji_digit = factory
    .withName("kanji_digit")
    .regExp(/^[〇一二三四五六七八九十百千]/)
    ;

export const $roman_digit = factory
    .withName("roman_digit")
    .regExp(/^[iIｉＩxXｘＸ]/)
    ;

export const $iroha_char = factory
    .withName("iroha_char")
    .regExp(/^[イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセスン]/)
    ;

export const rules = {
    kanji_digit: $kanji_digit,
    roman_digit: $roman_digit,
    iroha_char: $iroha_char,
    INDENT: $INDENT,
    DEDENT: $DEDENT,
    _: $_,
    __: $__,
    CHAR: $CHAR,
    NEWLINE: $NEWLINE,
};
