"use strict";

const sha512 = require("hash.js/lib/hash/sha/512");
import * as parser from "./parser";
import { EL, Container, ContainerType, RelPos, Env, Span, throwError } from "./util";
import * as util from "./util";
import { LAWNUM_TABLE } from "./lawnum_table";
import { isString } from "util";

export function get_law_name_length(law_num: string) {
    let digest = sha512().update(law_num).digest("hex");
    let key = parseInt(digest.slice(0, 7), 16);
    return LAWNUM_TABLE[key];
}

var root_container_tags = [
    "Law",
];

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
    "Sentence",
];

var container_tags = [
    ...root_container_tags,
    ...toplevel_container_tags,
    ...article_container_tags,
    ...span_container_tags,
];

function get_container_type(tag: string): ContainerType {
    if (root_container_tags.indexOf(tag) >= 0) return ContainerType.ROOT;
    else if (toplevel_container_tags.indexOf(tag) >= 0) return ContainerType.TOPLEVEL;
    else if (article_container_tags.indexOf(tag) >= 0) return ContainerType.ARTICLES;
    else if (span_container_tags.indexOf(tag) >= 0) return ContainerType.SPANS;
    else return ContainerType.SPANS;
}

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

function extract_spans(law: EL): [Span[], Container[], Container] {

    let spans: Span[] = [];
    let containers: Container[] = [];

    let root_container: Container | null = null;

    let extract = (el: EL, _env: Env) => {

        if (!el.tag) return;

        if (ignore_span_tag.indexOf(el.tag) >= 0) return;

        let env = _env.copy();

        let is_mixed = false;
        for (let subel of el.children) {
            if (typeof subel === "string") {
                is_mixed = true;
                break;
            }
        }

        if (is_mixed && el.children.length !== 1) {
            console.error(`unexpected mixed content! ${JSON.stringify(el)}`);
        }

        if (is_mixed) {
            el.attr.span_index = String(spans.length);
            spans.push(new Span(spans.length, el, env));
            return;

        } else {
            env.parents.push(el);

            let is_container = container_tags.indexOf(el.tag) >= 0;

            let container: Container | null = null;
            if (is_container) {
                let type = get_container_type(el.tag);
                container = new Container(el, type);
                env.add_container(container);
                containers.push(container);
                if (type === ContainerType.ROOT) root_container = container;
            }

            let start_span_index = spans.length;
            for (let subel of el.children) {
                if (isString(subel)) continue;
                extract(subel, env);
            }
            let end_span_index = spans.length; // half open

            if (container) container.span_range = [start_span_index, end_span_index];
        }
    };

    extract(law, new Env(law.attr.LawType || ""));

    if (!root_container) throw new Error();

    return [spans, containers, root_container];
}

class Pos {
    span: Span
    span_index: number
    text_index: number
    length: number
    env: Env
    constructor(span: Span, span_index: number, text_index: number, length: number, env: Env) {
        this.span = span
        this.span_index = span_index
        this.text_index = text_index
        this.length = length
        this.env = env
    }
}

export class ____Declaration extends EL {
    type: string
    name: string
    scope: ScopeRange[]
    value: string | null
    name_pos: Pos
    constructor(type: string, name: string, value: string | null, scope: ScopeRange[], name_pos: Pos) {
        super("____Declaration");

        this.type = type;
        this.name = name;
        this.value = value;
        this.scope = scope;
        this.name_pos = name_pos;

        this.attr.type = type;
        this.attr.name = name;
        if (value !== null) this.attr.value = value;
        this.attr.scope = JSON.stringify(scope);
        this.attr.name_pos = JSON.stringify({
            span_index: name_pos.span_index,
            text_index: name_pos.text_index,
            length: name_pos.length,
        });

        this.append(name);
    }
}

class ScopeRange {
    start_span_index: number
    start_text_index: number
    end_span_index: number
    end_text_index: number
    constructor(
        start_span_index: number,
        start_text_index: number,
        end_span_index: number, // half open
        end_text_index: number, // half open
    ) {
        this.start_span_index = start_span_index;
        this.start_text_index = start_text_index;
        this.end_span_index = end_span_index;
        this.end_text_index = end_text_index;
    }
}

class ____VarRef extends EL {
    ref_name: string
    declaration: ____Declaration
    ref_pos: Pos
    constructor(ref_name: string, declaration: ____Declaration, ref_pos: Pos) {
        super("____VarRef");

        this.ref_name = ref_name;
        this.declaration = declaration;
        this.ref_pos = ref_pos;

        this.attr.ref_declaration_index = declaration.attr.declaration_index;

        this.append(ref_name);
    }
}

export class Declarations {
    declarations: ____Declaration[]
    constructor() {
        this.declarations = [];
    }

    *iterate(span_index: number): IterableIterator<____Declaration> {
        for (let declaration of this.declarations) {
            if (
                declaration.scope.some(range =>
                    range.start_span_index <= span_index &&
                    span_index < range.end_span_index
                )
            ) {
                yield declaration;
            }
        }
    }

    add(declaration: ____Declaration) {
        this.declarations.push(declaration);
    }

    get length(): number {
        return this.declarations.length;
    }

    get(index: number): ____Declaration {
        return this.declarations[index];
    }
}

function parse_ranges(text: string): util.Ranges { // closed
    if (text === "") return [];
    try {
        return parser.parse(text, { startRule: "ranges" });
    } catch (e) {
        console.error(text, e);
        return [];
    }
}

function locate_ranges(orig_ranges: util.Ranges, current_span: Span) {
    let ranges: util.Ranges = [];

    let locate_pointer = (
        orig_pointer: util.Pointer,
        prev_pointer: util.Pointer | null,
    ): util.Pointer => {

        let located_pointer: util.Pointer;

        {
            let head = orig_pointer[0];
            let head_type = get_container_type(head.tag);
            let current_container = current_span.env.container;

            let found_index = -1;

            if (ignore_span_tag.indexOf(head.tag) >= 0) {
                located_pointer = orig_pointer;

            } else if (head.rel_pos === RelPos.SAME) {
                console.error("RelPos.SAME is detected. Skipping:", current_span, orig_pointer);
                let copy = head.copy();
                copy.located_container = current_container
                    .thisOrClosest(c => c.type === ContainerType.TOPLEVEL);
                located_pointer = [copy];

            } else if (
                head.rel_pos === RelPos.HERE ||
                head.rel_pos === RelPos.PREV ||
                head.rel_pos === RelPos.NEXT
            ) {
                let scope_container = current_container
                    .thisOrClosest(c => c.el.tag === head.tag);

                if (scope_container) {
                    head.located_container =
                        (head.rel_pos === RelPos.HERE)
                            ? scope_container
                            : (head_type === ContainerType.ARTICLES)
                                ? (head.rel_pos === RelPos.PREV)
                                    ? scope_container.prev(c => c.el.tag === head.tag)
                                    : (head.rel_pos === RelPos.NEXT)
                                        ? scope_container.next(c => c.el.tag === head.tag)
                                        : throwError()
                                : (head.rel_pos === RelPos.PREV)
                                    ? scope_container.prevSub(c => c.el.tag === head.tag)
                                    : (head.rel_pos === RelPos.NEXT)
                                        ? scope_container.nextSub(c => c.el.tag === head.tag)
                                        : throwError();
                }

                located_pointer = orig_pointer;

            } else if (
                prev_pointer &&
                1 <= (found_index = prev_pointer.findIndex(fragment => fragment.tag === head.tag))
            ) {
                located_pointer = [
                    ...prev_pointer.slice(0, found_index),
                    ...orig_pointer,
                ];

            } else if (head_type === ContainerType.TOPLEVEL) {
                head.located_container = current_container.findAncestorChildrenSub(c => {
                    if (c.el.tag !== head.tag) return false;
                    let title_el = <EL>c.el.children.find(el =>
                        el instanceof EL && el.tag === `${c.el.tag}Title`);
                    return title_el.text.match(new RegExp(`^${head.name}(?:[(（]|\s|$)`)) !== null;
                });

                located_pointer = orig_pointer;

            } else {
                let func = (c: Container) =>
                    (
                        c.el.tag === head.tag ||
                        head.tag === "SUBITEM" && c.el.tag.match(/^Subitem\d+$/) !== null
                    ) &&
                    (c.el.attr.Num || null) === head.num;
                head.located_container =
                    head_type === ContainerType.ARTICLES
                        ? current_container.findAncestorChildren(func)
                        : current_container.findAncestorChildrenSub(func);

                located_pointer = orig_pointer;
            }
        }

        if (located_pointer[0].located_container) {
            let parent_container = located_pointer[0].located_container;
            for (let fragment of located_pointer.slice(1)) {
                if (!parent_container) break;
                // let fragment_rank = container_tags.indexOf(fragment.tag);
                // if (fragment_rank < 0) fragment_rank = Number.POSITIVE_INFINITY;
                parent_container =
                    fragment.located_container =
                    parent_container.find(
                        c =>
                            (
                                (
                                    c.el.tag === fragment.tag ||
                                    fragment.tag === "SUBITEM" &&
                                    c.el.tag.match(/^Subitem\d+$/) !== null
                                ) &&
                                (c.el.attr.Num || null) === fragment.num
                            ) ||
                            fragment.tag === "PROVISO" &&
                            c.el.tag === "Sentence" &&
                            c.el.attr.Function === "proviso",
                        // c => fragment_rank < container_tags.indexOf(c.el.tag),
                    );
            }
        }

        return located_pointer;
    }

    let prev_pointer: util.Pointer | null = null;
    for (let [orig_from, orig_to] of orig_ranges) {
        let from = locate_pointer(orig_from, prev_pointer);
        prev_pointer = from;
        let to: util.Pointer | null;
        if (orig_from === orig_to) {
            to = from;
        } else {
            to = locate_pointer(orig_to, prev_pointer);
            prev_pointer = to;
        }
        ranges.push([from, to]);
    }

    return ranges;
}

function get_scope(current_span: Span, scope_text: string, following: boolean, following_index: number): ScopeRange[] {
    let ret: ScopeRange[] = [];
    let ranges = locate_ranges(parse_ranges(scope_text), current_span);
    for (let [from, to] of ranges) {
        let fromc = from[from.length - 1].located_container;
        let toc = to[to.length - 1].located_container;
        if (fromc && toc) {
            if (following) {
                ret.push(new ScopeRange(following_index, 0, toc.span_range[1], 0));
            } else {
                ret.push(new ScopeRange(fromc.span_range[0], 0, toc.span_range[1], 0));
            }
        } else {
            console.error("Scope couldn't be detected:", { from: from, to: to });
        }
    }
    // console.log(scope_text, ranges, ret);
    return ret;
}

function detect_declarations(law: EL, spans: Span[], containers: Container[]) {

    let detect_lawname = (spans: Span[], span_index: number) => {
        if (spans.length <= span_index + 3) return null;
        let [
            lawname_span,
            start_span,
            lawnum_span,
        ] = spans.slice(span_index, span_index + 3);

        if (!(
            start_span.el.tag === "__PStart" &&
            start_span.el.attr.type === "round"
        )) return null;

        let match = lawnum_span.text.match(/^(?:明治|大正|昭和|平成)[元〇一二三四五六七八九十]+年\S+?第[〇一二三四五六七八九十百千]+号/);
        if (!match) return null;

        let law_num = match[0];
        let lawname_length = get_law_name_length(law_num);
        let lawname_text_index = lawname_span.text.length - lawname_length;
        let law_name = lawname_span.text.slice(lawname_text_index);

        let lawnum_el = new EL("____LawNum", {}, [law_num]);

        if (
            lawnum_span.text.length <= law_num.length &&
            lawnum_span.index + 1 < spans.length
        ) {

            let after_span = spans[lawnum_span.index + 1];

            if (
                after_span.el.tag === "__PEnd" &&
                after_span.el.attr.type === "round"
            ) {
                let scope = [
                    new ScopeRange(
                        after_span.index + 1,
                        0,
                        spans.length, // half open
                        0, // half open
                    ),
                ];

                let name_pos = new Pos(
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

                lawname_span.el.replace_span(lawname_text_index, lawname_text_index + lawname_length, declaration);
                lawnum_span.el.replace_span(0, law_num.length, lawnum_el);

                return declaration;
            }

        } else if (
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

            let scope_match = lawnum_span.text.slice(law_num.length + 1).match(/^(以下)?(?:([^。]+?)において)?(?:単に)?$/);
            let name_after_match = name_after_span.text.match(/^という。/);
            if (
                scope_match &&
                name_start_span.el.tag === "__PStart" &&
                name_start_span.el.attr.type === "square" &&
                name_end_span.el.tag === "__PEnd" &&
                name_end_span.el.attr.type === "square" &&
                name_after_match
            ) {
                let following = scope_match[1] !== undefined;
                let scope_text = scope_match[2] || null;

                let scope = scope_text
                    ? get_scope(lawnum_span, scope_text, following, name_after_span.index)
                    : [new ScopeRange(name_after_span.index, 0, spans.length, 0)];

                let name_pos = new Pos(
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

                lawname_span.el.replace_span(lawname_text_index, lawname_text_index + lawname_length, new EL("____DeclarationVal", {}, [law_name]));
                name_span.el.replace_span(0, name_span.text.length, declaration);
                lawnum_span.el.replace_span(0, law_num.length, lawnum_el);
                return declaration;
            }
        }
        return null;

    };

    let detect_name = (spans: Span[], span_index: number) => {
        if (spans.length < span_index + 5) return null;
        let [
            name_before_span,
            name_start_span,
            name_span,
            name_end_span,
            name_after_span,
        ] = spans.slice(span_index, span_index + 5);

        let scope_match = name_before_span.text.match(/(以下)?(?:([^。]+?)において)?(?:単に)?$/);
        let name_after_match = name_after_span.text.match(/^という。/);
        if (
            scope_match &&
            name_start_span.el.tag === "__PStart" &&
            name_start_span.el.attr.type === "square" &&
            name_end_span.el.tag === "__PEnd" &&
            name_end_span.el.attr.type === "square" &&
            name_after_match
        ) {
            let following = scope_match[1] !== undefined;
            let scope_text = scope_match[2] || null;

            let scope = scope_text
                ? get_scope(name_before_span, scope_text, following, name_after_span.index)
                : [new ScopeRange(name_after_span.index, 0, spans.length, 0)];

            let name_pos = new Pos(
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

            name_span.el.replace_span(0, name_span.text.length, declaration);
            return declaration;
        }

        return null;
    };

    let declarations = new Declarations();

    for (let span_index = 0; span_index < spans.length; span_index++) {
        let declaration =
            detect_lawname(spans, span_index) ||
            detect_name(spans, span_index);
        if (declaration) {
            declaration.attr.declaration_index = String(declarations.length);
            declarations.add(declaration);
        }
    }

    return declarations;
}

function detect_variable_references(law: EL, spans: Span[], declarations: Declarations) {

    let variable_references: ____VarRef[] = [];

    let detect = (span: Span) => {
        let parent = span.env.parents[span.env.parents.length - 1];
        if (parent.tag === "__PContent" && parent.attr.type === "square") return;
        let ret: ____VarRef[] = [];
        for (let declaration of declarations.iterate(span.index)) {
            let text_scope = {
                start: 0,
                end: Number.POSITIVE_INFINITY,
            };
            let next_index_offset = 0;
            for (let child of span.el.children) {
                let index_offset = next_index_offset;
                next_index_offset += (child instanceof EL ? child.text : child).length;
                if (child instanceof EL) continue;

                let index = -1;
                let search_index = 0;
                while ((index = child.indexOf(declaration.name, search_index)) >= 0) {
                    search_index = index + declaration.name.length;

                    if (text_scope.start <= index && index < text_scope.end) {
                        let ref_pos = new Pos(
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

    for (let span of spans) {
        let varrefs = detect(span);
        if (varrefs) {
            variable_references = variable_references.concat(varrefs);
        }
    }

    return variable_references;
}

export interface Analysis {
    declarations: Declarations,
}

export function analyze(law: EL): Analysis {
    let [spans, containers] = extract_spans(law);
    let declarations = detect_declarations(law, spans, containers);
    let variable_references = detect_variable_references(law, spans, declarations);
    return {
        declarations: declarations,
    };
}

export function stdxml_to_ext(el: EL) {
    if (["LawNum", "QuoteStruct"].indexOf(el.tag) < 0) {
        let is_mixed = el.children.some(child => typeof child === 'string' || child instanceof String);
        if (is_mixed) {
            el.children = parser.parse(el.innerXML(), { startRule: "INLINE" });
        } else {
            el.children = el.children.map(stdxml_to_ext)
        }
    }
    return el;
};
