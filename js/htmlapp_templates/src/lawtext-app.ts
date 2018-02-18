'use strict';

import * as lawtext from "../../src/lawtext";
import * as $ from "jquery";
import * as Backbone from "backbone";
import * as _ from "underscore";
import { EL, JsonEL } from "../../src/util";
import * as util from "../../src/util";
import * as analyzer from "../../src/analyzer";
import * as renderer from "../../src/renderer";
import { saveAs } from "file-saver";
import { isString } from "util";
import * as JSZip from "jszip";
import * as bootstrap from "bootstrap";

function em(input) {
    var emSize = parseFloat($("body").css("font-size"));
    return (emSize * input);
}

class LawNameItem {
    law_name: string
    law_no: string
    promulgation_date: string
    constructor(law_name: string, law_no: string, promulgation_date: string) {
        this.law_name = law_name;
        this.law_no = law_no;
        this.promulgation_date = promulgation_date;
    }
}

function annotate(el: JsonEL | string, m_text_default: (el: JsonEL) => string): string {
    if (!m_text_default) {
        throw true;
    }
    if (isString(el)) {
        return _(el).escape();
    }

    if (el.tag[0] === "_") {
        let child_str = el.children.map(child => annotate(child, m_text_default)).join("");

        if (el.tag === "____Declaration") {
            return `<span class="lawtext-analyzed lawtext-analyzed-declaration" lawtext_declaration_index="${el.attr.declaration_index}">${child_str}</span>`

        } else if (el.tag === "____VarRef") {
            return `<span class="lawtext-analyzed lawtext-analyzed-varref" lawtext_declaration_index="${el.attr.ref_declaration_index}">${child_str}</span>`

        } else if (el.tag === "____LawNum") {
            return `<a class="lawtext-analyzed lawtext-analyzed-lawnum" href="#${child_str}" target="_blank">${child_str}</a>`

        } else if (el.tag === "__Parentheses") {
            return `<span class="lawtext-analyzed lawtext-analyzed-parentheses" lawtext_parentheses_type="${el.attr.type}" data-lawtext-parentheses-depth="${el.attr.depth}">${child_str}</span>`

        } else if (el.tag === "__PStart") {
            return `<span class="lawtext-analyzed lawtext-analyzed-start-parenthesis" lawtext_parentheses_type="${el.attr.type}">${child_str}</span>`

        } else if (el.tag === "__PContent") {
            return `<span class="lawtext-analyzed lawtext-analyzed-parentheses-content" lawtext_parentheses_type="${el.attr.type}">${child_str}</span>`

        } else if (el.tag === "__PEnd") {
            return `<span class="lawtext-analyzed lawtext-analyzed-end-parenthesis" lawtext_parentheses_type="${el.attr.type}">${child_str}</span>`

        } else if (el.tag === "__MismatchStartParenthesis") {
            return `<span class="lawtext-analyzed lawtext-analyzed-mismatch-start-parenthesis">${child_str}</span>`

        } else if (el.tag === "__MismatchEndParenthesis") {
            return `<span class="lawtext-analyzed lawtext-analyzed-mismatch-end-parenthesis">${child_str}</span>`

        } else {
            return child_str;
        }
    } else {
        return m_text_default(el);
    }
}

function get_law_range(orig_law: EL, range) {
    let s_pos = range.start;
    let e_pos = range.end;

    let law = new EL(
        orig_law.tag,
        orig_law.attr,
    );

    let orig_law_num = <EL>orig_law.children.find((el) => !isString(el) && el.tag === "LawNum");
    if (orig_law_num) {
        law.append(orig_law_num);
    }

    let orig_law_body = <EL>orig_law.children.find((el) => !isString(el) && el.tag === "LawBody");
    let law_body = new EL(
        orig_law_body.tag,
        orig_law_body.attr,
    );
    law.append(law_body);

    let orig_law_title = orig_law_body.children.find((el) => !isString(el) && el.tag === "LawTitle");
    if (orig_law_title) {
        law_body.append(orig_law_title);
    }


    let in_container_range = false;
    let in_item_range = false;

    let find_els = (el, tag) => {
        if (!(el instanceof EL)) return [];
        if (el.tag === tag) return [el];
        let ret: EL[] = [];
        for (let child of el.children) {
            ret = ret.concat(find_els(child, tag));
        }
        return ret;
    }

    for (let toplevel of orig_law_body.children) {
        if (isString(toplevel)) continue;
        if (
            !in_container_range &&
            toplevel.tag === s_pos.container_tag &&
            (
                toplevel.tag !== "SupplProvision" ||
                (toplevel.attr.AmendLawNum || null) === s_pos.container_id
            )
        ) {
            in_container_range = true;
        }

        let container_children: (EL | string)[] = [];

        if (
            in_container_range &&
            e_pos.item_tag === "SupplProvisionLabel" &&
            toplevel.tag === e_pos.container_tag &&
            (
                toplevel.tag !== "SupplProvision" ||
                (toplevel.attr.AmendLawNum || null) === e_pos.container_id
            )
        ) {
            in_container_range = false;
        }

        if (in_container_range) {

            let items = find_els(toplevel, "Article");
            if (items.length === 0) items = find_els(toplevel, "Paragraph");

            for (let item of items) {

                if (
                    !in_item_range &&
                    (
                        s_pos.item_tag === "SupplProvisionLabel" ||
                        (
                            item.tag === s_pos.item_tag &&
                            (
                                !s_pos.item_id ||
                                item.attr.Num === s_pos.item_id
                            )
                        )
                    )
                ) {
                    in_item_range = true;
                }

                if (in_item_range) {
                    container_children.push(item);
                }

                if (
                    in_item_range &&
                    item.tag === e_pos.item_tag &&
                    (
                        !e_pos.item_id ||
                        item.attr.Num === e_pos.item_id
                    )
                ) {
                    in_item_range = false;
                }
            }
        }

        if (container_children.length > 0) {
            let suppl_provision_label = toplevel.children.find((el) => !isString(el) && el.tag === "SupplProvisionLabel");
            if (suppl_provision_label) container_children.unshift(suppl_provision_label);
            law_body.append(new EL(
                toplevel.tag,
                toplevel.attr,
                container_children,
            ));
        }

        if (
            in_container_range &&
            toplevel.tag === e_pos.container_tag &&
            (
                toplevel.tag !== "SupplProvision" ||
                (toplevel.attr.AmendLawNum || null) === e_pos.container_id
            )
        ) {
            in_container_range = false;
        }
    }

    return law;
}















class Data extends Backbone.Model {

    open_file_input: JQuery

    defaults() {
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
            .css({ display: "none" });
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
        this.set({ opening_file: true });

        let file = evt.target.files[0];
        if (file === null) return;
        let reader = new FileReader();
        reader.onload = (e => {
            $(evt.target).val("");
            let div = $("<div>");
            let text = e.target["result"];
            this.load_law_text(text, true);
            this.set({ law_search_key: null });
            this.trigger("file-loaded");
        });
        reader.readAsText(file);
    }

    invoke_error(title, body_el) {
        this.trigger("error", title, body_el);
    }

    load_law_text(text, analyze_xml) {
        let div = $("<div>");
        let law: EL | null = null;
        if (/^(?:<\?xml|<Law)/.test(text.trim())) {
            law = util.xml_to_json(text);
            if (analyze_xml) {
                analyzer.stdxml_to_ext(law);
            }
        } else {
            try {
                law = lawtext.parse(text, { startRule: "start" });
            } catch (err) {
                let err_str = err.toString();
                let pre = $("<pre>")
                    .css({ "white-space": "pre-wrap" })
                    .css({ "line-height": "1.2em" })
                    .css({ "padding": "1em 0" })
                    .html(err_str);
                this.invoke_error("読み込んだLawtextにエラーがあります", pre[0]);
                law = null;
            }
        }
        if (law) {
            this.set({ opening_file: false, law: law });
        } else {
            this.set({ opening_file: false });
        }
    }

    search_law(law_search_key) {
        this.set({ opening_file: true });
        setTimeout(() => {
            this.search_law_inner(law_search_key);
        }, 30);
    }

    search_law_inner(law_search_key) {
        let load_law_num = lawnum => {

            let law_data_str = localStorage ? localStorage.getItem(`law_for:${lawnum}`) : null;
            if (law_data_str) {
                let law_data = JSON.parse(law_data_str);
                let datetime = new Date(law_data.datetime);
                let now = new Date();
                let ms = now.getTime() - datetime.getTime();
                let days = ms / (1000 * 60 * 60 * 24);
                if (days < 1) {
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
                    if (response.ok && !/^(?:<\?xml|<Law)/.test(text.trim())) {
                        JSZip.loadAsync(text, { base64: true })
                            .then(zip => zip.file("body.xml").async("text"))
                            .then(xml => resolve([response, xml]));
                    } else {
                        resolve([response, text]);
                    }
                }))
                .then(([response, text]) => {
                    if (response.ok) {
                        this.load_law_text(text, true);
                        if (localStorage) {
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
                        this.set({ opening_file: false });
                        this.invoke_error(
                            "法令の読み込み中にエラーが発生しました",
                            text,
                        );
                    }
                });
        };

        let law_num_data_str = localStorage ? localStorage.getItem(`law_num_for:${law_search_key}`) : null;
        if (law_num_data_str) {
            let law_num_data = JSON.parse(law_num_data_str);
            let datetime = new Date(law_num_data.datetime);
            let now = new Date();
            let ms = now.getTime() - datetime.getTime();
            let days = ms / (1000 * 60 * 60 * 24);
            if (days < 1) {
                load_law_num(law_num_data.lawnum);
                return;
            }
        }

        let re_lawnum = /^(?:明治|大正|昭和|平成)[元〇一二三四五六七八九十]+年(?:\S+?第[〇一二三四五六七八九十百千]+号|人事院規則[〇一二三四五六七八九―]+|[一二三四五六七八九十]+月[一二三四五六七八九十]+日内閣総理大臣決定)$/;
        let match = re_lawnum.exec(law_search_key);
        if (match) {
            let lawnum = match[0];
            load_law_num(lawnum);
            if (localStorage) {
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
                    if (data.length) {
                        let lawnum = _(data).sortBy(d => d[0].length)[0][1];
                        load_law_num(lawnum);
                        if (localStorage) {
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
                    this.set({ opening_file: false });
                });
        }
    }

    get_law_name(): string | null {
        let law = this.get("law");
        if (law === null) return null;

        let law_num = _(law.children).findWhere({ tag: "LawNum" });
        let law_body = _(law.children).findWhere({ tag: "LawBody" });
        let law_title = law_body && _(law_body.children).findWhere({ tag: "LawTitle" });

        let s_law_num = law_num ? law_num.text : "";
        let s_law_title = law_title ? law_title.text : "";
        s_law_num = (s_law_num && s_law_title) ? (`（${s_law_num}）`) : s_law_num;

        return s_law_title + s_law_num;
    }

    download_docx(range?) {
        let law = this.get("law");
        if (law === null) return;

        if (range) {
            law = get_law_range(law, range);
        }

        renderer.render_docx_async(law)
            .then(buffer => {
                let blob = new Blob(
                    [buffer],
                    { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
                );
                let law_name = this.get_law_name() || "lawtext_output";
                saveAs(blob, `${law_name}.docx`);
            });
    }

    download_lawtext() {
        let law = this.get("law");
        if (law === null) return;

        let s_lawtext = renderer.render_lawtext(law);
        let blob = new Blob(
            [s_lawtext],
            { type: "text/plain" },
        );
        let law_name = this.get_law_name() || "lawtext_output";
        saveAs(blob, `${law_name}.law.txt`);
    }

    download_xml() {
        let law = this.get("law");
        if (law === null) return;

        let s_lawtext = renderer.render_xml(law);
        let blob = new Blob(
            [s_lawtext],
            { type: "application/xml" },
        );
        let law_name = this.get_law_name() || "lawtext_output";
        saveAs(blob, `${law_name}.xml`);
    }

    get_declaration(index: number): analyzer.____Declaration | null {
        let analysis = this.get("analysis");
        if (analysis === null) return null;

        let declarations = analysis.declarations;
        return declarations.get(index);
    }
}


import sidebar_view_template from "../templates/sidebar_view"
var SidebarView_template = _.template(sidebar_view_template);
class SidebarView extends Backbone.View<Backbone.Model> {

    data: Data

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

    render() {
        this.$el.html(SidebarView_template({
            data: this.data.attributes,
        }));
        return this;
    }
}



var VarRefView_template = _.template(`
<span class="lawtext-varref-text"><%= text %></span><span class="lawtext-varref-float-block" style="display: none; height: 0;">
<div class="lawtext-varref-float-block-inner">
<div class="lawtext-varref-arrow"></div>
<div class="lawtext-varref-window">
</div>
</div>
</span>
`.trim());
class VarRefView extends Backbone.View<Backbone.Model> {

    data: Data
    declaration_index: number
    text: string
    text_obj: JQuery<HTMLElement> | null
    block_obj: JQuery<HTMLElement> | null
    inner_obj: JQuery<HTMLElement> | null
    arrow_obj: JQuery<HTMLElement> | null
    window_obj: JQuery<HTMLElement> | null
    rendered: boolean

    get tagName() { return "span"; }
    get className() { return "lawtext-varref-view"; }
    events() {
        return {
            "click .lawtext-varref-text": "text_click",
        };
    }

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

    get_content(): JQuery<HTMLElement> | null {
        let declaration = this.data.get_declaration(this.declaration_index);
        if (!declaration) return null;
        let container_stack = declaration.name_pos.env.container.linealAscendant();
        let names: string[] = [];
        for (let container of container_stack) {
            if (container.el.tag === "EnactStatement") {
                names.push("（制定文）");

            } else if (container.el.tag === "Article") {
                let article_title = _(<EL[]>container.el.children)
                    .findWhere({ tag: "ArticleTitle" });
                if (article_title) {
                    names.push(article_title.text);
                }

            } else if (container.el.tag === "Paragraph") {
                let paragraph_num = _(<EL[]>container.el.children)
                    .findWhere({ tag: "ParagraphNum" });
                if (paragraph_num) {
                    names.push(paragraph_num.text || "１");
                }

            } else if ([
                "Item", "Subitem1", "Subitem2", "Subitem3",
                "Subitem4", "Subitem5", "Subitem6",
                "Subitem7", "Subitem8", "Subitem9",
                "Subitem10",
            ].indexOf(container.el.tag) >= 0) {
                let item_title = _(<EL[]>container.el.children)
                    .findWhere({ tag: `${container.el.tag}Title` });
                if (item_title) {
                    names.push(item_title.text);
                }

            } else if (container.el.tag === "Table") {
                let table_struct_title_el = _(container.el.children)
                    .findWhere({ tag: "TableStructTitle" });
                let table_struct_title = table_struct_title_el instanceof EL
                    ? table_struct_title_el.text
                    : "表"
                names.push(table_struct_title + "（抜粋）");

            }
        }

        let closest_children = container_stack[container_stack.length - 1].el.children
            .filter(el => {
                if (!(el instanceof EL)) return false;
                return [
                    "ArticleTitle", "ParagraphNum", "ItemTitle",
                    "Subitem1Title", "Subitem2Title", "Subitem3Title",
                    "Subitem4Title", "Subitem5Title", "Subitem6Title",
                    "Subitem7Title", "Subitem8Title", "Subitem9Title",
                    "Subitem10Title",
                    "SupplProvision",
                ].indexOf(el.tag) < 0;
            });
        let fragment = renderer.render_elements_fragment(
            closest_children,
            {
                "annotate": annotate,
            },
        ).trim();
        let ret = $(`
<div class="paragraph-item-body"><span class="paragraph-item-num">${names.join("／")}</span>　${fragment}</div>
`);
        ret.find(`.lawtext-analyzed-declaration[lawtext_declaration_index="${this.declaration_index}"]`).css({ "font-weight": "bold" });
        return ret;
    }

    render() {
        this.$el.html(VarRefView_template({
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
            if (!this.is_open && this.block_obj) this.block_obj.hide();
        }, false);

        this.trigger("rendered");

        return this;
    }

    update_window() {
        if (!this.window_obj) return;
        this.window_obj.empty();
        let content = this.get_content();
        if (content) this.window_obj.append(content);
    }

    update_size() {
        if (!this.is_open) return;
        if (!this.text_obj) return;
        if (!this.window_obj) return;
        if (!this.arrow_obj) return;
        if (!this.block_obj) return;
        if (!this.inner_obj) return;

        let text_offset = this.text_obj.offset();
        let window_offset = this.window_obj.offset();

        let text_left = text_offset ? text_offset.left : 0;
        let window_left = window_offset ? window_offset.left : 0;
        let rel_left = text_left - window_left;
        let left = Math.max(rel_left, em(0.2));
        this.arrow_obj.css({ "margin-left": `${left}px` });

        let inner_height = this.inner_obj.outerHeight();
        if (inner_height) this.block_obj.height(inner_height);
    }

    get is_open() {
        return this.$el.hasClass("lawtext-varref-open");
    }

    set is_open(value) {
        this.$el.toggleClass("lawtext-varref-open", value);
    }

    text_click() {
        if (!this.block_obj) return;
        if (this.is_open) {
            this.block_obj.height(0);
            this.is_open = false;
        } else {
            this.update_window();
            this.block_obj.show();
            this.is_open = true;
            this.update_size();
        }
    }
}



import htmlpreview_view_template from "../templates/htmlpreview_view"
var HTMLpreviewView_template = _.template(htmlpreview_view_template);
class HTMLpreviewView extends Backbone.View<Backbone.Model> {

    data: Data
    law_html: string | null
    analyzed: boolean
    varref_views: Array<VarRefView>

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
        if (law !== null && this.law_html === null) {
            let analysis = lawtext.analyze(law);
            this.law_html = renderer.render_htmlfragment(law, {
                "annotate": annotate,
            });
            this.analyzed = true;
            this.data.set({ analysis: analysis });
        }

        this.$el.html(HTMLpreviewView_template({
            data: this.data.attributes,
            law_html: this.law_html,
        }));

        this.varref_views = [];
        for (let el of this.$(".lawtext-analyzed-varref")) {
            let obj = $(el);
            let varref_view = new VarRefView({
                data: this.data,
                declaration_index: parseInt(obj.attr("lawtext_declaration_index") || "", 10),
                text: obj.text(),
            });
            obj.replaceWith(varref_view.el);
            varref_view.render();
            this.varref_views.push(varref_view);
        }
        return this;
    }

    scroll_to_law_anchor(tag, name) {
        for (let el of this.$(".law-anchor")) {
            let obj = $(el);
            if (obj.data("tag") === tag && obj.data("name") === name) {
                let offset = obj.offset();
                if (offset) $("html,body").animate({ scrollTop: offset.top }, "normal");
            }
        }
    }
}



import sample_lawtext_template from "../templates/sample_lawtext"

import main_view_template from "../templates/main_view"
var MainView_template = _.template(main_view_template);
class MainView extends Backbone.View<Backbone.Model> {

    data: Data
    router: Router
    sidebar_view: SidebarView
    htmlpreview_view: HTMLpreviewView

    get tagName() { return "div"; }
    get className() { return "lawtext-main-view"; }
    events() {
        return {
            "click .lawtext-open-file-button": "open_file_button_click",
            "click .lawtext-download-sample-lawtext-button": "download_sample_lawtext_button_click",
            "click .search-law-button": "search_law_button_click",
            "click .lawtext-download-docx-button": "download_docx_button_click",
            "click .lawtext-download-docx-selected-button": "download_docx_selected_button_click",
            "click .lawtext-download-lawtext-button": "download_lawtext_button_click",
            "click .lawtext-download-xml-button": "download_xml_button_click",
            "click .law-link": "law_link_click",
            "click .lawtext-analyzed-varref-text": "varref_text_click",
        };
    }

    constructor(options) {
        super(...arguments);

        this.data = options.data;
        this.router = options.router;

        this.sidebar_view = new SidebarView({
            data: this.data,
        });
        this.htmlpreview_view = new HTMLpreviewView({
            data: this.data,
        });

        this.listenTo(this.data, "change:law_search_key", this.law_search_key_change);
        this.listenTo(this.data, "change:law", this.law_change);
        this.listenTo(this.data, "error", this.onerror);
    }

    render() {
        this.sidebar_view.$el.detach();
        this.htmlpreview_view.$el.detach();

        this.$el.html(MainView_template({
        }));

        this.$(".lawtext-sidebar-view-place").replaceWith(this.sidebar_view.el);
        this.sidebar_view.render();
        this.$(".lawtext-htmlpreview-view-place").replaceWith(this.htmlpreview_view.el);
        this.htmlpreview_view.render();

        return this;
    }

    search_law_button_click(e) {
        let obj = $(e.currentTarget);

        let textbox = obj.parent().parent().find(".search-law-textbox");
        let text = String(textbox.val()).trim();

        this.router.navigate(text, { trigger: true });

        return false;
    }

    open_file_button_click(e) {
        this.data.open_file();
    }

    download_sample_lawtext_button_click(e) {
        let blob = new Blob(
            [sample_lawtext_template],
            { type: "text/plain" },
        );
        saveAs(blob, "sample_lawtext.law.txt");
    }

    tobe_downloaded_range() {
        let get_pos = (node) => {
            let el = $(node.parentNode);
            let parents = el.parents("[selection-id]");
            let item_el = parents[parents.length - 1];
            if (!item_el && el.attr("selection-id")) item_el = el[0];
            if (!item_el) return null;

            let m: RegExpMatchArray | null;
            let id = item_el.getAttribute("selection-id");
            if (id && (m = id.match(/([^-]+)(?:-([^-]+))?---([^-]+)(?:-([^-]+))?/))) {
                return {
                    container_tag: m[1],
                    container_id: m[2] || null,
                    item_tag: m[3],
                    item_id: m[4] || null,
                }
            } else {
                return null;
            }
        };

        let selection = window.getSelection();
        let range = selection.getRangeAt(0);

        let s_pos = get_pos(range.startContainer);
        let e_pos = get_pos(range.endContainer);
        if (!s_pos || !e_pos) return null;

        return {
            start: s_pos,
            end: e_pos,
        };
    }

    download_docx_selected_button_click(e) {
        let range = this.tobe_downloaded_range();
        if (range) {
            this.data.download_docx(range);
        } else {
            alert("選択範囲が取得できませんでした。");
        }
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
        if (law_search_key) {
            this.data.search_law(law_search_key);
        }
    }

    law_change() {
        let law = this.data.get("law");
        let law_search_key = this.data.get("law_search_key");

        if (law && law_search_key) {
            let law_body = _(law.children).findWhere({ tag: "LawBody" });
            let law_title = _(law_body.children).findWhere({ tag: "LawTitle" });
            document.title = `${law_title.text} | Lawtext`;
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

        for (let el of parent_div.find(".lawtext-analyzed-varref.lawtext-analyzed-varref-open")) {
            let varref = $(el);
            let _parent_div = varref.closest("div");
            if (!parent_div[0].isEqualNode(_parent_div[0])) return;
            let arr = $(varref.find(".lawtext-analyzed-varref-arrow")[0]);
            let win = $(varref.find(".lawtext-analyzed-varref-window")[0]);
            varref.removeClass("lawtext-analyzed-varref-open");
            arr.hide();
            win.slideUp(200);
        }

        if (!is_open) {
            let arr = $(varref.find(".lawtext-analyzed-varref-arrow")[0]);
            let win = $(varref.find(".lawtext-analyzed-varref-window")[0]);
            let is_empty = win.hasClass("lawtext-analyzed-varref-empty");
            if (is_empty) {
                let decl_index = varref.attr("lawtext_declaration_index");
                let decl = this.$(`.lawtext-analyzed-declaration[lawtext_declaration_index="${decl_index}"]`);
                let decl_container = decl.closest(".article,.enact-statement").clone();
                for (let el of decl_container.find(".lawtext-analyzed-declaration[lawtext_declaration_index]")) {
                    let obj = $(el);
                    obj.removeAttr("lawtext_declaration_index");
                }
                for (let el of decl_container.find(".lawtext-analyzed-varref-window")) {
                    let obj = $(el);
                    obj.html();
                    obj.addClass("lawtext-analyzed-varref-empty");
                }
                win.empty();
                win.append(decl_container);
                win.removeClass("lawtext-analyzed-varref-empty");
            }
            varref.addClass("lawtext-analyzed-varref-open");
            arr.show();
            win.slideDown(200);
        }
    }
}

class Router extends Backbone.Router {

    data: Data

    get routes() {
        return {
            ":law_search_key": "law",
            "": "index",
        };
    }

    constructor(options) {
        super(...arguments);

        this.data = options.data;

        this.listenTo(this.data, "file-loaded", () => {
            this.navigate("", { trigger: false });
        });
    }

    law(law_search_key: string) {
        this.data.set({ law_search_key: law_search_key });
    }

    index() {
        this.data.set({ law_search_key: null, law: null });
    }
}

class App {
    data: Data
    router: Router
    main_view: MainView

    constructor() {
        this.data = new Data();

        this.router = new Router({
            data: this.data,
        });

        this.main_view = new MainView({
            data: this.data,
            router: this.router,
        });
    }

    start() {
        $(".lawtext-main-view-place").replaceWith(this.main_view.el);
        this.main_view.render();

        Backbone.history.start({ pushState: false });

        $(".search-law-textbox").focus();
    }
}

var app = new App();
$(() => app.start());

exports.app = app;

