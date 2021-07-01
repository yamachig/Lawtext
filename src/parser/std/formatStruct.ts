/* eslint-disable no-irregular-whitespace */
import { __Text, EL } from "@coresrc/util";
import { factory } from "../common";
import { $INLINE } from "../inline";
import { $_, $NEWLINE, $INDENT, $DEDENT } from "../lexical";
import { $columns_or_sentences } from "./columnsOrSentences";
import { $fig } from "./figStruct";
import { $remarks } from "./remarks";

export const $format_struct = factory
    .withName("format_struct")
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
                    .ref(() => $format_struct_title),
                )
            , "format_struct_title")
            .and(r => r
                .zeroOrMore(r => r
                    .ref(() => $remarks),
                )
            , "remarkses1")
            .and(r => r
                .ref(() => $format)
            , "format")
            .and(r => r
                .zeroOrMore(r => r
                    .ref(() => $remarks),
                )
            , "remarkses2"),
        )
    , (({ format_struct_title, remarkses1, format, remarkses2 }) => {
        const format_struct = new EL("FormatStruct");

        if (format_struct_title !== null) {
            format_struct.append(format_struct_title);
        }

        format_struct.extend(remarkses1);

        format_struct.append(format);

        format_struct.extend(remarkses2);

        return format_struct;
    }),
    )
    ;

export const $format_struct_title = factory
    .withName("format_struct_title")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual(":format-struct-title:"),
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
        return new EL("FormatStructTitle", {}, [new __Text(title)]);
    }),
    )
    ;

export const $format = factory
    .withName("format")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .choice(c => c
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
                        .ref(() => $columns_or_sentences),
                    ),
                )
            , "children"),
        )
    , (({ children }) => {
        return new EL("Format", {}, children);
    }),
    )
    ;


export const rules = {
    format_struct: $format_struct,
    format_struct_title: $format_struct_title,
    format: $format,
};
