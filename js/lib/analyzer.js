"use strict";

var _ = window._ || require('lodash');
var sha512 = require("hash.js/lib/hash/sha/512");
var parser = require("../dest/parser");
var EL = require("./util").EL;


var LAWNUM_TABLE = require("../dest/lawnum_table").LAWNUM_TABLE;

function get_law_name_length(law_num) {
    let digest = sha512().update(law_num).digest("hex");
    let key = parseInt(digest.slice(0, 7), 16);
    return LAWNUM_TABLE[key];
}
exports.get_law_name_length = get_law_name_length;

var toplevel_container_tags = [
    "EnactStatement", "MainProvision", "AppdxTable", "AppdxStyle",
];

var article_container_tags = [
    "Part", "Chapter", "Section", "Subsection", "Division",
];

var span_container_tags = [
    "Article", "Paragraph",
    "Item", "Subitem1", "Subitem2", "Subitem3",
    "Subitem4", "Subitem5", "Subitem6",
    "Subitem7", "Subitem8", "Subitem9",
    "Subitem10",
    "Table", "TableRow", "TableColumn",
];

var container_tags = []
    .concat(toplevel_container_tags)
    .concat(article_container_tags)
    .concat(span_container_tags);

var ignore_span_tag = [
    "LawNum", "LawTitle",
    "TOC",
    "ArticleTitle", "ParagraphNum", "ItemTitle",
    "Subitem1Title", "Subitem2Title", "Subitem3Title",
    "Subitem4Title", "Subitem5Title", "Subitem6Title",
    "Subitem7Title", "Subitem8Title", "Subitem9Title",
    "Subitem10Title",
    "SupplProvision",
];

class Env {
    constructor(law_type, container_stack, parents) {
        this.law_type = law_type;
        this.container_stack = container_stack || [];
        this.parents = parents || [];
    }

    copy() {
        return new Env(
            this.law_type,
            this.container_stack.slice(),
            this.parents.slice(),
        );
    }
}

class Span {
    constructor(index, el, env) {
        this.index = index;
        this.el = el;
        this.env = env;

        this.text = el.text;

        this.new_declarations = [];
        this.active_declarations = [];
    }
}

function extract_spans(law) {

    let spans = [];
    let containers = [];

    let extract = (el, _env) => {

        if(!el.tag) return;

        if(ignore_span_tag.indexOf(el.tag) >= 0) return;

        let env = _env.copy();

        let is_mixed = false;
        for(let subel of el.children) {
            if(typeof subel === "string") {
                is_mixed = true;
                break;
            }
        }

        if(is_mixed && el.children.length !== 1) {
            console.error(`unexpected mixed content! ${JSON.stringify(el)}`);
        }

        if(is_mixed) {
            el.attr.span_index = spans.length;
            spans.push(new Span(spans.length, el, env));
        } else {
            env.parents.push(el);
            let is_container = container_tags.indexOf(el.tag) >= 0;
            if(is_container) {
                env.container_stack.push(el);
            }

            let start_span_index = spans.length;
            for(let subel of el.children) {
                extract(subel, env, spans);
            }
            let end_span_index = spans.length; // half open

            if(is_container) {
                containers.push([
                    el,
                    [start_span_index, end_span_index],
                ]);
            }
        }
    };

    extract(law, new Env(law.attr.LawType));

    return [spans, containers];
}

class Pos {
    constructor(span, span_index, text_index, length, env) {
        this.span = span
        this.span_index = span_index
        this.text_index = text_index
        this.length = length
        this.env = env
    }
}

class ____Declaration extends EL {
    constructor(type, name, value, scope, name_pos) {
        super("____Declaration");

        this.type = type;
        this.name = name;
        this.value = value;
        this.scope = scope;
        this.name_pos = name_pos;

        this.attr.type = type;
        this.attr.name = name;
        this.attr.value = value;
        this.attr.scope = JSON.stringify(scope);
        this.attr.name_pos = JSON.stringify({
            span_index: name_pos.span_index,
            text_index: name_pos.text_index,
            length: name_pos.length,
        });

        this.append(name);
    }
}

class ____VarRef extends EL {
    constructor(ref_name, declaration, ref_pos) {
        super("____VarRef");

        this.ref_name = ref_name;
        this.declaration = declaration;
        this.ref_pos = ref_pos;

        this.attr.ref_declaration_index = declaration.attr.declaration_index;

        this.append(ref_name);
    }
}

function detect_declarations(law, spans) {

    let detect_lawname = (spans, span_index) => {
        if(spans.length <= span_index + 3) return;
        let [
            lawname_span,
            start_span,
            lawnum_span,
        ] = spans.slice(span_index, span_index + 3);

        if(!(
            start_span.el.tag === "__PStart" &&
            start_span.el.attr.type === "round"
        )) return;

        let match = lawnum_span.text.match(/^(?:明治|大正|昭和|平成)[元〇一二三四五六七八九十]+年\S+?第[〇一二三四五六七八九十百千]+号/);
        if(!match) return;

        let law_num = match[0];
        let lawname_length = get_law_name_length(law_num);
        let lawname_text_index = lawname_span.text.length - lawname_length;
        let law_name = lawname_span.text.slice(lawname_text_index);

        let lawnum_el = new EL("____LawNum", {}, [law_num]);

        if(
            lawnum_span.text.length <= law_num.length &&
            lawnum_span.index + 1 < spans.length
        ) {

            let after_span = spans[lawnum_span.index + 1];

            if(
                after_span.el.tag === "__PEnd" &&
                after_span.el.attr.type === "round"
            ) {
                let scope = [
                    [
                        {
                            span_index: after_span.index + 1,
                            text_index: 0,
                        },
                        {
                            span_index: spans.length,
                            text_index: 0,
                        }, // half open
                    ],
                ];

                let name_pos = new Pos (
                    lawname_span,       // span
                    lawname_span.index, // span_index
                    lawname_text_index, // text_index
                    lawname_length,     // length
                    lawname_span.env,   // env
                );

                let declaration = new ____Declaration(
                    "LawName", // type
                    law_name,  // name
                    law_num,   // value
                    scope,     // scope
                    name_pos,  // name_pos
                );

                lawname_span.new_declarations.push(declaration);
                lawname_span.el.replace_span(lawname_text_index, lawname_text_index + lawname_length, declaration);
                lawnum_span.el.replace_span(0, law_num.length, lawnum_el);

                return declaration;
            }

        } else if(
            law_num.length < lawnum_span.text.length &&
            lawnum_span.text[law_num.length] == "。" &&
            lawnum_span.index + 5 < spans.length
        ) {
            let [
                name_start_span,
                name_span,
                name_end_span,
                name_after_span,
            ] = spans.slice(lawnum_span.index + 1, lawnum_span.index + 5);

            let scope_match = lawnum_span.text.slice(law_num.length + 1).match(/^(以下)?(?:([^。]+?)において)?$/);
            let name_after_match = name_after_span.text.match(/^という。/);
            if(
                scope_match &&
                name_start_span.el.tag === "__PStart" &&
                name_start_span.el.attr.type === "square" &&
                name_end_span.el.tag === "__PEnd" &&
                name_end_span.el.attr.type === "square" &&
                name_after_match
            ) {
                let following = scope_match[1] !== undefined;
                let scope_text = scope_match[2] || null;

                let scope = [
                    [
                        {
                            span_index: name_after_span.index,
                            text_index: name_after_match[0].length,
                        },
                        {
                            span_index: spans.length,
                            text_index: 0,
                        }, // half open
                    ],
                ];

                let name_pos = new Pos (
                    name_span,       // span
                    name_span.index, // span_index
                    0,               // text_index
                    name_span.text.length, // length
                    name_span.env,   // env
                );

                let declaration = new ____Declaration(
                    "LawName", // type
                    name_span.text,  // name
                    law_num,   // value
                    scope,     // scope
                    name_pos,  // name_pos
                );

                name_span.new_declarations.push(declaration);
                lawname_span.el.replace_span(lawname_text_index, lawname_text_index + lawname_length, new EL("____DeclarationVal", {}, [law_name]));
                name_span.el.replace_span(0, name_span.text.length, declaration);
                lawnum_span.el.replace_span(0, law_num.length, lawnum_el);
                return declaration;
            }
        }

    };

    let detect_name = (spans, span_index) => {
        if(spans.length < span_index + 5) return;
        let [
            name_before_span,
            name_start_span,
            name_span,
            name_end_span,
            name_after_span,
        ] = spans.slice(span_index, span_index + 5);

        let scope_match = name_before_span.text.match(/(以下)?(?:([^。]+?)において)?$/);
        let name_after_match = name_after_span.text.match(/^という。/);
        if(
            scope_match &&
            name_start_span.el.tag === "__PStart" &&
            name_start_span.el.attr.type === "square" &&
            name_end_span.el.tag === "__PEnd" &&
            name_end_span.el.attr.type === "square" &&
            name_after_match
        ) {
            let following = scope_match[1] !== undefined;
            let scope_text = scope_match[2] || null;

            let scope = [
                [
                    {
                        span_index: name_after_span.index,
                        text_index: name_after_match[0].length,
                    },
                    {
                        span_index: spans.length,
                        text_index: 0,
                    }, // half open
                ],
            ];

            let name_pos = new Pos (
                name_span,       // span
                name_span.index, // span_index
                0,               // text_index
                name_span.text.length, // length
                name_span.env,   // env
            );

            let declaration = new ____Declaration(
                "LawName", // type
                name_span.text,  // name
                null,   // value
                scope,     // scope
                name_pos,  // name_pos
            );

            name_span.new_declarations.push(declaration);
            name_span.el.replace_span(0, name_span.text.length, declaration);
            return declaration;
        }
    };

    let declarations = [];

    for(let span_index = 0; span_index < spans.length; span_index++) {
        let declaration =
            detect_lawname(spans, span_index) ||
            detect_name(spans, span_index);
        if(declaration) {
            declaration.attr.declaration_index = declarations.length;
            declarations.push(declaration);
        }
    }

    return declarations;
}

function set_active_declarations(spans, declarations) {

    for(let span_index = 0; span_index < spans.length; span_index++) {
        let span = spans[span_index];
        let decls = span.active_declarations;

        for(let declaration of declarations) {
            for(let [start, end] of declaration.scope) {
                if(
                    start.span_index <= span_index &&
                    span_index < end.span_index // half open
                ) {
                    let text_scope = {
                        start: 0,
                        end: span.text.length, // half open
                    };
                    if(span_index === start.span_index) {
                        text_scope.start = start.text_index;
                    }
                    if(span_index === end.span_index - 1) {
                        text_scope.end = end.text_index;
                    }
                    decls.push([text_scope, declaration]);
                }
            }
        }

        decls = _(decls).sortBy(([, decl]) => -decl.name.length);

        span.active_declarations = decls;
    }
}

function detect_variable_references(law, spans) {

    let variable_references = [];

    let detect = span => {
        let parent = span.env.parents[span.env.parents.length - 1];
        if(parent.tag === "__PContent" && parent.attr.type === "square") return;
        let ret = [];
        for(let [text_scope, declaration] of span.active_declarations) {
            let next_index_offset = 0;
            for(let child of span.el.children) {
                let index_offset = next_index_offset;
                next_index_offset += (child instanceof EL ? child.text : child).length;
                if(child instanceof EL) continue;

                let index = null;
                let search_index = 0;
                while((index = child.indexOf(declaration.name, search_index)) >= 0) {
                    search_index = index + declaration.name.length;

                    if(text_scope.start <= index && index < text_scope.end) {
                        let ref_pos = new Pos (
                            span,       // span
                            span.index, // span_index
                            index + index_offset,      // text_index
                            declaration.name.length, // length
                            span.env,   // env
                        );

                        let varref = new ____VarRef(declaration.name, declaration, ref_pos);
                        span.el.replace_span(index + index_offset, search_index + index_offset, varref);
                        ret.push(varref);
                    }

                }
            }
        }
        return ret;
    };

    for(let span of spans) {
        let varrefs = detect(span);
        if(varrefs) {
            variable_references = variable_references.concat(varrefs);
        }
    }

    return variable_references;
}

function analyze(law) {
    let [spans, containers] = extract_spans(law);
    let declarations = detect_declarations(law, spans);
    set_active_declarations(spans, declarations);
    let variable_references = detect_variable_references(law, spans);

    // console.error(`${spans.length} spans detected.`);
    // console.error(`${containers.length} containers detected.`);
    // console.error(declarations);
    // for(let span_index = 0; span_index < spans.length; span_index++) {
    //     let span = spans[span_index];
    //     console.error(`${span_index} <${span.el.tag}> "${span.text.slice(0,30)}"${span.text.length > 30 ? " …" : ""}`);

    //     if(span.new_declarations.length) {
    //         console.error(`    ${span.new_declarations.map(declaration => {
    //             return `${declaration.type} ${declaration.name} = ${declaration.value}`;
    //         }).join(", ")}`);
    //     }

        // console.error(`    ${span.active_declarations.map([text_scope,declaration] => {
        //     let s = [];
        //     for(let [start, end] of declaration.scope) {
        //         s.push(`[${start.span_index},${end.span_index})`);
        //     }
        //     return s.join("+");
        // }).join(", ")}`);

    //     console.error();
    // }
    return {
        declarations: declarations,
    };
}
exports.analyze = analyze;

function stdxml_to_ext(el) {
    if(typeof el === 'string' || el instanceof String) {
        return el;
    }
    if(["Sentence", "EnactStatement"].indexOf(el.tag) >= 0) {
        if(el.text) {
            el.children = parser.parse(el.text, {startRule: "INLINE"});
        }
    } else {
        for(let child of el.children) {
            stdxml_to_ext(child);
        }
    }
};
exports.stdxml_to_ext = stdxml_to_ext;
