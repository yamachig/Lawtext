/* eslint-disable no-irregular-whitespace */
import { __Text, EL, setItemNum } from "@coresrc/util";
import { factory } from "../common";
import { $ROUND_PARENTHESES_INLINE } from "../inline";
import { $_, $NEWLINE, $INDENT, $DEDENT } from "../lexical";
import { $fig_struct } from "./figStruct";
import { $note_struct } from "./noteStruct";
import { $remarks } from "./remarks";
import { $table_struct } from "./tableStruct";


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


export const rules = {
    appdx_note_title: $appdx_note_title,
    appdx_note: $appdx_note,
    appdx_note_children: $appdx_note_children,
};
