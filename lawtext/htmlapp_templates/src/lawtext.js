'use strict';

function em(input) {
    var emSize = parseFloat($("body").css("font-size"));
    return (emSize * input);
}

var Lawtext = Lawtext || {};

Lawtext.element_to_json = el => {
    let children = [];
    for (let node of el.childNodes) {
        if(node.nodeType === Node.TEXT_NODE) {
            let text = node.nodeValue.trim();
            if(text) {
                children.push(text);
            }
        } else if(node.nodeType === Node.ELEMENT_NODE) {
            children.push(Lawtext.element_to_json(node));
        } else {
            console.log(node);
        }
    }
    let attr = {};
    for (let at of el.attributes) {
        attr[at.name] = at.value;
    }
    return new Lawtext.EL(
        el.tagName,
        attr,
        children,
    );
};

Lawtext.LawNameItem = class {
    constructor(law_name, law_no, promulgation_date) {
        this.law_name = law_name;
        this.law_no = law_no;
        this.promulgation_date = promulgation_date;
    }
}

Lawtext.law_name_data = [];

Lawtext.xml_to_json = xml => {
    let parser = new DOMParser();
    let dom = parser.parseFromString(xml, "text/xml");
    return Lawtext.element_to_json(dom.documentElement);
};

Lawtext.restructure_table = table => {
    let new_table_children = [];
    let rowspan_state = {};
    let colspan_value = {};
    for(let row of table.children) {
        if(row.tag !== "TableRow") {
            new_table_children.push(row);
            return;
        }
        let new_row_children = [];
        let c = 0;
        let ci = 0;
        while(true){

            let rss = rowspan_state[c] || 0;
            if(rss) {
                let colspan = colspan_value[c] || 0;
                new_row_children.push({
                    tag: "TableColumnMerged",
                    attr: colspan ? {
                        colspan: colspan,
                    } : {},
                    children: [],
                });
                rowspan_state[c] = rss - 1;
                if(colspan) {
                    c += colspan - 1;
                }
                c += 1
                continue;
            }

            if(ci >= row.children.length) {
                break;
            }

            let column = row.children[ci];
            new_row_children.push(column);
            if(column.tag !== "TableColumn") {
                ci += 1;
                continue;
            }

            let colspan = Number(column.attr.colspan || 0);
            if(column.attr.rowspan !== undefined) {
                let rowspan = Number(column.attr.rowspan);
                rowspan_state[c] = rowspan - 1;
                colspan_value[c] = colspan;
                if(colspan) {
                    c += colspan - 1;
                }
            }
            c += 1;
            ci += 1;
        }

        new_table_children.push({
            tag: row.tag,
            attr: row.attr,
            children: new_row_children,
        });
    }

    let ret = {
        tag: table.tag,
        attr: table.attr,
        children: new_table_children,
    };

    return ret;
};

Lawtext.Context = class {
    constructor() {
        this.data = {};
    }
    get(key) {
        return this.data[key];
    }
    set(key, value) {
        this.data[key] = value;
        return "";
    }
};

Lawtext.annotate = el => {
    if(typeof el === "string" || el instanceof String) {
        return el;
    }

    let child_str = el.children.map(child => Lawtext.annotate(child)).join("");

    if(el.tag === "____Declaration") {
        return `<span class="lawtext-analyzed lawtext-analyzed-declaration" lawtext_declaration_index="${el.attr.declaration_index}">${child_str}</span>`

    } else if(el.tag === "____VarRef") {
        return `<span class="lawtext-analyzed lawtext-analyzed-varref" lawtext_declaration_index="${el.attr.ref_declaration_index}">${child_str}</span>`

    } else if(el.tag === "____LawNum") {
        return `<a class="lawtext-analyzed lawtext-analyzed-lawnum" href="#${child_str}" target="_blank">${child_str}</a>`

    } else if(el.tag === "__Parentheses") {
        return `<span class="lawtext-analyzed lawtext-analyzed-parentheses" lawtext_parentheses_type="${el.attr.type}" data-lawtext-parentheses-depth="${el.attr.depth}">${child_str}</span>`

    } else if(el.tag === "__PStart") {
        return `<span class="lawtext-analyzed lawtext-analyzed-start-parenthesis" lawtext_parentheses_type="${el.attr.type}">${child_str}</span>`

    } else if(el.tag === "__PContent") {
        return `<span class="lawtext-analyzed lawtext-analyzed-parentheses-content" lawtext_parentheses_type="${el.attr.type}">${child_str}</span>`

    } else if(el.tag === "__PEnd") {
        return `<span class="lawtext-analyzed lawtext-analyzed-end-parenthesis" lawtext_parentheses_type="${el.attr.type}">${child_str}</span>`

    } else if(el.tag === "__MismatchStartParenthesis") {
        return `<span class="lawtext-analyzed lawtext-analyzed-mismatch-start-parenthesis">${child_str}</span>`

    } else if(el.tag === "__MismatchEndParenthesis") {
        return `<span class="lawtext-analyzed lawtext-analyzed-mismatch-end-parenthesis">${child_str}</span>`

    } else {
        return child_str;
    }
}

Lawtext.render_law = (template_name, law) => {
    let rendered = nunjucks.render(template_name, {
        law: law,
        "print": console.log,
        "context": new Lawtext.Context(),
        "annotate": Lawtext.annotate,
    });
    if(template_name === "lawtext") {
        rendered = rendered.replace(/(\r?\n\r?\n)(?:\r?\n)+/g, "$1");
    }
    return rendered;
};

Lawtext.render_elements_fragment = (elements) => {
    let rendered = nunjucks.render("htmlfragment.html", {
        elements: elements,
        "print": console.log,
        "context": new Lawtext.Context(),
        "annotate": Lawtext.annotate,
    });
    return rendered;
};



Lawtext.analyze_xml = el => {
    if(typeof el === 'string' || el instanceof String) {
        return el;
    }
    if(["Sentence", "EnactStatement"].indexOf(el.tag) >= 0) {
        if(el.text) {
            el.children = Lawtext.parse(el.text, {startRule: "INLINE"});
        }
    } else {
        for(let child of el.children) {
            Lawtext.analyze_xml(child);
        }
    }
};















Lawtext.Data = class extends Backbone.Model {

    get defaults() {
        return {
            law: null,
            opening_file: false,
            law_search_key: null,
            analysis: null,
        };
    }

    constructor() {
        super(...arguments);

        this.open_file_input = $("<input>")
            .attr({
                type: "file",
                accept: "text/plain,application/xml",
            })
            .css({display: "none"});
        $("body").append(this.open_file_input);
        this.open_file_input.change(e => { this.open_file_input_change(e); });

        $(window).resize(_.throttle(() => {
            this.trigger("window-resize");
        }, 300));
    }

    open_file() {
        this.open_file_input.click();
    }

    open_file_input_change(evt) {
        this.set({opening_file: true});

        let file = evt.target.files[0];
        if(file === null) return;
        let reader = new FileReader();
        reader.onload = (e => {
            $(evt.target).val("");
            let div = $("<div>");
            let text = e.target.result;
            this.load_law_text(text, true);
            this.set({law_search_key: null});
            this.trigger("file-loaded");
        });
        reader.readAsText(file);
    }

    invoke_error(title, body_el) {
        this.trigger("error", title, body_el);
    }

    load_law_text(text, analyze_xml) {
        let div = $("<div>");
        let law = null;
        if(/^(?:<\?xml|<Law)/.test(text.trim())) {
            law = Lawtext.xml_to_json(text);
            if(analyze_xml) {
                Lawtext.analyze_xml(law);
            }
        } else {
            try {
                law = Lawtext.parse(text, {startRule: "start"});
            } catch(err) {
                let err_str = err.toString();
                let pre = $("<pre>")
                    .css({"white-space": "pre-wrap"})
                    .css({"line-height": "1.2em"})
                    .css({"padding": "1em 0"})
                    .html(err_str);
                    this.invoke_error("読み込んだLawtextにエラーがあります", pre[0]);
                law = null;
            }
        }
        if(law) {
            this.set({opening_file: false, law: law});
        } else {
            this.set({opening_file: false});
        }
    }

    search_law(law_search_key) {
        this.set({opening_file: true});
        setTimeout(() => {
            this.search_law_inner(law_search_key);
        }, 30);
    }

    search_law_inner(law_search_key) {
        let load_law_num = lawnum => {

            let law_data = localStorage ? localStorage.getItem(`law_for:${lawnum}`) : null;
            if(law_data) {
                law_data = JSON.parse(law_data);
                let datetime = new Date(law_data.datetime);
                let now = new Date();
                let ms = now.getTime() - datetime.getTime();
                let days = ms / (1000 * 60 * 60 * 24);
                if(days < 1) {
                    this.load_law_text(law_data.xml, true);
                    return;
                }
            }

            fetch(`https://lic857vlz1.execute-api.ap-northeast-1.amazonaws.com/prod/Lawtext-API?method=lawdata&lawnum=${encodeURI(lawnum)}`, {
                mode: "cors",
            })
            .then(response => new Promise((resolve, reject) => {
                response.text().then(text => resolve([response, text]));
            }))
            .then(([response, text]) => new Promise((resolve, reject) => {
                if(response.ok && !/^(?:<\?xml|<Law)/.test(text.trim())) {
                    JSZip.loadAsync(text, {base64: true})
                    .then(zip => zip.file("body.xml").async("string"))
                    .then(xml => resolve([response, xml]));
                } else {
                    resolve([response, text]);
                }
            }))
            .then(([response, text]) => {
                if(response.ok) {
                    this.load_law_text(text, true);
                    if(localStorage) {
                        localStorage.setItem(
                            `law_for:${lawnum}`,
                            JSON.stringify({
                                datetime: new Date().toISOString(),
                                xml: text,
                            }),
                        );
                    }
                } else {
                    console.log(response);
                    this.set({opening_file: false});
                    this.invoke_error(
                        "法令の読み込み中にエラーが発生しました",
                        text,
                    );
                }
            });
        };

        let law_num_data = localStorage ? localStorage.getItem(`law_num_for:${law_search_key}`) : null;
        if(law_num_data) {
            law_num_data = JSON.parse(law_num_data);
            let datetime = new Date(law_num_data.datetime);
            let now = new Date();
            let ms = now.getTime() - datetime.getTime();
            let days = ms / (1000 * 60 * 60 * 24);
            if(days < 1) {
                load_law_num(law_num_data.lawnum);
                return;
            }
        }

        let re_lawnum = /^(?:明治|大正|昭和|平成)[元〇一二三四五六七八九十]+年(?:\S+?第[〇一二三四五六七八九十百千]+号|人事院規則[〇一二三四五六七八九―]+|[一二三四五六七八九十]+月[一二三四五六七八九十]+日内閣総理大臣決定)$/;
        let match = re_lawnum.exec(law_search_key);
        if(match) {
            let lawnum = match[0];
            load_law_num(lawnum);
            if(localStorage) {
                localStorage.setItem(
                    `law_num_for:${law_search_key}`,
                    JSON.stringify({
                        datetime: new Date().toISOString(),
                        lawnum: lawnum,
                    }),
                );
            }
        } else {
            fetch(`https://lic857vlz1.execute-api.ap-northeast-1.amazonaws.com/prod/Lawtext-API?method=lawnums&lawname=${encodeURI(law_search_key)}`, {
                mode: "cors",
            })
            .then(response => response.json())
            .then(data => {
                if(data.length) {
                    let lawnum = data[0][1];
                    load_law_num(lawnum);
                    if(localStorage) {
                        localStorage.setItem(
                            "law_num_for:" + law_search_key,
                            JSON.stringify({
                                datetime: new Date().toISOString(),
                                lawnum: lawnum,
                            }),
                        );
                    }
                    return;
                } else {
                    this.invoke_error(
                        "法令が見つかりません",
                        `「${law_search_key}」を検索しましたが、見つかりませんでした。`,
                    );
                }
                this.set({opening_file: false});
            });
        }
    }

    get_law_name() {
        let law = this.get("law");
        if(law === null) return;

        let law_num = _(law.children).findWhere({tag: "LawNum"});
        let law_body = _(law.children).findWhere({tag: "LawBody"});
        let law_title = law_body && _(law_body.children).findWhere({tag: "LawTitle"});

        let s_law_num = law_num ? law_num.children[0] : "";
        let s_law_title = law_title ? law_title.children[0] : "";
        s_law_num = (s_law_num && s_law_title) ? (`（${s_law_num}）`) : s_law_num;

        return s_law_title + s_law_num;
    }

    download_docx() {
        let law = this.get("law");
        if(law === null) return;

        let s_content_types = nunjucks.render("docx/[Content_Types].xml");
        let s_rels = nunjucks.render("docx/_rels/.rels");
        let s_document_rels = nunjucks.render("docx/word/_rels/document.xml.rels");
        let s_document = nunjucks.render("docx/word/document.xml", {
            law: law,
            restructure_table: Lawtext.restructure_table,
            print: console.log,
            context: new Lawtext.Context(),
        });
        let s_styles = nunjucks.render("docx/word/styles.xml");

        let zip = new JSZip();
        zip.file("[Content_Types].xml", s_content_types)
        zip.file("_rels/.rels", s_rels)
        zip.file("word/_rels/document.xml.rels", s_document_rels)
        zip.file("word/document.xml", s_document)
        zip.file("word/styles.xml", s_styles)
        zip.generateAsync({
            type: "uint8array",
            compression: "DEFLATE",
            compressionOptions: {
                level: 9
            },
        })
        .then(buffer => {
            let blob = new Blob(
                [buffer],
                {type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"},
            );
            let law_name = this.get_law_name() || "lawtext_output";
            saveAs(blob, `${law_name}.docx`);
        });
    }

    download_lawtext() {
        let law = this.get("law");
        if(law === null) return;

        let s_lawtext = nunjucks.render("lawtext.j2", {
            law: law,
            print: console.log,
            context: new Lawtext.Context(),
        });
        let blob = new Blob(
            [s_lawtext],
            {type: "text/plain"},
        );
        let law_name = this.get_law_name() || "lawtext_output";
        saveAs(blob, `${law_name}.law.txt`);
    }

    download_xml() {
        let law = this.get("law");
        if(law === null) return;

        let s_lawtext = nunjucks.render("xml.xml", {
            law: law,
            print: console.log,
            context: new Lawtext.Context(),
        });
        let blob = new Blob(
            [s_lawtext],
            {type: "application/xml"},
        );
        let law_name = this.get_law_name() || "lawtext_output";
        saveAs(blob, `${law_name}.xml`);
    }

    get_declaration(index) {
        let analysis = this.get("analysis");
        if(analysis === null) return null;

        let declarations = analysis.declarations;
        return declarations[index];
    }
}



Lawtext.SidebarView_template = _.template(Lawtext.sidebar_view_template);
Lawtext.SidebarView = class extends Backbone.View {

    get tagName() { return "div"; }
    get className() { return "lawtext-sidebar-view"; }

    constructor(options) {
        super(...arguments);

        this.data = options.data;
        this.listenTo(
            this.data,
            "change:law change:opening_file",
            _.debounce(() => {
                this.render();
            }, 100),
        );
    }

    render(options) {
        this.$el.html(Lawtext.SidebarView_template({
            data: this.data.attributes,
        }));
    }
}



Lawtext.VarRefView_template = _.template(`
<span class="lawtext-varref-text"><%= text %></span><span class="lawtext-varref-float-block" style="display: none; height: 0;">
<div class="lawtext-varref-float-block-inner">
<div class="lawtext-varref-arrow"></div>
<div class="lawtext-varref-window">
</div>
</div>
</span>
`.trim());
Lawtext.VarRefView = class extends Backbone.View {

    get tagName() { return "span"; }
    get className() { return "lawtext-varref-view"; }
    get events() { return {
        "click .lawtext-varref-text": "text_click",
    }; }

    constructor(options) {
        super(...arguments);

        this.data = options.data;
        this.declaration_index = options.declaration_index;
        this.text = options.text;

        this.text_obj = null;
        this.block_obj = null;
        this.inner_obj = null;
        this.arrow_obj = null;
        this.window_obj = null;

        this.rendered = false;

        this.listenTo(this, "rendered", this.update_size);
        this.listenTo(this.data, "window-resize", this.update_size);
    }

    get_content() {
        let declaration = this.data.get_declaration(this.declaration_index);
        let container_stack = declaration.name_pos.env.container_stack;
        let names = [];
        for(let container of container_stack) {
            if(container.tag === "EnactStatement") {
                names.push("（制定文）");

            } else if(container.tag === "Article") {
                let article_name = _(container.children)
                    .findWhere({tag: "ArticleTitle"})
                    .text;
                names.push(article_name);

            } else if(container.tag === "Paragraph") {
                let paragraph_num = _(container.children)
                    .findWhere({tag: "ParagraphNum"})
                    .text || "１";
                names.push(paragraph_num);

            } else if([
                "Item", "Subitem1", "Subitem2", "Subitem3",
                "Subitem4", "Subitem5", "Subitem6",
                "Subitem7", "Subitem8", "Subitem9",
                "Subitem10",
            ].indexOf(container.tag) >= 0) {
                let item_title = _(container.children)
                    .findWhere({tag: `${container.tag}Title`})
                    .text;
                names.push(item_title);

            } else if(container.tag === "Table") {
                let table_struct_title_el = _(container.children)
                    .findWhere({tag: "TableStructTitle"});
                let table_struct_title = table_struct_title_el
                    ? table_struct_title_el.text
                    : "表"
                names.push(table_struct_title + "（抜粋）");

            }
        }

        let closest_children = container_stack[container_stack.length - 1].children
        .filter(el => {
            return [
                "ArticleTitle", "ParagraphNum", "ItemTitle",
                "Subitem1Title", "Subitem2Title", "Subitem3Title",
                "Subitem4Title", "Subitem5Title", "Subitem6Title",
                "Subitem7Title", "Subitem8Title", "Subitem9Title",
                "Subitem10Title",
                "SupplProvision",
            ].indexOf(el.tag) < 0;
        });
        let fragment = Lawtext.render_elements_fragment(closest_children).trim();
        return `
<div class="paragraph-item-body"><span class="paragraph-item-num">${names.join("／")}</span>　${fragment}</div>
`.trim();
    }

    render() {
        this.$el.html(Lawtext.VarRefView_template({
            data: this.data.attributes,
            text: this.text,
        }));
        this.text_obj = this.$(".lawtext-varref-text");
        this.block_obj = this.$(".lawtext-varref-float-block");
        this.inner_obj = this.$(".lawtext-varref-float-block-inner");
        this.arrow_obj = this.$(".lawtext-varref-arrow");
        this.window_obj = this.$(".lawtext-varref-window");
        this.rendered = true;

        this.listenTo(this.block_obj, "transitionend", alert);
        this.block_obj[0].addEventListener("transitionend", () => {
            if(!this.is_open) this.block_obj.hide();
        }, false);

        this.trigger("rendered");
    }

    update_window() {
        this.window_obj.html(this.get_content());
    }

    update_size() {
        if(!this.rendered) return;

        let text_left = this.text_obj.offset().left;
        let window_left = this.window_obj.offset().left;
        let rel_left = text_left - window_left;
        let left = Math.max(rel_left, em(0.2));
        this.arrow_obj.css({"margin-left": `${left}px`});

        let inner_height = this.inner_obj.outerHeight();
        this.block_obj.height(inner_height);
    }

    get is_open() {
        return this.$el.hasClass("lawtext-varref-open");
    }

    set is_open(value) {
        return this.$el.toggleClass("lawtext-varref-open", value);
    }

    text_click() {
        if(this.is_open) {
            this.block_obj.height(0);
            this.is_open = false;
        } else {
            this.update_window();
            this.block_obj.show();
            this.update_size();
            this.is_open = true;
        }
    }
}



Lawtext.HTMLpreviewView_template = _.template(Lawtext.htmlpreview_view_template);
Lawtext.HTMLpreviewView = class extends Backbone.View {

    get tagName() { return "div"; }
    get className() { return "lawtext-htmlpreview-view"; }

    constructor(options) {
        super(...arguments);

        this.data = options.data;
        this.law_html = null;
        this.analyzed = false;

        this.listenTo(this.data, "change:law", this.law_change);
        this.listenTo(
            this.data,
            "change:law change:opening_file",
            _.debounce(() => {
                this.render();
            }, 100),
        );
        this.listenTo(this.data, "scroll-to-law-anchor", this.scroll_to_law_anchor);

        this.varref_views = [];
    }

    law_change() {
        this.law_html = null;
        this.analyzed = false;
    }

    render() {
        let law = this.data.get("law");
        if(law !== null && this.law_html === null) {
            let analysis = Lawtext.analyze(law);
            this.law_html = Lawtext.render_law("htmlfragment.html", law);
            this.analyzed = true;
            this.data.set({analysis, analysis});
        }

        this.$el.html(Lawtext.HTMLpreviewView_template({
            data: this.data.attributes,
            law_html: this.law_html,
        }));

        this.varref_views = [];
        for(let el of this.$(".lawtext-analyzed-varref")) {
            let obj = $(el);
            let varref_view = new Lawtext.VarRefView({
                data: this.data,
                declaration_index: parseInt(obj.attr("lawtext_declaration_index"), 10),
                text: obj.text(),
            });
            obj.replaceWith(varref_view.el);
            varref_view.render();
            this.varref_views.push(varref_view);
        }
    }

    scroll_to_law_anchor(tag, name) {
        for(let el of this.$(".law-anchor")) {
            let obj = $(el);
            if(obj.data("tag") === tag && obj.data("name") === name) {
                $("html,body").animate({scrollTop: obj.offset().top}, "normal");
            }
        }
    }
}




Lawtext.MainView_template = _.template(Lawtext.main_view_template);
Lawtext.MainView = class extends Backbone.View {

    get tagName() { return "div"; }
    get className() { return "lawtext-main-view"; }
    get events() { return {
        "click .lawtext-open-file-button": "open_file_button_click",
        "click .lawtext-download-sample-lawtext-button": "download_sample_lawtext_button_click",
        "click .search-law-button": "search_law_button_click",
        "click .lawtext-download-docx-button": "download_docx_button_click",
        "click .lawtext-download-lawtext-button": "download_lawtext_button_click",
        "click .lawtext-download-xml-button": "download_xml_button_click",
        "click .law-link": "law_link_click",
        "click .lawtext-analyzed-varref-text": "varref_text_click",
    }; }

    constructor(options) {
        super(...arguments);

        this.data = options.data;
        this.router = options.router;

        this.sidebar_view = new Lawtext.SidebarView({
            data: Lawtext.data,
        });
        this.htmlpreview_view = new Lawtext.HTMLpreviewView({
            data: Lawtext.data,
        });

        this.listenTo(this.data, "change:law_search_key", this.law_search_key_change);
        this.listenTo(this.data, "change:law", this.law_change);
        this.listenTo(this.data, "error", this.onerror);
    }

    render() {
        this.sidebar_view.$el.detach();
        this.htmlpreview_view.$el.detach();

        this.$el.html(Lawtext.MainView_template({
        }));

        this.$(".lawtext-sidebar-view-place").replaceWith(this.sidebar_view.el);
        this.sidebar_view.render();
        this.$(".lawtext-htmlpreview-view-place").replaceWith(this.htmlpreview_view.el);
        this.htmlpreview_view.render();
    }

    search_law_button_click(e) {
        let obj = $(e.currentTarget);

        let textbox = obj.parent().parent().find(".search-law-textbox");
        let text = textbox.val().trim();

        this.router.navigate(text, {trigger: true});

        return false;
    }

    open_file_button_click(e) {
        this.data.open_file();
    }

    download_sample_lawtext_button_click(e) {
        let blob = new Blob(
            [Lawtext.sample_lawtext],
            {type: "text/plain"},
        );
        saveAs(blob, "sample_lawtext.law.txt");
    }

    download_docx_button_click(e) {
        this.data.download_docx();
    }

    download_lawtext_button_click(e) {
        this.data.download_lawtext();
    }

    download_xml_button_click(e) {
        this.data.download_xml();
    }

    law_link_click(e) {
        let obj = $(e.currentTarget);
        this.data.trigger("scroll-to-law-anchor", obj.data("tag"), obj.data("name"));
    }

    law_search_key_change() {
        let law_search_key = this.data.get("law_search_key");
        if(law_search_key) {
            this.data.search_law(law_search_key);
        }
    }

    law_change() {
        let law = this.data.get("law");
        let law_search_key = this.data.get("law_search_key");

        if(law && law_search_key) {
            let law_body = _(law.children).findWhere({tag: "LawBody"});
            let law_title = _(law_body.children).findWhere({tag: "LawTitle"});
            document.title = `${law_title.children[0]} | Lawtext`;
        } else {
            document.title = "Lawtext";
        }
    }

    onerror(title, body_el) {
        let modal = this.$("#errorModal");
        modal.find(".modal-title").html(title);
        modal.find(".modal-body").html(body_el);
        modal.modal("show");
    }

    varref_text_click(e) {
        let obj = $(e.currentTarget);

        let varref = obj.closest(".lawtext-analyzed-varref");
        let is_open = varref.hasClass("lawtext-analyzed-varref-open");

        let parent_div = varref.closest("div");

        for(let el of parent_div.find(".lawtext-analyzed-varref.lawtext-analyzed-varref-open")) {
            let varref = $(el);
            let _parent_div = varref.closest("div");
            if(!parent_div[0].isEqualNode(_parent_div[0])) return;
            let arr = $(varref.find(".lawtext-analyzed-varref-arrow")[0]);
            let win = $(varref.find(".lawtext-analyzed-varref-window")[0]);
            varref.removeClass("lawtext-analyzed-varref-open");
            arr.hide();
            win.slideUp(200);
        }

        if(!is_open) {
            let arr = $(varref.find(".lawtext-analyzed-varref-arrow")[0]);
            let win = $(varref.find(".lawtext-analyzed-varref-window")[0]);
            let is_empty = win.hasClass("lawtext-analyzed-varref-empty");
            if(is_empty) {
                let decl_index = varref.attr("lawtext_declaration_index");
                let decl = self.$(`.lawtext-analyzed-declaration[lawtext_declaration_index="${decl_index}"]`);
                let decl_container = decl.closest(".article,.enact-statement").clone();
                for(let el of decl_container.find(".lawtext-analyzed-declaration[lawtext_declaration_index]")) {
                    let obj = $(el);
                    obj.removeAttr("lawtext_declaration_index");
                }
                for(let el of decl_container.find(".lawtext-analyzed-varref-window")) {
                    let obj = $(el);
                    obj.html();
                    obj.addClass("lawtext-analyzed-varref-empty");
                }
                win.html(decl_container);
                win.removeClass("lawtext-analyzed-varref-empty");
            }
            varref.addClass("lawtext-analyzed-varref-open");
            arr.show();
            win.slideDown(200);
        }
    }
}

Lawtext.Router = class extends Backbone.Router {
    get routes() { return {
        ":law_search_key": "law",
        "": "index",
    }; }

    constructor(options) {
        super(...arguments);

        this.data = options.data;

        this.listenTo(this.data, "file-loaded", () => {
            this.navigate("", {trigger: false});
        });
    }

    law(law_search_key) {
        this.data.set({law_search_key: law_search_key});
    }

    index() {
        this.data.set({law_search_key: null, law: null});
    }
}

$(function(){

    Lawtext.data = new Lawtext.Data();

    Lawtext.router = new Lawtext.Router({
        data: Lawtext.data,
    });

    Lawtext.main_view = new Lawtext.MainView({
        data: Lawtext.data,
        router: Lawtext.router,
    });
    $(".lawtext-main-view-place").replaceWith(Lawtext.main_view.el);
    Lawtext.main_view.render();

    Backbone.history.start({pushState: false});

    $(".search-law-textbox").focus();

});
