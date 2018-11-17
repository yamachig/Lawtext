import * as fs from "fs";
import { isString } from "util";
import { EL, xmlToJson } from "../src/util";

const Node = {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1,
};

const schema = xmlToJson(fs.readFileSync(__dirname + "/std_law.xsd", "utf-8"));

const elementIfs: string[] = [];

function* getByTagName(el: EL, tag: string): IterableIterator<EL> {
    for (const child of el.children) {
        if (isString(child)) continue;
        if (child.tag === tag) {
            yield child;
        } else {
            yield* getByTagName(child, tag);
        }
    }
}

elementIfs.push(`\
import { EL } from "./util"
`);
elementIfs.push(`\
export interface __EL extends EL {
    isControl: true
}
`);
elementIfs.push(`\
export interface StdEL extends EL {
    isControl: false
}
`);

for (const element of schema.children.filter(el => !isString(el) && el.tag === "xs:element")) {
    if (isString(element)) continue;

    if (element.attr.type === "xs:string") {
        elementIfs.push(`\
export interface ${element.attr.name} extends StdEL {
    tag: "${element.attr.name}"
    children: Array<__EL | string>
}

export const is${element.attr.name} = (obj: EL): obj is ${element.attr.name} => {
    return obj.tag === "${element.attr.name}";
}
`);

    } else if (element.attr.type) {
        const childrenType = element.attr.type === "any"
            ? "EL | string"
            : element.attr.type;
        elementIfs.push(`\
export interface ${element.attr.name} extends StdEL {
    tag: "${element.attr.name}"
    children: Array<${childrenType}>
}

export const is${element.attr.name} = (obj: EL): obj is ${element.attr.name} => {
    return obj.tag === "${element.attr.name}";
}
`);

    } else {
        const childTags = new Set([...getByTagName(element, "xs:element")].map(el => el.attr.ref));

        const isMixed = [...getByTagName(element, "xs:complexType")].filter(el => el.attr.mixed === "true").length > 0;
        if (isMixed) childTags.add("string").add("__EL")

        const attrLines: string[] = [];
        for (const attr of getByTagName(element, "xs:attribute")) {
            const name = attr.attr.name;
            const optional = attr.attr.use === "required" ? "" : "?";
            const enums = new Set([...getByTagName(attr, "xs:enumeration")].map(el => el.attr.value));
            const attrType = enums.size === 0 ? "string" : [...enums].map(s => `"${s}"`).join(" | ");
            attrLines.push(`        ${name}${optional}: ${attrType},`);
        }

        const attrsType = attrLines.length === 0 ? "" : ["", ...attrLines, "    "].join("\r\n");
        const childrenType = childTags.size === 0 ? "never[]" : `Array<(${[...childTags].join(" | ")})>`;

        elementIfs.push(`\
export interface ${element.attr.name} extends StdEL {
    tag: "${element.attr.name}"
    attr: {${attrsType}}
    children: ${childrenType}
}

export const is${element.attr.name} = (obj: EL): obj is ${element.attr.name} => {
    return obj.tag === "${element.attr.name}";
}
`);
    }
}

console.log(elementIfs.join(`
`));
