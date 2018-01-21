"use strict";



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

    json() {
        return {
            tag: this.tag,
            attr: this.attr,
            children: this.children.map((el) => {
                if (el instanceof EL) return el.json();
                return el;
            }),
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


class __Text extends EL {

    constructor(text) {
        super("__Text", {}, [text]);
    }
}


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
}


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.EL = EL;
    exports.__Text = __Text;
    exports.__Parentheses = __Parentheses;
}

