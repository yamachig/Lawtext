/* eslint-disable no-irregular-whitespace */
import { newStdEL } from "../../std_law";
import { __Text } from "../../util";
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
                                                            .nextIsNot(r => r.seqEqual("様式")),
                                                        )
                                                        .and(r => r
                                                            .nextIsNot(r => r.seqEqual("書式")),
                                                        )
                                                        .and(r => r
                                                            .nextIsNot(r => r.regExp(/^[(（]/)),
                                                        )
                                                        .and(() => $CHAR),
                                                    ),
                                                ),
                                            )
                                            .and(r => r
                                                .choice(c => c
                                                    .or(r => r.seqEqual("様式"))
                                                    .or(r => r.seqEqual("書式")),
                                                ),
                                            )
                                            .and(r => r
                                                .zeroOrMore(r => r.regExp(/^[^\r\n(（]/)),
                                            )
                                            .and(() => $ROUND_PARENTHESES_INLINE)
                                            .and(r => r
                                                .zeroOrMore(r => r.regExp(/^[^\r\n(（]/)),
                                            )
                                            .and(r => r.nextIs(() => $ROUND_PARENTHESES_INLINE)),
                                        ),
                                    )
                                    .or(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .zeroOrMore(r => r
                                                    .sequence(c => c
                                                        .and(r => r
                                                            .nextIsNot(r => r.seqEqual("様式")),
                                                        )
                                                        .and(r => r
                                                            .nextIsNot(r => r.seqEqual("書式")),
                                                        )
                                                        .and(r => r
                                                            .nextIsNot(r => r.regExp(/^[(（]/)),
                                                        )
                                                        .and(() => $CHAR),
                                                    ),
                                                ),
                                            )
                                            .and(r => r
                                                .choice(c => c
                                                    .or(r => r.seqEqual("様式"))
                                                    .or(r => r.seqEqual("書式")),
                                                ),
                                            )
                                            .and(r => r
                                                .zeroOrMore(r => r.regExp(/^[^\r\n(（]/)),
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
                                        .and(() => $_)
                                        .and(() => $ROUND_PARENTHESES_INLINE, "target"),
                                    )
                                , (({ target }) => {
                                    return target;
                                }),
                                ),
                            )
                        , "related_article_num")
                        .and(r => r
                            .zeroOrMore(r => r.regExp(/^[^\r\n(（]/))
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
            .and(() => $appdx_style_title, "title_struct")
            .and(r => r.oneOrMore(() => $NEWLINE))
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(() => $INDENT)
                            .and(r => r
                                .action(r => r
                                    .sequence(c => c
                                        .and(() => $style_struct, "first")
                                        .and(r => r
                                            .zeroOrMore(r => r
                                                .action(r => r
                                                    .sequence(c => c
                                                        .and(r => r.oneOrMore(() => $NEWLINE))
                                                        .and(() => $style_struct, "_target"),
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
                            .and(r => r.zeroOrMore(() => $NEWLINE))
                            .and(() => $DEDENT),
                        )
                    , (({ target }) => {
                        return target;
                    }),
                    ),
                )
            , "children"),
        )
    , (({ title_struct, children }) => {
        const appdx_style = newStdEL("AppdxStyle");
        appdx_style.append(newStdEL("AppdxStyleTitle", {}, [new __Text(title_struct.title)]));
        if (title_struct.related_article_num) {
            appdx_style.append(newStdEL("RelatedArticleNum", {}, [title_struct.related_article_num]));
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
