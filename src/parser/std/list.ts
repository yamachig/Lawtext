/* eslint-disable no-irregular-whitespace */
import { newStdEL, List, Sublist1, Sublist2, Sublist3 } from "../../std_law";
import { listTags } from "../../lawUtil";
import { factory, ValueRule } from "../common";
import { $DEDENT, $INDENT, $NEWLINE } from "../lexical";
import { $columns_or_sentences } from "./columnsOrSentences";


export const $list: ValueRule<List | Sublist1 | Sublist2 | Sublist3> = factory
    .withName("list")
    .action(r => r
        .sequence(c => c
            .and(() => $columns_or_sentences, "columns_or_sentences")
            .and(r => r.oneOrMore(() => $NEWLINE))
            .and(r => r
                .zeroOrOne(r => r
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
                                                        state.listDepth++; return true;
                                                    }),
                                                ),
                                            ),
                                        ),
                                    )
                                    .and(() => $INDENT)
                                    .and(() => $INDENT)
                                    .and(r => r.oneOrMore(() => $list), "target")
                                    .and(r => r.zeroOrMore(() => $NEWLINE))
                                    .and(() => $DEDENT)
                                    .and(() => $DEDENT)
                                    .and(r => r
                                        .nextIs(r => r
                                            .sequence(c => c
                                                .and(r => r.seqEqual(""))
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
                                            .and(r => r.seqEqual(""))
                                            .and(r => r
                                                .assert(({ state }) => {
                                                    state.listDepth--; return false;
                                                }),
                                            ),
                                        ),
                                    ),
                                )
                                .and(r => r.seqEqual("DUMMY")),
                            ) as unknown as ValueRule<never>,
                        ),
                    ),
                )
            , "sublists"),
        )
    , (({ columns_or_sentences, sublists, state }) => {
        const list = newStdEL(listTags[state.listDepth]);
        const list_sentence = newStdEL(`${listTags[state.listDepth]}Sentence`);
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
