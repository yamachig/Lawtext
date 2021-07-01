/* eslint-disable no-irregular-whitespace */
import { __Text, EL } from "@coresrc/util";
import { factory } from "../common";
import { $ROUND_PARENTHESES_INLINE } from "../inline";
import { $_, $NEWLINE, $CHAR, $INDENT, $DEDENT } from "../lexical";
import { $style_struct } from "./styleStruct";


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


export const rules = {
    appdx_style_title: $appdx_style_title,
    appdx_style: $appdx_style,
};
