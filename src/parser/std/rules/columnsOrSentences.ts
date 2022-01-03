/* eslint-disable no-irregular-whitespace */
import { newStdEL } from "../../../law/std";
import { __Text } from "../../../node/control";
import { EL } from "../../../node/el";
import { factory, ValueRule } from "../common";
import { $INLINE, $PERIOD_SENTENCE_FRAGMENT } from "../../cst/rules/inline";
import { $__ } from "../../cst/rules/lexical";


export const makeSquareAttr = (lazyNameRule: (f: typeof factory) => ValueRule<string>) => {
    return factory
        .withName("square_attr")
        .sequence(c => c
            .and(r => r.seqEqual("["))
            .and(lazyNameRule, "name")
            .and(r => r.seqEqual("=\""))
            .and(r => r
                .asSlice(r => r
                    .oneOrMore(r => r.regExp(/^[^ 　\t\r\n\]"]/)),
                )
            , "value")
            .and(r => r.seqEqual("\"]"))
            .action(({ name, value }) => {
                return [name, value] as [name: string, value: string];
            }),
        );
};

export const $square_attr = makeSquareAttr(r => r
    .asSlice(r => r
        .oneOrMore(r => r
            .regExp(/^[^ 　\t\r\n\]=]/),
        ),
    ),
);

export const $columns_or_sentences = factory
    .withName("columns_or_sentences")
    .choice(c => c
        .or(() => $columns)
        .or(() => $period_sentences)
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .action(r => r
                            .sequence(c => c
                                .and(r => r
                                    .zeroOrMore(() => $square_attr)
                                , "target"),
                            )
                        , (({ target }) => {
                            const ret = {} as Record<string, string>;
                            for (const [name, value] of target) {
                                ret[name] = value;
                            }
                            return ret;
                        }),
                        )
                    , "attr")
                    .and(() => $INLINE, "inline"),
                )
            , (({ attr, inline }) => {
            // console.error(`### line ${location().start.line}: Maybe mismatched parenthesis!`);
                const sentence = newStdEL(
                    "Sentence",
                    attr,
                    inline,
                );
                return [sentence];
            }),
            ),
        ),
    )
;

export const $period_sentences = factory
    .withName("period_sentences")
    .action(r => r
        .sequence(c => c
            .and(r => r.oneOrMore(() => $PERIOD_SENTENCE_FRAGMENT), "fragments"),
        )
    , (({ fragments }) => {
        const sentences: Array<EL> = [];
        const proviso_indices: Array<number> = [];
        for (let i = 0; i < fragments.length; i++) {
            const sentence_content = fragments[i];
            const sentence = newStdEL(
                "Sentence",
                {},
                sentence_content,
            );
            if (fragments.length >= 2) sentence.attr.Num = "" + (i + 1);
            if (
                sentence_content[0] instanceof __Text &&
            sentence_content[0].text.match(/^ただし、|但し、/)
            ) {
                proviso_indices.push(i);
            }
            sentences.push(sentence);
        }
        if (proviso_indices.length > 0) {
            for (let i = 0; i < sentences.length; i++) {
                sentences[i].attr.Function =
                proviso_indices.indexOf(i) >= 0 ?
                    "proviso" : "main";
            }
        }
        return sentences;
    }),
    )
;

export const $columns = factory
    .withName("columns")
    .action(r => r
        .sequence(c => c
            .and(() => $column, "first")
            .and(r => r
                .oneOrMore(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(() => $__)
                            .and(() => $column, "target"),
                        )
                    , (({ target }) => {
                        return target;
                    }),
                    ),
                )
            , "rest"),
        )
    , (({ first, rest }) => {
        const columns = [first].concat(rest);
        if (columns.length >= 2) {
            for (const [i, column] of columns.entries()) {
                column.attr.Num = "" + (i + 1);
            }
        }
        return columns;
    }),
    )
;

export const $column = factory
    .withName("column")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .zeroOrMore(r => r
                                .action(r => r
                                    .sequence(c => c
                                        .and(r => r.seqEqual("["))
                                        .and(r => r
                                            .asSlice(r => r
                                                .oneOrMore(r => r.regExp(/^[^ 　\t\r\n\]=]/)),
                                            )
                                        , "name")
                                        .and(r => r.seqEqual("=\""))
                                        .and(r => r
                                            .asSlice(r => r
                                                .oneOrMore(r => r.regExp(/^[^ 　\t\r\n\]"]/)),
                                            )
                                        , "value")
                                        .and(r => r.seqEqual("\"]")),
                                    )
                                , (({ name, value }) => {
                                    return [name, value];
                                }),
                                ),
                            )
                        , "target"),
                    )
                , (({ target }) => {
                    const ret = {} as Record<string, string>;
                    for (const [name, value] of target) {
                        ret[name] = value;
                    }
                    return ret;
                }),
                )
            , "attr")
            .and(() => $period_sentences, "content"),
        )
    , (({ attr, content }) => {
        return newStdEL("Column", attr, content);
    }),
    )
;

export const rules = {
    columns_or_sentences: $columns_or_sentences,
    period_sentences: $period_sentences,
    columns: $columns,
    column: $column,
};
