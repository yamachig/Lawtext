import { newStdEL } from "../../../law/std";
import { __Text } from "../../../node/control";
import { factory } from "../factory";
import $sentenceChildren, { $PERIOD_SENTENCE_FRAGMENT, sentenceChildrenToString } from "./$sentenceChildren";
import { $_, $__ } from "./lexical";
import { WithErrorRule } from "../util";
import { Sentences, SentencesArray } from "../../../node/cst/inline";
import * as std from "../../../law/std";
import $squareAttr from "./$squareAttr";
import { ErrorMessage } from "../error";


export const sentencesArrayToString = (
    sentencesArray: SentencesArray,
): string => {
    const runs: string[] = [];

    for (const sentences of sentencesArray) {
        runs.push(sentences.leadingSpace);
        for (const attrEntry of sentences.attrEntries) {
            runs.push(attrEntry.text);
        }
        for (const sentence of sentences.sentences) {
            runs.push(sentenceChildrenToString(sentence.children));
        }
    }

    return runs.join("");
};


export const $sentencesArray: WithErrorRule<SentencesArray> = factory
    .withName("sentencesArray")
    .choice(c => c
        .or(() => $columns)
        .orSequence(c => c
            .and(r => r
                .zeroOrMore(r => r
                    .sequence(s => s
                        .and(() => $squareAttr, "entry")
                        .and(() => $_, "trailingSpace")
                        .action(({ entry, trailingSpace }) => {
                            return {
                                value: {
                                    ...entry.value,
                                    trailingSpace
                                },
                                errors: entry.errors,
                            };
                        })
                    )
                )
            , "attrEntries")
            .and(r => r
                .choice(c => c
                    .or(() => $periodSentences)
                    .orSequence(s => s
                        .and(() => $sentenceChildren, "inline")
                        .action(({ inline }) => {
                            return {
                                value: [
                                    newStdEL(
                                        "Sentence",
                                        {},
                                        inline.value,
                                    )
                                ],
                                errors: inline.errors,
                            };
                        })
                    )
                )
            , "sentences")
            .action(({ attrEntries, sentences }) => {
                const errors = [
                    ...attrEntries.map(e => e.errors).flat(),
                    ...sentences.errors,
                ];
                return {
                    value: [
                        {
                            leadingSpace: "",
                            attrEntries: attrEntries.map(e => e.value).flat(),
                            sentences: sentences.value,
                        },
                    ],
                    errors,
                };
            })
        )
    )
    ;

export default $sentencesArray;

export const $periodSentences: WithErrorRule<std.Sentence[]> = factory
    .withName("periodSentences")
    .sequence(c => c
        .and(r => r.oneOrMore(() => $PERIOD_SENTENCE_FRAGMENT), "fragments")
        .action(({ fragments }) => {
            const sentences: Array<std.Sentence> = [];
            const errors: ErrorMessage[] = [];
            const proviso_indices: Array<number> = [];
            for (let i = 0; i < fragments.length; i++) {
                const sentence_content = fragments[i].value;
                errors.push(...fragments[i].errors);
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
            return { value: sentences, errors };
        })
    )
    ;

export const $columns: WithErrorRule<SentencesArray> = factory
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
                            value: {
                                ...column.value,
                                leadingSpace,
                            },
                            errors: column.errors,
                        };
                    })
                )
            )
        , "restColumns")
        .action(({ firstColumn, restColumns }) => {
            const columns = [firstColumn, ...restColumns];
            return {
                value: columns.map(c => c.value),
                errors: columns.map(c => c.errors).flat(),
            };
        })
    )
    ;

export const $column: WithErrorRule<Sentences> = factory
    .withName("column")
    .sequence(c => c
        .and(r => r
            .zeroOrMore(r => r
                .sequence(s => s
                    .and(() => $squareAttr, "entry")
                    .and(() => $_, "trailingSpace")
                    .action(({ entry, trailingSpace }) => {
                        return {
                            value: {
                                ...entry.value,
                                trailingSpace
                            },
                            errors: entry.errors,
                        };
                    })
                )
            )
        , "attrEntries")
        .and(() => $periodSentences, "sentences")
        .action(({ attrEntries, sentences }) => {
            const errors = [
                ...attrEntries.map(e => e.errors).flat(),
                ...sentences.errors,
            ];
            return {
                value: {
                    leadingSpace: "",
                    attrEntries: attrEntries.map(e => e.value).flat(),
                    sentences: sentences.value,
                },
                errors,
            };
        })
    )
    ;
