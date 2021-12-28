/* eslint-disable no-irregular-whitespace */
import { newStdEL, StdEL } from "../../std_law";
import { articleGroupType, parseNamedNum, PointerFragment, RelPos } from "../../util";
import { factory } from "../common";
import { $ROUND_PARENTHESES_INLINE } from "../inline";
import { $_, $NEWLINE, $__, $INDENT, $DEDENT } from "../lexical";
import { makeRangesRule } from "../range";
import { $columns_or_sentences } from "./columnsOrSentences";
import { $list } from "./list";
import { $paragraph_item, $paragraph_item_child } from "./paragraphItem";
import { $suppl_note } from "./supplNote";


export const $article_paragraph_caption = factory
    .withName("article_paragraph_caption")
    .sequence(c => c
        .and(() => $__)
        .and(() => $ROUND_PARENTHESES_INLINE, "article_paragraph_caption")
        .and(() => $NEWLINE)
        .and(r => r
            .nextIs(r => r.regExp(/^[^ 　\t\r\n]/)),
        )
        .action(({ article_paragraph_caption }) => {
            return article_paragraph_caption;
        }),
    );


const { $ranges: $article_ranges } = makeRangesRule(() => $article_pointer);
$article_ranges.name = "article_ranges";

export const $article_title = factory
    .withName("article_title")
    .asSlice(() => $article_ranges) ;

export const $article_pointer = factory
    .withName("article_pointer")
    .sequence(c => c
        .and(r => r.seqEqual("第"))
        .and(r => r.regExp(/^[〇一二三四五六七八九十百千]+/))
        .and(r => r.seqEqual("条"))
        .and(r => r
            .zeroOrMore(r => r
                .sequence(c => c
                    .and(r => r.regExp(/^[のノ]/))
                    .and(r => r.regExp(/^[〇一二三四五六七八九十百千]+/)),
                ),
            ),
        )
        .action(({ text }) => {
            return [
                new PointerFragment(
                    RelPos.NAMED,
                    articleGroupType.条,
                    text(),
                    parseNamedNum(text()),
                ),
            ];
        }),
    );

export const $article = factory
    .withName("article")
    .sequence(c => c
        .and(r => r
            .zeroOrOne(() => $article_paragraph_caption)
        , "article_caption")
        .and(r => r
            .sequence(s => s
                .and(() => $article_ranges, "article_ranges")
                .action(({ article_ranges, text }) => {
                    return {
                        article_ranges,
                        text: text(),
                    };
                }),
            )
        , "article_ranges_struct")
        .and(r => r
            .sequence(s => s
                .and(r => r
                    .choice(c => c
                        .or(r => r
                            .sequence(c => c
                                .and(() => $__)
                                .and(() => $columns_or_sentences, "target")
                                .action(({ target }) => {
                                    return target;
                                }),
                            ),
                        )
                        .or(r => r
                            .action(r => r
                                .ref(() => $_)
                            , (() => {
                                return [newStdEL("Sentence")];
                            }),
                            ),
                        ),
                    )
                , "inline_contents")
                .and(r => r.oneOrMore(() => $NEWLINE))
                .action(
                    ({ inline_contents }) => {
                        return inline_contents;
                    },
                    // ({ result, prevEnv, range, target, factory }) => {
                    //     const [start] = range();
                    //     const newResult = factory.sequence(s => s
                    //         .and(r => r.asSlice(() => $INLINE), "inline")
                    //         .and(() => $NEWLINE)
                    //         .action(({ inline }) => inline),
                    //     ).match(start, target(), prevEnv);
                    //     if (!newResult.ok) return result;
                    //     const inline_contents = [new __MatchFail(result, [newResult.value])];
                    //     return {
                    //         ...newResult,
                    //         env: {
                    //             ...prevEnv,
                    //             inline_contents,
                    //         },
                    //         value: inline_contents,
                    //     };
                    // },
                ),
            )
        , "inline_contents")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(c => c
                    .and(() => $INDENT)
                    .and(() => $INDENT)
                    .and(r => r
                        .oneOrMore(() => $list)
                    , "target")
                    .and(r => r
                        .zeroOrMore(() => $NEWLINE),
                    )
                    .and(() => $DEDENT)
                    .and(() => $DEDENT)
                    .action(({ target }) => {
                        return target;
                    }),
                ),
            )
        , "lists")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(c => c
                    .and(() => $INDENT)
                    .and(() => $paragraph_item_child, "target")
                    .and(r => r
                        .zeroOrMore(() => $NEWLINE),
                    )
                    .and(r => r
                        .zeroOrMore(r => r
                            .sequence(c => c
                                .and(() => $paragraph_item_child, "_target")
                                .and(r => r
                                    .zeroOrMore(() => $NEWLINE),
                                )
                                .action(({ _target }) => {
                                    return _target;
                                }),
                            ),
                        )
                    , "target_rest")
                    .and(() => $DEDENT)
                    .action(({ target, target_rest }) => {
                        return [target].concat(target_rest);
                    }),
                ),
            )
        , "children1")
        .and(r => r
            .zeroOrMore(() => $paragraph_item)
        , "paragraphs")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(c => c
                    .and(() => $INDENT)
                    .and(() => $paragraph_item_child, "target")
                    .and(r => r
                        .zeroOrMore(() => $NEWLINE),
                    )
                    .and(r => r
                        .zeroOrMore(r => r
                            .sequence(c => c
                                .and(() => $paragraph_item_child, "_target")
                                .and(r => r
                                    .zeroOrMore(() => $NEWLINE),
                                )
                                .action(({ _target }) => {
                                    return _target;
                                }),
                            ),
                        )
                    , "target_rest")
                    .and(() => $DEDENT)
                    .action(({ target, target_rest }) => {
                        return [target].concat(target_rest);
                    }),
                ),
            )
        , "children2")
        .and(r => r
            .zeroOrMore(() => $suppl_note)
        , "suppl_notes")
        .action(({ article_caption, article_ranges_struct, inline_contents, lists, children1, paragraphs, children2, suppl_notes }) => {
            const { article_ranges, text: article_title } = article_ranges_struct;
            const article = newStdEL(
                "Article",
                { Delete: "false", Hide: "false" },
            );
            if (article_caption !== null) {
                article.append(newStdEL("ArticleCaption", {}, [article_caption]));
            }
            article.append(newStdEL("ArticleTitle", {}, [article_title]));

            const num = article_ranges[0][0][0].num;
            if (num) {
                article.attr.Num = num;
            }

            const paragraph = newStdEL("Paragraph");
            paragraph.attr.Num = "1";
            paragraph.attr.OldStyle = "false";
            (paragraph as StdEL).attr.Delete = "false";
            article.append(paragraph);

            paragraph.append(newStdEL("ParagraphNum"));
            paragraph.append(newStdEL("ParagraphSentence", {}, inline_contents));
            paragraph.extend(lists || []);
            paragraph.extend(children1 || []);
            paragraph.extend(children2 || []);

            article.extend(paragraphs);
            article.extend(suppl_notes);

            return article;
        }),
    )
    ;


export const rules = {
    article_paragraph_caption: $article_paragraph_caption,
    article_title: $article_title,
    article: $article,
};
