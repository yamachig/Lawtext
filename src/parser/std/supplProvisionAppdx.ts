/* eslint-disable no-irregular-whitespace */
import { newStdEL } from "@coresrc/std_law";
import { __Text, setItemNum } from "@coresrc/util";
import { factory } from "../common";
import { $ROUND_PARENTHESES_INLINE } from "../inline";
import { $_, $NEWLINE, $INDENT, $DEDENT } from "../lexical";
import { $xml_element } from "../xml";
import { $remarks } from "./remarks";


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
        const suppl_provision_appdx = newStdEL("SupplProvisionAppdx");
        suppl_provision_appdx.append(newStdEL("ArithFormulaNum", title_struct.attr, [new __Text(title_struct.title)]));
        if (title_struct.related_article_num) {
            suppl_provision_appdx.append(newStdEL("RelatedArticleNum", {}, [title_struct.related_article_num]));
        }

        if (children) {
            setItemNum(children);
        }
        suppl_provision_appdx.extend(children || []);

        return suppl_provision_appdx;
    }),
    )
    ;


export const rules = {
    suppl_provision_appdx_title: $suppl_provision_appdx_title,
    suppl_provision_appdx: $suppl_provision_appdx,
};
