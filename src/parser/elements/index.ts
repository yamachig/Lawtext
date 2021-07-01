/* eslint-disable no-irregular-whitespace */
import { __Text, EL, __Parentheses, eras, parseKanjiNum, getLawtype, articleGroupType, parseNamedNum, articleGroupTitleTag, paragraphItemTags, paragraphItemTitleTags, paragraphItemSentenceTags, setItemNum, listTags, articleGroupTypeChars } from "@coresrc/util";
import { $columns_or_sentences, rules as columnsOrSentencesRules } from "./columnsOrSentences";
import { factory, ValueRule } from "../common";
import { $INLINE, $OUTSIDE_ROUND_PARENTHESES_INLINE, $ROUND_PARENTHESES_INLINE } from "../inline";
import { $INDENT, $DEDENT, $_, $__, $CHAR, $NEWLINE } from "../lexical";
import { $xml_element } from "../xml";


export const $law = factory
    .action(r => r
        .sequence(c => c
            .and(r => r
                .zeroOrOne(r => r
                    .ref(() => $law_title),
                )
            , "law_title")
            .and(r => r
                .zeroOrMore(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .choice(c => c
                                    .or(r => r
                                        .seqEqual(":前文:"),
                                    )
                                    .or(r => r
                                        .seqEqual(":Preamble:"),
                                    ),
                                ),
                            )
                            .and(r => r
                                .ref(() => $NEWLINE),
                            )
                            .and(r => r
                                .oneOrMore(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .ref(() => $INLINE)
                                            , "inline")
                                            .and(r => r
                                                .ref(() => $NEWLINE),
                                            ),
                                        )
                                    , (({ inline }) => {
                                        return new EL("Paragraph", {}, [
                                            new EL("ParagraphNum"),
                                            new EL("ParagraphSentence", {}, [new EL("Sentence", {}, inline)]),
                                        ]);
                                    }),
                                    ),
                                )
                            , "target")
                            .and(r => r
                                .oneOrMore(r => r
                                    .ref(() => $NEWLINE),
                                ),
                            ),
                        )
                    , (({ target }) => {
                        return new EL("Preamble", {}, target);
                    }),
                    ),
                )
            , "preambles1")
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .ref(() => $INDENT),
                            )
                            .and(r => r
                                .ref(() => $INDENT),
                            )
                            .and(r => r
                                .oneOrMore(r => r
                                    .ref(() => $enact_statement),
                                )
                            , "target")
                            .and(r => r
                                .ref(() => $DEDENT),
                            )
                            .and(r => r
                                .ref(() => $DEDENT),
                            ),
                        )
                    , (({ target }) => {
                        return target;
                    }),
                    ),
                )
            , "enact_statements")
            .and(r => r
                .zeroOrOne(r => r
                    .ref(() => $toc),
                )
            , "toc")
            .and(r => r
                .zeroOrMore(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .choice(c => c
                                    .or(r => r
                                        .seqEqual(":前文:"),
                                    )
                                    .or(r => r
                                        .seqEqual(":Preamble:"),
                                    ),
                                ),
                            )
                            .and(r => r
                                .ref(() => $NEWLINE),
                            )
                            .and(r => r
                                .oneOrMore(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .ref(() => $INLINE)
                                            , "inline")
                                            .and(r => r
                                                .ref(() => $NEWLINE),
                                            ),
                                        )
                                    , (({ inline }) => {
                                        return new EL("Paragraph", {}, [
                                            new EL("ParagraphNum"),
                                            new EL("ParagraphSentence", {}, [new EL("Sentence", {}, inline)]),
                                        ]);
                                    }),
                                    ),
                                )
                            , "target")
                            .and(r => r
                                .oneOrMore(r => r
                                    .ref(() => $NEWLINE),
                                ),
                            ),
                        )
                    , (({ target }) => {
                        return new EL("Preamble", {}, target);
                    }),
                    ),
                )
            , "preambles2")
            .and(r => r
                .ref(() => $main_provision)
            , "main_provision")
            .and(r => r
                .zeroOrMore(r => r
                    .ref(() => $appdx_item),
                )
            , "appdx_items"),
        )
    , (({ law_title, preambles1, enact_statements, toc, preambles2, main_provision, appdx_items }) => {
        const law = new EL("Law", { Lang: "ja" });
        const law_body = new EL("LawBody");

        if (law_title !== null) {
            if (law_title.law_num) {
                law.append(new EL("LawNum", {}, [law_title.law_num]));

                const m = law_title.law_num.match(/^(明治|大正|昭和|平成|令和)([一二三四五六七八九十]+)年(\S+?)(?:第([一二三四五六七八九十百千]+)号)?$/);
                if (m) {
                    const [era, year, law_type, num] = m.slice(1);

                    if (era in eras) law.attr.Era = eras[era as keyof typeof eras];

                    const year_val = parseKanjiNum(year);
                    if (year_val !== null) law.attr.Year = year_val;

                    const law_type_val = getLawtype(law_type);
                    if (law_type_val !== null) law.attr.LawType = law_type_val;

                    if (num) {
                        const num_val = parseKanjiNum(num);
                        if (num_val !== null) law.attr.Num = num_val;
                        else law.attr.Num = "";
                    } else {
                        law.attr.Num = "";
                    }
                }
            }

            if (law_title.law_title) {
                law_body.append(new EL("LawTitle", {}, [law_title.law_title]));
            }
        }

        law.append(law_body);

        law_body.extend(preambles1);
        law_body.extend(enact_statements || []);
        if (toc) law_body.append(toc);
        law_body.extend(preambles2);
        law_body.append(main_provision);
        law_body.extend(appdx_items);

        return law;
    }),
    )
    ;

export const $law_title = factory
    .withName("law_title")
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .asSlice(r => r
                            .ref(() => $INLINE),
                        )
                    , "law_title")
                    .and(r => r
                        .ref(() => $NEWLINE),
                    )
                    .and(r => r
                        .ref(() => $ROUND_PARENTHESES_INLINE)
                    , "law_num")
                    .and(r => r
                        .oneOrMore(r => r
                            .ref(() => $NEWLINE),
                        ),
                    ),
                )
            , (({ law_title, law_num }) => {
                return {
                    law_title: law_title,
                    law_num: law_num.content,
                };
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .asSlice(r => r
                            .ref(() => $INLINE),
                        )
                    , "law_title")
                    .and(r => r
                        .oneOrMore(r => r
                            .ref(() => $NEWLINE),
                        ),
                    ),
                )
            , (({ law_title }) => {
                return {
                    law_title: law_title,
                    law_num: undefined,
                };
            }),
            ),
        ),
    )
    ;

export const $enact_statement = factory
    .withName("enact_statement")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .nextIsNot(r => r
                    .ref(() => $__),
                ),
            )
            .and(r => r
                .nextIsNot(r => r
                    .ref(() => $toc_label),
                ),
            )
            .and(r => r
                .nextIsNot(r => r
                    .ref(() => $article_title),
                ),
            )
            .and(r => r
                .ref(() => $INLINE)
            , "target")
            .and(r => r
                .oneOrMore(r => r
                    .ref(() => $NEWLINE),
                ),
            ),
        )
    , (({ target }) => {
        return new EL("EnactStatement", {}, target);
    }),
    )
    ;

export const $toc_label = factory
    .withName("toc_label")
    .sequence(c => c
        .and(r => r
            .nextIsNot(r => r
                .ref(() => $INDENT),
            ),
        )
        .and(r => r
            .nextIsNot(r => r
                .ref(() => $DEDENT),
            ),
        )
        .and(r => r
            .nextIsNot(r => r
                .ref(() => $NEWLINE),
            ),
        )
        .and(r => r
            .sequence(c => c
                .and(r => r
                    .zeroOrMore(r => r
                        .regExp(/^[^\r\n目]/),
                    ),
                )
                .and(r => r
                    .seqEqual("目次"),
                ),
            ),
        )
        .and(r => r
            .nextIs(r => r
                .ref(() => $NEWLINE),
            ),
        ),
    )
    ;

export const $toc = factory
    .withName("toc")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .asSlice(r => r
                    .ref(() => $toc_label),
                )
            , "toc_label")
            .and(r => r
                .ref(() => $NEWLINE),
            )
            .and(r => r
                .ref(() => $INDENT),
            )
            .and(r => r
                .ref(() => $toc_item)
            , "first")
            .and(r => r
                .zeroOrMore(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .ref(() => $toc_item)
                            , "target"),
                        )
                    , (({ target }) => {
                        return target;
                    }),
                    ),
                )
            , "rest")
            .and(r => r
                .zeroOrMore(r => r
                    .ref(() => $NEWLINE),
                ),
            )
            .and(r => r
                .ref(() => $DEDENT),
            ),
        )
    , (({ toc_label, first, rest }) => {
        const children = [first].concat(rest);

        const toc = new EL("TOC", {}, []);
        toc.append(new EL("TOCLabel", {}, [toc_label]));
        toc.extend(children);

        return toc;
    }),
    )
    ;

export const $toc_item: ValueRule<EL> = factory
    .withName("toc_item")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .nextIsNot(r => r
                    .ref(() => $INDENT),
                ),
            )
            .and(r => r
                .nextIsNot(r => r
                    .ref(() => $DEDENT),
                ),
            )
            .and(r => r
                .nextIsNot(r => r
                    .ref(() => $NEWLINE),
                ),
            )
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .oneOrMore(r => r
                                .choice(c => c
                                    .or(r => r
                                        .action(r => r
                                            .sequence(c => c
                                                .and(r => r
                                                    .ref(() => $OUTSIDE_ROUND_PARENTHESES_INLINE)
                                                , "target"),
                                            )
                                        , (({ target }) => {
                                            return target.content;
                                        }),
                                        ),
                                    )
                                    .or(r => r
                                        .action(r => r
                                            .sequence(c => c
                                                .and(r => r
                                                    .ref(() => $ROUND_PARENTHESES_INLINE)
                                                , "target"),
                                            )
                                        , (({ target }) => {
                                            return [target];
                                        }),
                                        ),
                                    ),
                                ),
                            )
                        , "sets"),
                    )
                , (({ sets }) => {
                    const ret: EL[] = [];
                    for (const set of sets) {
                        ret.push(...set);
                    }
                    return ret;
                }),
                )
            , "fragments")
            .and(r => r
                .ref(() => $NEWLINE),
            )
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .ref(() => $INDENT),
                            )
                            .and(r => r
                                .ref(() => $toc_item)
                            , "first")
                            .and(r => r
                                .zeroOrMore(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .ref(() => $toc_item)
                                            , "target"),
                                        )
                                    , (({ target }) => {
                                        return target;
                                    }),
                                    ),
                                )
                            , "rest")
                            .and(r => r
                                .zeroOrMore(r => r
                                    .ref(() => $NEWLINE),
                                ),
                            )
                            .and(r => r
                                .ref(() => $DEDENT),
                            ),
                        )
                    , (({ first, rest }) => {
                        return [first].concat(rest);
                    }),
                    ),
                )
            , "children"),
        )
    , (({ fragments, children }) => {
        const last_fragment = fragments[fragments.length - 1];
        let article_range;
        let title_fragments;
        if (last_fragment instanceof __Parentheses && last_fragment.attr.type === "round") {
            title_fragments = fragments.slice(0, fragments.length - 1);
            article_range = last_fragment;
        } else {
            title_fragments = fragments.slice(0, fragments.length);
            article_range = null;
        }
        if (!title_fragments[0].text) console.error(title_fragments);

        let toc_item;

        if (title_fragments[0].text.match(/前文/)) {
            toc_item = new EL("TOCPreambleLabel", {}, title_fragments);
        } else {
            const type_char = title_fragments[0].text.match(/[編章節款目章則]/)?.[0];
            toc_item = new EL("TOC" + articleGroupType[type_char as keyof typeof articleGroupType]);

            if (title_fragments[0].text.match(/[編章節款目章]/)) {
                toc_item.attr.Delete = "false";
                const num = parseNamedNum(title_fragments[0].text);
                if (num) {
                    toc_item.attr.Num = num;
                }
            }

            toc_item.append(new EL(
                articleGroupTitleTag[type_char as keyof typeof articleGroupTitleTag],
                {},
                title_fragments,
            ));

            if (article_range !== null) {
                toc_item.append(new EL(
                    "ArticleRange",
                    {},
                    [article_range],
                ));
            }

            toc_item.extend(children || []);
        }

        return toc_item;
    }),
    )
    ;

export const $main_provision = factory
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .oneOrMore(r => r
                            .choice(c => c
                                .or(r => r
                                    .ref(() => $article),
                                )
                                .or(r => r
                                    .ref(() => $article_group),
                                ),
                            ),
                        )
                    , "children"),
                )
            , (({ children }) => {
                return new EL("MainProvision", {}, children);
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .ref(() => $no_name_paragraph_item)
                    , "paragraph"),
                )
            , (({ paragraph }) => {
                return new EL("MainProvision", {}, [paragraph]);
            }),
            ),
        ),
    )
    ;

export const $article_group_title = factory
    .withName("article_group_title")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $__),
            )
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .seqEqual("第"),
                                    )
                                    .and(r => r
                                        .oneOrMore(r => r
                                            .regExp(/^[^ 　\t\r\n編章節款目]/),
                                        ),
                                    )
                                    .and(r => r
                                        .regExp(/^[編章節款目]/)
                                    , "type_char")
                                    .and(r => r
                                        .zeroOrOne(r => r
                                            .sequence(c => c
                                                .and(r => r
                                                    .regExp(/^[のノ]/),
                                                )
                                                .and(r => r
                                                    .oneOrMore(r => r
                                                        .regExp(/^[^ 　\t\r\n]/),
                                                    ),
                                                ),
                                            ),
                                        ),
                                    ),
                                )
                            , (({ text, type_char }) => {
                                return { num: text(), type_char: type_char };
                            }),
                            )
                        , "num")
                        .and(r => r
                            .zeroOrOne(r => r
                                .action(r => r
                                    .sequence(c => c
                                        .and(r => r
                                            .asSlice(r => r
                                                .ref(() => $__),
                                            )
                                        , "space")
                                        .and(r => r
                                            .ref(() => $INLINE)
                                        , "inline"),
                                    )
                                , (({ space, inline }) => {
                                    return { space: space, inline: inline };
                                }),
                                ),
                            )
                        , "name"),
                    )
                , (({ num, name }) => {
                    const ret = {
                        content: name ? [
                            new __Text(num.num),
                            new __Text(name.space),
                        ].concat(name.inline) : [] as EL[],
                        ...num,
                        ...name,
                    };
                    return ret;
                }),
                )
            , "title")
            .and(r => r
                .oneOrMore(r => r
                    .ref(() => $NEWLINE),
                ),
            ),
        )
    , (({ title }) => {
        return title;
    }),
    )
    ;

export const $article_group: ValueRule<EL> = factory
    .withName("article_group")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $article_group_title)
            , "article_group_title")
            .and(r => r
                .oneOrMore(r => r
                    .choice(c => c
                        .or(r => r
                            .ref(() => $article),
                        )
                        .or(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .nextIs(r => r
                                            .sequence(c => c
                                                .and(r => r
                                                    .ref(() => $article_group_title)
                                                , "next_title")
                                                .and(r => r
                                                    .assert(({ article_group_title, next_title }) => {
                                                        const current_level = articleGroupTypeChars.indexOf(article_group_title.type_char);
                                                        const next_level = articleGroupTypeChars.indexOf(next_title.type_char);
                                                        return current_level < next_level;
                                                    }),
                                                ),
                                            ),
                                        ),
                                    )
                                    .and(r => r
                                        .ref(() => $article_group)
                                    , "article_group"),
                                )
                            , (({ article_group }) => {
                                return article_group;
                            }),
                            ),
                        ),
                    ),
                )
            , "children"),
        )
    , (({ article_group_title, children }) => {
        const article_group = new EL(
            articleGroupType[article_group_title.type_char as keyof typeof articleGroupType],
            { Delete: "false", Hide: "false" },
        );

        article_group.append(new EL(
            articleGroupTitleTag[article_group_title.type_char as keyof typeof articleGroupTitleTag],
            {},
            article_group_title.content,
        ));

        const num = parseNamedNum(article_group_title.num);
        if (num) {
            article_group.attr.Num = num;
        }

        article_group.extend(children);

        return article_group;
    }),
    )
    ;

export const $article_paragraph_caption = factory
    .withName("article_paragraph_caption")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $__),
            )
            .and(r => r
                .ref(() => $ROUND_PARENTHESES_INLINE)
            , "article_paragraph_caption")
            .and(r => r
                .ref(() => $NEWLINE),
            )
            .and(r => r
                .nextIs(r => r
                    .regExp(/^[^ 　\t\r\n]/),
                ),
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
        .and(r => r
            .seqEqual("第"),
        )
        .and(r => r
            .oneOrMore(r => r
                .regExp(/^[^ 　\t\r\n条]/),
            ),
        )
        .and(r => r
            .seqEqual("条"),
        )
        .and(r => r
            .zeroOrOne(r => r
                .sequence(c => c
                    .and(r => r
                        .choice(c => c
                            .or(r => r
                                .regExp(/^[のノ]/),
                            )
                            .or(r => r
                                .seqEqual("及び"),
                            ),
                        ),
                    )
                    .and(r => r
                        .oneOrMore(r => r
                            .regExp(/^[^ 　\t\r\n]/),
                        ),
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
                .zeroOrOne(r => r
                    .ref(() => $article_paragraph_caption),
                )
            , "article_caption")
            .and(r => r
                .asSlice(r => r
                    .ref(() => $article_title),
                )
            , "article_title")
            .and(r => r
                .choice(c => c
                    .or(r => r
                        .action(r => r
                            .sequence(c => c
                                .and(r => r
                                    .ref(() => $__),
                                )
                                .and(r => r
                                    .ref(() => $columns_or_sentences)
                                , "target"),
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
                            return [new EL("Sentence")];
                        }),
                        ),
                    ),
                )
            , "inline_contents")
            .and(r => r
                .oneOrMore(r => r
                    .ref(() => $NEWLINE),
                ),
            )
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
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
                            ),
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
                            .and(r => r
                                .ref(() => $INDENT),
                            )
                            .and(r => r
                                .ref(() => $paragraph_item_child)
                            , "target")
                            .and(r => r
                                .zeroOrMore(r => r
                                    .ref(() => $NEWLINE),
                                ),
                            )
                            .and(r => r
                                .zeroOrMore(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .ref(() => $paragraph_item_child)
                                            , "_target")
                                            .and(r => r
                                                .zeroOrMore(r => r
                                                    .ref(() => $NEWLINE),
                                                ),
                                            ),
                                        )
                                    , (({ _target }) => {
                                        return _target;
                                    }),
                                    ),
                                )
                            , "target_rest")
                            .and(r => r
                                .ref(() => $DEDENT),
                            ),
                        )
                    , (({ target, target_rest }) => {
                        return [target].concat(target_rest);
                    }),
                    ),
                )
            , "children1")
            .and(r => r
                .zeroOrMore(r => r
                    .ref(() => $paragraph_item),
                )
            , "paragraphs")
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .ref(() => $INDENT),
                            )
                            .and(r => r
                                .ref(() => $paragraph_item_child)
                            , "target")
                            .and(r => r
                                .zeroOrMore(r => r
                                    .ref(() => $NEWLINE),
                                ),
                            )
                            .and(r => r
                                .zeroOrMore(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .ref(() => $paragraph_item_child)
                                            , "_target")
                                            .and(r => r
                                                .zeroOrMore(r => r
                                                    .ref(() => $NEWLINE),
                                                ),
                                            ),
                                        )
                                    , (({ _target }) => {
                                        return _target;
                                    }),
                                    ),
                                )
                            , "target_rest")
                            .and(r => r
                                .ref(() => $DEDENT),
                            ),
                        )
                    , (({ target, target_rest }) => {
                        return [target].concat(target_rest);
                    }),
                    ),
                )
            , "children2")
            .and(r => r
                .zeroOrMore(r => r
                    .ref(() => $suppl_note),
                )
            , "suppl_notes"),
        )
    , (({ article_caption, article_title, inline_contents, lists, children1, paragraphs, children2, suppl_notes }) => {
        const article = new EL(
            "Article",
            { Delete: "false", Hide: "false" },
        );
        if (article_caption !== null) {
            article.append(new EL("ArticleCaption", {}, [article_caption]));
        }
        article.append(new EL("ArticleTitle", {}, [article_title]));

        const num = parseNamedNum(article_title);
        if (num) {
            article.attr.Num = num;
        }

        const paragraph = new EL("Paragraph");
        paragraph.attr.Num = "1";
        paragraph.attr.OldStyle = "false";
        paragraph.attr.Delete = "false";
        article.append(paragraph);

        paragraph.append(new EL("ParagraphNum"));
        paragraph.append(new EL("ParagraphSentence", {}, inline_contents));
        paragraph.extend(lists || []);
        paragraph.extend(children1 || []);
        paragraph.extend(children2 || []);

        article.extend(paragraphs);
        article.extend(suppl_notes);

        return article;
    }),
    )
    ;

export const $suppl_note = factory
    .withName("suppl_note")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual(":SupplNote:"),
            )
            .and(r => r
                .ref(() => $_),
            )
            .and(r => r
                .ref(() => $INLINE)
            , "inline")
            .and(r => r
                .oneOrMore(r => r
                    .ref(() => $NEWLINE),
                ),
            ),
        )
    , (({ inline }) => {
        return new EL("SupplNote", {}, inline);
    }),
    )
    ;

export const $paragraph_item: ValueRule<EL> = factory
    .withName("paragraph_item")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .zeroOrOne(r => r
                    .ref(() => $article_paragraph_caption),
                )
            , "paragraph_caption")
            .and(r => r
                .asSlice(r => r
                    .sequence(c => c
                        .and(r => r
                            .nextIsNot(r => r
                                .ref(() => $article_title),
                            ),
                        )
                        .and(r => r
                            .nextIsNot(r => r
                                .ref(() => $appdx_table_title),
                            ),
                        )
                        .and(r => r
                            .nextIsNot(r => r
                                .ref(() => $appdx_style_title),
                            ),
                        )
                        .and(r => r
                            .nextIsNot(r => r
                                .ref(() => $appdx_format_title),
                            ),
                        )
                        .and(r => r
                            .nextIsNot(r => r
                                .ref(() => $appdx_fig_title),
                            ),
                        )
                        .and(r => r
                            .nextIsNot(r => r
                                .ref(() => $appdx_note_title),
                            ),
                        )
                        .and(r => r
                            .nextIsNot(r => r
                                .ref(() => $appdx_title),
                            ),
                        )
                        .and(r => r
                            .nextIsNot(r => r
                                .ref(() => $suppl_provision_label),
                            ),
                        )
                        .and(r => r
                            .nextIsNot(r => r
                                .seqEqual(":SupplNote:"),
                            ),
                        )
                        .and(r => r
                            .oneOrMore(r => r
                                .regExp(/^[^ 　\t\r\n条<]/),
                            ),
                        ),
                    ),
                )
            , "paragraph_item_title")
            .and(r => r
                .ref(() => $__),
            )
            .and(r => r
                .ref(() => $columns_or_sentences)
            , "inline_contents")
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
                                    ),
                                )
                            , (({ target }) => {
                                return target;
                            }),
                            ),
                        )
                        .or(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .ref(() => $INDENT),
                                    )
                                    .and(r => r
                                        .ref(() => $paragraph_item_child)
                                    , "target")
                                    .and(r => r
                                        .zeroOrMore(r => r
                                            .ref(() => $NEWLINE),
                                        ),
                                    )
                                    .and(r => r
                                        .zeroOrMore(r => r
                                            .action(r => r
                                                .sequence(c => c
                                                    .and(r => r
                                                        .ref(() => $paragraph_item_child)
                                                    , "_target")
                                                    .and(r => r
                                                        .zeroOrMore(r => r
                                                            .ref(() => $NEWLINE),
                                                        ),
                                                    ),
                                                )
                                            , (({ _target }) => {
                                                return _target;
                                            }),
                                            ),
                                        )
                                    , "target_rest")
                                    .and(r => r
                                        .ref(() => $DEDENT),
                                    ),
                                )
                            , (({ target, target_rest }) => {
                                return [target].concat(target_rest);
                            }),
                            ),
                        )
                        .or(r => r
                            .action(r => r
                                .sequence(c => c
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
                                    , "target1")
                                    .and(r => r
                                        .zeroOrMore(r => r
                                            .ref(() => $NEWLINE),
                                        ),
                                    )
                                    .and(r => r
                                        .ref(() => $DEDENT),
                                    )
                                    .and(r => r
                                        .ref(() => $paragraph_item_child)
                                    , "target2")
                                    .and(r => r
                                        .zeroOrMore(r => r
                                            .ref(() => $NEWLINE),
                                        ),
                                    )
                                    .and(r => r
                                        .zeroOrMore(r => r
                                            .action(r => r
                                                .sequence(c => c
                                                    .and(r => r
                                                        .ref(() => $paragraph_item_child)
                                                    , "_target")
                                                    .and(r => r
                                                        .zeroOrMore(r => r
                                                            .ref(() => $NEWLINE),
                                                        ),
                                                    ),
                                                )
                                            , (({ _target }) => {
                                                return _target;
                                            }),
                                            ),
                                        )
                                    , "target2_rest")
                                    .and(r => r
                                        .ref(() => $DEDENT),
                                    ),
                                )
                            , (({ target1, target2, target2_rest }) => {
                                return [...target1, target2, ...target2_rest];
                            }),
                            ),
                        ),
                    ),
                )
            , "children"),
        )
    , (({ state, location, paragraph_caption, paragraph_item_title, inline_contents, children }) => {
        const lineno = location().start.line;
        let indent = state.indentMemo[lineno];

        if (state.baseIndentStack.length > 0) {
            const [base_indent, is_first, base_lineno] = state.baseIndentStack[state.baseIndentStack.length - 1];
            if (!is_first || lineno !== base_lineno) {
                indent -= base_indent;
            }
        }

        const paragraph_item = new EL(
            paragraphItemTags[indent],
            { Hide: "false" },
        );
        if (indent === 0) {
            paragraph_item.attr.OldStyle = "false";
        } else {
            paragraph_item.attr.Delete = "false";
        }
        if (paragraph_caption !== null) {
            paragraph_item.append(new EL("ParagraphCaption", {}, [paragraph_caption]));
        }

        paragraph_item.append(new EL(paragraphItemTitleTags[indent], {}, [paragraph_item_title]));

        // let num = parseNamedNum(paragraph_item_title);
        // if(num) {
        //     paragraph_item.attr.Num = num;
        // }

        paragraph_item.append(new EL(paragraphItemSentenceTags[indent], {}, inline_contents));

        if (children) {
            setItemNum(children);
        }

        paragraph_item.extend(children || []);

        return paragraph_item;
    }),
    )
    ;

export const $in_table_column_paragraph_items = factory
    .withName("in_table_column_paragraph_items")
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .asSlice(r => r
                            .sequence(c => c
                                .and(r => r
                                    .nextIsNot(r => r
                                        .ref(() => $article_title),
                                    ),
                                )
                                .and(r => r
                                    .nextIsNot(r => r
                                        .ref(() => $appdx_table_title),
                                    ),
                                )
                                .and(r => r
                                    .nextIsNot(r => r
                                        .ref(() => $appdx_style_title),
                                    ),
                                )
                                .and(r => r
                                    .nextIsNot(r => r
                                        .ref(() => $appdx_format_title),
                                    ),
                                )
                                .and(r => r
                                    .nextIsNot(r => r
                                        .ref(() => $appdx_fig_title),
                                    ),
                                )
                                .and(r => r
                                    .nextIsNot(r => r
                                        .ref(() => $appdx_note_title),
                                    ),
                                )
                                .and(r => r
                                    .nextIsNot(r => r
                                        .ref(() => $appdx_title),
                                    ),
                                )
                                .and(r => r
                                    .nextIsNot(r => r
                                        .ref(() => $suppl_provision_label),
                                    ),
                                )
                                .and(r => r
                                    .oneOrMore(r => r
                                        .regExp(/^[^ 　\t\r\n条<]/),
                                    ),
                                ),
                            ),
                        )
                    , "paragraph_item_title")
                    .and(r => r
                        .ref(() => $__),
                    )
                    .and(r => r
                        .ref(() => $columns_or_sentences)
                    , "inline_contents")
                    .and(r => r
                        .oneOrMore(r => r
                            .ref(() => $NEWLINE),
                        ),
                    )
                    .and(r => r
                        .ref(() => $INDENT),
                    )
                    .and(r => r
                        .ref(() => $INDENT),
                    )
                    .and(r => r
                        .zeroOrOne(r => r
                            .choice(c => c
                                .or(r => r
                                    .action(r => r
                                        .sequence(c => c
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
                                            ),
                                        )
                                    , (({ target }) => {
                                        return target;
                                    }),
                                    ),
                                )
                                .or(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .ref(() => $INDENT),
                                            )
                                            .and(r => r
                                                .ref(() => $paragraph_item_child)
                                            , "target")
                                            .and(r => r
                                                .zeroOrMore(r => r
                                                    .ref(() => $NEWLINE),
                                                ),
                                            )
                                            .and(r => r
                                                .zeroOrMore(r => r
                                                    .action(r => r
                                                        .sequence(c => c
                                                            .and(r => r
                                                                .ref(() => $paragraph_item_child)
                                                            , "_target")
                                                            .and(r => r
                                                                .zeroOrMore(r => r
                                                                    .ref(() => $NEWLINE),
                                                                ),
                                                            ),
                                                        )
                                                    , (({ _target }) => {
                                                        return _target;
                                                    }),
                                                    ),
                                                )
                                            , "target_rest")
                                            .and(r => r
                                                .ref(() => $DEDENT),
                                            ),
                                        )
                                    , (({ target, target_rest }) => {
                                        return [target].concat(target_rest);
                                    }),
                                    ),
                                )
                                .or(r => r
                                    .action(r => r
                                        .sequence(c => c
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
                                            , "target1")
                                            .and(r => r
                                                .zeroOrMore(r => r
                                                    .ref(() => $NEWLINE),
                                                ),
                                            )
                                            .and(r => r
                                                .ref(() => $DEDENT),
                                            )
                                            .and(r => r
                                                .ref(() => $paragraph_item_child)
                                            , "target2")
                                            .and(r => r
                                                .zeroOrMore(r => r
                                                    .ref(() => $NEWLINE),
                                                ),
                                            )
                                            .and(r => r
                                                .zeroOrMore(r => r
                                                    .action(r => r
                                                        .sequence(c => c
                                                            .and(r => r
                                                                .ref(() => $paragraph_item_child)
                                                            , "_target")
                                                            .and(r => r
                                                                .zeroOrMore(r => r
                                                                    .ref(() => $NEWLINE),
                                                                ),
                                                            ),
                                                        )
                                                    , (({ _target }) => {
                                                        return _target;
                                                    }),
                                                    ),
                                                )
                                            , "target2_rest")
                                            .and(r => r
                                                .ref(() => $DEDENT),
                                            ),
                                        )
                                    , (({ target1, target2, target2_rest }) => {
                                        return [...target1, target2, ...target2_rest];
                                    }),
                                    ),
                                ),
                            ),
                        )
                    , "children")
                    .and(r => r
                        .zeroOrMore(r => r
                            .ref(() => $paragraph_item),
                        )
                    , "rest")
                    .and(r => r
                        .ref(() => $DEDENT),
                    )
                    .and(r => r
                        .ref(() => $DEDENT),
                    ),
                )
            , (({ state, location, paragraph_item_title, inline_contents, children, rest }) => {
                const lineno = location().start.line;
                let indent = state.indentMemo[lineno];

                if (state.baseIndentStack.length > 0) {
                    const [base_indent, is_first, base_lineno] = state.baseIndentStack[state.baseIndentStack.length - 1];
                    if (!is_first || lineno !== base_lineno) {
                        indent -= base_indent;
                    }
                }

                const paragraph_item = new EL(
                    paragraphItemTags[indent],
                    { Hide: "false" },
                );
                if (indent === 0) {
                    paragraph_item.attr.OldStyle = "false";
                } else {
                    paragraph_item.attr.Delete = "false";
                }

                paragraph_item.append(new EL(paragraphItemTitleTags[indent], {}, [paragraph_item_title]));

                // let num = parseNamedNum(paragraph_item_title);
                // if(num) {
                //     paragraph_item.attr.Num = num;
                // }

                paragraph_item.append(new EL(paragraphItemSentenceTags[indent], {}, inline_contents));

                if (children) {
                    setItemNum(children);
                }

                paragraph_item.extend(children || []);

                return [paragraph_item, ...rest];
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .asSlice(r => r
                            .sequence(c => c
                                .and(r => r
                                    .nextIsNot(r => r
                                        .ref(() => $article_title),
                                    ),
                                )
                                .and(r => r
                                    .nextIsNot(r => r
                                        .ref(() => $appdx_table_title),
                                    ),
                                )
                                .and(r => r
                                    .nextIsNot(r => r
                                        .ref(() => $appdx_style_title),
                                    ),
                                )
                                .and(r => r
                                    .nextIsNot(r => r
                                        .ref(() => $appdx_format_title),
                                    ),
                                )
                                .and(r => r
                                    .nextIsNot(r => r
                                        .ref(() => $appdx_fig_title),
                                    ),
                                )
                                .and(r => r
                                    .nextIsNot(r => r
                                        .ref(() => $appdx_note_title),
                                    ),
                                )
                                .and(r => r
                                    .nextIsNot(r => r
                                        .ref(() => $appdx_title),
                                    ),
                                )
                                .and(r => r
                                    .nextIsNot(r => r
                                        .ref(() => $suppl_provision_label),
                                    ),
                                )
                                .and(r => r
                                    .oneOrMore(r => r
                                        .regExp(/^[^ 　\t\r\n条<]/),
                                    ),
                                ),
                            ),
                        )
                    , "paragraph_item_title")
                    .and(r => r
                        .ref(() => $__),
                    )
                    .and(r => r
                        .ref(() => $columns_or_sentences)
                    , "inline_contents")
                    .and(r => r
                        .oneOrMore(r => r
                            .ref(() => $NEWLINE),
                        ),
                    )
                    .and(r => r
                        .nextIsNot(r => r
                            .ref(() => $INDENT),
                        ),
                    ),
                )
            , (({ state, location, paragraph_item_title, inline_contents }) => {
                const lineno = location().start.line;
                let indent = state.indentMemo[lineno];

                if (state.baseIndentStack.length > 0) {
                    const [base_indent, is_first, base_lineno] = state.baseIndentStack[state.baseIndentStack.length - 1];
                    if (!is_first || lineno !== base_lineno) {
                        indent -= base_indent;
                    }
                }

                const paragraph_item = new EL(
                    paragraphItemTags[indent],
                    { Hide: "false" },
                );
                if (indent === 0) {
                    paragraph_item.attr.OldStyle = "false";
                } else {
                    paragraph_item.attr.Delete = "false";
                }

                paragraph_item.append(new EL(paragraphItemTitleTags[indent], {}, [paragraph_item_title]));

                // let num = parseNamedNum(paragraph_item_title);
                // if(num) {
                //     paragraph_item.attr.Num = num;
                // }

                paragraph_item.append(new EL(paragraphItemSentenceTags[indent], {}, inline_contents));

                return [paragraph_item];
            }),
            ),
        ),
    )
    ;

export const $no_name_paragraph_item: ValueRule<EL> = factory
    .withName("no_name_paragraph_item")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .zeroOrOne(r => r
                    .ref(() => $article_paragraph_caption),
                )
            , "paragraph_caption")
            .and(r => r
                .ref(() => $columns_or_sentences)
            , "inline_contents")
            .and(r => r
                .oneOrMore(r => r
                    .ref(() => $NEWLINE),
                ),
            )
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
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
                            ),
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
                            .and(r => r
                                .ref(() => $INDENT),
                            )
                            .and(r => r
                                .ref(() => $paragraph_item_child)
                            , "target")
                            .and(r => r
                                .zeroOrMore(r => r
                                    .ref(() => $NEWLINE),
                                ),
                            )
                            .and(r => r
                                .zeroOrMore(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .ref(() => $paragraph_item_child)
                                            , "_target")
                                            .and(r => r
                                                .zeroOrMore(r => r
                                                    .ref(() => $NEWLINE),
                                                ),
                                            ),
                                        )
                                    , (({ _target }) => {
                                        return _target;
                                    }),
                                    ),
                                )
                            , "target_rest")
                            .and(r => r
                                .ref(() => $DEDENT),
                            ),
                        )
                    , (({ target, target_rest }) => {
                        return [target].concat(target_rest);
                    }),
                    ),
                )
            , "children"),
        )
    , (({ state, location, paragraph_caption, inline_contents, lists, children }) => {
        const lineno = location().start.line;
        let indent = state.indentMemo[lineno];

        if (state.baseIndentStack.length > 0) {
            const [base_indent, is_first, base_lineno] = state.baseIndentStack[state.baseIndentStack.length - 1];
            if (!is_first || lineno !== base_lineno) {
                indent -= base_indent;
            }
        }

        const paragraph_item = new EL(
            paragraphItemTags[indent],
            { Hide: "false", Num: "1" },
        );
        if (indent === 0) {
            paragraph_item.attr.OldStyle = "false";
        } else {
            paragraph_item.attr.Delete = "false";
        }
        if (paragraph_caption !== null) {
            paragraph_item.append(new EL("ParagraphCaption", {}, [paragraph_caption]));
        }
        paragraph_item.append(new EL(paragraphItemTitleTags[indent]));
        paragraph_item.append(new EL(paragraphItemSentenceTags[indent], {}, inline_contents));
        paragraph_item.extend(lists || []);

        if (children) {
            setItemNum(children);
        }
        paragraph_item.extend(children || []);

        return paragraph_item;
    }),
    )
    ;

export const $paragraph_item_child: ValueRule<EL> = factory
    .withName("paragraph_item_child")
    .choice(c => c
        .or(r => r
            .ref(() => $fig_struct),
        )
        .or(r => r
            .ref(() => $amend_provision),
        )
        .or(r => r
            .ref(() => $table_struct),
        )
        .or(r => r
            .ref(() => $paragraph_item),
        )
        .or(r => r
            .ref(() => $style_struct),
        ),
    )
    ;

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

export const $amend_provision = factory
    .withName("amend_provision")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual(":AmendProvision:"),
            )
            .and(r => r
                .ref(() => $NEWLINE),
            )
            .and(r => r
                .oneOrMore(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .choice(c => c
                                    .or(r => r
                                        .ref(() => $xml_element),
                                    )
                                    .or(r => r
                                        .action(r => r
                                            .sequence(c => c
                                                .and(r => r
                                                    .ref(() => $INLINE)
                                                , "_inline"),
                                            )
                                        , (({ _inline }) => {
                                            return new EL("AmendProvisionSentence", {}, [new EL("Sentence", {}, _inline)]);
                                        }),
                                        ),
                                    ),
                                )
                            , "inline")
                            .and(r => r
                                .ref(() => $NEWLINE),
                            ),
                        )
                    , (({ inline }) => {
                        return inline;
                    }),
                    ),
                )
            , "target"),
        )
    , (({ target }) => {
        return new EL("AmendProvision", {}, target);
    }),
    )
    ;

export const $table_struct: ValueRule<EL> = factory
    .withName("table_struct")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .nextIsNot(r => r
                    .ref(() => $INDENT),
                ),
            )
            .and(r => r
                .nextIsNot(r => r
                    .ref(() => $DEDENT),
                ),
            )
            .and(r => r
                .nextIsNot(r => r
                    .ref(() => $NEWLINE),
                ),
            )
            .and(r => r
                .zeroOrOne(r => r
                    .sequence(c => c
                        .and(r => r
                            .seqEqual(":table-struct:"),
                        )
                        .and(r => r
                            .ref(() => $NEWLINE),
                        ),
                    ),
                ),
            )
            .and(r => r
                .zeroOrOne(r => r
                    .ref(() => $table_struct_title),
                )
            , "table_struct_title")
            .and(r => r
                .zeroOrMore(r => r
                    .ref(() => $remarks),
                )
            , "remarkses1")
            .and(r => r
                .ref(() => $table)
            , "table")
            .and(r => r
                .zeroOrMore(r => r
                    .ref(() => $remarks),
                )
            , "remarkses2"),
        )
    , (({ table_struct_title, remarkses1, table, remarkses2 }) => {
        const table_struct = new EL("TableStruct");

        if (table_struct_title !== null) {
            table_struct.append(table_struct_title);
        }

        table_struct.extend(remarkses1);

        table_struct.append(table);

        table_struct.extend(remarkses2);

        return table_struct;
    }),
    )
    ;

export const $table_struct_title: ValueRule<EL> = factory
    .withName("table_struct_title")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual(":table-struct-title:"),
            )
            .and(r => r
                .ref(() => $_),
            )
            .and(r => r
                .asSlice(r => r
                    .ref(() => $INLINE),
                )
            , "title")
            .and(r => r
                .ref(() => $NEWLINE),
            ),
        )
    , (({ title }) => {
        return new EL("TableStructTitle", {}, [new __Text(title)]);
    }),
    )
    ;

export const $table: ValueRule<EL> = factory
    .withName("table")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .oneOrMore(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .seqEqual("["),
                                            )
                                            .and(r => r
                                                .asSlice(r => r
                                                    .oneOrMore(r => r
                                                        .regExp(/^[^ 　\t\r\n\]=]/),
                                                    ),
                                                )
                                            , "name")
                                            .and(r => r
                                                .seqEqual("=\""),
                                            )
                                            .and(r => r
                                                .asSlice(r => r
                                                    .oneOrMore(r => r
                                                        .regExp(/^[^ 　\t\r\n\]"]/),
                                                    ),
                                                )
                                            , "value")
                                            .and(r => r
                                                .seqEqual("\"]"),
                                            ),
                                        )
                                    , (({ name, value }) => {
                                        return [name, value];
                                    }),
                                    ),
                                )
                            , "target")
                            .and(r => r
                                .ref(() => $NEWLINE),
                            ),
                        )
                    , (({ target }) => {
                        return target;
                    }),
                    ),
                )
            , "attr")
            .and(r => r
                .oneOrMore(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .seqEqual("*"),
                            )
                            .and(r => r
                                .ref(() => $__),
                            )
                            .and(r => r
                                .ref(() => $table_column)
                            , "first")
                            .and(r => r
                                .zeroOrMore(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .choice(c => c
                                                    .or(r => r
                                                        .seqEqual("  "),
                                                    )
                                                    .or(r => r
                                                        .seqEqual("　"),
                                                    )
                                                    .or(r => r
                                                        .seqEqual("\t"),
                                                    ),
                                                ),
                                            )
                                            .and(r => r
                                                .ref(() => $table_column)
                                            , "target"),
                                        )
                                    , (({ target }) => {
                                        return target;
                                    }),
                                    ),
                                )
                            , "rest"),
                        )
                    , (({ first, rest }) => {
                        return [first].concat(rest);
                    }),
                    ),
                )
            , "table_row_columns"),
        )
    , (({ attr, table_row_columns }) => {
        const table = new EL("Table");
        if (attr) {
            for (let i = 0; i < attr.length; i++) {
                const [name, value] = attr[i];
                table.attr[name] = value;
            }
        }
        for (let i = 0; i < table_row_columns.length; i++) {
            const table_row = new EL("TableRow", {}, table_row_columns[i]);
            table.append(table_row);
        }

        return table;
    }),
    )
    ;

export const $table_column_attr_name = factory
    .choice(c => c
        .or(r => r
            .seqEqual("BorderTop"),
        )
        .or(r => r
            .seqEqual("BorderBottom"),
        )
        .or(r => r
            .seqEqual("BorderLeft"),
        )
        .or(r => r
            .seqEqual("BorderRight"),
        )
        .or(r => r
            .seqEqual("rowspan"),
        )
        .or(r => r
            .seqEqual("colspan"),
        )
        .or(r => r
            .seqEqual("Align"),
        )
        .or(r => r
            .seqEqual("Valign"),
        ),
    )
    ;

export const $table_column: ValueRule<EL> = factory
    .withName("table_column")
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .seqEqual("-"),
                    )
                    .and(r => r
                        .ref(() => $__),
                    )
                    .and(r => r
                        .zeroOrMore(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .seqEqual("["),
                                    )
                                    .and(r => r
                                        .asSlice(r => r
                                            .ref(() => $table_column_attr_name),
                                        )
                                    , "name")
                                    .and(r => r
                                        .seqEqual("=\""),
                                    )
                                    .and(r => r
                                        .asSlice(r => r
                                            .oneOrMore(r => r
                                                .regExp(/^[^ 　\t\r\n\]"]/),
                                            ),
                                        )
                                    , "value")
                                    .and(r => r
                                        .seqEqual("\"]"),
                                    ),
                                )
                            , (({ name, value }) => {
                                return [name, value];
                            }),
                            ),
                        )
                    , "attr")
                    .and(r => r
                        .choice(c => c
                            .or(r => r
                                .action(r => r
                                    .sequence(c => c
                                        .and(r => r
                                            .choice(c => c
                                                .or(r => r
                                                    .ref(() => $remarks),
                                                )
                                                .or(r => r
                                                    .ref(() => $fig_struct),
                                                ),
                                            )
                                        , "first")
                                        .and(r => r
                                            .zeroOrOne(r => r
                                                .action(r => r
                                                    .sequence(c => c
                                                        .and(r => r
                                                            .ref(() => $INDENT),
                                                        )
                                                        .and(r => r
                                                            .ref(() => $INDENT),
                                                        )
                                                        .and(r => r
                                                            .oneOrMore(r => r
                                                                .action(r => r
                                                                    .sequence(c => c
                                                                        .and(r => r
                                                                            .ref(() => $fig_struct)
                                                                        , "_target"),
                                                                    )
                                                                , (({ _target }) => {
                                                                    return _target;
                                                                }),
                                                                ),
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
                                                        ),
                                                    )
                                                , (({ target }) => {
                                                    return target;
                                                }),
                                                ),
                                            )
                                        , "rest"),
                                    )
                                , (({ first, rest }) => {
                                    return [first, ...(rest || [])];
                                }),
                                ),
                            )
                            .or(r => r
                                .ref(() => $in_table_column_paragraph_items),
                            )
                            .or(r => r
                                .action(r => r
                                    .sequence(c => c
                                        .and(r => r
                                            .action(r => r
                                                .sequence(c => c
                                                    .and(r => r
                                                        .zeroOrOne(r => r
                                                            .ref(() => $INLINE),
                                                        )
                                                    , "inline")
                                                    .and(r => r
                                                        .ref(() => $NEWLINE),
                                                    ),
                                                )
                                            , (({ inline }) => {
                                                return new EL(
                                                    "Sentence",
                                                    {},
                                                    inline || [],
                                                );
                                            }),
                                            )
                                        , "first")
                                        .and(r => r
                                            .zeroOrOne(r => r
                                                .action(r => r
                                                    .sequence(c => c
                                                        .and(r => r
                                                            .ref(() => $INDENT),
                                                        )
                                                        .and(r => r
                                                            .ref(() => $INDENT),
                                                        )
                                                        .and(r => r
                                                            .oneOrMore(r => r
                                                                .action(r => r
                                                                    .sequence(c => c
                                                                        .and(r => r
                                                                            .action(r => r
                                                                                .sequence(c => c
                                                                                    .and(r => r
                                                                                        .ref(() => $INLINE)
                                                                                    , "inline")
                                                                                    .and(r => r
                                                                                        .ref(() => $NEWLINE),
                                                                                    ),
                                                                                )
                                                                            , (({ inline }) => {
                                                                                return new EL(
                                                                                    "Sentence",
                                                                                    {},
                                                                                    inline,
                                                                                );
                                                                            }),
                                                                            )
                                                                        , "_target"),
                                                                    )
                                                                , (({ _target }) => {
                                                                    return _target;
                                                                }),
                                                                ),
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
                                                        ),
                                                    )
                                                , (({ target }) => {
                                                    return target;
                                                }),
                                                ),
                                            )
                                        , "rest"),
                                    )
                                , (({ first, rest }) => {
                                    return [first, ...(rest || [])];
                                }),
                                ),
                            ),
                        )
                    , "children"),
                )
            , (({ attr, children }) => {
                const table_column = new EL("TableColumn");
                for (let i = 0; i < attr.length; i++) {
                    const [name, value] = attr[i];
                    table_column.attr[name] = value;
                }

                table_column.extend(children);

                return table_column;
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .seqEqual("-"),
                    )
                    .and(r => r
                        .ref(() => $_),
                    )
                    .and(r => r
                        .ref(() => $NEWLINE),
                    ),
                )
            , (() => {
                return new EL(
                    "TableColumn",
                    {
                        BorderTop: "solid",
                        BorderRight: "solid",
                        BorderBottom: "solid",
                        BorderLeft: "solid",
                    },
                    [new EL("Sentence")],
                );
            }),
            ),
        ),
    )
    ;

export const $style_struct = factory
    .withName("style_struct")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .nextIsNot(r => r
                    .ref(() => $INDENT),
                ),
            )
            .and(r => r
                .nextIsNot(r => r
                    .ref(() => $DEDENT),
                ),
            )
            .and(r => r
                .nextIsNot(r => r
                    .ref(() => $NEWLINE),
                ),
            )
            .and(r => r
                .zeroOrOne(r => r
                    .ref(() => $style_struct_title),
                )
            , "style_struct_title")
            .and(r => r
                .zeroOrMore(r => r
                    .ref(() => $remarks),
                )
            , "remarkses1")
            .and(r => r
                .ref(() => $style)
            , "style")
            .and(r => r
                .zeroOrMore(r => r
                    .ref(() => $remarks),
                )
            , "remarkses2"),
        )
    , (({ style_struct_title, remarkses1, style, remarkses2 }) => {
        const style_struct = new EL("StyleStruct");

        if (style_struct_title !== null) {
            style_struct.append(style_struct_title);
        }

        style_struct.extend(remarkses1);

        style_struct.append(style);

        style_struct.extend(remarkses2);

        return style_struct;
    }),
    )
    ;

export const $style_struct_title = factory
    .withName("style_struct_title")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual(":style-struct-title:"),
            )
            .and(r => r
                .ref(() => $_),
            )
            .and(r => r
                .asSlice(r => r
                    .ref(() => $INLINE),
                )
            , "title")
            .and(r => r
                .ref(() => $NEWLINE),
            ),
        )
    , (({ title }) => {
        return new EL("StyleStructTitle", {}, [new __Text(title)]);
    }),
    )
    ;

export const $style = factory
    .withName("style")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
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
                            ),
                        )
                    , (({ target }) => {
                        return target;
                    }),
                    ),
                )
            , "lists")
            .and(r => r
                .oneOrMore(r => r
                    .choice(c => c
                        .or(r => r
                            .ref(() => $table),
                        )
                        .or(r => r
                            .ref(() => $table_struct),
                        )
                        .or(r => r
                            .ref(() => $fig),
                        )
                        .or(r => r
                            .ref(() => $fig_struct),
                        )
                        .or(r => r
                            .ref(() => $paragraph_item),
                        ),
                    ),
                )
            , "children"),
        )
    , (({ lists, children }) => {
        return new EL("Style", {}, [...(lists || []), ...children]);
    }),
    )
    ;

export const $format_struct = factory
    .withName("format_struct")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .nextIsNot(r => r
                    .ref(() => $INDENT),
                ),
            )
            .and(r => r
                .nextIsNot(r => r
                    .ref(() => $DEDENT),
                ),
            )
            .and(r => r
                .nextIsNot(r => r
                    .ref(() => $NEWLINE),
                ),
            )
            .and(r => r
                .zeroOrOne(r => r
                    .ref(() => $format_struct_title),
                )
            , "format_struct_title")
            .and(r => r
                .zeroOrMore(r => r
                    .ref(() => $remarks),
                )
            , "remarkses1")
            .and(r => r
                .ref(() => $format)
            , "format")
            .and(r => r
                .zeroOrMore(r => r
                    .ref(() => $remarks),
                )
            , "remarkses2"),
        )
    , (({ format_struct_title, remarkses1, format, remarkses2 }) => {
        const format_struct = new EL("FormatStruct");

        if (format_struct_title !== null) {
            format_struct.append(format_struct_title);
        }

        format_struct.extend(remarkses1);

        format_struct.append(format);

        format_struct.extend(remarkses2);

        return format_struct;
    }),
    )
    ;

export const $format_struct_title = factory
    .withName("format_struct_title")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual(":format-struct-title:"),
            )
            .and(r => r
                .ref(() => $_),
            )
            .and(r => r
                .asSlice(r => r
                    .ref(() => $INLINE),
                )
            , "title")
            .and(r => r
                .ref(() => $NEWLINE),
            ),
        )
    , (({ title }) => {
        return new EL("FormatStructTitle", {}, [new __Text(title)]);
    }),
    )
    ;

export const $format = factory
    .withName("format")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .choice(c => c
                    .or(r => r
                        .action(r => r
                            .sequence(c => c
                                .and(r => r
                                    .ref(() => $fig)
                                , "fig"),
                            )
                        , (({ fig }) => {
                            return [fig];
                        }),
                        ),
                    )
                    .or(r => r
                        .ref(() => $columns_or_sentences),
                    ),
                )
            , "children"),
        )
    , (({ children }) => {
        return new EL("Format", {}, children);
    }),
    )
    ;

export const $note_struct = factory
    .withName("note_struct")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .nextIsNot(r => r
                    .ref(() => $INDENT),
                ),
            )
            .and(r => r
                .nextIsNot(r => r
                    .ref(() => $DEDENT),
                ),
            )
            .and(r => r
                .nextIsNot(r => r
                    .ref(() => $NEWLINE),
                ),
            )
            .and(r => r
                .zeroOrOne(r => r
                    .ref(() => $note_struct_title),
                )
            , "note_struct_title")
            .and(r => r
                .zeroOrMore(r => r
                    .ref(() => $remarks),
                )
            , "remarkses1")
            .and(r => r
                .ref(() => $note)
            , "note")
            .and(r => r
                .zeroOrMore(r => r
                    .ref(() => $remarks),
                )
            , "remarkses2"),
        )
    , (({ note_struct_title, remarkses1, note, remarkses2 }) => {
        const note_struct = new EL("NoteStruct");

        if (note_struct_title !== null) {
            note_struct.append(note_struct_title);
        }

        note_struct.extend(remarkses1);

        note_struct.append(note);

        note_struct.extend(remarkses2);

        return note_struct;
    }),
    )
    ;

export const $note_struct_title = factory
    .withName("note_struct_title")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual(":note-struct-title:"),
            )
            .and(r => r
                .ref(() => $_),
            )
            .and(r => r
                .asSlice(r => r
                    .ref(() => $INLINE),
                )
            , "title")
            .and(r => r
                .ref(() => $NEWLINE),
            ),
        )
    , (({ title }) => {
        return new EL("NoteStructTitle", {}, [new __Text(title)]);
    }),
    )
    ;

export const $note = factory
    .withName("note")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .choice(c => c
                    .or(r => r
                        .action(r => r
                            .sequence(c => c
                                .and(r => r
                                    .ref(() => $table)
                                , "table"),
                            )
                        , (({ table }) => {
                            return [table];
                        }),
                        ),
                    )
                    .or(r => r
                        .action(r => r
                            .sequence(c => c
                                .and(r => r
                                    .ref(() => $fig)
                                , "fig"),
                            )
                        , (({ fig }) => {
                            return [fig];
                        }),
                        ),
                    )
                    .or(r => r
                        .sequence(c => c
                            .and(r => r
                                .action(r => r
                                    .sequence(c => c
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
                                        ),
                                    )
                                , (({ target }) => {
                                    return target;
                                }),
                                )
                            , "lists"),
                        ),
                    )
                    .or(r => r
                        .action(r => r
                            .sequence(c => c
                                .and(r => r
                                    .oneOrMore(r => r
                                        .ref(() => $paragraph_item),
                                    )
                                , "paragraph_items"),
                            )
                        , (({ paragraph_items }) => {
                            return paragraph_items;
                        }),
                        ),
                    )
                    .or(r => r
                        .action(r => r
                            .sequence(c => c
                                .and(r => r
                                    .ref(() => $xml_element)
                                , "arith_formula"),
                            )
                        , (({ arith_formula }) => {
                            return [arith_formula];
                        }),
                        ),
                    ),
                )
            , "children"),
        )
    , (({ children }) => {
        return new EL("Note", {}, children);
    }),
    )
    ;

export const $remarks = factory
    .withName("remarks")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .zeroOrMore(r => r
                                .action(r => r
                                    .sequence(c => c
                                        .and(r => r
                                            .seqEqual("["),
                                        )
                                        .and(r => r
                                            .asSlice(r => r
                                                .oneOrMore(r => r
                                                    .regExp(/^[^ 　\t\r\n\]=]/),
                                                ),
                                            )
                                        , "name")
                                        .and(r => r
                                            .seqEqual("=\""),
                                        )
                                        .and(r => r
                                            .asSlice(r => r
                                                .oneOrMore(r => r
                                                    .regExp(/^[^ 　\t\r\n\]"]/),
                                                ),
                                            )
                                        , "value")
                                        .and(r => r
                                            .seqEqual("\"]"),
                                        ),
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
            , "label_attr")
            .and(r => r
                .choice(c => c
                    .or(r => r
                        .action(r => r
                            .sequence(c => c
                                .and(r => r
                                    .seqEqual(":remarks:"),
                                )
                                .and(r => r
                                    .zeroOrMore(r => r
                                        .regExp(/^[^ 　\t\r\n]/),
                                    ),
                                ),
                            )
                        , (() => {
                            return "";
                        }),
                        ),
                    )
                    .or(r => r
                        .asSlice(r => r
                            .sequence(c => c
                                .and(r => r
                                    .choice(c => c
                                        .or(r => r
                                            .seqEqual("備考"),
                                        )
                                        .or(r => r
                                            .seqEqual("注"),
                                        )
                                        .or(r => r
                                            .seqEqual("※"),
                                        ),
                                    ),
                                )
                                .and(r => r
                                    .zeroOrMore(r => r
                                        .regExp(/^[^ 　\t\r\n]/),
                                    ),
                                ),
                            ),
                        ),
                    ),
                )
            , "label")
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .ref(() => $__),
                            )
                            .and(r => r
                                .ref(() => $INLINE)
                            , "_target"),
                        )
                    , (({ _target }) => {
                        return new EL(
                            "Sentence",
                            {},
                            _target,
                        );
                    }),
                    ),
                )
            , "first")
            .and(r => r
                .ref(() => $NEWLINE),
            )
            .and(r => r
                .zeroOrOne(r => r
                    .choice(c => c
                        .or(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .ref(() => $INDENT),
                                    )
                                    .and(r => r
                                        .ref(() => $INDENT),
                                    )
                                    .and(r => r
                                        .oneOrMore(r => r
                                            .choice(c => c
                                                .or(r => r
                                                    .action(r => r
                                                        .sequence(c => c
                                                            .and(r => r
                                                                .assert(({ first }) => {
                                                                    return !first;
                                                                }),
                                                            )
                                                            .and(r => r
                                                                .nextIs(r => r
                                                                    .sequence(c => c
                                                                        .and(r => r
                                                                            .seqEqual(""),
                                                                        )
                                                                        .and(r => r
                                                                            .assert(({ state, location }) => {
                                                                                state.baseIndentStack.push([state.indentMemo[location().start.line] - 1, false, location().start.line]); return true;
                                                                            }),
                                                                        ),
                                                                    ),
                                                                ),
                                                            )
                                                            .and(r => r
                                                                .choice(c => c
                                                                    .or(r => r
                                                                        .ref(() => $paragraph_item),
                                                                    )
                                                                    .or(r => r
                                                                        .ref(() => $no_name_paragraph_item),
                                                                    ),
                                                                )
                                                            , "_target")
                                                            .and(r => r
                                                                .nextIs(r => r
                                                                    .sequence(c => c
                                                                        .and(r => r
                                                                            .seqEqual(""),
                                                                        )
                                                                        .and(r => r
                                                                            .assert(({ state }) => {
                                                                                state.baseIndentStack.pop(); return true;
                                                                            }),
                                                                        ),
                                                                    ),
                                                                ),
                                                            ),
                                                        )
                                                    , (({ _target }) => {
                                                        return _target;
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
                                                                            state.baseIndentStack.pop(); return false;
                                                                        }),
                                                                    ),
                                                                ),
                                                            ),
                                                        )
                                                        .and(r => r
                                                            .seqEqual("DUMMY"),
                                                        ),
                                                    ) as unknown as ValueRule<never>,
                                                )
                                                .or(r => r
                                                    .action(r => r
                                                        .sequence(c => c
                                                            .and(r => r
                                                                .ref(() => $INLINE)
                                                            , "_target")
                                                            .and(r => r
                                                                .ref(() => $NEWLINE),
                                                            ),
                                                        )
                                                    , (({ _target }) => {
                                                        return new EL(
                                                            "Sentence",
                                                            {},
                                                            _target,
                                                        );
                                                    }),
                                                    ),
                                                ),
                                            ),
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
                                    ),
                                )
                            , (({ target }) => {
                                return target;
                            }),
                            ),
                        )
                        .or(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .ref(() => $INDENT),
                                    )
                                    .and(r => r
                                        .ref(() => $INDENT),
                                    )
                                    .and(r => r
                                        .ref(() => $INDENT),
                                    )
                                    .and(r => r
                                        .ref(() => $INDENT),
                                    )
                                    .and(r => r
                                        .oneOrMore(r => r
                                            .choice(c => c
                                                .or(r => r
                                                    .action(r => r
                                                        .sequence(c => c
                                                            .and(r => r
                                                                .assert(({ first }) => {
                                                                    return !first;
                                                                }),
                                                            )
                                                            .and(r => r
                                                                .nextIs(r => r
                                                                    .sequence(c => c
                                                                        .and(r => r
                                                                            .seqEqual(""),
                                                                        )
                                                                        .and(r => r
                                                                            .assert(({ state, location }) => {
                                                                                state.baseIndentStack.push([state.indentMemo[location().start.line] - 1, false, location().start.line]); return true;
                                                                            }),
                                                                        ),
                                                                    ),
                                                                ),
                                                            )
                                                            .and(r => r
                                                                .choice(c => c
                                                                    .or(r => r
                                                                        .ref(() => $paragraph_item),
                                                                    )
                                                                    .or(r => r
                                                                        .ref(() => $no_name_paragraph_item),
                                                                    ),
                                                                )
                                                            , "_target")
                                                            .and(r => r
                                                                .nextIs(r => r
                                                                    .sequence(c => c
                                                                        .and(r => r
                                                                            .seqEqual(""),
                                                                        )
                                                                        .and(r => r
                                                                            .assert(({ state }) => {
                                                                                state.baseIndentStack.pop(); return true;
                                                                            }),
                                                                        ),
                                                                    ),
                                                                ),
                                                            ),
                                                        )
                                                    , (({ _target }) => {
                                                        return _target;
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
                                                                            state.baseIndentStack.pop(); return false;
                                                                        }),
                                                                    ),
                                                                ),
                                                            ),
                                                        )
                                                        .and(r => r
                                                            .seqEqual("DUMMY"),
                                                        ),
                                                    ) as unknown as ValueRule<never>,
                                                )
                                                .or(r => r
                                                    .action(r => r
                                                        .sequence(c => c
                                                            .and(r => r
                                                                .ref(() => $INLINE)
                                                            , "_target")
                                                            .and(r => r
                                                                .ref(() => $NEWLINE),
                                                            ),
                                                        )
                                                    , (({ _target }) => {
                                                        return new EL(
                                                            "Sentence",
                                                            {},
                                                            _target,
                                                        );
                                                    }),
                                                    ),
                                                ),
                                            ),
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
                                        .ref(() => $DEDENT),
                                    )
                                    .and(r => r
                                        .ref(() => $DEDENT),
                                    ),
                                )
                            , (({ target }) => {
                                return target;
                            }),
                            ),
                        ),
                    ),
                )
            , "rest")
            .and(r => r
                .assert(({ first, rest }) => {
                    return first || (rest && rest.length);
                }),
            ),
        )
    , (({ label_attr, label, first, rest }) => {
        const children = [...(first ? [first] : []), ...(rest ?? [])];
        if (children.length >= 2) {
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child.tag.match(/Sentence|Column/)) {
                    child.attr.Num = "" + (i + 1);
                }
            }
        }

        const remarks = new EL("Remarks");
        remarks.append(new EL("RemarksLabel", label_attr, [new __Text(label)]));
        if (children) {
            setItemNum(children);
        }
        remarks.extend(children);

        return remarks;
    }),
    )
    ;

export const $fig_struct = factory
    .withName("fig_struct")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .zeroOrOne(r => r
                    .sequence(c => c
                        .and(r => r
                            .seqEqual(":fig-struct:"),
                        )
                        .and(r => r
                            .ref(() => $NEWLINE),
                        ),
                    ),
                ),
            )
            .and(r => r
                .ref(() => $fig)
            , "fig")
            .and(r => r
                .zeroOrMore(r => r
                    .ref(() => $remarks),
                )
            , "remarks"),
        )
    , (({ fig, remarks }) => {
        return new EL("FigStruct", {}, [fig].concat(remarks));
    }),
    )
    ;

export const $fig = factory
    .withName("fig")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual(".."),
            )
            .and(r => r
                .ref(() => $__),
            )
            .and(r => r
                .seqEqual("figure"),
            )
            .and(r => r
                .ref(() => $_),
            )
            .and(r => r
                .seqEqual("::"),
            )
            .and(r => r
                .ref(() => $_),
            )
            .and(r => r
                .asSlice(r => r
                    .ref(() => $INLINE),
                )
            , "src")
            .and(r => r
                .ref(() => $NEWLINE),
            ),
        )
    , (({ src }) => {
        return new EL("Fig", { src: src });
    }),
    )
    ;

export const $appdx_item = factory
    .choice(c => c
        .or(r => r
            .ref(() => $appdx),
        )
        .or(r => r
            .ref(() => $appdx_table),
        )
        .or(r => r
            .ref(() => $appdx_style),
        )
        .or(r => r
            .ref(() => $appdx_format),
        )
        .or(r => r
            .ref(() => $appdx_fig),
        )
        .or(r => r
            .ref(() => $appdx_note),
        )
        .or(r => r
            .ref(() => $suppl_provision),
        ),
    )
    ;

export const $appdx_table_title = factory
    .withName("appdx_table_title")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .zeroOrMore(r => r
                                            .action(r => r
                                                .sequence(c => c
                                                    .and(r => r
                                                        .seqEqual("["),
                                                    )
                                                    .and(r => r
                                                        .asSlice(r => r
                                                            .oneOrMore(r => r
                                                                .regExp(/^[^ 　\t\r\n\]=]/),
                                                            ),
                                                        )
                                                    , "name")
                                                    .and(r => r
                                                        .seqEqual("=\""),
                                                    )
                                                    .and(r => r
                                                        .asSlice(r => r
                                                            .oneOrMore(r => r
                                                                .regExp(/^[^ 　\t\r\n\]"]/),
                                                            ),
                                                        )
                                                    , "value")
                                                    .and(r => r
                                                        .seqEqual("\"]"),
                                                    ),
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
                        .and(r => r
                            .choice(c => c
                                .or(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .asSlice(r => r
                                                    .sequence(c => c
                                                        .and(r => r
                                                            .seqEqual("別表"),
                                                        )
                                                        .and(r => r
                                                            .zeroOrMore(r => r
                                                                .regExp(/^[^\r\n(（]/),
                                                            ),
                                                        ),
                                                    ),
                                                )
                                            , "title")
                                            .and(r => r
                                                .zeroOrOne(r => r
                                                    .action(r => r
                                                        .sequence(c => c
                                                            .and(r => r
                                                                .ref(() => $_),
                                                            )
                                                            .and(r => r
                                                                .ref(() => $ROUND_PARENTHESES_INLINE)
                                                            , "target"),
                                                        )
                                                    , (({ target }) => {
                                                        return target;
                                                    }),
                                                    ),
                                                )
                                            , "related_article_num")
                                            .and(r => r
                                                .asSlice(r => r
                                                    .zeroOrMore(r => r
                                                        .regExp(/^[^\r\n(（]/),
                                                    ),
                                                )
                                            , "table_struct_title")
                                            .and(r => r
                                                .nextIs(r => r
                                                    .ref(() => $NEWLINE),
                                                ),
                                            ),
                                        )
                                    , (({ text, title, related_article_num, table_struct_title }) => {
                                        return {
                                            text: text(),
                                            title: title,
                                            related_article_num: related_article_num,
                                            table_struct_title: table_struct_title,
                                        };
                                    }),
                                    ),
                                )
                                .or(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .asSlice(r => r
                                                    .sequence(c => c
                                                        .and(r => r
                                                            .seqEqual("別表"),
                                                        )
                                                        .and(r => r
                                                            .zeroOrMore(r => r
                                                                .regExp(/^[^\r\n(（]/),
                                                            ),
                                                        )
                                                        .and(r => r
                                                            .ref(() => $ROUND_PARENTHESES_INLINE),
                                                        ),
                                                    ),
                                                )
                                            , "title")
                                            .and(r => r
                                                .action(r => r
                                                    .sequence(c => c
                                                        .and(r => r
                                                            .ref(() => $_),
                                                        )
                                                        .and(r => r
                                                            .ref(() => $ROUND_PARENTHESES_INLINE)
                                                        , "target"),
                                                    )
                                                , (({ target }) => {
                                                    return target;
                                                }),
                                                )
                                            , "related_article_num")
                                            .and(r => r
                                                .nextIs(r => r
                                                    .ref(() => $NEWLINE),
                                                ),
                                            ),
                                        )
                                    , (({ text, title, related_article_num }) => {
                                        return {
                                            text: text(),
                                            title: title,
                                            related_article_num: related_article_num,
                                            table_struct_title: "",
                                        };
                                    }),
                                    ),
                                ),
                            )
                        , "target"),
                    )
                , (({ attr, target }) => {
                    return {
                        attr: attr,
                        ...target,
                    };
                }),
                )
            , "title_struct"),
        )
    , (({ title_struct }) => {
        return title_struct;
    }),
    )
    ;

export const $appdx_table = factory
    .withName("appdx_table")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $appdx_table_title)
            , "title_struct")
            .and(r => r
                .oneOrMore(r => r
                    .ref(() => $NEWLINE),
                ),
            )
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .ref(() => $INDENT),
                            )
                            .and(r => r
                                .oneOrMore(r => r
                                    .ref(() => $appdx_table_children),
                                )
                            , "target")
                            .and(r => r
                                .zeroOrMore(r => r
                                    .ref(() => $remarks),
                                )
                            , "remarkses")
                            .and(r => r
                                .zeroOrMore(r => r
                                    .ref(() => $NEWLINE),
                                ),
                            )
                            .and(r => r
                                .ref(() => $DEDENT),
                            ),
                        )
                    , (({ target, remarkses }) => {
                        return target.concat(remarkses);
                    }),
                    ),
                )
            , "children"),
        )
    , (({ location, title_struct, children }) => {
        const appdx_table = new EL("AppdxTable");
        if (title_struct.table_struct_title !== "") {
            console.error(`### line ${location().start.line}: Maybe irregular AppdxTableTitle!`);
            appdx_table.append(new EL("AppdxTableTitle", title_struct.attr, [new __Text( title_struct.text)]));
        } else {
            appdx_table.append(new EL("AppdxTableTitle", title_struct.attr, [new __Text(title_struct.title)]));
            if (title_struct.related_article_num) {
                appdx_table.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
            }
        }

        if (children) {
            setItemNum(children);
        }
        appdx_table.extend(children || []);

        return appdx_table;
    }),
    )
    ;

export const $appdx_table_children = factory
    .withName("appdx_table_children")
    .choice(c => c
        .or(r => r
            .ref(() => $table_struct),
        )
        .or(r => r
            .ref(() => $paragraph_item),
        ),
    )
    ;

export const $suppl_provision_appdx_table_title = factory
    .withName("suppl_provision_appdx_table_title")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .zeroOrMore(r => r
                                            .action(r => r
                                                .sequence(c => c
                                                    .and(r => r
                                                        .seqEqual("["),
                                                    )
                                                    .and(r => r
                                                        .asSlice(r => r
                                                            .oneOrMore(r => r
                                                                .regExp(/^[^ 　\t\r\n\]=]/),
                                                            ),
                                                        )
                                                    , "name")
                                                    .and(r => r
                                                        .seqEqual("=\""),
                                                    )
                                                    .and(r => r
                                                        .asSlice(r => r
                                                            .oneOrMore(r => r
                                                                .regExp(/^[^ 　\t\r\n\]"]/),
                                                            ),
                                                        )
                                                    , "value")
                                                    .and(r => r
                                                        .seqEqual("\"]"),
                                                    ),
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
                        .and(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .asSlice(r => r
                                            .choice(c => c
                                                .or(r => r
                                                    .sequence(c => c
                                                        .and(r => r
                                                            .regExp(/^[附付]/),
                                                        )
                                                        .and(r => r
                                                            .seqEqual("則別表"),
                                                        )
                                                        .and(r => r
                                                            .zeroOrMore(r => r
                                                                .regExp(/^[^\r\n(（]/),
                                                            ),
                                                        ),
                                                    ),
                                                )
                                                .or(r => r
                                                    .sequence(c => c
                                                        .and(r => r
                                                            .regExp(/^[附付]/),
                                                        )
                                                        .and(r => r
                                                            .seqEqual("則"),
                                                        )
                                                        .and(r => r
                                                            .zeroOrMore(r => r
                                                                .regExp(/^[^\r\n(（様]/),
                                                            ),
                                                        )
                                                        .and(r => r
                                                            .seqEqual("様式"),
                                                        )
                                                        .and(r => r
                                                            .zeroOrMore(r => r
                                                                .regExp(/^[^\r\n(（]/),
                                                            ),
                                                        ),
                                                    ),
                                                ),
                                            ),
                                        )
                                    , "title")
                                    .and(r => r
                                        .zeroOrOne(r => r
                                            .action(r => r
                                                .sequence(c => c
                                                    .and(r => r
                                                        .ref(() => $_),
                                                    )
                                                    .and(r => r
                                                        .ref(() => $ROUND_PARENTHESES_INLINE)
                                                    , "target"),
                                                )
                                            , (({ target }) => {
                                                return target;
                                            }),
                                            ),
                                        )
                                    , "related_article_num")
                                    .and(r => r
                                        .asSlice(r => r
                                            .zeroOrMore(r => r
                                                .regExp(/^[^\r\n(（]/),
                                            ),
                                        )
                                    , "table_struct_title"),
                                )
                            , (({ text, title, related_article_num, table_struct_title }) => {
                                return {
                                    text: text(),
                                    title: title,
                                    related_article_num: related_article_num,
                                    table_struct_title: table_struct_title,
                                };
                            }),
                            )
                        , "target"),
                    )
                , (({ attr, target }) => {
                    return {
                        attr: attr,
                        ...target,
                    };
                }),
                )
            , "title_struct"),
        )
    , (({ title_struct }) => {
        return title_struct;
    }),
    )
    ;

export const $suppl_provision_appdx_table = factory
    .withName("suppl_provision_appdx_table")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $suppl_provision_appdx_table_title)
            , "title_struct")
            .and(r => r
                .oneOrMore(r => r
                    .ref(() => $NEWLINE),
                ),
            )
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .ref(() => $INDENT),
                            )
                            .and(r => r
                                .oneOrMore(r => r
                                    .ref(() => $suppl_provision_appdx_table_children),
                                )
                            , "target")
                            .and(r => r
                                .zeroOrMore(r => r
                                    .ref(() => $remarks),
                                )
                            , "remarkses")
                            .and(r => r
                                .zeroOrMore(r => r
                                    .ref(() => $NEWLINE),
                                ),
                            )
                            .and(r => r
                                .ref(() => $DEDENT),
                            ),
                        )
                    , (({ target, remarkses }) => {
                        return target.concat(remarkses);
                    }),
                    ),
                )
            , "children"),
        )
    , (({ location, title_struct, children }) => {
        const suppl_provision_appdx_table = new EL("SupplProvisionAppdxTable");
        if (title_struct.table_struct_title !== "") {
            console.error(`### line ${location().start.line}: Maybe irregular SupplProvisionAppdxTableTitle!`);
            suppl_provision_appdx_table.append(new EL("SupplProvisionAppdxTableTitle", title_struct.attr, [new __Text( title_struct.text)]));
        } else {
            suppl_provision_appdx_table.append(new EL("SupplProvisionAppdxTableTitle", title_struct.attr, [new __Text(title_struct.title)]));
            if (title_struct.related_article_num) {
                suppl_provision_appdx_table.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
            }
        }

        if (children) {
            setItemNum(children);
        }
        suppl_provision_appdx_table.extend(children || []);

        return suppl_provision_appdx_table;
    }),
    )
    ;

export const $suppl_provision_appdx_table_children = factory
    .withName("suppl_provision_appdx_table_children")
    .ref(() => $table_struct)
    ;

export const $appdx_style_title = factory
    .withName("appdx_style_title")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .asSlice(r => r
                                .choice(c => c
                                    .or(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .zeroOrMore(r => r
                                                    .sequence(c => c
                                                        .and(r => r
                                                            .nextIsNot(r => r
                                                                .seqEqual("様式"),
                                                            ),
                                                        )
                                                        .and(r => r
                                                            .nextIsNot(r => r
                                                                .seqEqual("書式"),
                                                            ),
                                                        )
                                                        .and(r => r
                                                            .nextIsNot(r => r
                                                                .regExp(/^[(（]/),
                                                            ),
                                                        )
                                                        .and(r => r
                                                            .ref(() => $CHAR),
                                                        ),
                                                    ),
                                                ),
                                            )
                                            .and(r => r
                                                .choice(c => c
                                                    .or(r => r
                                                        .seqEqual("様式"),
                                                    )
                                                    .or(r => r
                                                        .seqEqual("書式"),
                                                    ),
                                                ),
                                            )
                                            .and(r => r
                                                .zeroOrMore(r => r
                                                    .regExp(/^[^\r\n(（]/),
                                                ),
                                            )
                                            .and(r => r
                                                .ref(() => $ROUND_PARENTHESES_INLINE),
                                            )
                                            .and(r => r
                                                .zeroOrMore(r => r
                                                    .regExp(/^[^\r\n(（]/),
                                                ),
                                            )
                                            .and(r => r
                                                .nextIs(r => r
                                                    .ref(() => $ROUND_PARENTHESES_INLINE),
                                                ),
                                            ),
                                        ),
                                    )
                                    .or(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .zeroOrMore(r => r
                                                    .sequence(c => c
                                                        .and(r => r
                                                            .nextIsNot(r => r
                                                                .seqEqual("様式"),
                                                            ),
                                                        )
                                                        .and(r => r
                                                            .nextIsNot(r => r
                                                                .seqEqual("書式"),
                                                            ),
                                                        )
                                                        .and(r => r
                                                            .nextIsNot(r => r
                                                                .regExp(/^[(（]/),
                                                            ),
                                                        )
                                                        .and(r => r
                                                            .ref(() => $CHAR),
                                                        ),
                                                    ),
                                                ),
                                            )
                                            .and(r => r
                                                .choice(c => c
                                                    .or(r => r
                                                        .seqEqual("様式"),
                                                    )
                                                    .or(r => r
                                                        .seqEqual("書式"),
                                                    ),
                                                ),
                                            )
                                            .and(r => r
                                                .zeroOrMore(r => r
                                                    .regExp(/^[^\r\n(（]/),
                                                ),
                                            ),
                                        ),
                                    ),
                                ),
                            )
                        , "title")
                        .and(r => r
                            .zeroOrOne(r => r
                                .action(r => r
                                    .sequence(c => c
                                        .and(r => r
                                            .ref(() => $_),
                                        )
                                        .and(r => r
                                            .ref(() => $ROUND_PARENTHESES_INLINE)
                                        , "target"),
                                    )
                                , (({ target }) => {
                                    return target;
                                }),
                                ),
                            )
                        , "related_article_num")
                        .and(r => r
                            .zeroOrMore(r => r
                                .regExp(/^[^\r\n(（]/),
                            )
                        , "style_struct_title"),
                    )
                , (({ text, title, related_article_num, style_struct_title }) => {
                    return {
                        text: text(),
                        title: title,
                        related_article_num: related_article_num,
                        style_struct_title: style_struct_title,
                    };
                }),
                )
            , "title_struct"),
        )
    , (({ title_struct }) => {
        return title_struct;
    }),
    )
    ;

export const $appdx_style = factory
    .withName("appdx_style")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $appdx_style_title)
            , "title_struct")
            .and(r => r
                .oneOrMore(r => r
                    .ref(() => $NEWLINE),
                ),
            )
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .ref(() => $INDENT),
                            )
                            .and(r => r
                                .action(r => r
                                    .sequence(c => c
                                        .and(r => r
                                            .ref(() => $style_struct)
                                        , "first")
                                        .and(r => r
                                            .zeroOrMore(r => r
                                                .action(r => r
                                                    .sequence(c => c
                                                        .and(r => r
                                                            .oneOrMore(r => r
                                                                .ref(() => $NEWLINE),
                                                            ),
                                                        )
                                                        .and(r => r
                                                            .ref(() => $style_struct)
                                                        , "_target"),
                                                    )
                                                , (({ _target }) => {
                                                    return _target;
                                                }),
                                                ),
                                            )
                                        , "rest"),
                                    )
                                , (({ first, rest }) => {
                                    return [first].concat(rest);
                                }),
                                )
                            , "target")
                            .and(r => r
                                .zeroOrMore(r => r
                                    .ref(() => $NEWLINE),
                                ),
                            )
                            .and(r => r
                                .ref(() => $DEDENT),
                            ),
                        )
                    , (({ target }) => {
                        return target;
                    }),
                    ),
                )
            , "children"),
        )
    , (({ title_struct, children }) => {
        const appdx_style = new EL("AppdxStyle");
        appdx_style.append(new EL("AppdxStyleTitle", {}, [new __Text(title_struct.title)]));
        if (title_struct.related_article_num) {
            appdx_style.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
        }
        appdx_style.extend(children || []);

        return appdx_style;
    }),
    )
    ;

export const $suppl_provision_appdx_style_title = factory
    .withName("suppl_provision_appdx_style_title")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .asSlice(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .regExp(/^[附付]/),
                                    )
                                    .and(r => r
                                        .seqEqual("則"),
                                    )
                                    .and(r => r
                                        .zeroOrMore(r => r
                                            .sequence(c => c
                                                .and(r => r
                                                    .nextIsNot(r => r
                                                        .seqEqual("様式"),
                                                    ),
                                                )
                                                .and(r => r
                                                    .nextIsNot(r => r
                                                        .regExp(/^[(（]/),
                                                    ),
                                                )
                                                .and(r => r
                                                    .ref(() => $CHAR),
                                                ),
                                            ),
                                        ),
                                    )
                                    .and(r => r
                                        .seqEqual("様式"),
                                    )
                                    .and(r => r
                                        .zeroOrMore(r => r
                                            .regExp(/^[^\r\n(（]/),
                                        ),
                                    ),
                                ),
                            )
                        , "title")
                        .and(r => r
                            .zeroOrOne(r => r
                                .action(r => r
                                    .sequence(c => c
                                        .and(r => r
                                            .ref(() => $_),
                                        )
                                        .and(r => r
                                            .ref(() => $ROUND_PARENTHESES_INLINE)
                                        , "target"),
                                    )
                                , (({ target }) => {
                                    return target;
                                }),
                                ),
                            )
                        , "related_article_num")
                        .and(r => r
                            .zeroOrMore(r => r
                                .regExp(/^[^\r\n(（]/),
                            )
                        , "style_struct_title"),
                    )
                , (({ text, title, related_article_num, style_struct_title }) => {
                    return {
                        text: text(),
                        title: title,
                        related_article_num: related_article_num,
                        style_struct_title: style_struct_title,
                    };
                }),
                )
            , "title_struct"),
        )
    , (({ title_struct }) => {
        return title_struct;
    }),
    )
    ;

export const $suppl_provision_appdx_style = factory
    .withName("suppl_provision_appdx_style")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $suppl_provision_appdx_style_title)
            , "title_struct")
            .and(r => r
                .oneOrMore(r => r
                    .ref(() => $NEWLINE),
                ),
            )
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .ref(() => $INDENT),
                        )
                        .and(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .ref(() => $style_struct)
                                    , "first")
                                    .and(r => r
                                        .zeroOrMore(r => r
                                            .action(r => r
                                                .sequence(c => c
                                                    .and(r => r
                                                        .oneOrMore(r => r
                                                            .ref(() => $NEWLINE),
                                                        ),
                                                    )
                                                    .and(r => r
                                                        .ref(() => $style_struct)
                                                    , "_target"),
                                                )
                                            , (({ _target }) => {
                                                return _target;
                                            }),
                                            ),
                                        )
                                    , "rest"),
                                )
                            , (({ first, rest }) => {
                                return [first].concat(rest);
                            }),
                            )
                        , "target")
                        .and(r => r
                            .zeroOrMore(r => r
                                .ref(() => $NEWLINE),
                            ),
                        )
                        .and(r => r
                            .ref(() => $DEDENT),
                        ),
                    )
                , (({ target }) => {
                    return target;
                }),
                )
            , "children"),
        )
    , (({ title_struct, children }) => {
        const suppl_provision_appdx_style = new EL("SupplProvisionAppdxStyle");
        suppl_provision_appdx_style.append(new EL("SupplProvisionAppdxStyleTitle", {}, [new __Text(title_struct.title)]));
        if (title_struct.related_article_num) {
            suppl_provision_appdx_style.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
        }
        suppl_provision_appdx_style.extend(children || []);

        return suppl_provision_appdx_style;
    }),
    )
    ;

export const $appdx_format_title = factory
    .withName("appdx_format_title")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .asSlice(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .zeroOrMore(r => r
                                            .sequence(c => c
                                                .and(r => r
                                                    .nextIsNot(r => r
                                                        .choice(c => c
                                                            .or(r => r
                                                                .seqEqual("様式"),
                                                            )
                                                            .or(r => r
                                                                .seqEqual("書式"),
                                                            ),
                                                        ),
                                                    ),
                                                )
                                                .and(r => r
                                                    .nextIsNot(r => r
                                                        .regExp(/^[(（]/),
                                                    ),
                                                )
                                                .and(r => r
                                                    .ref(() => $CHAR),
                                                ),
                                            ),
                                        ),
                                    )
                                    .and(r => r
                                        .choice(c => c
                                            .or(r => r
                                                .seqEqual("様式"),
                                            )
                                            .or(r => r
                                                .seqEqual("書式"),
                                            ),
                                        ),
                                    )
                                    .and(r => r
                                        .zeroOrMore(r => r
                                            .regExp(/^[^\r\n(（]/),
                                        ),
                                    ),
                                ),
                            )
                        , "title")
                        .and(r => r
                            .zeroOrOne(r => r
                                .action(r => r
                                    .sequence(c => c
                                        .and(r => r
                                            .ref(() => $_),
                                        )
                                        .and(r => r
                                            .ref(() => $ROUND_PARENTHESES_INLINE)
                                        , "target"),
                                    )
                                , (({ target }) => {
                                    return target;
                                }),
                                ),
                            )
                        , "related_article_num")
                        .and(r => r
                            .zeroOrMore(r => r
                                .regExp(/^[^\r\n(（]/),
                            )
                        , "format_struct_title"),
                    )
                , (({ text, title, related_article_num, format_struct_title }) => {
                    return {
                        text: text(),
                        title: title,
                        related_article_num: related_article_num,
                        format_struct_title: format_struct_title,
                    };
                }),
                )
            , "title_struct"),
        )
    , (({ title_struct }) => {
        return title_struct;
    }),
    )
    ;

export const $appdx_format = factory
    .withName("appdx_format")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .zeroOrOne(r => r
                    .sequence(c => c
                        .and(r => r
                            .seqEqual(":appdx-format:"),
                        )
                        .and(r => r
                            .oneOrMore(r => r
                                .ref(() => $NEWLINE),
                            ),
                        ),
                    ),
                ),
            )
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .ref(() => $appdx_format_title)
                            , "target")
                            .and(r => r
                                .oneOrMore(r => r
                                    .ref(() => $NEWLINE),
                                ),
                            ),
                        )
                    , (({ target }) => {
                        return target;
                    }),
                    ),
                )
            , "title_struct")
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .ref(() => $INDENT),
                        )
                        .and(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .ref(() => $format_struct)
                                    , "first")
                                    .and(r => r
                                        .zeroOrMore(r => r
                                            .action(r => r
                                                .sequence(c => c
                                                    .and(r => r
                                                        .oneOrMore(r => r
                                                            .ref(() => $NEWLINE),
                                                        ),
                                                    )
                                                    .and(r => r
                                                        .ref(() => $format_struct)
                                                    , "_target"),
                                                )
                                            , (({ _target }) => {
                                                return _target;
                                            }),
                                            ),
                                        )
                                    , "rest"),
                                )
                            , (({ first, rest }) => {
                                return [first].concat(rest);
                            }),
                            )
                        , "target")
                        .and(r => r
                            .zeroOrMore(r => r
                                .ref(() => $NEWLINE),
                            ),
                        )
                        .and(r => r
                            .ref(() => $DEDENT),
                        ),
                    )
                , (({ target }) => {
                    return target;
                }),
                )
            , "children"),
        )
    , (({ title_struct, children }) => {
        const appdx_format = new EL("AppdxFormat");
        if (title_struct) {
            appdx_format.append(new EL("AppdxFormatTitle", {}, [new __Text(title_struct.title)]));
            if (title_struct.related_article_num) {
                appdx_format.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
            }
        }
        appdx_format.extend(children || []);

        return appdx_format;
    }),
    )
    ;

export const $appdx_fig_title = factory
    .withName("appdx_fig_title")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .asSlice(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .seqEqual("別図"),
                                    )
                                    .and(r => r
                                        .zeroOrMore(r => r
                                            .regExp(/^[^\r\n(（]/),
                                        ),
                                    ),
                                ),
                            )
                        , "title")
                        .and(r => r
                            .zeroOrOne(r => r
                                .action(r => r
                                    .sequence(c => c
                                        .and(r => r
                                            .ref(() => $_),
                                        )
                                        .and(r => r
                                            .ref(() => $ROUND_PARENTHESES_INLINE)
                                        , "target"),
                                    )
                                , (({ target }) => {
                                    return target;
                                }),
                                ),
                            )
                        , "related_article_num")
                        .and(r => r
                            .zeroOrMore(r => r
                                .regExp(/^[^\r\n(（]/),
                            )
                        , "fig_struct_title"),
                    )
                , (({ text, title, related_article_num, fig_struct_title }) => {
                    return {
                        text: text(),
                        title: title,
                        related_article_num: related_article_num,
                        fig_struct_title: fig_struct_title,
                    };
                }),
                )
            , "title_struct"),
        )
    , (({ title_struct }) => {
        return title_struct;
    }),
    )
    ;

export const $appdx_fig = factory
    .withName("appdx_fig")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $appdx_fig_title)
            , "title_struct")
            .and(r => r
                .oneOrMore(r => r
                    .ref(() => $NEWLINE),
                ),
            )
            .and(r => r
                .choice(c => c
                    .or(r => r
                        .action(r => r
                            .sequence(c => c
                                .and(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .ref(() => $INDENT),
                                            )
                                            .and(r => r
                                                .action(r => r
                                                    .sequence(c => c
                                                        .and(r => r
                                                            .ref(() => $appdx_fig_children)
                                                        , "first")
                                                        .and(r => r
                                                            .zeroOrMore(r => r
                                                                .action(r => r
                                                                    .sequence(c => c
                                                                        .and(r => r
                                                                            .oneOrMore(r => r
                                                                                .ref(() => $NEWLINE),
                                                                            ),
                                                                        )
                                                                        .and(r => r
                                                                            .ref(() => $appdx_fig_children)
                                                                        , "_target"),
                                                                    )
                                                                , (({ _target }) => {
                                                                    return _target;
                                                                }),
                                                                ),
                                                            )
                                                        , "rest"),
                                                    )
                                                , (({ first, rest }) => {
                                                    return [first].concat(rest);
                                                }),
                                                )
                                            , "target")
                                            .and(r => r
                                                .zeroOrMore(r => r
                                                    .ref(() => $NEWLINE),
                                                ),
                                            )
                                            .and(r => r
                                                .ref(() => $DEDENT),
                                            ),
                                        )
                                    , (({ target }) => {
                                        return target;
                                    }),
                                    )
                                , "children"),
                            )
                        , (({ title_struct, children }) => {
                            const appdx_fig = new EL("AppdxFig");
                            appdx_fig.append(new EL("AppdxFigTitle", {}, [new __Text(title_struct.title)]));
                            if (title_struct.related_article_num) {
                                appdx_fig.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
                            }
                            appdx_fig.extend(children || []);

                            return appdx_fig;
                        }),
                        ),
                    )
                    .or(r => r
                        .assert(({ location }) => {
                            throw new Error(`Line ${location().start.line}: Detected AppdxFig but found error inside it.`);
                        }),
                    ),
                )
            , "success"),
        )
    , (({ success }) => {
        return success as EL;
    }),
    )
    ;

export const $appdx_fig_children = factory
    .withName("appdx_fig_children")
    .choice(c => c
        .or(r => r
            .ref(() => $fig_struct),
        )
        .or(r => r
            .ref(() => $table_struct),
        ),
    )
    ;

export const $appdx_note_title = factory
    .withName("appdx_note_title")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .zeroOrMore(r => r
                                            .action(r => r
                                                .sequence(c => c
                                                    .and(r => r
                                                        .seqEqual("["),
                                                    )
                                                    .and(r => r
                                                        .asSlice(r => r
                                                            .oneOrMore(r => r
                                                                .regExp(/^[^ 　\t\r\n\]=]/),
                                                            ),
                                                        )
                                                    , "name")
                                                    .and(r => r
                                                        .seqEqual("=\""),
                                                    )
                                                    .and(r => r
                                                        .asSlice(r => r
                                                            .oneOrMore(r => r
                                                                .regExp(/^[^ 　\t\r\n\]"]/),
                                                            ),
                                                        )
                                                    , "value")
                                                    .and(r => r
                                                        .seqEqual("\"]"),
                                                    ),
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
                        .and(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .asSlice(r => r
                                            .sequence(c => c
                                                .and(r => r
                                                    .choice(c => c
                                                        .or(r => r
                                                            .seqEqual("別記"),
                                                        )
                                                        .or(r => r
                                                            .seqEqual("付録"),
                                                        )
                                                        .or(r => r
                                                            .seqEqual("（別紙）"),
                                                        ),
                                                    ),
                                                )
                                                .and(r => r
                                                    .zeroOrMore(r => r
                                                        .regExp(/^[^\r\n(（]/),
                                                    ),
                                                ),
                                            ),
                                        )
                                    , "title")
                                    .and(r => r
                                        .zeroOrOne(r => r
                                            .action(r => r
                                                .sequence(c => c
                                                    .and(r => r
                                                        .ref(() => $_),
                                                    )
                                                    .and(r => r
                                                        .ref(() => $ROUND_PARENTHESES_INLINE)
                                                    , "target"),
                                                )
                                            , (({ target }) => {
                                                return target;
                                            }),
                                            ),
                                        )
                                    , "related_article_num")
                                    .and(r => r
                                        .asSlice(r => r
                                            .zeroOrMore(r => r
                                                .regExp(/^[^\r\n(（]/),
                                            ),
                                        )
                                    , "table_struct_title"),
                                )
                            , (({ text, title, related_article_num, table_struct_title }) => {
                                return {
                                    text: text(),
                                    title: title,
                                    related_article_num: related_article_num,
                                    table_struct_title: table_struct_title,
                                };
                            }),
                            )
                        , "target"),
                    )
                , (({ attr, target }) => {
                    return {
                        attr: attr,
                        ...target,
                    };
                }),
                )
            , "title_struct"),
        )
    , (({ title_struct }) => {
        return title_struct;
    }),
    )
    ;

export const $appdx_note = factory
    .withName("appdx_note")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $appdx_note_title)
            , "title_struct")
            .and(r => r
                .oneOrMore(r => r
                    .ref(() => $NEWLINE),
                ),
            )
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .ref(() => $INDENT),
                            )
                            .and(r => r
                                .zeroOrOne(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .ref(() => $appdx_note_children)
                                            , "first")
                                            .and(r => r
                                                .zeroOrMore(r => r
                                                    .action(r => r
                                                        .sequence(c => c
                                                            .and(r => r
                                                                .oneOrMore(r => r
                                                                    .ref(() => $NEWLINE),
                                                                ),
                                                            )
                                                            .and(r => r
                                                                .ref(() => $appdx_note_children)
                                                            , "_target"),
                                                        )
                                                    , (({ _target }) => {
                                                        return _target;
                                                    }),
                                                    ),
                                                )
                                            , "rest"),
                                        )
                                    , (({ first, rest }) => {
                                        return [first].concat(rest);
                                    }),
                                    ),
                                )
                            , "target")
                            .and(r => r
                                .zeroOrMore(r => r
                                    .ref(() => $remarks),
                                )
                            , "remarkses")
                            .and(r => r
                                .zeroOrMore(r => r
                                    .ref(() => $NEWLINE),
                                ),
                            )
                            .and(r => r
                                .ref(() => $DEDENT),
                            ),
                        )
                    , (({ target, remarkses }) => {
                        return (target || []).concat(remarkses);
                    }),
                    ),
                )
            , "children"),
        )
    , (({ location, title_struct, children }) => {
        const appdx_note = new EL("AppdxNote");
        if (title_struct.table_struct_title !== "") {
            console.error(`### line ${location().start.line}: Maybe irregular AppdxNoteTitle!`);
            appdx_note.append(new EL("AppdxNoteTitle", title_struct.attr, [new __Text( title_struct.text)]));
        } else {
            appdx_note.append(new EL("AppdxNoteTitle", title_struct.attr, [new __Text(title_struct.title)]));
            if (title_struct.related_article_num) {
                appdx_note.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
            }
        }

        if (children) {
            setItemNum(children);
        }
        appdx_note.extend(children || []);

        return appdx_note;
    }),
    )
    ;

export const $appdx_note_children = factory
    .withName("appdx_note_children")
    .choice(c => c
        .or(r => r
            .ref(() => $fig_struct),
        )
        .or(r => r
            .ref(() => $note_struct),
        )
        .or(r => r
            .ref(() => $table_struct),
        ),
    )
    ;

export const $appdx_title = factory
    .withName("appdx_title")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .zeroOrMore(r => r
                                            .action(r => r
                                                .sequence(c => c
                                                    .and(r => r
                                                        .seqEqual("["),
                                                    )
                                                    .and(r => r
                                                        .asSlice(r => r
                                                            .oneOrMore(r => r
                                                                .regExp(/^[^ 　\t\r\n\]=]/),
                                                            ),
                                                        )
                                                    , "name")
                                                    .and(r => r
                                                        .seqEqual("=\""),
                                                    )
                                                    .and(r => r
                                                        .asSlice(r => r
                                                            .oneOrMore(r => r
                                                                .regExp(/^[^ 　\t\r\n\]"]/),
                                                            ),
                                                        )
                                                    , "value")
                                                    .and(r => r
                                                        .seqEqual("\"]"),
                                                    ),
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
                        .and(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .asSlice(r => r
                                            .sequence(c => c
                                                .and(r => r
                                                    .seqEqual("付録"),
                                                )
                                                .and(r => r
                                                    .zeroOrMore(r => r
                                                        .regExp(/^[^\r\n(（]/),
                                                    ),
                                                ),
                                            ),
                                        )
                                    , "title")
                                    .and(r => r
                                        .zeroOrOne(r => r
                                            .action(r => r
                                                .sequence(c => c
                                                    .and(r => r
                                                        .ref(() => $_),
                                                    )
                                                    .and(r => r
                                                        .ref(() => $ROUND_PARENTHESES_INLINE)
                                                    , "target"),
                                                )
                                            , (({ target }) => {
                                                return target;
                                            }),
                                            ),
                                        )
                                    , "related_article_num"),
                                )
                            , (({ text, title, related_article_num }) => {
                                return {
                                    text: text(),
                                    title: title,
                                    related_article_num: related_article_num,
                                };
                            }),
                            )
                        , "target"),
                    )
                , (({ attr, target }) => {
                    return {
                        attr: attr,
                        ...target,
                    };
                }),
                )
            , "title_struct"),
        )
    , (({ title_struct }) => {
        return title_struct;
    }),
    )
    ;

export const $appdx = factory
    .withName("appdx")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $appdx_title)
            , "title_struct")
            .and(r => r
                .oneOrMore(r => r
                    .ref(() => $NEWLINE),
                ),
            )
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .ref(() => $INDENT),
                        )
                        .and(r => r
                            .oneOrMore(r => r
                                .action(r => r
                                    .sequence(c => c
                                        .and(r => r
                                            .ref(() => $xml_element)
                                        , "_target")
                                        .and(r => r
                                            .oneOrMore(r => r
                                                .ref(() => $NEWLINE),
                                            ),
                                        ),
                                    )
                                , (({ _target }) => {
                                    return _target;
                                }),
                                ),
                            )
                        , "target")
                        .and(r => r
                            .zeroOrMore(r => r
                                .ref(() => $remarks),
                            )
                        , "remarkses")
                        .and(r => r
                            .zeroOrMore(r => r
                                .ref(() => $NEWLINE),
                            ),
                        )
                        .and(r => r
                            .ref(() => $DEDENT),
                        ),
                    )
                , (({ target, remarkses }) => {
                    return target.concat(remarkses);
                }),
                )
            , "children"),
        )
    , (({ title_struct, children }) => {
        const appdx = new EL("Appdx");
        appdx.append(new EL("ArithFormulaNum", title_struct.attr, [new __Text(title_struct.title)]));
        if (title_struct.related_article_num) {
            appdx.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
        }

        if (children) {
            setItemNum(children);
        }
        appdx.extend(children || []);

        return appdx;
    }),
    )
    ;

export const $suppl_provision_appdx_title = factory
    .withName("suppl_provision_appdx_title")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .zeroOrMore(r => r
                                            .action(r => r
                                                .sequence(c => c
                                                    .and(r => r
                                                        .seqEqual("["),
                                                    )
                                                    .and(r => r
                                                        .asSlice(r => r
                                                            .oneOrMore(r => r
                                                                .regExp(/^[^ 　\t\r\n\]=]/),
                                                            ),
                                                        )
                                                    , "name")
                                                    .and(r => r
                                                        .seqEqual("=\""),
                                                    )
                                                    .and(r => r
                                                        .asSlice(r => r
                                                            .oneOrMore(r => r
                                                                .regExp(/^[^ 　\t\r\n\]"]/),
                                                            ),
                                                        )
                                                    , "value")
                                                    .and(r => r
                                                        .seqEqual("\"]"),
                                                    ),
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
                        .and(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r
                                        .asSlice(r => r
                                            .sequence(c => c
                                                .and(r => r
                                                    .regExp(/^[附付]/),
                                                )
                                                .and(r => r
                                                    .seqEqual("則付録"),
                                                )
                                                .and(r => r
                                                    .zeroOrMore(r => r
                                                        .regExp(/^[^\r\n(（]/),
                                                    ),
                                                ),
                                            ),
                                        )
                                    , "title")
                                    .and(r => r
                                        .zeroOrOne(r => r
                                            .action(r => r
                                                .sequence(c => c
                                                    .and(r => r
                                                        .ref(() => $_),
                                                    )
                                                    .and(r => r
                                                        .ref(() => $ROUND_PARENTHESES_INLINE)
                                                    , "target"),
                                                )
                                            , (({ target }) => {
                                                return target;
                                            }),
                                            ),
                                        )
                                    , "related_article_num"),
                                )
                            , (({ text, title, related_article_num }) => {
                                return {
                                    text: text(),
                                    title: title,
                                    related_article_num: related_article_num,
                                };
                            }),
                            )
                        , "target"),
                    )
                , (({ attr, target }) => {
                    return {
                        attr: attr,
                        ...target,
                    };
                }),
                )
            , "title_struct"),
        )
    , (({ title_struct }) => {
        return title_struct;
    }),
    )
    ;

export const $suppl_provision_appdx = factory
    .withName("suppl_provision_appdx")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $suppl_provision_appdx_title)
            , "title_struct")
            .and(r => r
                .oneOrMore(r => r
                    .ref(() => $NEWLINE),
                ),
            )
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .ref(() => $INDENT),
                        )
                        .and(r => r
                            .oneOrMore(r => r
                                .action(r => r
                                    .sequence(c => c
                                        .and(r => r
                                            .ref(() => $xml_element)
                                        , "_target")
                                        .and(r => r
                                            .oneOrMore(r => r
                                                .ref(() => $NEWLINE),
                                            ),
                                        ),
                                    )
                                , (({ _target }) => {
                                    return _target;
                                }),
                                ),
                            )
                        , "target")
                        .and(r => r
                            .zeroOrMore(r => r
                                .ref(() => $remarks),
                            )
                        , "remarkses")
                        .and(r => r
                            .zeroOrMore(r => r
                                .ref(() => $NEWLINE),
                            ),
                        )
                        .and(r => r
                            .ref(() => $DEDENT),
                        ),
                    )
                , (({ target, remarkses }) => {
                    return target.concat(remarkses);
                }),
                )
            , "children"),
        )
    , (({ title_struct, children }) => {
        const suppl_provision_appdx = new EL("SupplProvisionAppdx");
        suppl_provision_appdx.append(new EL("ArithFormulaNum", title_struct.attr, [new __Text(title_struct.title)]));
        if (title_struct.related_article_num) {
            suppl_provision_appdx.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
        }

        if (children) {
            setItemNum(children);
        }
        suppl_provision_appdx.extend(children || []);

        return suppl_provision_appdx;
    }),
    )
    ;

export const $suppl_provision_label = factory
    .withName("suppl_provision_label")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $__),
            )
            .and(r => r
                .asSlice(r => r
                    .sequence(c => c
                        .and(r => r
                            .regExp(/^[附付]/),
                        )
                        .and(r => r
                            .ref(() => $_),
                        )
                        .and(r => r
                            .seqEqual("則"),
                        ),
                    ),
                )
            , "label")
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .ref(() => $ROUND_PARENTHESES_INLINE)
                            , "target"),
                        )
                    , (({ target }) => {
                        return target.content;
                    }),
                    ),
                )
            , "amend_law_num")
            .and(r => r
                .zeroOrOne(r => r
                    .sequence(c => c
                        .and(r => r
                            .ref(() => $_),
                        )
                        .and(r => r
                            .seqEqual("抄"),
                        ),
                    ),
                )
            , "extract")
            .and(r => r
                .oneOrMore(r => r
                    .ref(() => $NEWLINE),
                ),
            ),
        )
    , (({ label, amend_law_num, extract }) => {
        return {
            label: label,
            amend_law_num: amend_law_num,
            extract: extract,
        };
    }),
    )
    ;

export const $suppl_provision = factory
    .withName("suppl_provision")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .ref(() => $suppl_provision_label)
            , "suppl_provision_label")
            .and(r => r
                .choice(c => c
                    .or(r => r
                        .oneOrMore(r => r
                            .ref(() => $article),
                        ),
                    )
                    .or(r => r
                        .oneOrMore(r => r
                            .ref(() => $paragraph_item),
                        ),
                    )
                    .or(r => r
                        .action(r => r
                            .sequence(c => c
                                .and(r => r
                                    .ref(() => $no_name_paragraph_item)
                                , "first")
                                .and(r => r
                                    .zeroOrMore(r => r
                                        .ref(() => $paragraph_item),
                                    )
                                , "rest"),
                            )
                        , (({ first, rest }) => {
                            return [first].concat(rest);
                        }),
                        ),
                    ),
                )
            , "children")
            .and(r => r
                .zeroOrMore(r => r
                    .choice(c => c
                        .or(r => r
                            .ref(() => $suppl_provision_appdx_table),
                        )
                        .or(r => r
                            .ref(() => $suppl_provision_appdx_style),
                        )
                        .or(r => r
                            .ref(() => $suppl_provision_appdx),
                        ),
                    ),
                )
            , "suppl_provision_appdx_items"),
        )
    , (({ suppl_provision_label, children, suppl_provision_appdx_items }) => {
        const suppl_provision = new EL("SupplProvision");
        if (suppl_provision_label.amend_law_num) {
            suppl_provision.attr["AmendLawNum"] = suppl_provision_label.amend_law_num;
        }
        if (suppl_provision_label.extract !== null) {
            suppl_provision.attr["Extract"] = "true";
        }
        suppl_provision.append(new EL("SupplProvisionLabel", {}, [new __Text(suppl_provision_label.label)]));

        if (children) {
            setItemNum(children);
        }
        suppl_provision.extend(children);
        suppl_provision.extend(suppl_provision_appdx_items);
        return suppl_provision;
    }),
    )
    ;

export const rules = {
    law: $law,
    law_title: $law_title,
    enact_statement: $enact_statement,
    toc_label: $toc_label,
    toc: $toc,
    toc_item: $toc_item,
    main_provision: $main_provision,
    article_group_title: $article_group_title,
    article_group: $article_group,
    article_paragraph_caption: $article_paragraph_caption,
    article_title: $article_title,
    article: $article,
    suppl_note: $suppl_note,
    paragraph_item: $paragraph_item,
    in_table_column_paragraph_items: $in_table_column_paragraph_items,
    no_name_paragraph_item: $no_name_paragraph_item,
    paragraph_item_child: $paragraph_item_child,
    list: $list,
    amend_provision: $amend_provision,
    table_struct: $table_struct,
    table_struct_title: $table_struct_title,
    table: $table,
    table_column_attr_name: $table_column_attr_name,
    table_column: $table_column,
    style_struct: $style_struct,
    style_struct_title: $style_struct_title,
    style: $style,
    format_struct: $format_struct,
    format_struct_title: $format_struct_title,
    format: $format,
    note_struct: $note_struct,
    note_struct_title: $note_struct_title,
    note: $note,
    remarks: $remarks,
    fig_struct: $fig_struct,
    fig: $fig,
    appdx_item: $appdx_item,
    appdx_table_title: $appdx_table_title,
    appdx_table: $appdx_table,
    appdx_table_children: $appdx_table_children,
    suppl_provision_appdx_table_title: $suppl_provision_appdx_table_title,
    suppl_provision_appdx_table: $suppl_provision_appdx_table,
    suppl_provision_appdx_table_children: $suppl_provision_appdx_table_children,
    appdx_style_title: $appdx_style_title,
    appdx_style: $appdx_style,
    suppl_provision_appdx_style_title: $suppl_provision_appdx_style_title,
    suppl_provision_appdx_style: $suppl_provision_appdx_style,
    appdx_format_title: $appdx_format_title,
    appdx_format: $appdx_format,
    appdx_fig_title: $appdx_fig_title,
    appdx_fig: $appdx_fig,
    appdx_fig_children: $appdx_fig_children,
    appdx_note_title: $appdx_note_title,
    appdx_note: $appdx_note,
    appdx_note_children: $appdx_note_children,
    appdx_title: $appdx_title,
    appdx: $appdx,
    suppl_provision_appdx_title: $suppl_provision_appdx_title,
    suppl_provision_appdx: $suppl_provision_appdx,
    suppl_provision_label: $suppl_provision_label,
    suppl_provision: $suppl_provision,
    ...columnsOrSentencesRules,
};
