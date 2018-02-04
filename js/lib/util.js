"use strict";

var DOMParser = DOMParser || require("xmldom").DOMParser;

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

