"use strict";

var nunjucks = window.nunjucks || require("nunjucks");
var templates = require("../dest/templates");
var JSZip = require("jszip");




function restructure_table(table) {
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
}

class Context {
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

var env = new nunjucks.Environment(new nunjucks.PrecompiledLoader(window.nunjucksPrecompiled));

function render(template_name, context) {
    let ctx = {
        restructure_table: restructure_table,
        print: console.log,
        context: new Context(),
    };
    ctx = Object.assign(ctx, context);
    let rendered = env.render(template_name, ctx);
    if(template_name === "lawtext.j2") {
        rendered = rendered.replace(/(\r?\n\r?\n)(?:\r?\n)+/g, "$1");
    }
    return rendered;
}
exports.render = render;

function render_docx_async(law) {
    return new JSZip()
    .file(
        "[Content_Types].xml",
        render("docx/[Content_Types].xml"),
    ).file(
        "_rels/.rels",
        render("docx/_rels/.rels"),
    ).file(
        "word/_rels/document.xml.rels",
        render("docx/word/_rels/document.xml.rels"),
    ).file(
        "word/document.xml",
        render("docx/word/document.xml", {law: law}),
    ).file(
        "word/styles.xml",
        render("docx/word/styles.xml"),
    ).generateAsync({
        type: JSZip.support.nodebuffer ? "nodebuffer" : "uint8array",
        compression: "DEFLATE",
        compressionOptions: {
            level: 9,
        },
    });
}
exports.render_docx_async = render_docx_async;

function render_lawtext(law, context) {
    return render("lawtext.j2", Object.assign({law: law}, context));
}
exports.render_lawtext = render_lawtext;

function render_xml(law, context) {
    return render("xml.xml", Object.assign({law: law}, context));
}
exports.render_xml = render_xml;

function render_html(law, context) {
    return render("html.html", Object.assign({law: law}, context));
}
exports.render_html = render_html;

function render_htmlfragment(law, context) {
    return render("htmlfragment.html", Object.assign({law: law}, context));
}
exports.render_htmlfragment = render_htmlfragment;

function render_elements_fragment(elements, context) {
    return render("htmlfragment.html", Object.assign({elements: elements}, context));
}
exports.render_elements_fragment = render_elements_fragment;
