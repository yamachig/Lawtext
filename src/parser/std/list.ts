/* eslint-disable no-irregular-whitespace */
import { EL, listTags } from "@coresrc/util";
import { factory, ValueRule } from "../common";
import { $DEDENT, $INDENT, $NEWLINE } from "../lexical";
import { $columns_or_sentences } from "./columnsOrSentences";


export const $list: ValueRule<EL> = factory
    .withName("list")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $columns_or_sentences)
            , "columns_or_sentences")
            .and(r => r
                .oneOrMore(r => r
                    .ref(() => $NEWLINE),
                ),
            )
            .and(r => r
                .zeroOrOne(r => r
                    .choice(c => c
                        .or(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .nextIs(r => r
                                            .sequence(c => c
                                                .and(r => r
                                                    .seqEqual(""),
                                                )
                                                .and(r => r
                                                    .assert(({ state }) => {
                                                        state.listDepth++; return true;
                                                    }),
                                                ),
                                            ),
                                        ),
                                    )
                                    .and(r => r
                                        .ref(() => $INDENT),
                                    )
                                    .and(r => r
                                        .ref(() => $INDENT),
                                    )
                                    .and(r => r
                                        .oneOrMore(r => r
                                            .ref(() => $list),
                                        )
                                    , "target")
                                    .and(r => r
                                        .zeroOrMore(r => r
                                            .ref(() => $NEWLINE),
                                        ),
                                    )
                                    .and(r => r
                                        .ref(() => $DEDENT),
                                    )
                                    .and(r => r
                                        .ref(() => $DEDENT),
                                    )
                                    .and(r => r
                                        .nextIs(r => r
                                            .sequence(c => c
                                                .and(r => r
                                                    .seqEqual(""),
                                                )
                                                .and(r => r
                                                    .assert(({ state }) => {
                                                        state.listDepth--; return true;
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
                                            .and(r => r
                                                .seqEqual(""),
                                            )
                                            .and(r => r
                                                .assert(({ state }) => {
                                                    state.listDepth--; return false;
                                                }),
                                            ),
                                        ),
                                    ),
                                )
                                .and(r => r
                                    .seqEqual("DUMMY"),
                                ),
                            ) as unknown as ValueRule<never>,
                        ),
                    ),
                )
            , "sublists"),
        )
    , (({ columns_or_sentences, sublists, state }) => {
        const list = new EL(listTags[state.listDepth]);
        const list_sentence = new EL(listTags[state.listDepth] + "Sentence");
        list.append(list_sentence);

        list_sentence.extend(columns_or_sentences);

        list.extend(sublists || []);

        return list;
    }),
    )
    ;


export const rules = {
    list: $list,
};
