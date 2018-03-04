"use strict";

import * as nunjucks from "nunjucks"
import { nunjucksPrecompiled } from "./templates"
import * as JSZip from "jszip"
import { EL, JsonEL } from "./util"
import { isString } from "util";




function restructure_table(table: JsonEL): JsonEL {
    let new_table_children: Array<JsonEL | string> = [];
    let rowspan_state = {};
    let colspan_value = {};
    for (let row of table.children) {
        if (isString(row)) continue;
        if (row.tag !== "TableRow") {
            new_table_children.push(row);
            continue;
        }
        let new_row_children: Array<JsonEL | string> = [];
        let c = 0;
        let ci = 0;
        while (true) {

            let rss = rowspan_state[c] || 0;
            if (rss) {
                let colspan = colspan_value[c] || 0;
                new_row_children.push({
                    tag: "TableColumnMerged",
                    attr: colspan ? {
                        colspan: colspan,
                    } : {},
                    children: [],
                });
                rowspan_state[c] = rss - 1;
                if (colspan) {
                    c += colspan - 1;
                }
                c += 1
                continue;
            }

            if (ci >= row.children.length) {
                break;
            }

            let column = <JsonEL>row.children[ci];
            new_row_children.push(column);
            if (column.tag !== "TableColumn") {
                ci += 1;
                continue;
            }

            let colspan = Number(column.attr.colspan || 0);
            if (column.attr.rowspan !== undefined) {
                let rowspan = Number(column.attr.rowspan);
                rowspan_state[c] = rowspan - 1;
                colspan_value[c] = colspan;
                if (colspan) {
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
    data: { [key: string]: any }
    constructor() {
        this.data = {};
    }
    get(key: string): any {
        return this.data[key];
    }
    set(key: string, value) {
        this.data[key] = value;
        return "";
    }
};

// @ts-ignore
var env = new nunjucks.Environment(new nunjucks.PrecompiledLoader(nunjucksPrecompiled));

export function render(template_name: string, context?: { [key: string]: any }): string {
    let ctx = {
        restructure_table: restructure_table,
        print: console.log,
        context: new Context(),
    };
    ctx = Object.assign(ctx, context);
    let rendered = env.render(template_name, ctx);
    if (template_name === "lawtext.j2") {
        rendered = rendered.replace(/(\r?\n\r?\n)(?:\r?\n)+/g, "$1");
    }
    return rendered;
}

export function render_docx_async(law: JsonEL): Promise<Uint8Array | Buffer> {
    return <Promise<Buffer | Uint8Array>>new JSZip().file(
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
        render("docx/word/document.xml", { law: law }),
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

// export function render_lawtext(law: JsonEL, context?: { [key: string]: any }): string {
//     return render("lawtext.j2", Object.assign({ law: law }, context));
// }

export function render_xml(law: JsonEL, context?: { [key: string]: any }): string {
    return render("xml.xml", Object.assign({ law: law }, context));
}

export function render_html(law: JsonEL, context?: { [key: string]: any }): string {
    return render("html.html", Object.assign({ law: law }, context));
}

export function render_htmlfragment(law: JsonEL, context?: { [key: string]: any }): string {
    return render("htmlfragment.html", Object.assign({ law: law }, context));
}

export function render_elements_fragment(elements, context?: { [key: string]: any }): string {
    return render("htmlfragment.html", Object.assign({ elements: elements }, context));
}
