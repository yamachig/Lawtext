/* eslint-disable no-irregular-whitespace */
import { newStdEL, Paragraph, Item, Subitem1, Subitem2, Subitem3, Subitem4, Subitem5, Subitem6, Subitem7, Subitem8, Subitem9, Subitem10 } from "../../std_law";
import { paragraphItemSentenceTags, paragraphItemTags, paragraphItemTitleTags, setItemNum } from "../../util";
import { factory, ValueRule } from "../common";
import { $DEDENT, $INDENT, $NEWLINE, $__ } from "../lexical";
import { $amend_provision } from "./amendProvision";
import { $appdx_title } from "./appdx";
import { $appdx_fig_title } from "./appdxFig";
import { $appdx_format_title } from "./appdxFormat";
import { $appdx_note_title } from "./appdxNote";
import { $appdx_style_title } from "./appdxStyle";
import { $appdx_table_title } from "./appdxTable";
import { $article_paragraph_caption, $article_title } from "./article";
import { $columns_or_sentences, makeSquareAttr } from "./columnsOrSentences";
import { $fig_struct } from "./figStruct";
import { $list } from "./list";
import { $style_struct } from "./styleStruct";
import { $suppl_provision_label } from "./supplProvision";
import { $table_struct } from "./tableStruct";

const $old_num_attr = makeSquareAttr(r => r.seqEqual("OldNum"));
$old_num_attr.name = "old_num_attr";
const $missing_num_attr = makeSquareAttr(r => r.seqEqual("MissingNum"));
$missing_num_attr.name = "missing_num_attr";

export const $paragraph_item: ValueRule<Paragraph | Item | Subitem1 | Subitem2 | Subitem3 | Subitem4 | Subitem5 | Subitem6 | Subitem7 | Subitem8 | Subitem9 | Subitem10> = factory
    .withName("paragraph_item")
    .sequence(c => c
        .and(r => r.zeroOrOne(() => $article_paragraph_caption), "paragraph_caption")
        .and(r => r
            .sequence(c => c
                .and(r => r.nextIsNot(() => $article_title))
                .and(r => r.nextIsNot(() => $appdx_table_title))
                .and(r => r.nextIsNot(() => $appdx_style_title))
                .and(r => r.nextIsNot(() => $appdx_format_title))
                .and(r => r.nextIsNot(() => $appdx_fig_title))
                .and(r => r.nextIsNot(() => $appdx_note_title))
                .and(r => r.nextIsNot(() => $appdx_title))
                .and(r => r.nextIsNot(() => $suppl_provision_label))
                .and(r => r
                    .nextIsNot(r => r.seqEqual(":SupplNote:")),
                )
                .and(r => r
                    .choice(c => c
                        .or(r => r
                            .sequence(s => s
                                .and(r => r
                                    .asSlice(r => r
                                        .oneOrMore(r => r.regExp(/^[^ 　\t\r\n条<]/)),
                                    )
                                , "title")
                                .and(() => $__)
                                .action(({ title }) => {
                                    return { title };
                                }),
                            ),
                        )
                        .or(r => r
                            .sequence(s => s
                                .and(() => $old_num_attr, "old_num_attr")
                                .action(({ old_num_attr }) => {
                                    return { old_num_attr };
                                }),
                            ),
                        )
                        .or(r => r
                            .sequence(s => s
                                .and(() => $missing_num_attr, "missing_num_attr")
                                .action(({ missing_num_attr }) => {
                                    return { missing_num_attr };
                                }),
                            ),
                        ),
                    )
                , "title_struct")
                .action(({ title_struct }) => {
                    return title_struct;
                }),
            )
        , "title_struct")
        .and(() => $columns_or_sentences, "inline_contents")
        .and(r => r.oneOrMore(() => $NEWLINE))
        .and(r => r
            .zeroOrOne(r => r
                .choice(c => c
                    .or(r => r
                        .sequence(c => c
                            .and(() => $INDENT)
                            .and(() => $INDENT)
                            .and(r => r.oneOrMore(() => $list), "target")
                            .and(r => r.zeroOrMore(() => $NEWLINE))
                            .and(() => $DEDENT)
                            .and(() => $DEDENT)
                            .action(({ target }) => {
                                return target;
                            }),
                        ),
                    )
                    .or(r => r
                        .sequence(c => c
                            .and(() => $INDENT)
                            .and(() => $paragraph_item_child, "target")
                            .and(r => r.zeroOrMore(() => $NEWLINE))
                            .and(r => r
                                .zeroOrMore(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(() => $paragraph_item_child, "_target")
                                            .and(r => r.zeroOrMore(() => $NEWLINE)),
                                        )
                                    , (({ _target }) => {
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
                    .or(r => r
                        .sequence(c => c
                            .and(() => $INDENT)
                            .and(() => $INDENT)
                            .and(r => r.oneOrMore(() => $list), "target1")
                            .and(r => r.zeroOrMore(() => $NEWLINE))
                            .and(() => $DEDENT)
                            .and(() => $paragraph_item_child, "target2")
                            .and(r => r.zeroOrMore(() => $NEWLINE))
                            .and(r => r
                                .zeroOrMore(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(() => $paragraph_item_child, "_target")
                                            .and(r => r.zeroOrMore(() => $NEWLINE)),
                                        )
                                    , (({ _target }) => {
                                        return _target;
                                    }),
                                    ),
                                )
                            , "target2_rest")
                            .and(() => $DEDENT)
                            .action(({ target1, target2, target2_rest }) => {
                                return [...target1, target2, ...target2_rest];
                            }),
                        ),
                    ),
                ),
            )
        , "children")
        .action(({ state, location, paragraph_caption, title_struct, inline_contents, children }) => {
            const lineno = location().start.line;
            let indent = state.indentMemo[lineno];

            if (state.baseIndentStack.length > 0) {
                const [base_indent, is_first, base_lineno] = state.baseIndentStack[state.baseIndentStack.length - 1];
                if (!is_first || lineno !== base_lineno) {
                    indent -= base_indent;
                }
            }

            const paragraph_item = newStdEL(
                paragraphItemTags[indent],
                { Hide: "false" },
            );
            if (indent === 0) {
                (paragraph_item as Paragraph).attr.OldStyle = "false";
            } else {
                (paragraph_item as Item | Subitem1 | Subitem2 | Subitem3 | Subitem4 | Subitem5 | Subitem6 | Subitem7 | Subitem8 | Subitem9 | Subitem10).attr.Delete = "false";
            }
            if (paragraph_caption !== null) {
                paragraph_item.append(newStdEL("ParagraphCaption", {}, [paragraph_caption]));
            }

            if ("title" in title_struct) {
                paragraph_item.append(newStdEL(paragraphItemTitleTags[indent], {}, [title_struct.title]));
            }

            if ("old_num_attr" in title_struct) {
                (paragraph_item as Paragraph).attr.OldNum = title_struct.old_num_attr[1];
            }

            if ("missing_num_attr" in title_struct) {
                /* */
            }


            // let num = parseNamedNum(paragraph_item_title);
            // if(num) {
            //     paragraph_item.attr.Num = num;
            // }

            paragraph_item.append(newStdEL(paragraphItemSentenceTags[indent], {}, inline_contents));

            if (children) {
                setItemNum(children);
            }

            paragraph_item.extend(children || []);

            return paragraph_item;
        }),
    ) ;

export const $in_table_column_paragraph_items = factory
    .withName("in_table_column_paragraph_items")
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .asSlice(r => r
                            .sequence(c => c
                                .and(r => r.nextIsNot(() => $article_title))
                                .and(r => r.nextIsNot(() => $appdx_table_title))
                                .and(r => r.nextIsNot(() => $appdx_style_title))
                                .and(r => r.nextIsNot(() => $appdx_format_title))
                                .and(r => r.nextIsNot(() => $appdx_fig_title))
                                .and(r => r.nextIsNot(() => $appdx_note_title))
                                .and(r => r.nextIsNot(() => $appdx_title))
                                .and(r => r.nextIsNot(() => $suppl_provision_label))
                                .and(r => r
                                    .oneOrMore(r => r.regExp(/^[^ 　\t\r\n条<]/)),
                                ),
                            ),
                        )
                    , "paragraph_item_title")
                    .and(() => $__)
                    .and(() => $columns_or_sentences, "inline_contents")
                    .and(r => r.oneOrMore(() => $NEWLINE))
                    .and(() => $INDENT)
                    .and(() => $INDENT)
                    .and(r => r
                        .zeroOrOne(r => r
                            .choice(c => c
                                .or(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(() => $INDENT)
                                            .and(() => $INDENT)
                                            .and(r => r.oneOrMore(() => $list), "target")
                                            .and(r => r.zeroOrMore(() => $NEWLINE))
                                            .and(() => $DEDENT)
                                            .and(() => $DEDENT),
                                        )
                                    , (({ target }) => {
                                        return target;
                                    }),
                                    ),
                                )
                                .or(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(() => $INDENT)
                                            .and(() => $paragraph_item_child, "target")
                                            .and(r => r.zeroOrMore(() => $NEWLINE))
                                            .and(r => r
                                                .zeroOrMore(r => r
                                                    .action(r => r
                                                        .sequence(c => c
                                                            .and(() => $paragraph_item_child, "_target")
                                                            .and(r => r.zeroOrMore(() => $NEWLINE)),
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
                                .or(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(() => $INDENT)
                                            .and(() => $INDENT)
                                            .and(r => r.oneOrMore(() => $list), "target1")
                                            .and(r => r.zeroOrMore(() => $NEWLINE))
                                            .and(() => $DEDENT)
                                            .and(() => $paragraph_item_child, "target2")
                                            .and(r => r.zeroOrMore(() => $NEWLINE))
                                            .and(r => r
                                                .zeroOrMore(r => r
                                                    .action(r => r
                                                        .sequence(c => c
                                                            .and(() => $paragraph_item_child, "_target")
                                                            .and(r => r.zeroOrMore(() => $NEWLINE)),
                                                        )
                                                    , (({ _target }) => {
                                                        return _target;
                                                    }),
                                                    ),
                                                )
                                            , "target2_rest")
                                            .and(() => $DEDENT),
                                        )
                                    , (({ target1, target2, target2_rest }) => {
                                        return [...target1, target2, ...target2_rest];
                                    }),
                                    ),
                                ),
                            ),
                        )
                    , "children")
                    .and(r => r.zeroOrMore(() => $paragraph_item), "rest")
                    .and(() => $DEDENT)
                    .and(() => $DEDENT),
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

                const paragraph_item = newStdEL(
                    paragraphItemTags[indent],
                    { Hide: "false" },
                );
                if (indent === 0) {
                    (paragraph_item as Paragraph).attr.OldStyle = "false";
                } else {
                    (paragraph_item as Item | Subitem1 | Subitem2 | Subitem3 | Subitem4 | Subitem5 | Subitem6 | Subitem7 | Subitem8 | Subitem9 | Subitem10).attr.Delete = "false";
                }

                paragraph_item.append(newStdEL(paragraphItemTitleTags[indent], {}, [paragraph_item_title]));

                // let num = parseNamedNum(paragraph_item_title);
                // if(num) {
                //     paragraph_item.attr.Num = num;
                // }

                paragraph_item.append(newStdEL(paragraphItemSentenceTags[indent], {}, inline_contents));

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
                                .and(r => r.nextIsNot(() => $article_title))
                                .and(r => r.nextIsNot(() => $appdx_table_title))
                                .and(r => r.nextIsNot(() => $appdx_style_title))
                                .and(r => r.nextIsNot(() => $appdx_format_title))
                                .and(r => r.nextIsNot(() => $appdx_fig_title))
                                .and(r => r.nextIsNot(() => $appdx_note_title))
                                .and(r => r.nextIsNot(() => $appdx_title))
                                .and(r => r.nextIsNot(() => $suppl_provision_label))
                                .and(r => r
                                    .oneOrMore(r => r.regExp(/^[^ 　\t\r\n条<]/)),
                                ),
                            ),
                        )
                    , "paragraph_item_title")
                    .and(() => $__)
                    .and(() => $columns_or_sentences, "inline_contents")
                    .and(r => r.oneOrMore(() => $NEWLINE))
                    .and(r => r.nextIsNot(() => $INDENT)),
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

                const paragraph_item = newStdEL(
                    paragraphItemTags[indent],
                    { Hide: "false" },
                );
                if (indent === 0) {
                    (paragraph_item as Paragraph).attr.OldStyle = "false";
                } else {
                    (paragraph_item as Item | Subitem1 | Subitem2 | Subitem3 | Subitem4 | Subitem5 | Subitem6 | Subitem7 | Subitem8 | Subitem9 | Subitem10).attr.Delete = "false";
                }

                paragraph_item.append(newStdEL(paragraphItemTitleTags[indent], {}, [paragraph_item_title]));

                // let num = parseNamedNum(paragraph_item_title);
                // if(num) {
                //     paragraph_item.attr.Num = num;
                // }

                paragraph_item.append(newStdEL(paragraphItemSentenceTags[indent], {}, inline_contents));

                return [paragraph_item];
            }),
            ),
        ),
    )
    ;

export const $no_name_paragraph_item: ValueRule<Paragraph | Item | Subitem1 | Subitem2 | Subitem3 | Subitem4 | Subitem5 | Subitem6 | Subitem7 | Subitem8 | Subitem9 | Subitem10> = factory
    .withName("no_name_paragraph_item")
    .action(r => r
        .sequence(c => c
            .and(r => r.zeroOrOne(() => $article_paragraph_caption), "paragraph_caption")
            .and(() => $columns_or_sentences, "inline_contents")
            .and(r => r.oneOrMore(() => $NEWLINE))
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(() => $INDENT)
                            .and(() => $INDENT)
                            .and(r => r.oneOrMore(() => $list), "target")
                            .and(r => r.zeroOrMore(() => $NEWLINE))
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
                            .and(r => r.zeroOrMore(() => $NEWLINE))
                            .and(r => r
                                .zeroOrMore(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(() => $paragraph_item_child, "_target")
                                            .and(r => r.zeroOrMore(() => $NEWLINE)),
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

        const paragraph_item = newStdEL(
            paragraphItemTags[indent],
            { Hide: "false", Num: "1" },
        );
        if (indent === 0) {
            (paragraph_item as Paragraph).attr.OldStyle = "false";
        } else {
            (paragraph_item as Item | Subitem1 | Subitem2 | Subitem3 | Subitem4 | Subitem5 | Subitem6 | Subitem7 | Subitem8 | Subitem9 | Subitem10).attr.Delete = "false";
        }
        if (paragraph_caption !== null) {
            paragraph_item.append(newStdEL("ParagraphCaption", {}, [paragraph_caption]));
        }
        paragraph_item.append(newStdEL(paragraphItemTitleTags[indent]));
        paragraph_item.append(newStdEL(paragraphItemSentenceTags[indent], {}, inline_contents));
        paragraph_item.extend(lists || []);

        if (children) {
            setItemNum(children);
        }
        paragraph_item.extend(children || []);

        return paragraph_item;
    }),
    )
    ;

export const $paragraph_item_child = factory
    .withName("paragraph_item_child")
    .choice(c => c
        .or(() => $fig_struct)
        .or(() => $amend_provision)
        .or(() => $table_struct)
        .or(() => $paragraph_item)
        .or(() => $style_struct),
    )
    ;


export const rules = {
    paragraph_item: $paragraph_item,
    in_table_column_paragraph_items: $in_table_column_paragraph_items,
    no_name_paragraph_item: $no_name_paragraph_item,
    paragraph_item_child: $paragraph_item_child,
};
