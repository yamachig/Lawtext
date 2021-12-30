/* eslint-disable no-irregular-whitespace */
import { AppdxFig, newStdEL } from "../../std_law";
import { __Text } from "../../node/control";
import { factory } from "../common";
import { $ROUND_PARENTHESES_INLINE } from "../inline";
import { $_, $NEWLINE, $INDENT, $DEDENT } from "../lexical";
import { $fig_struct } from "./figStruct";
import { $table_struct } from "./tableStruct";


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
                                    .and(r => r.seqEqual("別図"))
                                    .and(r => r
                                        .zeroOrMore(r => r.regExp(/^[^\r\n(（]/)),
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
            .and(() => $appdx_fig_title, "title_struct")
            .and(r => r.oneOrMore(() => $NEWLINE))
            .and(r => r
                .choice(c => c
                    .or(r => r
                        .action(r => r
                            .sequence(c => c
                                .and(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(() => $INDENT)
                                            .and(r => r
                                                .action(r => r
                                                    .sequence(c => c
                                                        .and(() => $appdx_fig_children, "first")
                                                        .and(r => r
                                                            .zeroOrMore(r => r
                                                                .action(r => r
                                                                    .sequence(c => c
                                                                        .and(r => r.oneOrMore(() => $NEWLINE))
                                                                        .and(() => $appdx_fig_children, "_target"),
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
                                    )
                                , "children"),
                            )
                        , (({ title_struct, children }) => {
                            const appdx_fig = newStdEL("AppdxFig");
                            appdx_fig.append(newStdEL("AppdxFigTitle", {}, [new __Text(title_struct.title)]));
                            if (title_struct.related_article_num) {
                                appdx_fig.append(newStdEL("RelatedArticleNum", {}, [title_struct.related_article_num]));
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
        return success as AppdxFig;
    }),
    )
    ;

export const $appdx_fig_children = factory
    .withName("appdx_fig_children")
    .choice(c => c
        .or(() => $fig_struct)
        .or(() => $table_struct),
    )
    ;

export const rules = {
    appdx_fig_title: $appdx_fig_title,
    appdx_fig: $appdx_fig,
    appdx_fig_children: $appdx_fig_children,
};
