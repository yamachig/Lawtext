import * as fs from "fs";
import { EL, xmlToJson } from "../src/node/el";
import path from "path";

// const Node = {
//     TEXT_NODE: 3,
//     ELEMENT_NODE: 1,
// };

let rootDir = path.dirname(__dirname);
while (!fs.existsSync(path.join(rootDir, "package.json"))) {
    const newRootDir = path.dirname(rootDir);
    if (newRootDir === rootDir) break;
    rootDir = newRootDir;
}

const schema = xmlToJson(fs.readFileSync(path.join(rootDir, "/bin/stdLaw.xsd"), "utf-8"));

const elementIfs: string[] = [];
const newStdELConditions: string[] = [];
const stdElTags: string[] = [];

function* getByTagName(el: EL, tag: string): IterableIterator<EL> {
    for (const child of el.children) {
        if (typeof child === "string") continue;
        if (child.tag === tag) {
            yield child;
        } else {
            yield* getByTagName(child, tag);
        }
    }
}

elementIfs.push(`\
import { EL } from "../../node/el";
`);
elementIfs.push(`\
export interface __EL extends EL {
    isControl: true
}

export const isControl = (obj: EL | string): obj is __EL => {
    return (typeof obj !== "string") && obj.isControl;
};
`);
elementIfs.push(`\
export interface _StdEL extends EL {
    isControl: false
}
`);

for (const element of schema.children.filter(el => typeof el !== "string" && el.tag === "xs:element")) {
    if (typeof element === "string") continue;
    if (element.attr.name) stdElTags.push(element.attr.name);

    newStdELConditions.push(`\
    TName extends "${element.attr.name}" ? ${element.attr.name} :
`);

    if (element.attr.type === "xs:string") {
        elementIfs.push(`\
export interface ${element.attr.name ?? ""} extends _StdEL {
    tag: "${element.attr.name ?? ""}"
    children: Array<__EL | string>
}

export const is${element.attr.name ?? ""} = (obj: EL | string): obj is ${element.attr.name ?? ""} => {
    return (typeof obj !== "string") && (obj.tag === "${element.attr.name ?? ""}");
};
`);

    } else if (element.attr.type) {
        const childrenType = element.attr.type === "any"
            ? "StdEL | __EL | string"
            : element.attr.type;
        elementIfs.push(`\
export interface ${element.attr.name ?? ""} extends _StdEL {
    tag: "${element.attr.name ?? ""}"
    children: Array<${childrenType}>
}

export const is${element.attr.name ?? ""} = (obj: EL | string): obj is ${element.attr.name ?? ""} => {
    return (typeof obj !== "string") && (obj.tag === "${element.attr.name ?? ""}");
};
`);

    } else {
        const childTags = new Set([...getByTagName(element, "xs:element")].map(el => el.attr.ref));

        const isMixed1 = [...getByTagName(element, "xs:complexType")].filter(el => el.attr.mixed === "true").length > 0;

        if (isMixed1) childTags.add("string").add("__EL");

        const isMixed2 = [...getByTagName(element, "xs:complexType")].filter(el => [...getByTagName(el, "xs:complexContent")].filter(el => [...getByTagName(el, "xs:extension")].filter(el => el.attr.base === "any").length > 0).length > 0).length > 0;

        if (isMixed2) childTags.add("string").add("StdEL").add("__EL");

        const attrLines: string[] = [];
        for (const attr of getByTagName(element, "xs:attribute")) {
            const name = attr.attr.name ?? "";
            const optional = attr.attr.use === "required" ? "" : "?";
            const enums = new Set([...getByTagName(attr, "xs:enumeration")].map(el => el.attr.value));
            const attrType = enums.size === 0 ? "string" : [...enums].map(s => `"${s ?? ""}"`).join(" | ");
            attrLines.push(`        ${name}${optional}: ${attrType},`);
        }

        const attrsType = attrLines.length === 0 ? "Record<string, never>" : `{${["", ...attrLines, "    "].join("\r\n")}}`;
        const childrenType = childTags.size === 0 ? "never[]" : `Array<(${[...childTags].join(" | ")})>`;

        elementIfs.push(`\
export interface ${element.attr.name ?? ""} extends _StdEL {
    tag: "${element.attr.name ?? ""}"
    attr: ${attrsType}
    children: ${childrenType}
}

export const is${element.attr.name ?? ""} = (obj: EL | string): obj is ${element.attr.name ?? ""} => {
    return (typeof obj !== "string") && (obj.tag === "${element.attr.name ?? ""}");
};
`);
    }
}

elementIfs.push(`\
export type StdELType<TName extends string> =
${newStdELConditions.join("").trimEnd()}
    never

export type StdEL =
${stdElTags.map(tag => `    | ${tag}`).join("\r\n")}
    ;

export const stdELTags = [
${stdElTags.map(tag => `    "${tag}",`).join("\r\n")}
] as const;

export type StdELTag = typeof stdELTags[number];

export const newStdEL = <
    TName extends string,
    TStdEL = StdELType<TName>,
    TAttr extends { [key: string]: string | undefined } = TStdEL extends StdEL ? TStdEL["attr"] : never,
    TChildren extends Array<EL | string> = TStdEL extends StdEL ? TStdEL["children"] : never,
>(
        tag: TName,
        attr?: TAttr,
        children?: TChildren,
        range: [start: number, end: number] | null = null,
    ): StdELType<TName> => {
    return new EL(tag, attr, children, range) as StdELType<TName>;
};

export const isStdEL = <TTag extends StdELTag | undefined>(obj: EL | string, tag?: TTag | TTag[]): obj is (TTag extends undefined ? StdEL : StdELType<Diff<TTag, undefined>>) => {
    if (typeof obj === "string") {
        return false;
    } else if (tag === undefined) {
        return (stdELTags as readonly string[]).includes(obj.tag);
    } else if (Array.isArray(tag)) {
        return (tag as readonly string[]).includes(obj.tag);
    } else {
        return obj.tag === tag;
    }
};

export const makeIsStdEL = <TTag extends StdELTag>(tag: TTag | TTag[]) =>
    (obj: EL | string): obj is StdELType<TTag> =>
        isStdEL(obj, tag);
`);

const out = elementIfs.join(`
`);

fs.writeFileSync(path.join(rootDir, "/src/law/std/stdEL.ts"), out, { encoding: "utf-8" });
