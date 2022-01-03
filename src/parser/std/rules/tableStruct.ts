/* eslint-disable no-irregular-whitespace */
import { newStdEL, StdEL, Table } from "../../../law/std";
import { __Text } from "../../../node/control";
import { factory, ValueRule } from "../common";
import { $INLINE } from "../../cst/rules/inline";
import { $_, $NEWLINE, $INDENT, $DEDENT, $__ } from "../../cst/rules/lexical";
import { $fig_struct } from "./figStruct";
import { $in_table_column_paragraph_items } from "./paragraphItem";
import { $remarks } from "./remarks";


export const $table_struct = factory
    .withName("table_struct")
    .action(r => r
        .sequence(c => c
            .and(r => r.nextIsNot(() => $INDENT))
            .and(r => r.nextIsNot(() => $DEDENT))
            .and(r => r.nextIsNot(() => $NEWLINE))
            .and(r => r
                .zeroOrOne(r => r
                    .sequence(c => c
                        .and(r => r.seqEqual(":table-struct:"))
                        .and(() => $NEWLINE),
                    ),
                ),
            )
            .and(r => r.zeroOrOne(() => $table_struct_title), "table_struct_title")
            .and(r => r.zeroOrMore(() => $remarks), "remarkses1")
            .and(() => $table, "table")
            .and(r => r.zeroOrMore(() => $remarks), "remarkses2"),
        )
    , (({ table_struct_title, remarkses1, table, remarkses2 }) => {
        const table_struct = newStdEL("TableStruct");

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

export const $table_struct_title = factory
    .withName("table_struct_title")
    .action(r => r
        .sequence(c => c
            .and(r => r.seqEqual(":table-struct-title:"))
            .and(() => $_)
            .and(r => r.asSlice(() => $INLINE), "title")
            .and(() => $NEWLINE),
        )
    , (({ title }) => {
        return newStdEL("TableStructTitle", {}, [new __Text(title)]);
    }),
    )
    ;

export const $table: ValueRule<Table> = factory
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
                                            .and(r => r.seqEqual("["))
                                            .and(r => r
                                                .asSlice(r => r
                                                    .oneOrMore(r => r.regExp(/^[^ 　\t\r\n\]=]/)),
                                                )
                                            , "name")
                                            .and(r => r.seqEqual("=\""))
                                            .and(r => r
                                                .asSlice(r => r
                                                    .oneOrMore(r => r.regExp(/^[^ 　\t\r\n\]"]/)),
                                                )
                                            , "value")
                                            .and(r => r.seqEqual("\"]")),
                                        )
                                    , (({ name, value }) => {
                                        return [name, value];
                                    }),
                                    ),
                                )
                            , "target")
                            .and(() => $NEWLINE),
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
                            .and(r => r.seqEqual("*"))
                            .and(() => $__)
                            .and(() => $table_column, "first")
                            .and(r => r
                                .zeroOrMore(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .choice(c => c
                                                    .or(r => r.seqEqual("  "))
                                                    .or(r => r.seqEqual("　"))
                                                    .or(r => r.seqEqual("\t")),
                                                ),
                                            )
                                            .and(() => $table_column, "target"),
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
        const table = newStdEL("Table");
        if (attr) {
            for (let i = 0; i < attr.length; i++) {
                const [name, value] = attr[i];
                (table as StdEL).attr[name] = value;
            }
        }
        for (let i = 0; i < table_row_columns.length; i++) {
            const table_row = newStdEL("TableRow", {}, table_row_columns[i]);
            table.append(table_row);
        }

        return table;
    }),
    )
    ;

export const $table_column_attr_name = factory
    .withName("table_column_attr_name")
    .choice(c => c
        .or(r => r.seqEqual("BorderTop"))
        .or(r => r.seqEqual("BorderBottom"))
        .or(r => r.seqEqual("BorderLeft"))
        .or(r => r.seqEqual("BorderRight"))
        .or(r => r.seqEqual("rowspan"))
        .or(r => r.seqEqual("colspan"))
        .or(r => r.seqEqual("Align"))
        .or(r => r.seqEqual("Valign")),
    )
    ;

export const $table_column = factory
    .withName("table_column")
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.seqEqual("-"))
                    .and(() => $__)
                    .and(r => r
                        .zeroOrMore(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(r => r.seqEqual("["))
                                    .and(r => r.asSlice(() => $table_column_attr_name), "name")
                                    .and(r => r.seqEqual("=\""))
                                    .and(r => r
                                        .asSlice(r => r
                                            .oneOrMore(r => r.regExp(/^[^ 　\t\r\n\]"]/)),
                                        )
                                    , "value")
                                    .and(r => r.seqEqual("\"]")),
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
                                                .or(() => $remarks)
                                                .or(() => $fig_struct),
                                            )
                                        , "first")
                                        .and(r => r
                                            .zeroOrOne(r => r
                                                .action(r => r
                                                    .sequence(c => c
                                                        .and(() => $INDENT)
                                                        .and(() => $INDENT)
                                                        .and(r => r
                                                            .oneOrMore(r => r
                                                                .action(r => r
                                                                    .sequence(c => c
                                                                        .and(() => $fig_struct, "_target"),
                                                                    )
                                                                , (({ _target }) => {
                                                                    return _target;
                                                                }),
                                                                ),
                                                            )
                                                        , "target")
                                                        .and(r => r.zeroOrMore(() => $NEWLINE))
                                                        .and(() => $DEDENT)
                                                        .and(() => $DEDENT),
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
                            .or(() => $in_table_column_paragraph_items)
                            .or(r => r
                                .action(r => r
                                    .sequence(c => c
                                        .and(r => r
                                            .action(r => r
                                                .sequence(c => c
                                                    .and(r => r.zeroOrOne(() => $INLINE), "inline")
                                                    .and(() => $NEWLINE),
                                                )
                                            , (({ inline }) => {
                                                return newStdEL(
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
                                                        .and(() => $INDENT)
                                                        .and(() => $INDENT)
                                                        .and(r => r
                                                            .oneOrMore(r => r
                                                                .action(r => r
                                                                    .sequence(c => c
                                                                        .and(r => r
                                                                            .action(r => r
                                                                                .sequence(c => c
                                                                                    .and(() => $INLINE, "inline")
                                                                                    .and(() => $NEWLINE),
                                                                                )
                                                                            , (({ inline }) => {
                                                                                return newStdEL(
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
                                                        .and(r => r.zeroOrMore(() => $NEWLINE))
                                                        .and(() => $DEDENT)
                                                        .and(() => $DEDENT),
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
                const table_column = newStdEL("TableColumn");
                for (let i = 0; i < attr.length; i++) {
                    const [name, value] = attr[i];
                    (table_column as StdEL).attr[name] = value;
                }

                table_column.extend(children);

                return table_column;
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.seqEqual("-"))
                    .and(() => $_)
                    .and(() => $NEWLINE),
                )
            , (() => {
                return newStdEL(
                    "TableColumn",
                    {
                        BorderTop: "solid",
                        BorderRight: "solid",
                        BorderBottom: "solid",
                        BorderLeft: "solid",
                    },
                    [newStdEL("Sentence")],
                );
            }),
            ),
        ),
    )
    ;


export const rules = {
    table_struct: $table_struct,
    table_struct_title: $table_struct_title,
    table: $table,
    table_column_attr_name: $table_column_attr_name,
    table_column: $table_column,
};
