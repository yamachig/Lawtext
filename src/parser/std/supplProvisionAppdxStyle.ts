/* eslint-disable no-irregular-whitespace */
import { newStdEL } from "@coresrc/std_law";
import { __Text } from "@coresrc/util";
import { factory } from "../common";
import { $ROUND_PARENTHESES_INLINE } from "../inline";
import { $_, $NEWLINE, $INDENT, $DEDENT, $CHAR } from "../lexical";
import { $style_struct } from "./styleStruct";


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
        const suppl_provision_appdx_style = newStdEL("SupplProvisionAppdxStyle");
        suppl_provision_appdx_style.append(newStdEL("SupplProvisionAppdxStyleTitle", {}, [new __Text(title_struct.title)]));
        if (title_struct.related_article_num) {
            suppl_provision_appdx_style.append(newStdEL("RelatedArticleNum", {}, [title_struct.related_article_num]));
        }
        suppl_provision_appdx_style.extend(children || []);

        return suppl_provision_appdx_style;
    }),
    )
    ;


export const rules = {
    suppl_provision_appdx_style_title: $suppl_provision_appdx_style_title,
    suppl_provision_appdx_style: $suppl_provision_appdx_style,
};
