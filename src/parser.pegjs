{
    const EL = util.EL;
    const __Text = util.__Text;
    const __Parentheses = util.__Parentheses;

    const indentMemo = options.indentMemo;
    const baseIndentStack:Array<[number, boolean, number]> = [];
    let listDepth = 0;
    let parenthesesDepth = 0;
}





start =
    NEWLINE*
    law:law
    !.
    {
        return law;
    }




// ########### structures control begin ###########

law =
    law_title:law_title?
    preambles1:(
        (":前文:" / ":Preamble:") NEWLINE
        target:(
            inline:INLINE NEWLINE
            {
                return new EL("Paragraph", {}, [
                    new EL("ParagraphNum"),
                    new EL("ParagraphSentence", {}, [
                        new EL("Sentence", {}, inline),
                    ]),
                ]);
            }
        )+
        NEWLINE+
        { return new EL("Preamble", {}, target); }
    )*
    enact_statements:(
        INDENT INDENT
            target:enact_statement+
        DEDENT DEDENT
        { return target; }
    )?
    toc:toc?
    preambles2:(
        (":前文:" / ":Preamble:") NEWLINE
        target:(
            inline:INLINE NEWLINE
            {
                return new EL("Paragraph", {}, [
                    new EL("ParagraphNum"),
                    new EL("ParagraphSentence", {}, [
                        new EL("Sentence", {}, inline),
                    ]),
                ]);
            }
        )+
        NEWLINE+
        { return new EL("Preamble", {}, target); }
    )*
    main_provision:main_provision
    appdx_items:appdx_item*
    {
        let law = new EL("Law", {Lang: "ja"});
        let law_body = new EL("LawBody");

        if(law_title !== null) {
            if(law_title.law_num) {
                law.append(new EL("LawNum", {}, [law_title.law_num]));

                let m = law_title.law_num.match(/^(明治|大正|昭和|平成|令和)([一二三四五六七八九十]+)年(\S+?)(?:第([一二三四五六七八九十百千]+)号)?$/);
                if(m) {
                    let [era, year, law_type, num] = m.slice(1);

                    let era_val = util.eras[era];
                    if(era_val) law.attr.Era = era_val;

                    let year_val = util.parseKanjiNum(year);
                    if(year_val !== null) law.attr.Year = year_val;

                    let law_type_val = util.getLawtype(law_type);
                    if(law_type_val !== null) law.attr.LawType = law_type_val;

                    if(num) {
                        let num_val = util.parseKanjiNum(num);
                        if(num_val !== null) law.attr.Num = num_val;
                        else law.attr.Num = "";
                    } else {
                        law.attr.Num = "";
                    }
                }
            }

            if(law_title.law_title) {
                law_body.append(new EL("LawTitle", {}, [law_title.law_title]));
            }
        }

        law.append(law_body);

        law_body.extend(preambles1);
        law_body.extend(enact_statements || []);
        law_body.append(toc);
        law_body.extend(preambles2);
        law_body.append(main_provision);
        law_body.extend(appdx_items);

        return law;
    }

law_title "law_title" =
    law_title:$INLINE NEWLINE law_num:ROUND_PARENTHESES_INLINE NEWLINE+
    {
        return {
            law_title: law_title,
            law_num: law_num.content,
        }
    }
    /
    law_title:$INLINE NEWLINE+
    {
        return {
            law_title: law_title,
        }
    }

enact_statement "enact_statement" =
    // &(here:$(NEXTINLINE) &{ console.error(`here0 line ${location().start.line}: ${here}`); return true; })
    !__
    !toc_label
    !article_title
    target:INLINE
    NEWLINE+
    {
        return new EL("EnactStatement", {}, target);
    }




toc_label "toc_label" =
    !INDENT !DEDENT !NEWLINE
    ([^\r\n目]* "目次") &NEWLINE

toc "toc" =
    // &(here:$(NEXTINLINE) &{ console.error(`here1 line ${location().start.line}: ${here}`); return true; })
    toc_label:$toc_label
    NEWLINE
    INDENT
        first:toc_item
        rest:(target:toc_item { return target; })*
        NEWLINE*
    DEDENT
    // &(here:$(NEXTINLINE) &{ console.error(`here2 line ${location().start.line}: ${here}`); return true; })
    {
        let children = [first].concat(rest);

        let toc = new EL("TOC", {}, []);
        toc.append(new EL("TOCLabel", {}, [toc_label]));
        toc.extend(children);

        return toc;
    }

toc_item "toc_item" =
    !INDENT !DEDENT !NEWLINE
    // &(here:$(NEXTINLINE) &{ console.error(`here1.1 line ${location().start.line}: ${here}`); return true; })
    fragments:(
        sets:(
            target:OUTSIDE_ROUND_PARENTHESES_INLINE
            { return target.content; }
            /
            target:ROUND_PARENTHESES_INLINE
            { return [target]; }
        )+
        {
            const ret:util.EL[] = [];
            for(const set of sets) {
                ret.push(...set);
            }
            return ret;
        }
    )
    NEWLINE
    children:(
        INDENT
            first:toc_item
            rest:(target:toc_item { return target; })*
            NEWLINE*
        DEDENT
        { return [first].concat(rest); }
    )?
    // &(here:$(NEXTINLINE) &{ console.error(`here1.2 line ${location().start.line}: ${here}`); return true; })
    {
        const last_fragment = fragments[fragments.length - 1];
        let article_range;
        let title_fragments;
        if(last_fragment instanceof __Parentheses && last_fragment.attr.type === "round") {
            title_fragments = fragments.slice(0, fragments.length - 1);
            article_range = last_fragment;
        } else {
            title_fragments = fragments.slice(0, fragments.length);
            article_range = null;
        }
        if(!title_fragments[0].text) console.error(title_fragments);

        let toc_item;

        if(title_fragments[0].text.match(/前文/)) {
            toc_item = new EL("TOCPreambleLabel", {}, title_fragments);
        } else {
            let type_char = title_fragments[0].text.match(/[編章節款目章則]/)[0];
            toc_item = new EL("TOC" + util.articleGroupType[type_char]);

            if(title_fragments[0].text.match(/[編章節款目章]/)) {
                toc_item.attr.Delete = 'false';
                let num = util.parseNamedNum(title_fragments[0].text);
                if(num) {
                    toc_item.attr.Num = num;
                }
            }

            toc_item.append(new EL(
                util.articleGroupTitleTag[type_char],
                {},
                title_fragments,
            ));

            if(article_range !== null) {
                toc_item.append(new EL(
                    "ArticleRange",
                    {},
                    [article_range],
                ));
            }

            toc_item.extend(children || []);
        }

        return toc_item;
    }












main_provision =
    children:(article / article_group)+
    {
        return new EL("MainProvision", {}, children);
    }
    /
    paragraph:no_name_paragraph_item
    {
        return new EL("MainProvision", {}, [paragraph]);
    }





article_group_title "article_group_title" =
    // &(here:$(INLINE / ..........) &{ console.error(`here line ${location().start.line}: ${here}`); return true; })
    __
    title:(
        num:(
            "第"
            [^ 　\t\r\n編章節款目]+
            type_char:[編章節款目]
            ([のノ] [^ 　\t\r\n]+)?
            { return {num: text(), type_char: type_char}; }
        )
        name:(
            space:$__
            inline:INLINE
            { return {space: space, inline: inline}; }
        )?
        {
            return Object.assign({
                content: [
                    new __Text(num.num),
                    new __Text(name.space),
                ].concat(name.inline),
            }, num, name);
        }
    )
    NEWLINE+
    {
        return title;
    }

article_group "article_group" =
    article_group_title:article_group_title
    children:(
        article
        /
        (
            &(next_title:article_group_title &{
                let current_level = util.articleGroupTypeChars.indexOf(article_group_title.type_char);
                let next_level = util.articleGroupTypeChars.indexOf(next_title.type_char);
                return current_level < next_level;
            })
            article_group:article_group
            {
                return article_group;
            }
        )
    )+
    {
        let article_group = new EL(
            util.articleGroupType[article_group_title.type_char],
            {Delete: "false", Hide: "false"},
        );

        article_group.append(new EL(
            util.articleGroupType[article_group_title.type_char] + "Title",
            {},
            article_group_title.content,
        ))

        let num = util.parseNamedNum(article_group_title.num);
        if(num) {
            article_group.attr.Num = num;
        }

        article_group.extend(children);

        return article_group;
    }




article_paragraph_caption "article_paragraph_caption" =
    __
    article_paragraph_caption:ROUND_PARENTHESES_INLINE
    NEWLINE
    &[^ 　\t\r\n]
    {
        return article_paragraph_caption;
    }

article_title "article_title" =
    "第"
    [^ 　\t\r\n条]+
    "条"
    (([のノ] / "及び") [^ 　\t\r\n]+)?

article "article" =
    article_caption:article_paragraph_caption?
    article_title:$article_title
    inline_contents:(
        __
        target:columns_or_sentences
        { return target; }
        /
        _
        { return [new EL("Sentence")]; }
    )
    NEWLINE+
    lists:(
        INDENT INDENT
            target:list+
            NEWLINE*
        DEDENT DEDENT
        { return target; }
    )?
    children1:(
        INDENT
            target:paragraph_item_child NEWLINE*
            target_rest:(
                _target:paragraph_item_child NEWLINE*
                { return _target; }
            )*
        DEDENT
        { return [target].concat(target_rest); }
    )?
    paragraphs:paragraph_item*
    children2:(
        INDENT
            target:paragraph_item_child NEWLINE*
            target_rest:(
                _target:paragraph_item_child NEWLINE*
                { return _target; }
            )*
        DEDENT
        { return [target].concat(target_rest); }
    )?
    suppl_notes:suppl_note*
    {
        let article = new EL(
            "Article",
            {Delete: "false", Hide: "false"},
        );
        if(article_caption !== null) {
            article.append(new EL("ArticleCaption", {}, [article_caption]));
        }
        article.append(new EL("ArticleTitle", {}, [article_title]));

        let num = util.parseNamedNum(article_title);
        if(num) {
            article.attr.Num = num;
        }

        let paragraph = new EL("Paragraph");
        paragraph.attr.Num = "1";
        paragraph.attr.OldStyle = "false";
        paragraph.attr.Delete = "false";
        article.append(paragraph);

        paragraph.append(new EL("ParagraphNum"));
        paragraph.append(new EL("ParagraphSentence", {}, inline_contents));
        paragraph.extend(lists || []);
        paragraph.extend(children1 || []);
        paragraph.extend(children2 || []);

        article.extend(paragraphs);
        article.extend(suppl_notes);

        return article;
    }




suppl_note "suppl_note" =
    ":SupplNote:" _ inline:INLINE NEWLINE+
    {
        return new EL("SupplNote", {}, inline);
    }


paragraph_item "paragraph_item" =
    paragraph_caption:article_paragraph_caption?
    paragraph_item_title:$(
        !article_title
        !appdx_table_title
        !appdx_style_title
        !appdx_format_title
        !appdx_fig_title
        !appdx_note_title
        !appdx_title
        !suppl_provision_label
        !":SupplNote:"
        [^ 　\t\r\n条<]+
    )
    __
    // &(here:$(NEXTINLINE) &{ console.error(`paragraph_item line ${location().start.line}: ${here}`); return true; })
    inline_contents:columns_or_sentences
    NEWLINE+
    children:(

        INDENT INDENT
            target:list+
            NEWLINE*
        DEDENT DEDENT
        { return target; }

        /

        INDENT
            target:paragraph_item_child NEWLINE*
            target_rest:(
                _target:paragraph_item_child NEWLINE*
                { return _target; }
            )*
        DEDENT
        { return [target].concat(target_rest); }

        /

        INDENT INDENT
    // &(here:$(NEXTINLINE) &{ console.error(`here1.1 line ${location().start.line}: ${here}`); return true; })
            target1:list+
    // &(here:$(NEXTINLINE) &{ console.error(`here1.2 line ${location().start.line}: ${here}`); return true; })
            NEWLINE*
        DEDENT
            target2:paragraph_item_child NEWLINE*
            target2_rest:(
                _target:paragraph_item_child NEWLINE*
                { return _target; }
            )*
        DEDENT
        { return [...target1, target2, ...target2_rest]; }
    )?
    // &(here:$(NEXTINLINE) &{ console.error(`here2 line ${location().start.line}: ${here}`); return true; })
    {
        let lineno = location().start.line;
        let indent = indentMemo[lineno];

        if(baseIndentStack.length > 0) {
            let [base_indent, is_first, base_lineno] = baseIndentStack[baseIndentStack.length - 1];
            if(!is_first || lineno !== base_lineno) {
                indent -= base_indent;
            }
        }

        let paragraph_item = new EL(
            util.paragraphItemTags[indent],
            {Hide: "false"},
        );
        if(indent === 0) {
            paragraph_item.attr.OldStyle = "false";
        } else {
            paragraph_item.attr.Delete = "false";
        }
        if(paragraph_caption !== null) {
            paragraph_item.append(new EL("ParagraphCaption", {}, [paragraph_caption]));
        }

        paragraph_item.append(new EL(util.paragraphItemTitleTags[indent], {}, [paragraph_item_title]));

        // let num = util.parseNamedNum(paragraph_item_title);
        // if(num) {
        //     paragraph_item.attr.Num = num;
        // }

        paragraph_item.append(new EL(util.paragraphItemSentenceTags[indent], {}, inline_contents));

        if(children) {
            util.setItemNum(children);
        }

        paragraph_item.extend(children || []);

        return paragraph_item;
    }


in_table_column_paragraph_items "in_table_column_paragraph_items" =
    // &(here:$(INLINE / ......) &{ console.error(`visit in_table_column_paragraph_item line ${location().start.line}: ${here}`); return true; })
    paragraph_item_title:$(
        !article_title
        !appdx_table_title
        !appdx_style_title
        !appdx_format_title
        !appdx_fig_title
        !appdx_note_title
        !appdx_title
        !suppl_provision_label
        [^ 　\t\r\n条<]+
    )
    __
    inline_contents:columns_or_sentences
    NEWLINE+

    INDENT INDENT
        children:(
            INDENT INDENT
                target:list+
                NEWLINE*
            DEDENT DEDENT
            { return target; }

            /

            INDENT
        // &(here:$(INLINE / ......) &{ console.error(`in_table_column_paragraph_item here1.1 line ${location().start.line}: ${here}`); return true; })
                target:paragraph_item_child NEWLINE*
        // &(here:$(INLINE / ......) &{ console.error(`in_table_column_paragraph_item here1.2 line ${location().start.line}: ${here}`); return true; })
                target_rest:(
                    _target:paragraph_item_child NEWLINE*
                    { return _target; }
                )*
            DEDENT
            { return [target].concat(target_rest); }

            /

            INDENT INDENT
                target1:list+
                NEWLINE*
            DEDENT
                target2:paragraph_item_child NEWLINE*
                target2_rest:(
                    _target:paragraph_item_child NEWLINE*
                    { return _target; }
                )*
            DEDENT
            { return [...target1, target2, ...target2_rest]; }
        )?
        rest:paragraph_item*
    DEDENT DEDENT
    // &(here:$(INLINE / ......) &{ console.error(`leave in_table_column_paragraph_item line ${location().start.line}: ${here}`); return true; })
    {
        let lineno = location().start.line;
        let indent = indentMemo[lineno];

        if(baseIndentStack.length > 0) {
            let [base_indent, is_first, base_lineno] = baseIndentStack[baseIndentStack.length - 1];
            if(!is_first || lineno !== base_lineno) {
                indent -= base_indent;
            }
        }

        let paragraph_item = new EL(
            util.paragraphItemTags[indent],
            {Hide: "false"},
        );
        if(indent === 0) {
            paragraph_item.attr.OldStyle = "false";
        } else {
            paragraph_item.attr.Delete = "false";
        }

        paragraph_item.append(new EL(util.paragraphItemTitleTags[indent], {}, [paragraph_item_title]));

        // let num = util.parseNamedNum(paragraph_item_title);
        // if(num) {
        //     paragraph_item.attr.Num = num;
        // }

        paragraph_item.append(new EL(util.paragraphItemSentenceTags[indent], {}, inline_contents));

        if(children) {
            util.setItemNum(children);
        }

        paragraph_item.extend(children || []);

        return [paragraph_item, ...rest];
    }
    /
    paragraph_item_title:$(
        !article_title
        !appdx_table_title
        !appdx_style_title
        !appdx_format_title
        !appdx_fig_title
        !appdx_note_title
        !appdx_title
        !suppl_provision_label
        [^ 　\t\r\n条<]+
    )
    __
    inline_contents:columns_or_sentences
    NEWLINE+
    !INDENT
    {
        let lineno = location().start.line;
        let indent = indentMemo[lineno];

        if(baseIndentStack.length > 0) {
            let [base_indent, is_first, base_lineno] = baseIndentStack[baseIndentStack.length - 1];
            if(!is_first || lineno !== base_lineno) {
                indent -= base_indent;
            }
        }

        let paragraph_item = new EL(
            util.paragraphItemTags[indent],
            {Hide: "false"},
        );
        if(indent === 0) {
            paragraph_item.attr.OldStyle = "false";
        } else {
            paragraph_item.attr.Delete = "false";
        }

        paragraph_item.append(new EL(util.paragraphItemTitleTags[indent], {}, [paragraph_item_title]));

        // let num = util.parseNamedNum(paragraph_item_title);
        // if(num) {
        //     paragraph_item.attr.Num = num;
        // }

        paragraph_item.append(new EL(util.paragraphItemSentenceTags[indent], {}, inline_contents));

        return [paragraph_item];
    }

no_name_paragraph_item "no_name_paragraph_item" =
    paragraph_caption:article_paragraph_caption?
    inline_contents:columns_or_sentences
    NEWLINE+
    lists:(
        INDENT INDENT
            target:list+
            NEWLINE*
        DEDENT DEDENT
        { return target; }
    )?
    children:(
        INDENT
            target:paragraph_item_child NEWLINE*
            target_rest:(
                _target:paragraph_item_child NEWLINE*
                { return _target; }
            )*
        DEDENT
        { return [target].concat(target_rest); }
    )?
    {
        let lineno = location().start.line;
        let indent = indentMemo[lineno];

        if(baseIndentStack.length > 0) {
            let [base_indent, is_first, base_lineno] = baseIndentStack[baseIndentStack.length - 1];
            if(!is_first || lineno !== base_lineno) {
                indent -= base_indent;
            }
        }

        let paragraph_item = new EL(
            util.paragraphItemTags[indent],
            {Hide: "false", Num: "1"},
        );
        if(indent === 0) {
            paragraph_item.attr.OldStyle = "false";
        } else {
            paragraph_item.attr.Delete = "false";
        }
        if(paragraph_caption !== null) {
            paragraph_item.append(new EL("ParagraphCaption", {}, [paragraph_caption]));
        }
        paragraph_item.append(new EL(util.paragraphItemTitleTags[indent]));
        paragraph_item.append(new EL(util.paragraphItemSentenceTags[indent], {}, inline_contents));
        paragraph_item.extend(lists || []);

        if(children) {
            util.setItemNum(children);
        }
        paragraph_item.extend(children || []);

        return paragraph_item;
    }

paragraph_item_child "paragraph_item_child" =
    fig_struct
    /
    amend_provision
    /
    table_struct
    /
    paragraph_item
    /
    style_struct




list "list" =
    columns_or_sentences:columns_or_sentences
    NEWLINE+
    sublists:(
        &("" &{ listDepth++; return true; })
        INDENT INDENT
            target:list+
            NEWLINE*
        DEDENT DEDENT
        &("" &{ listDepth--; return true; })
        { return target; }
        /
        &("" &{ listDepth--; return false; }) "DUMMY"
    )?
    {
        let list = new EL(util.listTags[listDepth]);
        let list_sentence = new EL(util.listTags[listDepth] + "Sentence");
        list.append(list_sentence);

        list_sentence.extend(columns_or_sentences);

        list.extend(sublists || []);

        return list;
    }




amend_provision "amend_provision" =
    ":AmendProvision:" NEWLINE
    target:(
        inline:(
            xml_element
            /
            _inline: INLINE
            {
                return new EL("AmendProvisionSentence", {}, [
                    new EL("Sentence", {}, _inline),
                ]);
            }
        ) NEWLINE
        { return inline; }
    )+
    { return new EL("AmendProvision", {}, target); }




table_struct "table_struct" =
    !INDENT !DEDENT !NEWLINE
    (":table-struct:" NEWLINE)?
    // &(here:$(INLINE / ..........) &{ console.error(`visit table-struct line ${location().start.line}: ${here}`); return true; })
    table_struct_title:table_struct_title?
    remarkses1:remarks*
    table:table
    remarkses2:remarks*
    // &(here:$(INLINE / ..........) &{ console.error(`leave table-struct line ${location().start.line}: ${here}`); return true; })
    {
        let table_struct = new EL("TableStruct");

        if(table_struct_title !== null) {
            table_struct.append(table_struct_title);
        }

        table_struct.extend(remarkses1);

        table_struct.append(table);

        table_struct.extend(remarkses2);

        return table_struct;
    }

table_struct_title "table_struct_title" =
    ":table-struct-title:"
    _
    title:$INLINE
    NEWLINE
    {
        return new EL("TableStructTitle", {}, [new __Text(title)]);
    }

table "table" =
    attr:(
        target:(
            "["
            name:$[^ 　\t\r\n\]=]+
            "=\""
            value:$[^ 　\t\r\n\]"]+
            "\"]"
            { return [name, value]; }
        )+
        NEWLINE
        { return target; }
    )?
    table_row_columns:(
        "*" __
        first:table_column
        rest:(
            ("  " / "　" / "\t")
            target:table_column
            {return target;}
        )*
        {return [first].concat(rest);}
    )+
    {
        let table = new EL("Table");
        if(attr) {
            for(let i = 0; i < attr.length; i++) {
                let [name, value] = attr[i];
                table.attr[name] = value;
            }
        }
        for(let i = 0; i < table_row_columns.length; i++) {
            let table_row = new EL("TableRow", {}, table_row_columns[i]);
            table.append(table_row);
        }

        return table;
    }

table_column_attr_name =
    "BorderTop" / "BorderBottom" / "BorderLeft" / "BorderRight" / "rowspan" / "colspan" / "Align" / "Valign"

table_column "table_column" =
    // &(here:$(NEXTINLINE) &{ console.error(`tc 01 line ${location().start.line}: "${here}"`); return true; })
    "-" __
    attr:(
        "["
        name:$table_column_attr_name
        "=\""
        value:$[^ 　\t\r\n\]"]+
        "\"]"
        { return [name, value]; }
    )*
    children:(
        first:(
        // &(here:$(INLINE / ..........) &{ console.error(`here1 line ${location().start.line}: ${here}`); return true; })
            remarks
        // &(here:$(INLINE / ..........) &{ console.error(`here2 line ${location().start.line}: ${here}`); return true; })
            /
            fig_struct
        )
        rest:(
            INDENT INDENT
                target:(
        // &(here:$(NEXTINLINE) &{ console.error(`here0 line ${location().start.line}: "${here}"`); return true; })
                    _target:(
                        fig_struct
                    )
                    { return _target; }
                )+
                NEWLINE*
            DEDENT DEDENT
            { return target; }
        )?
        { return [first, ...(rest || [])]; }
        /
        // &(here:$(NEXTINLINE) &{ console.error(`here001 line ${location().start.line}: "${here}"`); return true; })
        in_table_column_paragraph_items
        // &(here:$(NEXTINLINE) &{ console.error(`here003 line ${location().start.line}: "${here}"`); return true; })
        /
        first:(
            inline:INLINE? NEWLINE
            {
                return new EL(
                    "Sentence",
                    {},
                    inline || [],
                )
            }
        )
        rest:(
            INDENT INDENT
                target:(
        // &(here:$(NEXTINLINE) &{ console.error(`here0 line ${location().start.line}: "${here}"`); return true; })
                    _target:(
                        inline:INLINE NEWLINE
                        {
                            return new EL(
                                "Sentence",
                                {},
                                inline,
                            )
                        }
                    )
                    { return _target; }
                )+
                NEWLINE*
            DEDENT DEDENT
            { return target; }
        )?
        { return [first, ...(rest || [])]; }
    )
    // &(here:$(NEXTINLINE) &{ console.error(`here0 line ${location().start.line}: "${here}"`); return true; })
    {

        let table_column = new EL("TableColumn");
        for(let i = 0; i < attr.length; i++) {
            let [name, value] = attr[i];
            table_column.attr[name] = value
        }

        table_column.extend(children);

        return table_column;
    }
    /
    // &(here:$(NEXTINLINE) &{ console.error(`tc 10 line ${location().start.line}: "${here}"`); return true; })
    "-" _ NEWLINE
    {
        return new EL(
            "TableColumn",
            {
                BorderTop: "solid",
                BorderRight: "solid",
                BorderBottom: "solid",
                BorderLeft: "solid",
            },
            [new EL("Sentence")],
        );
    }






style_struct "style_struct" =
    !INDENT !DEDENT !NEWLINE
    style_struct_title:style_struct_title?
    remarkses1:remarks*
    style:style
    remarkses2:remarks*
    {
        let style_struct = new EL("StyleStruct");

        if(style_struct_title !== null) {
            style_struct.append(style_struct_title);
        }

        style_struct.extend(remarkses1);

        style_struct.append(style);

        style_struct.extend(remarkses2);

        return style_struct;
    }

style_struct_title "style_struct_title" =
    ":style-struct-title:"
    _
    title:$INLINE
    NEWLINE
    {
        return new EL("StyleStructTitle", {}, [new __Text(title)]);
    }

style "style" =
    lists:(
        INDENT INDENT
            target:list+
            NEWLINE*
        DEDENT DEDENT
        { return target; }
    )?
    children:(
        table
        /
        table_struct
        /
        fig
        /
        fig_struct
        /
        paragraph_item
    )+
    {
        return new EL("Style", {}, [...(lists || []), ...children]);
    }






format_struct "format_struct" =
    !INDENT !DEDENT !NEWLINE
    // &(here:$(NEXTINLINE) &{ console.error(`format_struct line ${location().start.line}: "${here}"`); return true; })
    format_struct_title:format_struct_title?
    remarkses1:remarks*
    format:format
    remarkses2:remarks*
    {
        let format_struct = new EL("FormatStruct");

        if(format_struct_title !== null) {
            format_struct.append(format_struct_title);
        }

        format_struct.extend(remarkses1);

        format_struct.append(format);

        format_struct.extend(remarkses2);

        return format_struct;
    }

format_struct_title "format_struct_title" =
    ":format-struct-title:"
    _
    title:$INLINE
    NEWLINE
    {
        return new EL("FormatStructTitle", {}, [new __Text(title)]);
    }

format "format" =
    children:(
        fig:fig { return [fig]; }
        /
        columns_or_sentences
    )
    {
        return new EL("Format", {}, children);
    }





note_struct "note_struct" =
    !INDENT !DEDENT !NEWLINE
    // &(here:$(NEXTINLINE) &{ console.error(`note_struct line ${location().start.line}: "${here}"`); return true; })
    note_struct_title:note_struct_title?
    remarkses1:remarks*
    note:note
    remarkses2:remarks*
    {
        let note_struct = new EL("NoteStruct");

        if(note_struct_title !== null) {
            note_struct.append(note_struct_title);
        }

        note_struct.extend(remarkses1);

        note_struct.append(note);

        note_struct.extend(remarkses2);

        return note_struct;
    }

note_struct_title "note_struct_title" =
    ":note-struct-title:"
    _
    title:$INLINE
    NEWLINE
    {
        return new EL("NoteStructTitle", {}, [new __Text(title)]);
    }

note "note" =
    children:(
        table:table { return [table]; }
        /
        fig:fig { return [fig]; }
        /
        lists:(
            INDENT INDENT
                target:list+
                NEWLINE*
            DEDENT DEDENT
            { return target; }
        )
        /
    // &(here:$(NEXTINLINE) &{ console.error(`note line ${location().start.line}: "${here}"`); return true; })
        paragraph_items:paragraph_item+ { return paragraph_items; }
        /
        arith_formula:xml_element { return [arith_formula]; }
    )
    {
        return new EL("Note", {}, children);
    }







remarks "remarks" =
    label_attr:(
        target:(
            "["
            name:$[^ 　\t\r\n\]=]+
            "=\""
            value:$[^ 　\t\r\n\]"]+
            "\"]"
            { return [name, value]; }
        )*
        {
            const ret = {};
            for(const [name, value] of target) {
                ret[name] = value;
            }
            return ret;
        }
    )
    // &(here:$(INLINE / ..........) &{ console.error(`remarks 1 line ${location().start.line}: ${here}`); return true; })
    label:(
        ":remarks:"  [^ 　\t\r\n]*
        { return "" }
        /
        $(("備考" / "注" / "※") [^ 　\t\r\n]*)
    )
    // &(here:$(INLINE / ..........) &{ console.error(`remarks 2 line ${location().start.line}: ${here}`); return true; })
    first:(
        __
        _target:INLINE
        {
            return new EL(
                "Sentence",
                {},
                _target,
            );
        }
    )?
    NEWLINE
    rest:(
        INDENT INDENT
            target:(
                &{ return !first; }
                &("" &{ baseIndentStack.push([indentMemo[location().start.line] - 1, false, location().start.line]); return true; })
                _target:(paragraph_item / no_name_paragraph_item)
                &("" &{ baseIndentStack.pop(); return true; })
                { return _target; }
                /
                &("" &{ baseIndentStack.pop(); return false; }) "DUMMY"
                /
                _target:INLINE
                NEWLINE
                {
                    return new EL(
                        "Sentence",
                        {},
                        _target,
                    );
                }
            )+
            NEWLINE*
        DEDENT DEDENT
        { return target; }
        /
        INDENT INDENT INDENT INDENT
            target:(
                &{ return !first; }
                &("" &{ baseIndentStack.push([indentMemo[location().start.line] - 1, false, location().start.line]); return true; })
    // &(here:$(INLINE / ............................................................................) &{ console.error(`here1.1 line ${location().start.line}: ${here}`); return true; })
                _target:(paragraph_item / no_name_paragraph_item)
    // &(here:$(INLINE / ............................................................................) &{ console.error(`here1.2 line ${location().start.line}: ${here}`); return true; })
                &("" &{ baseIndentStack.pop(); return true; })
                { return _target; }
                /
                &("" &{ baseIndentStack.pop(); return false; }) "DUMMY"
                /
                _target:INLINE
                NEWLINE
                {
                    return new EL(
                        "Sentence",
                        {},
                        _target,
                    );
                }
            )+
            NEWLINE*
        DEDENT DEDENT DEDENT DEDENT
        { return target; }
    )?
    &{ return first || (rest && rest.length); }
    // &(here:$(INLINE / ............................................................................) &{ console.error(`here2 line ${location().start.line}: ${here}`); return true; })
    {
        let children = rest || [];
        if(first !== null) {
            children = [].concat(first).concat(children);
        }
        if(children.length >= 2) {
            for(let i = 0; i < children.length; i++) {
                let child = children[i];
                if(child.tag.match(/Sentence|Column/)) {
                    child.attr.Num = "" + (i + 1);
                }
            }
        }

        let remarks = new EL("Remarks");
        remarks.append(new EL("RemarksLabel", label_attr, [new __Text(label)]));
        if(children) {
            util.setItemNum(children);
        }
        remarks.extend(children);

        return remarks;
    }






fig_struct "fig_struct" =
    // &(here:$(NEXTINLINE) &{ console.error(`fig 0 line ${location().start.line}: "${here}"`); return true; })
    (":fig-struct:" NEWLINE)?
    fig:fig
    remarks:remarks*
    {
        return new EL("FigStruct", {}, [fig].concat(remarks));
    }

fig "fig" =
    ".." __ "figure" _ "::" _
    src:$INLINE
    NEWLINE
    {
        return new EL("Fig", {src: src});
    }







appdx_item =
    appdx
    /
    appdx_table
    /
    appdx_style
    /
    appdx_format
    /
    appdx_fig
    /
    appdx_note
    /
    suppl_provision





appdx_table_title "appdx_table_title" =
    title_struct:(
        attr:(
            target:(
                "["
                name:$[^ 　\t\r\n\]=]+
                "=\""
                value:$[^ 　\t\r\n\]"]+
                "\"]"
                { return [name, value]; }
            )*
            {
                const ret = {};
                for(const [name, value] of target) {
                    ret[name] = value;
                }
                return ret;
            }
        )
        target:(
            title:$("別表" [^\r\n(（]*)
            related_article_num:(_ target:ROUND_PARENTHESES_INLINE { return target; })?
            table_struct_title:$[^\r\n(（]*
            &NEWLINE
            {
                return {
                    text: text(),
                    title: title,
                    related_article_num: related_article_num,
                    table_struct_title: table_struct_title,
                };
            }
            /
            title:$("別表" [^\r\n(（]* ROUND_PARENTHESES_INLINE)
            related_article_num:(_ target:ROUND_PARENTHESES_INLINE { return target; })
            &NEWLINE
            {
                return {
                    text: text(),
                    title: title,
                    related_article_num: related_article_num,
                    table_struct_title: "",
                };
            }
        )
        {
            return {
                attr: attr,
                ...target,
            };
        }
    )
    {
        return title_struct;
    }


appdx_table "appdx_table" =
    // &(here:$(INLINE / ..........) &{ console.error(`appdx_table 1 line ${location().start.line}: ${here}`); return true; })
    title_struct:appdx_table_title
    NEWLINE+
    // &(here:$(INLINE / ..........) &{ console.error(`appdx_table 2 line ${location().start.line}: ${here}`); return true; })
    children:(
        INDENT
            target:appdx_table_children+
            remarkses:remarks*
            NEWLINE*
        DEDENT
        { return target.concat(remarkses); }
    )?
    // &(here:$(INLINE / ..........) &{ console.error(`here2 line ${location().start.line}: ${here}`); return true; })
    {
        let appdx_table = new EL("AppdxTable");
        if(title_struct.table_struct_title !== "") {
            console.error(`### line ${location().start.line}: Maybe irregular AppdxTableTitle!`);
            appdx_table.append(new EL("AppdxTableTitle", title_struct.attr, [new __Text( title_struct.text)]));
        } else {
            appdx_table.append(new EL("AppdxTableTitle", title_struct.attr, [new __Text(title_struct.title)]));
            if(title_struct.related_article_num) {
                appdx_table.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
            }
        }

        if(children) {
            util.setItemNum(children);
        }
        appdx_table.extend(children || []);

        return appdx_table;
    }

appdx_table_children "appdx_table_children" =
    table_struct
    /
    paragraph_item


suppl_provision_appdx_table_title "suppl_provision_appdx_table_title" =
    title_struct:(
        attr:(
            target:(
                "["
                name:$[^ 　\t\r\n\]=]+
                "=\""
                value:$[^ 　\t\r\n\]"]+
                "\"]"
                { return [name, value]; }
            )*
            {
                const ret = {};
                for(const [name, value] of target) {
                    ret[name] = value;
                }
                return ret;
            }
        )
        target:(
            title:$(
                [附付] "則別表" [^\r\n(（]*
                /
                [附付] "則" [^\r\n(（様]* "様式" [^\r\n(（]*
            )
            related_article_num:(_ target:ROUND_PARENTHESES_INLINE { return target; })?
            table_struct_title:$[^\r\n(（]*
            {
                return {
                    text: text(),
                    title: title,
                    related_article_num: related_article_num,
                    table_struct_title: table_struct_title,
                };
            }
        )
        {
            return {
                attr: attr,
                ...target,
            };
        }
    )
    {
        return title_struct;
    }


suppl_provision_appdx_table "suppl_provision_appdx_table" =
    // &(here:$(INLINE / ..........) &{ console.error(`here1 line ${location().start.line}: ${here}`); return true; })
    title_struct:suppl_provision_appdx_table_title
    NEWLINE+
    children:(
        INDENT
            target:suppl_provision_appdx_table_children+
            remarkses:remarks*
            NEWLINE*
        DEDENT
        { return target.concat(remarkses); }
    )?
    // &(here:$(INLINE / ..........) &{ console.error(`here2 line ${location().start.line}: ${here}`); return true; })
    {
        let suppl_provision_appdx_table = new EL("SupplProvisionAppdxTable");
        if(title_struct.table_struct_title !== "") {
            console.error(`### line ${location().start.line}: Maybe irregular SupplProvisionAppdxTableTitle!`);
            suppl_provision_appdx_table.append(new EL("SupplProvisionAppdxTableTitle", title_struct.attr, [new __Text( title_struct.text)]));
        } else {
            suppl_provision_appdx_table.append(new EL("SupplProvisionAppdxTableTitle", title_struct.attr, [new __Text(title_struct.title)]));
            if(title_struct.related_article_num) {
                suppl_provision_appdx_table.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
            }
        }

        if(children) {
            util.setItemNum(children);
        }
        suppl_provision_appdx_table.extend(children || []);

        return suppl_provision_appdx_table;
    }

suppl_provision_appdx_table_children "suppl_provision_appdx_table_children" =
    table_struct





appdx_style_title "appdx_style_title" =
    title_struct:(
        title:$(
    // &(here:$(NEXTINLINE) &{ console.error(`appdx_style_title 1 line ${location().start.line}: "${here}"`); return true; })
            (!"様式" !"書式" ![(（] CHAR)* ("様式" / "書式") [^\r\n(（]* ROUND_PARENTHESES_INLINE [^\r\n(（]* &ROUND_PARENTHESES_INLINE
            /
            (!"様式" !"書式" ![(（] CHAR)* ("様式" / "書式") [^\r\n(（]*
        )
        related_article_num:(_ target:ROUND_PARENTHESES_INLINE { return target; })?
        style_struct_title:[^\r\n(（]*
        {
            return {
                text: text(),
                title: title,
                related_article_num: related_article_num,
                style_struct_title: style_struct_title,
            };
        }
    )
    {
        return title_struct;
    }


appdx_style "appdx_style" =
    // &(here:$(NEXTINLINE) &{ console.error(`here1 line ${location().start.line}: "${here}"`); return true; })
    title_struct:appdx_style_title
    NEWLINE+
    children:(
        INDENT
            target:(
                first:style_struct
                rest:(
                    NEWLINE+
                    _target:style_struct
                    {return _target;}
                )*
                { return [first].concat(rest); }
            )
            NEWLINE*
        DEDENT
        { return target; }
    )?
    {
        let appdx_style = new EL("AppdxStyle");
        appdx_style.append(new EL("AppdxStyleTitle", {}, [new __Text(title_struct.title)]));
        if(title_struct.related_article_num) {
            appdx_style.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
        }
        appdx_style.extend(children || []);

        return appdx_style;
    }





suppl_provision_appdx_style_title "suppl_provision_appdx_style_title" =
    title_struct:(
        title:$([附付] "則" (!"様式" ![(（] CHAR)* "様式" [^\r\n(（]*)
        related_article_num:(_ target:ROUND_PARENTHESES_INLINE { return target; })?
        style_struct_title:[^\r\n(（]*
        {
            return {
                text: text(),
                title: title,
                related_article_num: related_article_num,
                style_struct_title: style_struct_title,
            };
        }
    )
    {
        return title_struct;
    }


suppl_provision_appdx_style "suppl_provision_appdx_style" =
    // &(here:$(NEXTINLINE) &{ console.error(`here1 line ${location().start.line}: "${here}"`); return true; })
    title_struct:suppl_provision_appdx_style_title
    NEWLINE+
    children:(
        INDENT
            target:(
                first:style_struct
                rest:(
                    NEWLINE+
                    _target:style_struct
                    {return _target;}
                )*
                { return [first].concat(rest); }
            )
            NEWLINE*
        DEDENT
        { return target; }
    )
    {
        let suppl_provision_appdx_style = new EL("SupplProvisionAppdxStyle");
        suppl_provision_appdx_style.append(new EL("SupplProvisionAppdxStyleTitle", {}, [new __Text(title_struct.title)]));
        if(title_struct.related_article_num) {
            suppl_provision_appdx_style.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
        }
        suppl_provision_appdx_style.extend(children || []);

        return suppl_provision_appdx_style;
    }





appdx_format_title "appdx_format_title" =
    title_struct:(
        title:$((!("様式" / "書式") ![(（] CHAR)* ("様式" / "書式") [^\r\n(（]*)
        related_article_num:(_ target:ROUND_PARENTHESES_INLINE { return target; })?
        format_struct_title:[^\r\n(（]*
        {
            return {
                text: text(),
                title: title,
                related_article_num: related_article_num,
                format_struct_title: format_struct_title,
            };
        }
    )
    {
        return title_struct;
    }


appdx_format "appdx_format" =
    // &(here:$(NEXTINLINE) &{ console.error(`here1 line ${location().start.line}: "${here}"`); return true; })
    (":appdx-format:" NEWLINE+)?
    title_struct:(
        target:appdx_format_title
        NEWLINE+
        { return target; }
    )?
    children:(
        INDENT
            target:(
                first:format_struct
                rest:(
                    NEWLINE+
                    _target:format_struct
                    {return _target;}
                )*
                { return [first].concat(rest); }
            )
            NEWLINE*
        DEDENT
        { return target; }
    )
    {
        let appdx_format = new EL("AppdxFormat");
        if(title_struct) {
            appdx_format.append(new EL("AppdxFormatTitle", {}, [new __Text(title_struct.title)]));
            if(title_struct.related_article_num) {
                appdx_format.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
            }
        }
        appdx_format.extend(children || []);

        return appdx_format;
    }






appdx_fig_title "appdx_fig_title" =
    title_struct:(
        title:$("別図" [^\r\n(（]*)
        related_article_num:(_ target:ROUND_PARENTHESES_INLINE { return target; })?
        fig_struct_title:[^\r\n(（]*
        {
            return {
                text: text(),
                title: title,
                related_article_num: related_article_num,
                fig_struct_title: fig_struct_title,
            };
        }
    )
    {
        return title_struct;
    }


appdx_fig "appdx_fig" =
    // &(here:$(NEXTINLINE) &{ console.error(`here1 line ${location().start.line}: "${here}"`); return true; })
    title_struct:appdx_fig_title
    NEWLINE+
    success:(
        children:(
            INDENT
                target:(
    // &(here:$(INLINE / ..........) &{ console.error(`@appdx_fig_children 1 line ${location().start.line}: ${here}`); return true; })
                    first:appdx_fig_children
                    rest:(
                        NEWLINE+
                        _target:appdx_fig_children
                        {return _target;}
                    )*
                    { return [first].concat(rest); }
                )
                NEWLINE*
            DEDENT
            { return target; }
        )
        {
            let appdx_fig = new EL("AppdxFig");
            appdx_fig.append(new EL("AppdxFigTitle", {}, [new __Text(title_struct.title)]));
            if(title_struct.related_article_num) {
                appdx_fig.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
            }
            appdx_fig.extend(children || []);

            return appdx_fig;
        }
        /
        & { throw new Error(`Line ${location().start.line}: Detected AppdxFig but found error inside it.`); }
    )
    { return success; }

appdx_fig_children "appdx_fig_children" =
    fig_struct
    /
    table_struct



appdx_note_title "appdx_note_title" =
    title_struct:(
        attr:(
            target:(
                "["
                name:$[^ 　\t\r\n\]=]+
                "=\""
                value:$[^ 　\t\r\n\]"]+
                "\"]"
                { return [name, value]; }
            )*
            {
                const ret = {};
                for(const [name, value] of target) {
                    ret[name] = value;
                }
                return ret;
            }
        )
        target:(
            title:$(("別記" / "付録" / "（別紙）") [^\r\n(（]*)
            related_article_num:(_ target:ROUND_PARENTHESES_INLINE { return target; })?
            table_struct_title:$[^\r\n(（]*
            {
                return {
                    text: text(),
                    title: title,
                    related_article_num: related_article_num,
                    table_struct_title: table_struct_title,
                };
            }
        )
        {
            return {
                attr: attr,
                ...target,
            };
        }
    )
    {
        return title_struct;
    }


appdx_note "appdx_note" =
    // &(here:$(INLINE / ..........) &{ console.error(`here1 line ${location().start.line}: ${here}`); return true; })
    title_struct:appdx_note_title
    NEWLINE+
    children:(
        INDENT
            target:(
                first:appdx_note_children
                rest:(
                    NEWLINE+
                    _target:appdx_note_children
                    {return _target;}
                )*
                { return [first].concat(rest); }
            )?
            remarkses:remarks*
            NEWLINE*
        DEDENT
        { return (target || []).concat(remarkses); }
    )?
    // &(here:$(INLINE / ..........) &{ console.error(`here2 line ${location().start.line}: ${here}`); return true; })
    {
        let appdx_note = new EL("AppdxNote");
        if(title_struct.table_struct_title !== "") {
            console.error(`### line ${location().start.line}: Maybe irregular AppdxNoteTitle!`);
            appdx_note.append(new EL("AppdxNoteTitle", title_struct.attr, [new __Text( title_struct.text)]));
        } else {
            appdx_note.append(new EL("AppdxNoteTitle", title_struct.attr, [new __Text(title_struct.title)]));
            if(title_struct.related_article_num) {
                appdx_note.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
            }
        }

        if(children) {
            util.setItemNum(children);
        }
        appdx_note.extend(children || []);

        return appdx_note;
    }

appdx_note_children "appdx_note_children" =
    fig_struct
    /
    note_struct
    /
    table_struct



appdx_title "appdx_title" =
    title_struct:(
        attr:(
            target:(
                "["
                name:$[^ 　\t\r\n\]=]+
                "=\""
                value:$[^ 　\t\r\n\]"]+
                "\"]"
                { return [name, value]; }
            )*
            {
                const ret = {};
                for(const [name, value] of target) {
                    ret[name] = value;
                }
                return ret;
            }
        )
        target:(
            title:$("付録" [^\r\n(（]*)
            related_article_num:(_ target:ROUND_PARENTHESES_INLINE { return target; })?
            {
                return {
                    text: text(),
                    title: title,
                    related_article_num: related_article_num,
                };
            }
        )
        {
            return {
                attr: attr,
                ...target,
            };
        }
    )
    {
        return title_struct;
    }

appdx "appdx" =
    // &(here:$(INLINE / ..........) &{ console.error(`here1 line ${location().start.line}: ${here}`); return true; })
    title_struct:appdx_title
    NEWLINE+
    children:(
        INDENT
            target:(
                _target:xml_element NEWLINE+
                { return _target }
            )+
            remarkses:remarks*
            NEWLINE*
        DEDENT
        { return target.concat(remarkses); }
    )
    // &(here:$(INLINE / ..........) &{ console.error(`here2 line ${location().start.line}: ${here}`); return true; })
    {
        let appdx = new EL("Appdx");
        appdx.append(new EL("ArithFormulaNum", title_struct.attr, [new __Text(title_struct.title)]));
        if(title_struct.related_article_num) {
            appdx.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
        }

        if(children) {
            util.setItemNum(children);
        }
        appdx.extend(children || []);

        return appdx;
    }



suppl_provision_appdx_title "suppl_provision_appdx_title" =
    title_struct:(
        attr:(
            target:(
                "["
                name:$[^ 　\t\r\n\]=]+
                "=\""
                value:$[^ 　\t\r\n\]"]+
                "\"]"
                { return [name, value]; }
            )*
            {
                const ret = {};
                for(const [name, value] of target) {
                    ret[name] = value;
                }
                return ret;
            }
        )
        target:(
            title:$([附付] "則付録" [^\r\n(（]*)
            related_article_num:(_ target:ROUND_PARENTHESES_INLINE { return target; })?
            {
                return {
                    text: text(),
                    title: title,
                    related_article_num: related_article_num,
                };
            }
        )
        {
            return {
                attr: attr,
                ...target,
            };
        }
    )
    {
        return title_struct;
    }

suppl_provision_appdx "suppl_provision_appdx" =
    // &(here:$(INLINE / ..........) &{ console.error(`here1 line ${location().start.line}: ${here}`); return true; })
    title_struct:suppl_provision_appdx_title
    NEWLINE+
    children:(
        INDENT
            target:(
                _target:xml_element NEWLINE+
                { return _target }
            )+
            remarkses:remarks*
            NEWLINE*
        DEDENT
        { return target.concat(remarkses); }
    )
    // &(here:$(INLINE / ..........) &{ console.error(`here2 line ${location().start.line}: ${here}`); return true; })
    {
        let suppl_provision_appdx = new EL("SupplProvisionAppdx");
        suppl_provision_appdx.append(new EL("ArithFormulaNum", title_struct.attr, [new __Text(title_struct.title)]));
        if(title_struct.related_article_num) {
            suppl_provision_appdx.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
        }

        if(children) {
            util.setItemNum(children);
        }
        suppl_provision_appdx.extend(children || []);

        return suppl_provision_appdx;
    }




suppl_provision_label "suppl_provision_label" =
    __
    label:$([附付] _ "則")
    amend_law_num:(target:ROUND_PARENTHESES_INLINE { return target.content; })?
    extract:(_ "抄")?
    NEWLINE+
    {
        return {
            label: label,
            amend_law_num: amend_law_num,
            extract: extract,
        }
    }

suppl_provision "suppl_provision" =
    // &(here:$(INLINE / ..........) &{ console.error(`here line ${location().start.line}: ${here}`); return true; })
    suppl_provision_label:suppl_provision_label
    children:(
        article+
        /
        paragraph_item+
        /
        first:no_name_paragraph_item
        rest:paragraph_item*
        { return [first].concat(rest); }
    )
    suppl_provision_appdx_items:(
        suppl_provision_appdx_table
        /
        suppl_provision_appdx_style
        /
        suppl_provision_appdx
    )*
    {
        let suppl_provision = new EL("SupplProvision");
        if(suppl_provision_label.amend_law_num) {
            suppl_provision.attr["AmendLawNum"] = suppl_provision_label.amend_law_num;
        }
        if(suppl_provision_label.extract !== null) {
            suppl_provision.attr["Extract"] = "true";
        }
        suppl_provision.append(new EL("SupplProvisionLabel", {}, [new __Text(suppl_provision_label.label)]))

        if(children) {
            util.setItemNum(children);
        }
        suppl_provision.extend(children);
        suppl_provision.extend(suppl_provision_appdx_items);
        return suppl_provision;
    }

// ########### structures control end ###########






// ########### sentences control begin ###########

columns_or_sentences "columns_or_sentences" =
    columns
    /
    period_sentences
    /
    attr:(
        target:(
            "["
            name:$[^ 　\t\r\n\]=]+
            "=\""
            value:$[^ 　\t\r\n\]"]+
            "\"]"
            { return [name, value]; }
        )*
        {
            const ret = {};
            for(const [name, value] of target) {
                ret[name] = value;
            }
            return ret;
        }
    )
    inline:INLINE
    {
        // console.error(`### line ${location().start.line}: Maybe mismatched parenthesis!`);
        let sentence = new EL(
            "Sentence",
            attr,
            inline,
        );
        return [sentence];
    }

period_sentences "period_sentences" =
    fragments:(PERIOD_SENTENCE_FRAGMENT)+
    {
        let sentences:Array<util.EL> = [];
        let proviso_indices:Array<number> = [];
        for(let i = 0; i < fragments.length; i++) {
            let sentence_content = fragments[i];
            let sentence = new EL(
                "Sentence",
                {},
                sentence_content,
            );
            if(fragments.length >= 2) sentence.attr.Num = "" + (i + 1);
            if(
                sentence_content[0] instanceof __Text &&
                sentence_content[0].text.match(/^ただし、|但し、/)
            ) {
                proviso_indices.push(i);
            }
            sentences.push(sentence);
        }
        if(proviso_indices.length > 0) {
            for(let i = 0; i < sentences.length; i++) {
                sentences[i].attr.Function =
                    proviso_indices.indexOf(i) >= 0 ?
                        'proviso' : 'main';
            }
        }
        return sentences;
    }

columns "columns" =
    first:column
    rest:(__ target:column { return target; })+
    {
        const columns = [first].concat(rest);
        if(columns.length >= 2) {
            for(const [i, column] of columns.entries()) {
                column.attr.Num = "" + (i + 1);
            }
        }
        return columns;
    }

column "column" =
    attr:(
        target:(
            "["
            name:$[^ 　\t\r\n\]=]+
            "=\""
            value:$[^ 　\t\r\n\]"]+
            "\"]"
            { return [name, value]; }
        )*
        {
            const ret = {};
            for(const [name, value] of target) {
                ret[name] = value;
            }
            return ret;
        }
    )
    content:period_sentences
    {
        return new EL("Column", attr, content);
    }

INLINE "INLINE" =
    !INDENT !DEDENT
    texts:(
        OUTSIDE_PARENTHESES_INLINE
        /
        PARENTHESES_INLINE
        /
        MISMATCH_END_PARENTHESIS
    )+
    {
        return texts;
    }

NEXTINLINE "NEXTINLINE" =
    (INDENT / DEDENT / [\r\n])* inline:INLINE
    {
        return {
            text: text(),
            inline: inline,
        }
    }

NOT_PARENTHESIS_CHAR "NOT_PARENTHESIS_CHAR" =
    [^\r\n<>()（）\[\]［］{}｛｝「」]

INLINE_FRAGMENT "INLINE_FRAGMENT" =
    !INDENT !DEDENT
    texts:(
        plain:$[^\r\n<>()（）\[\]［］{}｛｝「」 　\t]+
        { return new __Text(plain); }
        /
        PARENTHESES_INLINE
        /
        MISMATCH_END_PARENTHESIS
    )+
    {
        return texts;
    }

PERIOD_SENTENCE_FRAGMENT "PERIOD_SENTENCE_FRAGMENT" =
    !INDENT !DEDENT
    texts:(
        target:(
            plain:$[^\r\n<>()（）\[\]［］{}｛｝「」 　\t。]+
            { return new __Text(plain); }
            /
            PARENTHESES_INLINE
            /
            MISMATCH_END_PARENTHESIS
        )
        { return target; }
    )+
    tail:("。" / &__ / &NEWLINE)
    {
        let last = texts[texts.length - 1];
        if(tail) {
            if(last instanceof __Text) {
                last.text += tail;
            } else {
                texts.push(new __Text(tail));
            }
        }
        return texts;
    }
    /
    plain:"。"
    { return [new __Text(plain)]; }

OUTSIDE_PARENTHESES_INLINE "OUTSIDE_PARENTHESES_INLINE" =
    !INDENT !DEDENT
    plain:$NOT_PARENTHESIS_CHAR+
    { return new __Text(plain); }


OUTSIDE_ROUND_PARENTHESES_INLINE "OUTSIDE_ROUND_PARENTHESES_INLINE" =
    !INDENT !DEDENT
    target:(
        !ROUND_PARENTHESES_INLINE
        _target:(
            OUTSIDE_PARENTHESES_INLINE
            /
            PARENTHESES_INLINE
            /
            MISMATCH_END_PARENTHESIS
        )
        { return _target; }
    )+
    { return {text: text(), content: target}; }




MISMATCH_START_PARENTHESIS "MISMATCH_START_PARENTHESIS" =
    mismatch:$[<(（\[［{｛「]
    {
        // console.error(`### line ${location().start.line}: Mismatch start parenthesis!`);
        return new EL("__MismatchStartParenthesis", {}, [mismatch]);
    }

MISMATCH_END_PARENTHESIS "MISMATCH_END_PARENTHESIS" =
    mismatch:$[>)）\]］}｝」]
    {
        // console.error(`### line ${location().start.line}: Mismatch end parenthesis!`);
        return new EL("__MismatchEndParenthesis", {}, [mismatch]);
    }



PARENTHESES_INLINE "PARENTHESES_INLINE" =
    &("" &{ parenthesesDepth++; return true; })
    target:PARENTHESES_INLINE_INNER
    &("" &{ parenthesesDepth--; return true; })
    { return target; }
    /
    &("" &{ parenthesesDepth--; return false; }) "DUMMY"

PARENTHESES_INLINE_INNER "PARENTHESES_INLINE_INNER" =
    ROUND_PARENTHESES_INLINE
    /
    SQUARE_BRACKETS_INLINE
    /
    CURLY_BRACKETS_INLINE
    /
    SQUARE_PARENTHESES_INLINE
    /
    xml_element
    /
    MISMATCH_START_PARENTHESIS

ROUND_PARENTHESES_INLINE "ROUND_PARENTHESES_INLINE" =
    start:[(（]
    content:(
        plain:$NOT_PARENTHESIS_CHAR+
        { return new __Text(plain); }
        /
        PARENTHESES_INLINE
        /
        ![)）] target:MISMATCH_END_PARENTHESIS { return target; }
    )*
    end:[)）]
    {
        return new __Parentheses("round", parenthesesDepth, start, end, content, text());
    }

SQUARE_BRACKETS_INLINE "SQUARE_BRACKETS_INLINE" =
    start:[\[［]
    content:(
        plain:$NOT_PARENTHESIS_CHAR+
        { return new __Text(plain); }
        /
        PARENTHESES_INLINE
        /
        ![\]］] target:MISMATCH_END_PARENTHESIS { return target; }
    )*
    end:[\]］]
    {
        return new __Parentheses("squareb", parenthesesDepth, start, end, content, text());
    }

CURLY_BRACKETS_INLINE "CURLY_BRACKETS_INLINE" =
    start:[{｛]
    content:(
        plain:$NOT_PARENTHESIS_CHAR+
        { return new __Text(plain); }
        /
        PARENTHESES_INLINE
        /
        ![}｝] target:MISMATCH_END_PARENTHESIS { return target; }
    )*
    end:[}｝]
    {
        return new __Parentheses("curly", parenthesesDepth, start, end, content, text());
    }

SQUARE_PARENTHESES_INLINE "SQUARE_PARENTHESES_INLINE" =
    start:[「]
    content:(
        xml_element
        /
        (
            text:$(
                [^\r\n<>「」]+
                /
                SQUARE_PARENTHESES_INLINE
            )
            {return new __Text(text)}
        )
    )*
    end:[」]
    {
        return new __Parentheses("square", parenthesesDepth, start, end, content, text());
    }

xml "xml" =
    (
        text:$[^<>]+
        {return new __Text(text)}
        /
        xml_element
    )*

xml_element "xml_element" =
    !INDENT !DEDENT
    "<" !"/"
    tag:$[^/<> ="\t\r\n]+
    attr:(
        _
        name:$[^/<> ="\t\r\n]+
        _ "=" _ '"' value:$[^"]+ '"'
        {
            let ret = {};
            ret[name] = value;
            return ret;
        }
    )*
    _
    ">"
    children:xml
    (
        "</"
        _
        end_tag:$[^/<> ="\t\r\n]+
        _
        ">"
        &{
            return end_tag === tag;
        }
    )
    {
        return new EL(tag, Object.assign({}, ...attr), children);
    }
    /
    !INDENT !DEDENT
    "<" !"/"
    tag:$[^/<> ="\t\r\n]+
    attr:(
        _
        name:$[^/<> ="\t\r\n]+
        _ "=" _ '"' value:$[^"]+ '"'
        {
            let ret = {};
            ret[name] = value;
            return ret;
        }
    )*
    _
    "/>"
    {
        return new EL(tag, Object.assign({}, ...attr));
    }

// ########### sentences control end ###########







// ########### pointer control begin ###########

ranges "ranges" =
    first:range ("、" / "及び" / "並びに") rest:ranges
    {
        return [first].concat(rest);
    }
    /
    range:range
    {
        return [range];
    }


range "range" =
    from:pointer "から" to:pointer "まで"
    {
        return [from, to];
    }
    /
    pointer:pointer
    {
        return [pointer, pointer];
    }

pointer "pointer" =
    pointer_fragment+

kanji_digit "kanji_digit" =
    [〇一二三四五六七八九十百千]

roman_digit "roman_digit" =
    [iIｉＩxXｘＸ]

iroha_char "iroha_char" =
    [イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセスン]

pointer_fragment "pointer_fragment" =
    "第" kanji_digit+ type_char:[編章節款目章条項号]
    ("の" kanji_digit+)*
    {
        return new util.PointerFragment(
            util.RelPos.NAMED,
            util.articleGroupType[type_char],
            text(),
            util.parseNamedNum(text()),
        );
    }
    /
    "次" type_char:[編章節款目章条項号表]
    {
        return new util.PointerFragment(
            util.RelPos.NEXT,
            (type_char === "表")
                ? "TableStruct"
                : util.articleGroupType[type_char],
            text(),
            null,
        );
    }
    /
    "前" type_char:[編章節款目章条項号表]
    {
        return new util.PointerFragment(
            util.RelPos.PREV,
            (type_char === "表")
                ? "TableStruct"
                : util.articleGroupType[type_char],
            text(),
            null,
        );
    }
    /
    ("この" / "本") type_char:[編章節款目章条項号表]
    {
        return new util.PointerFragment(
            util.RelPos.HERE,
            (type_char === "表")
                ? "TableStruct"
                : util.articleGroupType[type_char],
            text(),
            null,
        );
    }
    /
    "同" type_char:[編章節款目章条項号表]
    {
        return new util.PointerFragment(
            util.RelPos.SAME,
            (type_char === "表")
                ? "TableStruct"
                : util.articleGroupType[type_char],
            text(),
            null,
        );
    }
    /
    [付附] type_char:"則"
    {
        return new util.PointerFragment(
            util.RelPos.NAMED,
            util.articleGroupType[type_char],
            text(),
            null,
        );
    }
    /
    "別表" ("第" kanji_digit+)?
    {
        return new util.PointerFragment(
            util.RelPos.NAMED,
            "AppdxTable",
            text(),
            util.parseNamedNum(text()),
        );
    }
    /
    "前段"
    {
        return new util.PointerFragment(
            util.RelPos.NAMED,
            "FIRSTPART",
            text(),
            null,
        );
    }
    /
    "後段"
    {
        return new util.PointerFragment(
            util.RelPos.NAMED,
            "LATTERPART",
            text(),
            null,
        );
    }
    /
    "ただし書"
    {
        return new util.PointerFragment(
            util.RelPos.NAMED,
            "PROVISO",
            text(),
            null,
        );
    }
    /
    (iroha_char / roman_digit+)
    {
        return new util.PointerFragment(
            util.RelPos.NAMED,
            "SUBITEM",
            text(),
            util.parseNamedNum(text()),
        );
    }

// ########### pointer control end ###########







// ########### indents control begin ###########

INDENT "INDENT" =
    "<INDENT str=\""
    str:[^"]+
    "\">"
    {
        return str;
    }

DEDENT "DEDENT" = "<DEDENT>"

// ########### indents control end ###########





// ########### whitespaces control begin ###########

_  = [ 　\t]*

__ "WHITESPACES" = [ 　\t]+

CHAR = [^ 　\t\r\n]

NEWLINE "NEWLINE" =
    [\r]?[\n] (_ &NEWLINE)?

// ########### whitespaces control end ###########
