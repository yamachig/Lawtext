{
    let util = require("../lib/util");
    let EL = util.EL;
    let __Text = util.__Text;
    let __Parentheses = util.__Parentheses;

    let xml_tag_stack = [];
    let indent_memo = options.indent_memo;
    let indent_depth = 0;
    let base_indent_stack = [];
    let list_depth = 0;
    let parentheses_depth = 0;
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
    enact_statements:(
        INDENT INDENT
            target:enact_statement+
        DEDENT DEDENT
        { return target; }
    )?
    toc:toc?
    main_provision:main_provision
    appdx_items:appdx_item*
    {
        let law = new EL("Law", {Lang: "ja"});
        let law_body = new EL("LawBody");

        if(law_title !== null) {
            if(law_title.law_num) {
                law.append(new EL("LawNum", {}, [law_title.law_num]));

                let m = law_title.law_num.match(/(明治|大正|昭和|平成)([一二三四五六七八九十]+)年(\S+?)第([一二三四五六七八九十百千]+)号/);
                if(m) {
                    let [era, year, law_type, num] = m.slice(1);

                    let era_val = util.eras[era];
                    if(era_val) law.attr.Era = era_val;

                    let year_val = util.parse_kanji_num(year);
                    if(year_val !== null) law.attr.Year = year_val;

                    let law_type_val = util.get_lawtype(law_type);
                    if(law_type_val !== null) law.attr.LawType = law_type_val;

                    let num_val = util.parse_kanji_num(num);
                    if(num_val !== null) law.attr.Num = num_val;
                }
            }

            if(law_title.law_title) {
                law_body.append(new EL("LawTitle", {}, [law_title.law_title]));
            }
        }

        law.append(law_body);

        law_body.extend(enact_statements || []);
        law_body.append(toc);
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
    title:OUTSIDE_ROUND_PARENTHESES_INLINE
    article_range:($ROUND_PARENTHESES_INLINE)?
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
        let type_char = title.text.match(/[編章節款目章則]/)[0];
        let toc_item = new EL("TOC" + util.article_group_type[type_char]);

        if(title.text.match(/[編章節款目章]/)) {
            toc_item.attr.Delete = 'false';
            let num = util.parse_named_num(title.text);
            if(num) {
                toc_item.attr.Num = num;
            }
        }

        toc_item.append(new EL(
            util.article_group_title_tag[type_char],
            {},
            title.content,
        ));

        if(article_range !== null) {
            toc_item.append(new EL(
                "ArticleRange",
                {},
                [article_range],
            ));
        }

        toc_item.extend(children || []);

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
                let current_level = util.article_group_type_chars.indexOf(article_group_title.type_char);
                let next_level = util.article_group_type_chars.indexOf(next_title.type_char);
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
            util.article_group_type[article_group_title.type_char],
            {Delete: "false", Hide: "false"},
        );

        article_group.append(new EL(
            util.article_group_type[article_group_title.type_char] + "Title",
            {},
            article_group_title.content,
        ))

        let num = util.parse_named_num(article_group_title.num);
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
    ([のノ] [^ 　\t\r\n]+)?

article "article" =
    article_caption:article_paragraph_caption?
    article_title:$article_title
    inline_contents:(
        __
        target:columns_or_sentences
        { return target; }
        /
        _
        { return [new EL("Sentence", {WritingMode: 'vertical'})]; }
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
    {
        let article = new EL(
            "Article",
            {Delete: "false", Hide: "false"},
        );
        if(article_caption !== null) {
            article.append(new EL("ArticleCaption", {}, [article_caption]));
        }
        article.append(new EL("ArticleTitle", {}, [article_title]));

        let num = util.parse_named_num(article_title);
        if(num) {
            article.attr.Num = num;
        }

        let paragraph = new EL("Paragraph");
        paragraph.attr.OldStyle = "false";
        paragraph.attr.Delete = "false";
        article.append(paragraph);

        paragraph.append(new EL("ParagraphNum"));
        paragraph.append(new EL("ParagraphSentence", {}, inline_contents));
        paragraph.extend(lists || []);
        paragraph.extend(children1 || []);
        paragraph.extend(children2 || []);

        article.extend(paragraphs);

        return article;
    }


paragraph_item "paragraph_item" =
    // &(here:$(NEXTINLINE) &{ console.error(`here1 line ${location().start.line}: ${here}`); return true; })
    paragraph_caption:article_paragraph_caption?
    paragraph_item_title:$(
        !article_title
        !appdx_table_title
        !appdx_style_title
        !suppl_provision_label
        [^ 　\t\r\n条<]+
    )
    __
    inline_contents:columns_or_sentences
    NEWLINE+
    lists:(
        INDENT INDENT
    // &(here:$(NEXTINLINE) &{ console.error(`here1.1 line ${location().start.line}: ${here}`); return true; })
            target:list+
    // &(here:$(NEXTINLINE) &{ console.error(`here1.2 line ${location().start.line}: ${here}`); return true; })
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
    // &(here:$(NEXTINLINE) &{ console.error(`here2 line ${location().start.line}: ${here}`); return true; })
    {
        let lineno = location().start.line;
        let indent = indent_memo[lineno];

        if(base_indent_stack.length > 0) {
            let [base_indent, is_first, base_lineno] = base_indent_stack[base_indent_stack.length - 1];
            if(!is_first || lineno !== base_lineno) {
                indent -= base_indent;
            }
        }

        let paragraph_item = new EL(
            util.paragraph_item_tags[indent],
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

        paragraph_item.append(new EL(util.paragraph_item_title_tags[indent], {}, [paragraph_item_title]));

        let num = util.parse_named_num(paragraph_item_title);
        if(num) {
            paragraph_item.attr.Num = num;
        }

        paragraph_item.append(new EL(util.paragraph_item_sentence_tags[indent], {}, inline_contents));

        paragraph_item.extend(lists || []);
        paragraph_item.extend(children || []);

        return paragraph_item;
    }

no_name_paragraph_item "no_name_paragraph_item" =
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
        let indent = indent_memo[lineno];

        if(base_indent_stack.length > 0) {
            let [base_indent, is_first, base_lineno] = base_indent_stack[base_indent_stack.length - 1];
            if(!is_first || lineno !== base_lineno) {
                indent -= base_indent;
            }
        }

        let paragraph_item = new EL(
            util.paragraph_item_tags[indent],
            {Hide: "false", Num: "1"},
        );
        if(indent === 0) {
            paragraph_item.attr.OldStyle = "false";
        } else {
            paragraph_item.attr.Delete = "false";
        }
        paragraph_item.append(new EL(util.paragraph_item_title_tags[indent]));
        paragraph_item.append(new EL(util.paragraph_item_sentence_tags[indent], {}, inline_contents));
        paragraph_item.extend(lists || []);
        paragraph_item.extend(children || []);

        return paragraph_item;
    }

paragraph_item_child "paragraph_item_child" =
    table_struct
    /
    paragraph_item
    /
    style_struct




list "list" =
    columns_or_sentences:columns_or_sentences
    NEWLINE+
    sublists:(
        &("" &{ list_depth++; return true; })
        INDENT INDENT
            target:list+
            NEWLINE*
        DEDENT DEDENT
        &("" &{ list_depth--; return true; })
        { return target; }
        /
        &("" &{ list_depth--; return false; }) "DUMMY"
    )?
    {
        let list = new EL(util.list_tags[list_depth]);
        let list_sentence = new EL(util.list_tags[list_depth] + "Sentence");
        list.append(list_sentence);

        list_sentence.extend(columns_or_sentences);

        list.extend(sublists || []);

        return list;
    }






table_struct "table_struct" =
    !INDENT !DEDENT !NEWLINE
    table_struct_title:table_struct_title?
    remarkses1:remarks*
    table:table
    remarkses2:remarks*
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
        let table = new EL("Table", {WritingMode: "vertical"});
        for(let i = 0; i < table_row_columns.length; i++) {
            let table_row = new EL("TableRow", {}, table_row_columns[i]);
            table.append(table_row);
        }

        return table;
    }

table_column "table_column" =
    // &(here:$(NEXTINLINE) &{ console.error(`tc 01 line ${location().start.line}: "${here}"`); return true; })
    "-" __
    attr:(
        "["
        name:$[^ 　\t\r\n\]=]+
        "=\""
        value:$[^ 　\t\r\n\]"]+
        "\"]"
        { return [name, value]; }
    )*
    first:(
        fig_struct
        /
        inline:INLINE? NEWLINE
        {
            return new EL(
                "Sentence",
                {WritingMode: "vertical"},
                inline || [new __Text("")],
            )
        }
    )
    rest:(
        INDENT INDENT
            target:(
    // &(here:$(NEXTINLINE) &{ console.error(`here0 line ${location().start.line}: "${here}"`); return true; })
                _target:(
                    fig_struct
                    /
                    inline:INLINE NEWLINE
                    {
                        return new EL(
                            "Sentence",
                            {WritingMode: "vertical"},
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
    {
        let children = [first].concat(rest || []);

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
            [new EL("Sentence", {WritingMode: "vertical"}),
        ]);
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
    )
    {
        return new EL("Style", {}, children);
    }







remarks "remarks" =
    label:$(("備考" / "注") [^ 　\t\r\n]*)
    first:(
        __
        _target:INLINE
        {
            return new EL(
                "Sentence",
                {WritingMode: "vertical"},
                _target,
            );
        }
    )?
    NEWLINE
    rest:(
        INDENT INDENT
            target:(
                &("" &{ base_indent_stack.push([indent_memo[location().start.line] - 1, false, location().start.line]); return true; })
                _target:(paragraph_item / no_name_paragraph_item)
                &("" &{ base_indent_stack.pop(); return true; })
                { return _target; }
                /
                &("" &{ base_indent_stack.pop(); return false; }) "DUMMY"
                /
                _target:INLINE
                NEWLINE
                {
                    return new EL(
                        "Sentence",
                        {WritingMode: "vertical"},
                        _target,
                        );
                    }
            )+
            NEWLINE*
        DEDENT DEDENT
        { return target; }
    )?
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
        remarks.append(new EL("RemarksLabel", {}, [new __Text(label)]));
        remarks.extend(children);

        return remarks;
    }






fig_struct "fig_struct" =
    // &(here:$(NEXTINLINE) &{ console.error(`fig 0 line ${location().start.line}: "${here}"`); return true; })
    fig:fig
    {
        return new EL("FigStruct", {}, [fig]);
    }

fig "fig" =
    ".." __ "figure" _ "::" _
    src:$INLINE
    NEWLINE
    {
        return new EL("Fig", {src: src});
    }







appdx_item "appdx_item" =
    appdx_table
    /
    appdx_style
    /
    suppl_provision





appdx_table_title "appdx_table_title" =
    title_struct:(
        title:$("別表" [^\r\n(（]*)
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
        return title_struct;
    }


appdx_table "appdx_table" =
    title_struct:appdx_table_title
    NEWLINE+
    children:(
        INDENT
            target:appdx_table_children
            remarkses:remarks*
            NEWLINE*
        DEDENT
        { return target.concat(remarkses); }
    )?
    {
        let appdx_table = new EL("AppdxTable");
        if(title_struct.table_struct_title !== "") {
            console.error(`### line ${location().start.line}: Maybe irregular AppdxTableTitle!`);
            appdx_table.append(new EL("AppdxTableTitle", {WritingMode: "vertical"}, [new __Text( title_struct.text)]));
        } else {
            appdx_table.append(new EL("AppdxTableTitle", {WritingMode: "vertical"}, [new __Text(title_struct.title)]));
            if(title_struct.related_article_num) {
                appdx_table.append(new EL("RelatedArticleNum", {}, [title_struct.related_article_num]));
            }
        }
        appdx_table.extend(children || []);

        return appdx_table;
    }

appdx_table_children "appdx_table_children" =
    table_struct:table_struct { return [table_struct]; }
    /
    paragraph_item+






appdx_style_title "appdx_style_title" =
    title_struct:(
        title:$("様式" [^\r\n(（]*)
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

appdx_style_children "appdx_style_children" =
    table_struct:table_struct { return [table_struct]; }
    /
    fig:fig { return [fig]; }
    /
    paragraph_item+





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
    {
        let suppl_provision = new EL("SupplProvision");
        if(suppl_provision_label.amend_law_num) {
            suppl_provision.attr["AmendLawNum"] = suppl_provision_label.amend_law_num;
        }
        if(suppl_provision_label.extract !== null) {
            suppl_provision.attr["Extract"] = "true";
        }
        suppl_provision.append(new EL("SupplProvisionLabel", {}, [new __Text(suppl_provision_label.label)]))
        suppl_provision.extend(children);
        return suppl_provision;
    }

// ########### structures control end ###########






// ########### sentences control begin ###########

columns_or_sentences "columns_or_sentences" =
    columns
    /
    period_sentences
    /
    inline:INLINE

    {
        // console.error(`### line ${location().start.line}: Maybe mismatched parenthesis!`);
        let sentence = new EL(
            "Sentence",
            {WritingMode: "vertical"},
            inline,
        );
        return [sentence];
    }

period_sentences "period_sentences" =
    fragments:(PERIOD_SENTENCE_FRAGMENT)+
    {
        let sentences = [];
        let proviso_indices = [];
        for(let i = 0; i < fragments.length; i++) {
            let sentence_content = fragments[i];
            let sentence = new EL(
                "Sentence",
                {WritingMode: "vertical"},
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
    first:period_sentences
    rest:(__ target:period_sentences { return target; })+
    {
        let column_inner_sets = [first].concat(rest);
        let columns = [];
        for(let i = 0; i < column_inner_sets.length; i++) {
            let column = new EL(
                "Column",
                {},
                column_inner_sets[i],
            );
            if(column_inner_sets.length >= 2) {
                column.attr.Num = "" + (i + 1);
            }
            columns.push(column);
        }
        return columns;
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
    &("" &{ parentheses_depth++; return true; })
    target:PARENTHESES_INLINE_INNER
    &("" &{ parentheses_depth--; return true; })
    { return target; }
    /
    &("" &{ parentheses_depth--; return false; }) "DUMMY"

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
        return new __Parentheses("round", parentheses_depth, start, end, content, text());
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
        return new __Parentheses("squareb", parentheses_depth, start, end, content, text());
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
        return new __Parentheses("curly", parentheses_depth, start, end, content, text());
    }

SQUARE_PARENTHESES_INLINE "SQUARE_PARENTHESES_INLINE" =
    start:[「]
    content:$(
        [^\r\n「」]+
        /
        SQUARE_PARENTHESES_INLINE
    )*
    end:[」]
    {
        return new __Parentheses("square", parentheses_depth, start, end, [new __Text(content)], text());
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
    "<"
    tag:$[^> \t\r\n]+
    _
    attr:(
        name:$[^> =\t\r\n]+
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
        end_tag:$[^> ]+
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
    "<"
    tag:$[^> \t\r\n]+
    _
    attr:(
        name:$[^> =\t\r\n]+
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

NEWLINE "NEWLINE" =
    [\r]?[\n] (_ &NEWLINE)?

// ########### whitespaces control end ###########
