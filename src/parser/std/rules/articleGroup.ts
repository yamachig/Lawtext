/* eslint-disable no-irregular-whitespace */
import { Chapter, Division, newStdEL, Part, Section, Subsection } from "../../../law/std";
import { articleGroupTypeChars, articleGroupType, articleGroupTitleTag, parseNamedNum } from "../../../law/lawUtil";
import { __Text } from "../../../node/control";
import { EL } from "../../../node/el";
import { factory, ValueRule } from "../common";
import { $INLINE } from "../../cst/rules/inline";
import { $NEWLINE, $__ } from "../../cst/rules/lexical";
import { $article } from "./article";


export const $article_group_title = factory
    .withName("article_group_title")
    .action(r => r
        .sequence(c => c
            .and(() => $__)
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r.seqEqual("第"))
                                    .and(r => r
                                        .oneOrMore(r => r.regExp(/^[^ 　\t\r\n編章節款目]/)),
                                    )
                                    .and(r => r.oneOf(articleGroupTypeChars), "type_char")
                                    .and(r => r
                                        .zeroOrOne(r => r
                                            .sequence(c => c
                                                .and(r => r.regExp(/^[のノ]/))
                                                .and(r => r
                                                    .oneOrMore(r => r.regExp(/^[^ 　\t\r\n]/)),
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
                                        .and(r => r.asSlice(() => $__), "space")
                                        .and(() => $INLINE, "inline"),
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
            .and(r => r.oneOrMore(() => $NEWLINE)),
        )
    , (({ title }) => {
        return title;
    }),
    )
    ;

export const $article_group: ValueRule<Part | Chapter | Section | Subsection | Division> = factory
    .withName("article_group")
    .sequence(c => c
        .and(() => $article_group_title, "article_group_title")
        .and(r => r
            .oneOrMore(r => r
                .choice(c => c
                    .or(() => $article)
                    .or(r => r
                        .sequence(c => c
                            .and(r => r
                                .nextIs(r => r
                                    .sequence(c => c
                                        .and(() => $article_group_title, "next_title")
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
                            .and(() => $article_group, "article_group")
                            .action(({ article_group }) => {
                                return article_group;
                            }),
                        ),
                    ),
                ),
            )
        , "children")
        .action(({ article_group_title, children }) => {
            const article_group = newStdEL(
                    articleGroupType[article_group_title.type_char as keyof typeof articleGroupType] as "Part" | "Chapter" | "Section" | "Subsection" | "Division",
                    { Delete: "false", Hide: "false" },
            );

            article_group.append(newStdEL(
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


export const rules = {
    article_group_title: $article_group_title,
    article_group: $article_group,
};
