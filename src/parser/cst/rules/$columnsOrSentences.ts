import { newStdEL } from "../../../law/std";
import { __Text } from "../../../node/control";
import { factory } from "../factory";
import { $INLINE_EXCLUDE_TRAILING_SPACES, $PERIOD_SENTENCE_FRAGMENT } from "./inline";
import { $_, $__ } from "./lexical";
import { ValueRule } from "../util";
import { Columns } from "../../../node/cst/inline";
import * as std from "../../../law/std";
import $squareAttr from "./$squareAttr";


export const $columnsOrSentences: ValueRule<Columns> = factory
    .withName("columnsOrSentences")
    .choice(c => c
        .or(() => $columns)
        .orSequence(c => c
            .and(r => r
                .zeroOrMore(r => r
                    .sequence(s => s
                        .and(() => $squareAttr, "entry")
                        .and(() => $_, "trailingSpace")
                        .action(({ entry, trailingSpace }) => ({ ...entry, trailingSpace }))
                    )
                )
            , "attrEntries")
            .and(r => r
                .choice(c => c
                    .or(() => $periodSentences)
                    .orSequence(s => s
                        .and(() => $INLINE_EXCLUDE_TRAILING_SPACES, "inline")
                        .action(({ inline }) => [
                            newStdEL(
                                "Sentence",
                                {},
                                inline,
                            )
                        ])
                    )
                )
            , "sentences")
            .action(({ attrEntries, sentences }) => {
                return [
                    {
                        leadingSpace: "",
                        attrEntries,
                        sentences,
                    }
                ];
            })
        )
    )
    ;

export default $columnsOrSentences;

export const $periodSentences: ValueRule<std.Sentence[]> = factory
    .withName("periodSentences")
    .sequence(c => c
        .and(r => r.oneOrMore(() => $PERIOD_SENTENCE_FRAGMENT), "fragments")
        .action(({ fragments }) => {
            const sentences: Array<std.Sentence> = [];
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
        })
    )
    ;

export const $columns: ValueRule<Columns> = factory
    .withName("columns")
    .sequence(c => c
        .and(() => $column, "firstColumn")
        .and(r => r
            .oneOrMore(r => r
                .sequence(c => c
                    .and(() => $__, "leadingSpace")
                    .and(() => $column, "column")
                    .action(({ column, leadingSpace }) => {
                        return {
                            ...column,
                            leadingSpace,
                        };
                    })
                )
            )
        , "restColumns")
        .action(({ firstColumn, restColumns }) => {
            return [firstColumn, ...restColumns];
        })
    )
    ;

export const $column = factory
    .withName("column")
    .sequence(c => c
        .and(r => r
            .zeroOrMore(r => r
                .sequence(s => s
                    .and(() => $squareAttr, "entry")
                    .and(() => $_, "trailingSpace")
                    .action(({ entry, trailingSpace }) => ({ ...entry, trailingSpace }))
                )
            )
        , "attrEntries")
        .and(() => $periodSentences, "sentences")
        .action(({ attrEntries, sentences }) => {
            return {
                leadingSpace: "",
                attrEntries,
                sentences,
            };
        })
    )
    ;
