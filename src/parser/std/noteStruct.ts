/* eslint-disable no-irregular-whitespace */
import { newStdEL } from "@coresrc/std_law";
import { __Text } from "@coresrc/util";
import { factory } from "../common";
import { $INLINE } from "../inline";
import { $_, $NEWLINE, $INDENT, $DEDENT } from "../lexical";
import { $xml_element } from "../xml";
import { $fig } from "./figStruct";
import { $list } from "./list";
import { $paragraph_item } from "./paragraphItem";
import { $remarks } from "./remarks";
import { $table } from "./tableStruct";


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
        const note_struct = newStdEL("NoteStruct");

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
        return newStdEL("NoteStructTitle", {}, [new __Text(title)]);
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
        return newStdEL("Note", {}, children);
    }),
    )
    ;


export const rules = {
    note_struct: $note_struct,
    note_struct_title: $note_struct_title,
    note: $note,
};
