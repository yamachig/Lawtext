"use strict";

import { DOMParser } from "xmldom";
import { isString } from "util";
import { AssertionError } from "assert";

var Node = Node || {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1,
};

export interface JsonEL {
    tag: string
    attr: { [key: string]: string }
    children: (JsonEL | string)[]
}

function isJsonEL(object: any): object is JsonEL {
    return 'tag' in object && 'attr' in object && 'children' in object;
}


export class EL {
    tag: string
    attr: { [key: string]: string }
    children: (EL | string)[]
    _text: string | null

    constructor(tag: string, attr: { [key: string]: string } = {}, children: (EL | string)[] = []) {
        // if(!tag) {
        //     error(`${JSON.stringify(tag)} is invalid tag.`);
        // }
        this.tag = tag;
        this.attr = attr;
        this.children = children;

        this._text = null;
    }

    append(child: EL | string): EL {
        if (child !== undefined && child !== null) {
            // if(!(child instanceof EL) && !(child instanceof String || (typeof child === "string"))) {
            //     error("child is not EL or String.");
            // }
            this.children.push(child);
            this._text = null;
        }
        return this;
    }

    extend(children: (EL | string)[]): EL {
        // if(!Array.isArray(children)) {
        //     error(`${JSON.stringify(children).slice(0,100)} is not Array.`);
        // }
        // for(let i = 0; i < children.length; i++) {
        //     let child = children[i];
        //     if(!(child instanceof EL) && !(child instanceof String || (typeof child === "string"))) {
        //         error("child is not EL or String.");
        //     }
        // }
        this.children = this.children.concat(children);
        this._text = null;
        return this;
    }

    json(with_control_el: boolean = false): JsonEL {
        let children: (JsonEL | string)[] = [];
        for (let el of this.children) {
            if (!(el instanceof EL || isString(el))) {
                console.error("[EL.json]", JSON.stringify(this));
                throw JSON.stringify(this);
            }
            if (el instanceof EL && (with_control_el || el.tag[0] !== "_")) {
                children.push(el.json(with_control_el));
            } else {
                let text = (el instanceof String || (typeof el === "string")) ? el : el.text;
                let last = children[children.length - 1];
                if (isString(last)) {
                    children[children.length - 1] = last + text;
                } else {
                    children.push(text);
                }
            }
        }
        return {
            tag: this.tag,
            attr: this.attr,
            children: children,
        };
    }

    get text(): string {
        if (this._text === null) {
            this._text = this.children.map(child => child instanceof EL ? child.text : child).join("");
        }
        return this._text;
    }

    set text(t: string) {
        this.children = [t];
        this._text = null;
    }

    wrapXML(innerXML: string): string {
        let attr = Object.keys(this.attr).map(key => ` ${key}="${this.attr[key]}"`).join("");
        if (innerXML) {
            return `<${this.tag}${attr}>${innerXML}</${this.tag}>`;
        } else {
            return `<${this.tag}${attr}/>`;
        }
    }

    outerXML(with_control_el: boolean = false): string {
        let innerXML = this.innerXML(with_control_el);
        if (with_control_el || this.tag[0] !== "_") {
            return this.wrapXML(innerXML);
        } else {
            return innerXML;
        }
    }

    innerXML(with_control_el: boolean = false): string {
        return this.children.map(el =>
            (el instanceof String || (typeof el === "string"))
                ? el
                : el.outerXML(with_control_el)
        ).join("");
    }

    replace_span(start: number, end: number/* half open */, repl_children: (EL | string)[] | EL | string) {
        if (!Array.isArray(repl_children)) {
            repl_children = [repl_children];
        }
        let next_c_start = 0;
        for (let i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            let c_start = next_c_start;
            let c_end = c_start + (child instanceof EL ? child.text : child).length; // half open
            next_c_start = c_end;

            if (c_start <= start && start < c_end) {
                if (c_start < end && end <= c_end) {
                    let start_in_child = start - c_start;
                    let end_in_child = end - c_start;

                    if (child instanceof EL) {
                        child.replace_span(start_in_child, end_in_child, repl_children);
                    } else {
                        let new_children: (EL | string)[] = [];
                        if (0 < start_in_child) new_children.push(child.slice(0, start_in_child));
                        new_children = new_children.concat(repl_children);
                        if (end_in_child < child.length) new_children.push(child.slice(end_in_child));
                        new_children = [
                            ...this.children.slice(0, i),
                            ...new_children,
                            ...this.children.slice(i + 1),
                        ];
                        this.children = new_children;
                        this._text = null;
                    }
                } else {
                    throw "Attempted to replace across elements.";
                }
                break;
            }
        }
    }
}

export enum ContainerType {
    ROOT,
    TOPLEVEL,
    ARTICLES,
    SPANS,
}

export class Container {
    el: EL
    type: ContainerType
    span_range: [number, number] // half open
    parent: Container | null
    children: Container[]

    sub_parent: Container | null
    sub_children: Container[]

    constructor(
        el: EL,
        type: ContainerType,
        span_range: [number, number] = [NaN, NaN],
        parent: Container | null = null,
        children: Container[] = [],
        sub_parent: Container | null = null,
        sub_children: Container[] = [],
    ) {
        this.el = el;
        this.type = type;
        this.span_range = span_range;
        this.parent = parent;
        this.children = children;
        this.sub_parent = sub_parent;
        this.sub_children = sub_children;
    }

    add_child(child: Container): Container {
        this.children.push(child);
        child.parent = this;
        if (child.type !== ContainerType.ARTICLES) {
            let sub_parent = this.type !== ContainerType.ARTICLES
                ? this
                : this.closest(container => container.type !== ContainerType.ARTICLES);
            if (!sub_parent) throw new AssertionError();
            sub_parent.sub_children.push(child);
            child.sub_parent = sub_parent;
        }
        return this;
    }

    thisOrClosest(func: (container: Container) => boolean): Container | null {
        if (func(this)) return this;
        return this.parents(func).next().value || null;
    }

    closest(func: (container: Container) => boolean): Container | null {
        return this.parents(func).next().value || null;
    }

    *parents(func?: (container: Container) => boolean): IterableIterator<Container> {
        if (!this.parent) return;
        if (!func || func(this.parent)) yield this.parent;
        yield* this.parent.parents(func);
    }

    linealAscendant(func?: (container: Container) => boolean): Container[] {
        let ret = [...this.parents(func)].reverse();
        if (!func || func(this)) ret.push(this);
        return ret;
    }

    findAncestorChildren(func: (container: Container) => boolean): Container | null {
        return this.ancestorChildren(func).next().value || null;
    }

    *ancestorChildren(func: (container: Container) => boolean): IterableIterator<Container> {
        if (!this.parent) return;
        yield* this.parent.children.filter(func);
        yield* this.parent.ancestorChildren(func);
    }

    next(func: (container: Container) => boolean): Container | null {
        return this.nextAll(func).next().value || null;
    }

    *nextAll(func: (container: Container) => boolean): IterableIterator<Container> {
        if (!this.parent) return;
        for (let i = this.parent.children.indexOf(this) + 1; i < this.parent.children.length; i++) {
            let sibling = this.parent.children[i];
            if (func(sibling)) yield sibling;
        }
    }

    prev(func: (container: Container) => boolean): Container | null {
        return this.prevAll(func).next().value || null;
    }

    *prevAll(func: (container: Container) => boolean): IterableIterator<Container> {
        if (!this.parent) return;
        for (let i = this.parent.children.indexOf(this) - 1; 0 <= i; i--) {
            let sibling = this.parent.children[i];
            if (func(sibling)) yield sibling;
        }
    }

    thisOrClosestSub(func: (container: Container) => boolean): Container | null {
        if (func(this)) return this;
        return this.parentsSub(func).next().value || null;
    }

    closestSub(func: (container: Container) => boolean): Container | null {
        return this.parentsSub(func).next().value || null;
    }

    *parentsSub(func: (container: Container) => boolean): IterableIterator<Container> {
        if (!this.sub_parent) return;
        if (func(this.sub_parent)) yield this.sub_parent;
        yield* this.sub_parent.parentsSub(func);
    }

    findAncestorChildrenSub(func: (container: Container) => boolean): Container | null {
        return this.ancestorChildrenSub(func).next().value || null;
    }

    *ancestorChildrenSub(func: (container: Container) => boolean): IterableIterator<Container> {
        if (!this.sub_parent) return;
        yield* this.sub_parent.sub_children.filter(func);
        yield* this.sub_parent.ancestorChildrenSub(func);
    }

    nextSub(func: (container: Container) => boolean): Container | null {
        return this.nextAllSub(func).next().value || null;
    }

    *nextAllSub(func: (container: Container) => boolean): IterableIterator<Container> {
        if (!this.sub_parent) return;
        for (let i = this.sub_parent.sub_children.indexOf(this) + 1;
            i < this.sub_parent.sub_children.length; i++) {
            let sibling = this.sub_parent.sub_children[i];
            if (func(sibling)) yield sibling;
        }
    }

    prevSub(func: (container: Container) => boolean): Container | null {
        return this.prevAllSub(func).next().value || null;
    }

    *prevAllSub(func: (container: Container) => boolean): IterableIterator<Container> {
        if (!this.sub_parent) return;
        for (let i = this.sub_parent.sub_children.indexOf(this) - 1; 0 <= i; i--) {
            let sibling = this.sub_parent.sub_children[i];
            if (func(sibling)) yield sibling;
        }
    }

    find(
        func?: (container: Container) => boolean,
        cut?: (container: Container) => boolean,
    ): Container | null {
        return this.findAll(func, cut).next().value || null;
    }

    *findAll(
        func?: (container: Container) => boolean,
        cut?: (container: Container) => boolean,
    ): IterableIterator<Container> {
        for (let child of this.children) {
            if (cut && cut(child)) return;
            if (!func || func(child)) yield child;
            yield* child.findAll(func, cut);
        }
    }

    *iterate(
        func?: (container: Container) => boolean,
        cut?: (container: Container) => boolean,
    ): IterableIterator<Container> {
        if (cut && cut(this)) return;
        if (!func || func(this)) yield this;
        for (let child of this.children) yield* child.iterate(func, cut);
    }

    *iterate_reverse(
        func?: (container: Container) => boolean,
        cut?: (container: Container) => boolean,
    ): IterableIterator<Container> {
        if (cut && cut(this)) return;
        for (let i = this.children.length - 1; 0 <= i; i--) {
            let child = this.children[i];
            yield* child.iterate_reverse(func, cut);
        }
        if (!func || func(this)) yield this;
    }
}

export class Env {
    law_type: string
    _container: Container | null
    parents: EL[]
    constructor(
        law_type: string,
        container: Container | null = null,
        parents: EL[] = [],
    ) {
        this.law_type = law_type;
        this._container = container;
        this.parents = parents;
    }

    get container(): Container {
        if (!this._container) throw new AssertionError();
        return this._container;
    }

    set container(container: Container) {
        this._container = container;
    }

    add_container(container: Container) {
        if (this._container) {
            this._container.add_child(container);
        }
        this._container = container;
    }

    copy() {
        return new Env(
            this.law_type,
            this._container,
            this.parents.slice(),
        );
    }
}

export class Span {
    index: number
    el: EL
    env: Env
    text: string
    constructor(index, el, env) {
        this.index = index;
        this.el = el;
        this.env = env;

        this.text = el.text;
    }
}

export function load_el(raw_law: JsonEL | string): EL | string {
    if (isString(raw_law)) {
        return raw_law;
    } else {
        if (!raw_law.children) {
            console.error("[load_el]", raw_law);
        }
        return new EL(
            raw_law.tag,
            raw_law.attr,
            raw_law.children.map(load_el),
        );
    }
}


export class __Parentheses extends EL {

    content: string

    constructor(type, depth, start, end, content, text) {
        super("__Parentheses");

        this.attr.type = type;
        this.attr.depth = `${depth}`;
        this.append(new EL("__PStart", { type: type }, [start]));
        this.extend([new EL("__PContent", { type: type }, content)]);
        this.append(new EL("__PEnd", { type: type }, [end]));

        this.content = text.slice(start.length, text.length - end.length);
    }
};


export class __Text extends EL {

    constructor(text) {
        super("__Text", {}, [text]);
    }
};

export function element_to_json(el: Element): EL {
    let children: (EL | string)[] = [];
    for (let i = 0; i < el.childNodes.length; i++) {
        let node = el.childNodes[i];
        if (node.nodeType === Node.TEXT_NODE) {
            let text = (node.nodeValue || "").trim();
            if (text) {
                children.push(text);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            children.push(element_to_json(<Element>node));
        } else {
            console.log(node);
        }
    }
    let attr = {};
    for (let i = 0; i < el.attributes.length; i++) {
        let at = el.attributes[i];
        attr[at.name] = at.value;
    }
    return new EL(
        el.tagName,
        attr,
        children,
    );
};

export function xml_to_json(xml: string): EL {
    let parser = new DOMParser();
    let dom = parser.parseFromString(xml, "text/xml");
    return element_to_json(dom.documentElement);
};



export const paragraph_item_tags = [
    'Paragraph', 'Item',
    'Subitem1', 'Subitem2', 'Subitem3',
    'Subitem4', 'Subitem5', 'Subitem6',
    'Subitem7', 'Subitem8', 'Subitem9',
    'Subitem10',
];

export const paragraph_item_title_tags = [
    'ParagraphNum', 'ItemTitle',
    'Subitem1Title', 'Subitem2Title', 'Subitem3Title',
    'Subitem4Title', 'Subitem5Title', 'Subitem6Title',
    'Subitem7Title', 'Subitem8Title', 'Subitem9Title',
    'Subitem10Title',
];

export const paragraph_item_sentence_tags = [
    'ParagraphSentence', 'ItemSentence',
    'Subitem1Sentence', 'Subitem2Sentence', 'Subitem3Sentence',
    'Subitem4Sentence', 'Subitem5Sentence', 'Subitem6Sentence',
    'Subitem7Sentence', 'Subitem8Sentence', 'Subitem9Sentence',
    'Subitem10Sentence',
];





export const list_tags = [
    'List', 'Sublist1', 'Sublist2', 'Sublist3',
];




export function get_lawtype(text: string): string | null {
    if (text.match(/^法律/)) return "Act";
    else if (text.match(/^政令/)) return "CabinetOrder";
    else if (text.match(/^勅令/)) return "ImperialOrder";
    else if (text.match(/^^\S*[^政勅]令/)) return "MinisterialOrdinance";
    else if (text.match(/^\S*規則/)) return "Rule";
    else return null;
}

export const eras = {
    '明治': 'Meiji', '大正': 'Taisho',
    '昭和': 'Showa', '平成': 'Heisei',
};


export const article_group_type_chars = "編章節款目";

export const article_group_type = {
    '編': 'Part', '章': 'Chapter', '節': 'Section',
    '款': 'Subsection', '目': 'Division',
    '条': 'Article', '項': 'Paragraph', '号': 'Item', '則': 'SupplProvision',
};

export const article_group_title_tag = {
    '編': 'PartTitle', '章': 'ChapterTitle', '節': 'SectionTitle',
    '款': 'SubsectionTitle', '目': 'DivisionTitle', '条': 'ArticleTitle',
    '則': 'SupplProvisionLabel'
};

export const re_kanji_num = /((\S*)千)?((\S*)百)?((\S*)十)?(\S*)/;

export function parse_kanji_num(text: string): string | null {
    let m = text.match(re_kanji_num);
    if (m) {
        let d1000 = m[1] ? kanji_digits[m[2]] || 1 : 0;
        let d100 = m[3] ? kanji_digits[m[4]] || 1 : 0;
        let d10 = m[5] ? kanji_digits[m[6]] || 1 : 0;
        let d1 = kanji_digits[m[7]] || 0;
        return "" + (d1000 * 1000 + d100 * 100 + d10 * 10 + d1);
    }
    return null;
}

export const kanji_digits = {
    '〇': 0, '一': 1, '二': 2, '三': 3, '四': 4,
    '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
};

export const re_named_num = /^(○?)第?([一二三四五六七八九十百千]+)\S*?([のノ一二三四五六七八九十百千]*)$/;
export const iroha_chars = "イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセスン";
export const re_iroha_char = /[イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセスン]/;
export const re_item_num = /^\D*(\d+)\D*$/;

export function parse_roman_num(text: string): number {
    let num = 0;
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        let next_char = text[i + 1] || "";
        if (char.match(/[iIｉＩ]/)) {
            if (next_char.match(/[xXｘＸ]/)) num -= 1;
            else num += 1;
        }
        if (char.match(/[xXｘＸ]/)) {
            num += 10;
        }
    }
    return num;
}

export const re_wide_digits: [RegExp, string][] = [
    [/０/g, '0'], [/１/g, '1'], [/２/g, '2'], [/３/g, '3'], [/４/g, '4'],
    [/５/g, '5'], [/６/g, '6'], [/７/g, '7'], [/８/g, '8'], [/９/g, '9'],
];

export function replace_wide_num(text: string): string {
    let ret = text;

    for (let i = 0; i < re_wide_digits.length; i++) {
        let [re_wide, narrow] = re_wide_digits[i];
        ret = ret.replace(re_wide, narrow);
    }
    return ret;
}

export function parse_named_num(text: string): string {
    let nums_group: string[] = [];

    let subtexts = text
        .split(/\s+/)[0]
        .replace("及び", "、")
        .replace("から", "、")
        .replace("まで", "")
        .replace("～", "、")
        .replace("・", "、")
        .split("、");

    for (let i = 0; i < subtexts.length; i++) {
        let subtext = subtexts[i];

        let m = subtext.match(re_named_num);
        if (m) {
            let nums = [parse_kanji_num(m[2])];
            if (m[3]) {
                let bs = m[3].split(/[のノ]/g);
                for (let j = 0; j < bs.length; j++) {
                    if (!bs[j]) continue;
                    nums.push(parse_kanji_num(bs[j]));
                }
            }
            nums_group.push(nums.join('_'));
            continue;
        }

        m = subtext.match(re_iroha_char);
        if (m) {
            nums_group.push(String(iroha_chars.indexOf(m[0]) + 1));
            continue;
        }

        subtext = replace_wide_num(subtext);
        m = subtext.match(re_item_num);
        if (m) {
            nums_group.push(m[1]);
            continue;
        }

        let roman_num = parse_roman_num(subtext);
        if (roman_num !== 0) {
            nums_group.push(String(roman_num));
        }
    }

    return nums_group.join(':');
}

export enum RelPos {
    PREV,
    HERE,
    NEXT,
    SAME,
    NAMED,
}
export function isRelPos(object: any): object is RelPos {
    return (
        object === RelPos.PREV ||
        object === RelPos.HERE ||
        object === RelPos.NEXT ||
        object === RelPos.NAMED
    );
}

export class PointerFragment {
    rel_pos: RelPos
    tag: string
    name: string
    num: string | null
    located_container: Container | null

    constructor(
        rel_pos: RelPos,
        tag: string,
        name: string,
        num: string | null,
        located_container: Container | null = null,
    ) {
        this.rel_pos = rel_pos;
        this.tag = tag;
        this.name = name;
        this.num = num;
        this.located_container = located_container;
    }

    copy() {
        return new PointerFragment(
            this.rel_pos,
            this.tag,
            this.name,
            this.num,
            this.located_container,
        );
    }
}

export type Pointer = PointerFragment[];
export type Range = [Pointer, Pointer]; // closed
export type Ranges = Range[];

export const throwAssertionError = () => {
    throw new AssertionError();
}
