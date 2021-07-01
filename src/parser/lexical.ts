/* eslint-disable no-irregular-whitespace */
import { factory, ValueRule } from "./common";

export const $INDENT = factory
    .withName("INDENT")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual("<INDENT str=\""),
            )
            .and(r => r
                .oneOrMore(r => r
                    .regExp(/^[^"]/),
                )
            , "str")
            .and(r => r
                .seqEqual("\">"),
            ),
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
    .zeroOrMore(r => r
        .regExp(/^[ 　\t]/),
    )
;

export const $__ = factory
    .withName("WHITESPACES")
    .oneOrMore(r => r
        .regExp(/^[ 　\t]/),
    )
;

export const $CHAR = factory
    .regExp(/^[^ 　\t\r\n]/)
;

export const $NEWLINE: ValueRule<unknown> = factory
    .withName("NEWLINE")
    .sequence(c => c
        .and(r => r
            .zeroOrOne(r => r
                .regExp(/^[\r]/),
            ),
        )
        .and(r => r
            .regExp(/^[\n]/),
        )
        .and(r => r
            .zeroOrOne(r => r
                .sequence(c => c
                    .and(r => r
                        .ref(() => $_),
                    )
                    .and(r => r
                        .nextIs(r => r
                            .ref(() => $NEWLINE),
                        ),
                    ),
                ),
            ),
        ),
    )
;
