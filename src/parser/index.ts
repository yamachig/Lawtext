import { ValueOfRule } from "generic-parser/lib/core";
import { factory, initializer, ValueRule } from "./common";

import {
    $law,
    $law_title,
    $enact_statement,
    $toc_label,
    $toc,
    $toc_item,
    $main_provision,
    $article_group_title,
    $article_group,
    $article_paragraph_caption,
    $article_title,
    $article,
    $suppl_note,
    $paragraph_item,
    $in_table_column_paragraph_items,
    $no_name_paragraph_item,
    $paragraph_item_child,
    $list,
    $amend_provision,
    $table_struct,
    $table_struct_title,
    $table,
    $table_column_attr_name,
    $table_column,
    $style_struct,
    $style_struct_title,
    $style,
    $format_struct,
    $format_struct_title,
    $format,
    $note_struct,
    $note_struct_title,
    $note,
    $remarks,
    $fig_struct,
    $fig,
    $appdx_item,
    $appdx_table_title,
    $appdx_table,
    $appdx_table_children,
    $suppl_provision_appdx_table_title,
    $suppl_provision_appdx_table,
    $suppl_provision_appdx_table_children,
    $appdx_style_title,
    $appdx_style,
    $suppl_provision_appdx_style_title,
    $suppl_provision_appdx_style,
    $appdx_format_title,
    $appdx_format,
    $appdx_fig_title,
    $appdx_fig,
    $appdx_fig_children,
    $appdx_note_title,
    $appdx_note,
    $appdx_note_children,
    $appdx_title,
    $appdx,
    $suppl_provision_appdx_title,
    $suppl_provision_appdx,
    $suppl_provision_label,
    $suppl_provision,
    $columns_or_sentences,
    $period_sentences,
    $columns,
    $column,
    $INLINE,
    $NEXTINLINE,
    $NOT_PARENTHESIS_CHAR,
    $INLINE_FRAGMENT,
    $PERIOD_SENTENCE_FRAGMENT,
    $OUTSIDE_PARENTHESES_INLINE,
    $OUTSIDE_ROUND_PARENTHESES_INLINE,
    $MISMATCH_START_PARENTHESIS,
    $MISMATCH_END_PARENTHESIS,
    $PARENTHESES_INLINE,
    $PARENTHESES_INLINE_INNER,
    $ROUND_PARENTHESES_INLINE,
    $SQUARE_BRACKETS_INLINE,
    $CURLY_BRACKETS_INLINE,
    $SQUARE_PARENTHESES_INLINE,
    $xml,
    $xml_element,
    $ranges,
    $range,
    $pointer,
    $kanji_digit,
    $roman_digit,
    $iroha_char,
    $pointer_fragment,
} from "./elements";
import { $CHAR, $DEDENT, $INDENT, $NEWLINE, $_, $__ } from "./lexical";

const $start = factory
    .sequence(c => c
        .and(r => r
            .zeroOrMore(r => r
                .ref(() => $NEWLINE),
            ),
        )
        .and(r => r
            .ref(() => $law)
        , "law")
        .and(r => r
            .nextIsNot(r => r
                .anyOne(),
            ),
        )
        .action((({ law }) => {
            return law;
        })),
    );


const rules = {
    start: $start,
    law: $law,
    law_title: $law_title,
    enact_statement: $enact_statement,
    toc_label: $toc_label,
    toc: $toc,
    toc_item: $toc_item,
    main_provision: $main_provision,
    article_group_title: $article_group_title,
    article_group: $article_group,
    article_paragraph_caption: $article_paragraph_caption,
    article_title: $article_title,
    article: $article,
    suppl_note: $suppl_note,
    paragraph_item: $paragraph_item,
    in_table_column_paragraph_items: $in_table_column_paragraph_items,
    no_name_paragraph_item: $no_name_paragraph_item,
    paragraph_item_child: $paragraph_item_child,
    list: $list,
    amend_provision: $amend_provision,
    table_struct: $table_struct,
    table_struct_title: $table_struct_title,
    table: $table,
    table_column_attr_name: $table_column_attr_name,
    table_column: $table_column,
    style_struct: $style_struct,
    style_struct_title: $style_struct_title,
    style: $style,
    format_struct: $format_struct,
    format_struct_title: $format_struct_title,
    format: $format,
    note_struct: $note_struct,
    note_struct_title: $note_struct_title,
    note: $note,
    remarks: $remarks,
    fig_struct: $fig_struct,
    fig: $fig,
    appdx_item: $appdx_item,
    appdx_table_title: $appdx_table_title,
    appdx_table: $appdx_table,
    appdx_table_children: $appdx_table_children,
    suppl_provision_appdx_table_title: $suppl_provision_appdx_table_title,
    suppl_provision_appdx_table: $suppl_provision_appdx_table,
    suppl_provision_appdx_table_children: $suppl_provision_appdx_table_children,
    appdx_style_title: $appdx_style_title,
    appdx_style: $appdx_style,
    suppl_provision_appdx_style_title: $suppl_provision_appdx_style_title,
    suppl_provision_appdx_style: $suppl_provision_appdx_style,
    appdx_format_title: $appdx_format_title,
    appdx_format: $appdx_format,
    appdx_fig_title: $appdx_fig_title,
    appdx_fig: $appdx_fig,
    appdx_fig_children: $appdx_fig_children,
    appdx_note_title: $appdx_note_title,
    appdx_note: $appdx_note,
    appdx_note_children: $appdx_note_children,
    appdx_title: $appdx_title,
    appdx: $appdx,
    suppl_provision_appdx_title: $suppl_provision_appdx_title,
    suppl_provision_appdx: $suppl_provision_appdx,
    suppl_provision_label: $suppl_provision_label,
    suppl_provision: $suppl_provision,
    columns_or_sentences: $columns_or_sentences,
    period_sentences: $period_sentences,
    columns: $columns,
    column: $column,
    INLINE: $INLINE,
    NEXTINLINE: $NEXTINLINE,
    NOT_PARENTHESIS_CHAR: $NOT_PARENTHESIS_CHAR,
    INLINE_FRAGMENT: $INLINE_FRAGMENT,
    PERIOD_SENTENCE_FRAGMENT: $PERIOD_SENTENCE_FRAGMENT,
    OUTSIDE_PARENTHESES_INLINE: $OUTSIDE_PARENTHESES_INLINE,
    OUTSIDE_ROUND_PARENTHESES_INLINE: $OUTSIDE_ROUND_PARENTHESES_INLINE,
    MISMATCH_START_PARENTHESIS: $MISMATCH_START_PARENTHESIS,
    MISMATCH_END_PARENTHESIS: $MISMATCH_END_PARENTHESIS,
    PARENTHESES_INLINE: $PARENTHESES_INLINE,
    PARENTHESES_INLINE_INNER: $PARENTHESES_INLINE_INNER,
    ROUND_PARENTHESES_INLINE: $ROUND_PARENTHESES_INLINE,
    SQUARE_BRACKETS_INLINE: $SQUARE_BRACKETS_INLINE,
    CURLY_BRACKETS_INLINE: $CURLY_BRACKETS_INLINE,
    SQUARE_PARENTHESES_INLINE: $SQUARE_PARENTHESES_INLINE,
    xml: $xml,
    xml_element: $xml_element,
    ranges: $ranges,
    range: $range,
    pointer: $pointer,
    kanji_digit: $kanji_digit,
    roman_digit: $roman_digit,
    iroha_char: $iroha_char,
    pointer_fragment: $pointer_fragment,
    INDENT: $INDENT,
    DEDENT: $DEDENT,
    _: $_,
    __: $__,
    CHAR: $CHAR,
    NEWLINE: $NEWLINE,
};
    type Rules = typeof rules;

export const parse = <TRuleKey extends (keyof Rules) = "start">(text: string, options: {startRule?: TRuleKey} & Record<string | number | symbol, unknown>): ValueOfRule<Rules[TRuleKey]> => {
    let rule: ValueRule<unknown> = $start;
    if ("startRule" in options) {
        rule = rules[options.startRule as keyof typeof rules];
    }
    const result = rule.match(
        0,
        text,
        initializer(options),
    );
    if (result.ok) return result.value as ValueOfRule<Rules[TRuleKey]>;
    throw new Error(`Expected ${result.expected} ${JSON.stringify(result)}`);
};
