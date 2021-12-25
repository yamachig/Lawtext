/* eslint-disable no-irregular-whitespace */
import { newStdEL } from "../../std_law";
import { __Text } from "../../util";
import { factory } from "../common";
import { $INLINE } from "../inline";
import { $_, $NEWLINE, $INDENT, $DEDENT } from "../lexical";
import { $fig, $fig_struct } from "./figStruct";
import { $list } from "./list";
import { $paragraph_item } from "./paragraphItem";
import { $remarks } from "./remarks";
import { $table, $table_struct } from "./tableStruct";


export const $style_struct = factory
    .withName("style_struct")
    .action(r => r
        .sequence(c => c
            .and(r => r.nextIsNot(() => $INDENT))
            .and(r => r.nextIsNot(() => $DEDENT))
            .and(r => r.nextIsNot(() => $NEWLINE))
            .and(r => r.zeroOrOne(() => $style_struct_title), "style_struct_title")
            .and(r => r.zeroOrMore(() => $remarks), "remarkses1")
            .and(() => $style, "style")
            .and(r => r.zeroOrMore(() => $remarks), "remarkses2"),
        )
    , (({ style_struct_title, remarkses1, style, remarkses2 }) => {
        const style_struct = newStdEL("StyleStruct");

        if (style_struct_title !== null) {
            style_struct.append(style_struct_title);
        }

        style_struct.extend(remarkses1);

        style_struct.append(style);

        style_struct.extend(remarkses2);

        return style_struct;
    }),
    )
    ;

export const $style_struct_title = factory
    .withName("style_struct_title")
    .action(r => r
        .sequence(c => c
            .and(r => r.seqEqual(":style-struct-title:"))
            .and(() => $_)
            .and(r => r.asSlice(() => $INLINE), "title")
            .and(() => $NEWLINE),
        )
    , (({ title }) => {
        return newStdEL("StyleStructTitle", {}, [new __Text(title)]);
    }),
    )
    ;

export const $style = factory
    .withName("style")
    .action(r => r
        .sequence(c => c
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
                .oneOrMore(r => r
                    .choice(c => c
                        .or(() => $table)
                        .or(() => $table_struct)
                        .or(() => $fig)
                        .or(() => $fig_struct)
                        .or(() => $paragraph_item),
                    ),
                )
            , "children"),
        )
    , (({ lists, children }) => {
        return newStdEL("Style", {}, [...(lists || []), ...children]);
    }),
    )
    ;


export const rules = {
    style_struct: $style_struct,
    style_struct_title: $style_struct_title,
    style: $style,
};
