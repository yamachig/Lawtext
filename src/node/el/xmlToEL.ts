import { DOMParser } from "@xmldom/xmldom";
import { EL } from ".";

const NodeType = {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1,
};


export const elementToEL = (el: Element): EL => {
    const children: Array<EL | string> = [];
    for (const node of Array.from(el.childNodes)) {
        if (node.nodeType === NodeType.TEXT_NODE) {
            const text = (node.nodeValue || "")
                .replace(/^[ \r\n\t]+/, "")
                .replace(/[ \r\n\t]+$/, "");
            if (text) {
                children.push(text);
            }
        } else if (node.nodeType === NodeType.ELEMENT_NODE) {
            children.push(elementToEL(node as Element));
        } else {
            // console.log(node);
        }
    }
    const attr: Record<string, string> = {};
    for (const at of Array.from(el.attributes)) {
        attr[at.name] = at.value;
    }
    return new EL(
        el.tagName,
        attr,
        children,
    );
};

export const xmlToEL = (xml: string): EL => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(xml, "text/xml");
    if (!dom.documentElement) throw new Error("never");
    return elementToEL(dom.documentElement);
};
