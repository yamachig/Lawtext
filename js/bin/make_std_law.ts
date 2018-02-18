import { EL, xml_to_json } from "../src/util";
import * as fs from "fs";
import { isString } from "util";

var Node = Node || {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1,
};

let schema = xml_to_json(fs.readFileSync(__dirname + "/std_law.xsd", "utf-8"));

let element_ifs: string[] = [];

function* getByTagName(el: EL, tag: string): IterableIterator<EL> {
    for (let child of el.children) {
        if (isString(child)) continue;
        if (child.tag === tag) {
            yield child;
        } else {
            yield* getByTagName(child, tag);
        }
    }
}

element_ifs.push(`\
import { EL } from "./util"
`);
element_ifs.push(`\
export interface __EL extends EL {
    isControl: true
}
`);

for (let element of schema.children.filter(el => !isString(el) && el.tag === "xs:element")) {
    if (isString(element)) continue;

    if (element.attr.type === "xs:string") {
        element_ifs.push(`\
export interface ${element.attr.name} extends EL {
    tag: "${element.attr.name}"
    children: [__EL | string]
}

export function is${element.attr.name}(obj: EL): obj is ${element.attr.name} {
    return obj.tag === "${element.attr.name}";
}
`);

    } else if (element.attr.type) {
        let children_type = element.attr.type === "any"
            ? "EL | string"
            : element.attr.type;
        element_ifs.push(`\
export interface ${element.attr.name} extends EL {
    tag: "${element.attr.name}"
    children: [${children_type}]
}

export function is${element.attr.name}(obj: EL): obj is ${element.attr.name} {
    return obj.tag === "${element.attr.name}";
}
`);

    } else {
        let child_tags = new Set([...getByTagName(element, "xs:element")].map(el => el.attr.ref));

        let is_mixed = [...getByTagName(element, "xs:complexType")].filter(el => el.attr.mixed === "true").length > 0;
        if (is_mixed) child_tags.add("string").add("__EL")

        let attr_lines: string[] = [];
        for (let attr of getByTagName(element, "xs:attribute")) {
            let name = attr.attr.name;
            let optional = attr.attr.use === "required" ? "" : "?";
            let enums = new Set([...getByTagName(attr, "xs:enumeration")].map(el => el.attr.value));
            let attr_type = enums.size === 0 ? "string" : [...enums].map(s => `"${s}"`).join(" | ");
            attr_lines.push(`        ${name}${optional}: ${attr_type},`);
        }

        let attrs_type = attr_lines.length === 0 ? "" : ["", ...attr_lines, "    "].join("\r\n");
        let children_type = child_tags.size === 0 ? "never[]" : `(${[...child_tags].join(" | ")})[]`;

        element_ifs.push(`\
export interface ${element.attr.name} extends EL {
    tag: "${element.attr.name}"
    attr: {${attrs_type}}
    children: ${children_type}
}

export function is${element.attr.name}(obj: EL): obj is ${element.attr.name} {
    return obj.tag === "${element.attr.name}";
}
`);
    }
}

console.log(element_ifs.join(`
`));
