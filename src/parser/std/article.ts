/* eslint-disable no-irregular-whitespace */
import { newStdEL, StdEL } from "@coresrc/std_law";
import { parseNamedNum } from "@coresrc/util";
import { factory } from "../common";
import { $ROUND_PARENTHESES_INLINE } from "../inline";
import { $_, $NEWLINE, $__, $INDENT, $DEDENT } from "../lexical";
import { $columns_or_sentences } from "./columnsOrSentences";
import { $list } from "./list";
import { $paragraph_item, $paragraph_item_child } from "./paragraphItem";
import { $suppl_note } from "./supplNote";


export const $article_paragraph_caption = factory
    .withName("article_paragraph_caption")
    .action(r => r
        .sequence(c => c
            .and(() => $__)
            .and(() => $ROUND_PARENTHESES_INLINE, "article_paragraph_caption")
            .and(() => $NEWLINE)
            .and(r => r
                .nextIs(r => r.regExp(/^[^ 　\t\r\n]/)),
            ),
        )
    , (({ article_paragraph_caption }) => {
        return article_paragraph_caption;
    }),
    )
    ;

export const $article_title = factory
    .withName("article_title")
    .sequence(c => c
        .and(r => r.seqEqual("第"))
        .and(r => r
            .oneOrMore(r => r.regExp(/^[^ 　\t\r\n条]/)),
        )
        .and(r => r.seqEqual("条"))
        .and(r => r
            .zeroOrOne(r => r
                .sequence(c => c
                    .and(r => r
                        .choice(c => c
                            .or(r => r.regExp(/^[のノ]/))
                            .or(r => r.seqEqual("及び")),
                        ),
                    )
                    .and(r => r
                        .oneOrMore(r => r.regExp(/^[^ 　\t\r\n]/)),
                    ),
                ),
            ),
        ),
    )
    ;

export const $article = factory
    .withName("article")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .zeroOrOne(() => $article_paragraph_caption)
            , "article_caption")
            .and(r => r
                .asSlice(() => $article_title)
            , "article_title")
            .and(r => r
                .choice(c => c
                    .or(r => r
                        .action(r => r
                            .sequence(c => c
                                .and(() => $__)
                                .and(() => $columns_or_sentences, "target"),
                            )
                        , (({ target }) => {
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
            .and(r => r
                .oneOrMore(() => $NEWLINE),
            )
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
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
                            .and(() => $DEDENT),
                        )
                    , (({ target }) => {
                        return target;
                    }),
                    ),
                )
            , "lists")
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(() => $INDENT)
                            .and(() => $paragraph_item_child, "target")
                            .and(r => r
                                .zeroOrMore(() => $NEWLINE),
                            )
                            .and(r => r
                                .zeroOrMore(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(() => $paragraph_item_child, "_target")
                                            .and(r => r
                                                .zeroOrMore(() => $NEWLINE),
                                            ),
                                        )
                                    , (({ _target }) => {
                                        return _target;
                                    }),
                                    ),
                                )
                            , "target_rest")
                            .and(() => $DEDENT),
                        )
                    , (({ target, target_rest }) => {
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
                    .action(r => r
                        .sequence(c => c
                            .and(() => $INDENT)
                            .and(() => $paragraph_item_child, "target")
                            .and(r => r
                                .zeroOrMore(() => $NEWLINE),
                            )
                            .and(r => r
                                .zeroOrMore(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(() => $paragraph_item_child, "_target")
                                            .and(r => r
                                                .zeroOrMore(() => $NEWLINE),
                                            ),
                                        )
                                    , (({ _target }) => {
                                        return _target;
                                    }),
                                    ),
                                )
                            , "target_rest")
                            .and(() => $DEDENT),
                        )
                    , (({ target, target_rest }) => {
                        return [target].concat(target_rest);
                    }),
                    ),
                )
            , "children2")
            .and(r => r
                .zeroOrMore(() => $suppl_note)
            , "suppl_notes"),
        )
    , (({ article_caption, article_title, inline_contents, lists, children1, paragraphs, children2, suppl_notes }) => {
        const article = newStdEL(
            "Article",
            { Delete: "false", Hide: "false" },
        );
        if (article_caption !== null) {
            article.append(newStdEL("ArticleCaption", {}, [article_caption]));
        }
        article.append(newStdEL("ArticleTitle", {}, [article_title]));

        const num = parseNamedNum(article_title);
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
