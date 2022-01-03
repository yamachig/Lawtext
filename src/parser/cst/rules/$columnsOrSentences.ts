import { newStdEL } from "../../../law/std";
import { __Text } from "../../../node/control";
import { EL } from "../../../node/el";
import { factory } from "../factory";
import { $INLINE_EXCLUDE_TRAILING_SPACES, $PERIOD_SENTENCE_FRAGMENT } from "../../inline";
import { $_, $__ } from "../../lexical";
import $squareAttr from "./$squareAttr";


export const $columnsOrSentences = factory
    .withName("columnsOrSentences")
    .choice(c => c
        .or(() => $columns)
        .or(() => $periodSentences)
        .or(r => r
            .sequence(c => c
                .and(r => r
                    .sequence(c => c
                        .and(r => r
                            .zeroOrMore(r => r
                                .sequence(s => s
                                    .and(() => $squareAttr, "entry")
                                    .and(() => $_)
                                    .action(({ entry }) => entry)
                                )
                            )
                        , "entries")
                        .action(({ entries }) => Object.fromEntries(entries))
                    )
                , "attr")
                .and(() => $INLINE_EXCLUDE_TRAILING_SPACES, "inline")
                .action(({ attr, inline }) => {
                    const sentence = newStdEL(
                        "Sentence",
                        attr,
                        inline,
                    );
                    return [sentence];
                })
            )
        ),
    )
    ;

export default $columnsOrSentences;

export const $periodSentences = factory
    .withName("periodSentences")
    .sequence(c => c
        .and(r => r.oneOrMore(() => $PERIOD_SENTENCE_FRAGMENT), "fragments")
        .action(({ fragments }) => {
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
        })
    )
    ;

export const $columns = factory
    .withName("columns")
    .sequence(c => c
        .and(() => $column, "first")
        .and(r => r
            .oneOrMore(r => r
                .sequence(c => c
                    .and(() => $__)
                    .and(() => $column, "target")
                    .action(({ target }) => {
                        return target;
                    })
                )
            )
        , "rest")
        .action(({ first, rest }) => {
            const columns = [first].concat(rest);
            if (columns.length >= 2) {
                for (const [i, column] of columns.entries()) {
                    column.attr.Num = "" + (i + 1);
                }
            }
            return columns;
        })
    )
    ;

export const $column = factory
    .withName("column")
    .sequence(c => c
        .and(r => r
            .sequence(c => c
                .and(r => r
                    .zeroOrMore(() => $squareAttr)
                , "target")
                .action(({ target }) => {
                    const ret = {} as Record<string, string>;
                    for (const [name, value] of target) {
                        ret[name] = value;
                    }
                    return ret;
                })
            )
        , "attr")
        .and(() => $periodSentences, "content")
        .action(({ attr, content }) => {
            return newStdEL("Column", attr, content);
        })
    )
    ;
