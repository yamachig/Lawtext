/* eslint-disable no-irregular-whitespace */
import { newStdEL } from "../../std_law";
import { __Text } from "../../node/control";
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
            .and(r => r.nextIsNot(() => $INDENT))
            .and(r => r.nextIsNot(() => $DEDENT))
            .and(r => r.nextIsNot(() => $NEWLINE))
            .and(r => r.zeroOrOne(() => $format_struct_title), "format_struct_title")
            .and(r => r.zeroOrMore(() => $remarks), "remarkses1")
            .and(() => $format, "format")
            .and(r => r.zeroOrMore(() => $remarks), "remarkses2"),
        )
    , (({ format_struct_title, remarkses1, format, remarkses2 }) => {
        const format_struct = newStdEL("FormatStruct");

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
            .and(r => r.seqEqual(":format-struct-title:"))
            .and(() => $_)
            .and(r => r.asSlice(() => $INLINE), "title")
            .and(() => $NEWLINE),
        )
    , (({ title }) => {
        return newStdEL("FormatStructTitle", {}, [new __Text(title)]);
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
                                .and(() => $fig, "fig"),
                            )
                        , (({ fig }) => {
                            return [fig];
                        }),
                        ),
                    )
                    .or(() => $columns_or_sentences),
                )
            , "children"),
        )
    , (({ children }) => {
        return newStdEL("Format", {}, children);
    }),
    )
    ;


export const rules = {
    format_struct: $format_struct,
    format_struct_title: $format_struct_title,
    format: $format,
};
