"use strict";

var DOMParser = require("xmldom").DOMParser;

var Node = Node || {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1,
};

class EL {

    constructor(tag, attr, children) {
        // if(!tag) {
        //     error(`${JSON.stringify(tag)} is invalid tag.`);
        // }
        this.tag = tag;
        this.attr = attr || {};
        this.children = children || [];

        this._text = null;
    }

    append(child) {
        if(child !== undefined && child !== null) {
            // if(!(child instanceof EL) && !(child instanceof String || (typeof child === "string"))) {
            //     error("child is not EL or String.");
            // }
            this.children.push(child);
            this._text = null;
        }
        return this;
    }

    extend(children) {
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

    json(with_control_el) {
        let children = [];
        for(let el of this.children) {
            if(!(
                el instanceof EL ||
                el instanceof String || (typeof el === "string")
            )) {
                console.error("[EL.json]", JSON.stringify(this));
                throw JSON.stringify(this);
            }
            if(el instanceof EL && (with_control_el || el.tag[0] !== "_")) {
                children.push(el.json(with_control_el));
            } else {
                let text = (el instanceof String || (typeof el === "string")) ? el : el.text;
                let last = children[children.length - 1];
                if(last instanceof String || (typeof last === "string")) {

                    children[children.length - 1] += text;
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

    get text() {
        if(this._text === null) {
            this._text = this.children.map(child => child instanceof EL ? child.text : child).join("");
        }
        return this._text;
    }

    set text(t) {
        this.children = [t];
        this._text = null;
    }

    wrapXML(innerXML) {
        let attr = Object.keys(this.attr).map(key => ` ${key}="${this.attr[key]}"`).join("");
        if(innerXML) {
            return `<${this.tag}${attr}>${innerXML}</${this.tag}>`;
        } else {
            return `<${this.tag}${attr}/>`;
        }
    }

    outerXML(with_control_el) {
        let innerXML = this.innerXML(with_control_el);
        if(with_control_el || this.tag[0] !== "_") {
            return this.wrapXML(innerXML);
        } else {
            return innerXML;
        }
    }

    innerXML(with_control_el) {
        return this.children.map(el =>
            (el instanceof String || (typeof el === "string"))
            ? el
            : el.outerXML(with_control_el)
        ).join("");
    }

    replace_span(start, end/* half open */, repl_children) {
        if(!Array.isArray(repl_children)) {
            repl_children = [repl_children];
        }
        let next_c_start = 0;
        for(let i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            let c_start = next_c_start;
            let c_end = c_start + (child instanceof EL ? child.text : child).length; // half open
            next_c_start = c_end;

            if(c_start <= start && start < c_end) {
                if(c_start < end && end <= c_end) {
                    let start_in_child = start - c_start;
                    let end_in_child = end - c_start;

                    if(child instanceof EL) {
                        child.replace_span(start_in_child, end_in_child, repl_children);
                    } else {
                        let new_child = [];
                        if(0 < start_in_child) new_child.push(child.slice(0, start_in_child));
                        new_child =new_child.concat(repl_children);
                        if(end_in_child < child.length) new_child.push(child.slice(end_in_child));
                        let new_children = []
                            .concat(this.children.slice(0, i))
                            .concat(new_child)
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
exports.EL = EL;


function load_el(raw_law) {
    if(raw_law instanceof String || (typeof raw_law === "string")) {
        return raw_law;
    } else {
        if(!raw_law.children) {
            console.error("[load_el]", raw_law);
        }
        return new EL(
            raw_law.tag,
            raw_law.attr,
            raw_law.children.map(load_el),
        );
    }
}
exports.load_el = load_el;


class __Parentheses extends EL {

    constructor(type, depth, start, end, content, text) {
        super("__Parentheses");

        this.attr.type = type;
        this.attr.depth = `${depth}`;
        this.append(new EL("__PStart", {type:type}, [start]));
        this.extend(new EL("__PContent", {type:type}, content));
        this.append(new EL("__PEnd", {type:type}, [end]));

        this.content = text.slice(start.length, text.length - end.length);
    }
};
exports.__Parentheses = __Parentheses;


class __Text extends EL {

    constructor(text) {
        super("__Text", {}, [text]);
    }
};
exports.__Text = __Text;


function element_to_json(el) {
    let children = [];
    for (let i = 0; i < el.childNodes.length; i++) {
        let node = el.childNodes[i];
        if(node.nodeType === Node.TEXT_NODE) {
            let text = node.nodeValue.trim();
            if(text) {
                children.push(text);
            }
        } else if(node.nodeType === Node.ELEMENT_NODE) {
            children.push(element_to_json(node));
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
exports.element_to_json = element_to_json;

function xml_to_json(xml) {
    let parser = new DOMParser();
    let dom = parser.parseFromString(xml, "text/xml");
    return element_to_json(dom.documentElement);
};
exports.xml_to_json = xml_to_json;



let paragraph_item_tags = {
    0: 'Paragraph', 1: 'Item',
    2: 'Subitem1',  3: 'Subitem2',  4: 'Subitem3',
    5: 'Subitem4',  6: 'Subitem5',  7: 'Subitem6',
    8: 'Subitem7',  9: 'Subitem8', 10: 'Subitem9',
    11: 'Subitem10',
};
exports.paragraph_item_tags = paragraph_item_tags;

let paragraph_item_title_tags = {
    0: 'ParagraphNum',  1: 'ItemTitle',
    2: 'Subitem1Title', 3: 'Subitem2Title', 4: 'Subitem3Title',
    5: 'Subitem4Title', 6: 'Subitem5Title', 7: 'Subitem6Title',
    8: 'Subitem7Title', 9: 'Subitem8Title', 10: 'Subitem9Title',
    11: 'Subitem10Title',
};
exports.paragraph_item_title_tags = paragraph_item_title_tags;

let paragraph_item_sentence_tags = {
    0: 'ParagraphSentence',  1: 'ItemSentence',
    2: 'Subitem1Sentence', 3: 'Subitem2Sentence', 4: 'Subitem3Sentence',
    5: 'Subitem4Sentence', 6: 'Subitem5Sentence', 7: 'Subitem6Sentence',
    8: 'Subitem7Sentence', 9: 'Subitem8Sentence', 10: 'Subitem9Sentence',
    11: 'Subitem10Sentence',
};
exports.paragraph_item_sentence_tags = paragraph_item_sentence_tags;





let list_tags = {
    0: 'List', 1: 'Sublist1', 2: 'Sublist2',  3: 'Sublist3',
};
exports.list_tags = list_tags;




function get_lawtype(text) {
    if(text.match(/^法律/)) return "Act";
    else if(text.match(/^政令/)) return "CabinetOrder";
    else if(text.match(/^勅令/)) return "ImperialOrder";
    else if(text.match(/^^\S*[^政勅]令/)) return "MinisterialOrdinance";
    else if(text.match(/^\S*規則/)) return "Rule";
    else return null;
}
exports.get_lawtype = get_lawtype;

let eras = {
    '明治': 'Meiji', '大正': 'Taisho',
    '昭和': 'Showa', '平成': 'Heisei',
};
exports.eras = eras;


let article_group_type_chars = "編章節款目";
exports.article_group_type_chars = article_group_type_chars;

let article_group_type = {
    '編': 'Part', '章': 'Chapter', '節': 'Section',
    '款': 'Subsection', '目': 'Division',
    '条': 'Article', '則': 'SupplProvision',
};
exports.article_group_type = article_group_type;

let article_group_title_tag = {
    '編': 'PartTitle', '章': 'ChapterTitle', '節': 'SectionTitle',
    '款': 'SubsectionTitle', '目': 'DivisionTitle', '条': 'ArticleTitle',
    '則': 'SupplProvisionLabel'
};
exports.article_group_title_tag = article_group_title_tag;

let re_kanji_num = /((\S*)千)?((\S*)百)?((\S*)十)?(\S*)/;
exports.re_kanji_num = re_kanji_num;

function parse_kanji_num(text) {
    let m = text.match(re_kanji_num);
    if(m) {
        let d1000 = m[1] ? kanji_digits[m[2]] || 1 : 0;
        let d100 = m[3] ? kanji_digits[m[4]] || 1 : 0;
        let d10 = m[5] ? kanji_digits[m[6]] || 1 : 0;
        let d1 = kanji_digits[m[7]] || 0;
        return "" + (d1000 * 1000 + d100 * 100 + d10 * 10 + d1);
    }
    return null;
}
exports.parse_kanji_num = parse_kanji_num;

let kanji_digits = {
    '〇': 0, '一': 1, '二': 2, '三': 3, '四': 4,
    '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
};
exports.kanji_digits = kanji_digits;

let re_named_num = /^(○?)第?([一二三四五六七八九十百千]+)\S*?([のノ一二三四五六七八九十百千]*)$/;
exports.re_named_num = re_named_num;
let iroha_chars = "イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセスン";
exports.iroha_chars = iroha_chars;
let re_iroha_char = /[イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセスン]/;
exports.re_iroha_char = re_iroha_char;
let re_item_num = /^\D*(\d+)\D*$/;
exports.re_item_num = re_item_num;

function parse_roman_num(text) {
    let num = 0;
    for(let i = 0; i < text.length; i++) {
        let char = text[i];
        let next_char = text[i + 1] || "";
        if(char.match(/[iIｉＩ]/)) {
            if (next_char.match(/[xXｘＸ]/)) num -= 1;
            else num += 1;
        }
        if(char.match(/[xXｘＸ]/)) {
            num += 10;
        }
    }
    return num;
}
exports.parse_roman_num = parse_roman_num;

let re_wide_digits = [
    [/０/g, '0'], [/１/g, '1'], [/２/g, '2'], [/３/g, '3'], [/４/g, '4'],
    [/５/g, '5'], [/６/g, '6'], [/７/g, '7'], [/８/g, '8'], [/９/g, '9'],
];
exports.re_wide_digits = re_wide_digits;

function replace_wide_num(text) {
    let ret = text;

    for(let i = 0; i < re_wide_digits.length; i++) {
        let [re_wide, narrow]  = re_wide_digits[i];
        ret = ret.replace(re_wide, narrow);
    }
    return ret;
}
exports.replace_wide_num = replace_wide_num;

function parse_named_num(text) {
    let nums_group = [];

    let subtexts = text
        .split(/\s+/)[0]
        .replace("及び", "、")
        .replace("から", "、")
        .replace("まで", "")
        .replace("～", "、")
        .replace("・", "、")
        .split("、");

    for(let i = 0; i < subtexts.length; i++) {
        let subtext = subtexts[i];

        let m = subtext.match(re_named_num);
        if(m) {
            let nums = [parse_kanji_num(m[2])];
            if(m[3]) {
                let bs = m[3].split(/[のノ]/g);
                for(let j = 0; j < bs.length; j++) {
                    if(!bs[j]) continue;
                    nums.push(parse_kanji_num(bs[j]));
                }
            }
            nums_group.push(nums.join('_'));
            continue;
        }

        m = subtext.match(re_iroha_char);
        if(m) {
            nums_group.push(iroha_chars.indexOf(m[0]) + 1);
            continue;
        }

        subtext = replace_wide_num(subtext);
        m = subtext.match(re_item_num);
        if(m) {
            nums_group.push(m[1]);
            continue;
        }

        let roman_num = parse_roman_num(subtext);
        if(roman_num !== 0) {
            nums_group.push(roman_num);
        }
    }

    return nums_group.join(':');
}
exports.parse_named_num = parse_named_num;
