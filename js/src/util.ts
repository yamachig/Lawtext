"use strict";

import { DOMParser } from "xmldom";
import { isString } from "util";

var Node = Node || {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1,
};

export interface JsonEL {
    tag: string
    attr: { [key: string]: string }
    children: Array<JsonEL | string>
}

function isJsonEL(object: any): object is JsonEL {
    return 'tag' in object && 'attr' in object && 'children' in object;
}


export class EL {
    tag: string
    attr: { [key: string]: string }
    children: Array<EL | string>
    _text: string | null

    constructor(tag: string, attr: { [key: string]: string } = {}, children: Array<EL | string> = []) {
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

    extend(children: Array<EL | string>): EL {
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
        let children: Array<JsonEL | string> = [];
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

    replace_span(start: number, end: number/* half open */, repl_children: Array<EL | string> | EL | string) {
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
                        let new_children: Array<EL | string> = [];
                        if (0 < start_in_child) new_children.push(child.slice(0, start_in_child));
                        new_children = new_children.concat(repl_children);
                        if (end_in_child < child.length) new_children.push(child.slice(end_in_child));
                        new_children = (<Array<EL | string>>[])
                            .concat(this.children.slice(0, i))
                            .concat(new_children)
                            .concat(this.children.slice(i + 1));
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
    let children: Array<EL | string> = [];
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
    '条': 'Article', '則': 'SupplProvision',
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

export const re_wide_digits: Array<[RegExp, string]> = [
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
    let nums_group: Array<string> = [];

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
