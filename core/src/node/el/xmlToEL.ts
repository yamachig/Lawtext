import type { Element } from "@xmldom/xmldom";
import { DOMParser, Node } from "@xmldom/xmldom";
import { EL } from ".";


export const elementToEL = (el: Element | HTMLElement): EL => {
    const children: Array<EL | string> = [];
    for (const node of Array.from<Node | ChildNode>(el.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = (node.nodeValue || "")
                .replace(/^[ \r\n\t]+/, "")
                .replace(/[ \r\n\t]+$/, "");
            if (text) {
                children.push(text);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            children.push(elementToEL(node as Element | HTMLElement));
        } else {
            // console.log(node);
        }
    }
    const attr: Record<string, string> = {};
    for (const at of Array.from(el.attributes as NamedNodeMap)) {
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

export default xmlToEL;
