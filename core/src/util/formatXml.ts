/*
Based on xml-formatter released under the MIT license
https://github.com/chrisbottin/xml-formatter/blob/05c192bb41663316f88f9d721ced31732d7933a9/LICENSE
*/

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type {
    XmlParserElementNode,
    XmlParserNode,
    XmlParserProcessingInstructionNode,
    XmlParserDocumentChildNode,
    XmlParserElementChildNode,
} from "xml-parser-xo";
import parser from "xml-parser-xo";

const trim = (str: string) => {
    return str.replace(/^[ \r\n\t\v]+|[ \r\n\t\v]+$/g, "");
};
interface XMLFormatterOptions{
    ignoredPaths: string[];
    indentation: string;
    filter?: (node: Record<string, unknown>) => boolean;
    collapseContent: boolean;
    lineSeparator: string;
    whiteSpaceAtEndOfSelfclosingTag: boolean;
    throwOnFailure: boolean;
    strictMode: boolean;
}

const defaultXMLFormatterOptions: XMLFormatterOptions = {
    ignoredPaths: [],
    indentation: "  ",
    filter: undefined,
    collapseContent: false,
    lineSeparator: "\n",
    whiteSpaceAtEndOfSelfclosingTag: false,
    throwOnFailure: true,
    strictMode: true,
};

type XMLFormatterState = {
    content: string;
    level: number;
    options: XMLFormatterOptions;
    path: string[];
};

const newLine = (state: XMLFormatterState) => {
    if (!state.options.indentation && !state.options.lineSeparator) return;
    state.content += state.options.lineSeparator;
    for (let i = 0; i < state.level; i++) {
        state.content += state.options.indentation;
    }
};

const indent = (state: XMLFormatterState) => {
    state.content = state.content.replace(/ +$/, "");
    let i;
    for (i = 0; i < state.level; i++) {
        state.content += state.options.indentation;
    }
};

const appendContent = (state: XMLFormatterState, content: string) => {
    state.content += content;
};

const processNode = (node: XmlParserNode, state: XMLFormatterState, preserveSpace: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (node as any).content === "string") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        processContent((node as any).content, state, preserveSpace);
    } else if (node.type === "Element") {
        processElementNode(node as XmlParserElementNode, state, preserveSpace);
    } else if (node.type === "ProcessingInstruction") {
        processProcessingInstruction(node as XmlParserProcessingInstructionNode, state);
    } else {
        throw new Error("Unknown node type: " + node.type);
    }
};

const processContent = (content: string, state: XMLFormatterState, preserveSpace: boolean) => {
    if (!preserveSpace) {
        const trimmedContent = trim(content);
        if (state.options.lineSeparator) {
            content = trimmedContent;
        } else if (trimmedContent.length === 0) {
            content = trimmedContent;
        }
    }
    if (content.length > 0) {
        if (!preserveSpace && state.content.length > 0) {
            newLine(state);
        }
        appendContent(state, content);
    }
};

const isPathMatchingIgnoredPaths = (path: string[], ignoredPaths: string[]) => {
    const fullPath = "/" + path.join("/");
    const pathLastPart = path[path.length - 1];
    return ignoredPaths.includes(pathLastPart) || ignoredPaths.includes(fullPath);
};

const processElementNode = (node: XmlParserElementNode, state: XMLFormatterState, preserveSpace: boolean) => {
    state.path.push(node.name);
    if (!preserveSpace && state.content.length > 0) {
        newLine(state);
    }

    appendContent(state, "<" + node.name);
    processAttributes(state, node.attributes);

    if (node.children === null) {
        const selfClosingNodeClosingTag = state.options.whiteSpaceAtEndOfSelfclosingTag ? " />" : "/>";
        // self-closing node
        appendContent(state, selfClosingNodeClosingTag);
    } else if (node.children.length === 0) {
        // empty node
        appendContent(state, "></" + node.name + ">");
    } else {

        const nodeChildren = node.children;

        appendContent(state, ">");

        state.level++;

        let nodePreserveSpace = node.attributes["xml:space"] === "preserve";
        let ignoredPath = false;

        if (!nodePreserveSpace && state.options.ignoredPaths) {
            ignoredPath = isPathMatchingIgnoredPaths(state.path, state.options.ignoredPaths);
            nodePreserveSpace = ignoredPath;
        }

        if (!nodePreserveSpace && state.options.collapseContent) {
            let containsTextNodes = false;
            let containsTextNodesWithLineBreaks = false;
            let containsNonTextNodes = false;

            nodeChildren.forEach((child: XmlParserElementChildNode, index: number) => {
                if (child.type === "Text") {
                    if (child.content.includes("\n")) {
                        containsTextNodesWithLineBreaks = true;
                        child.content = trim(child.content);
                    } else if (index === 0 || index === nodeChildren.length - 1) {
                        if (trim(child.content).length === 0) {
                            // If the text node is at the start or end and is empty, it should be ignored when formatting
                            child.content = "";
                        }
                    }
                    if (trim(child.content).length > 0) {
                        containsTextNodes = true;
                    }
                } else if (child.type === "CDATA") {
                    containsTextNodes = true;
                } else {
                    containsNonTextNodes = true;
                }
            });

            if (containsTextNodes && (!containsNonTextNodes || !containsTextNodesWithLineBreaks)) {
                nodePreserveSpace = true;
            }
        }

        nodeChildren.forEach((child: XmlParserElementChildNode) => {
            processNode(child, state, preserveSpace || nodePreserveSpace);
        });

        state.level--;

        if (!preserveSpace && !nodePreserveSpace) {
            newLine(state);
        }

        if (ignoredPath) {
            indent(state);
        }

        appendContent(state, "</" + node.name + ">");
    }
    state.path.pop();
};

const processAttributes = (state: XMLFormatterState, attributes: Record<string, string>) => {
    Object.keys(attributes).forEach((attr) => {
        const escaped = attributes[attr].replace(/"/g, "&quot;");
        appendContent(state, " " + attr + "=\"" + escaped + "\"");
    });
};

const processProcessingInstruction = (node: XmlParserProcessingInstructionNode, state: XMLFormatterState) => {
    if (state.content.length > 0) {
        newLine(state);
    }
    appendContent(state, "<?" + node.name);
    processAttributes(state, node.attributes);
    appendContent(state, "?>");
};


export const formatXML = (xml: string, _options: Partial<XMLFormatterOptions> = {}): string => {
    const options = {
        ...defaultXMLFormatterOptions,
        ..._options,
    };

    const m = /^((?:<\?.+?\?>)?)([\s\S]*)$/m.exec(xml.trim());

    const parsedXml = parser(`${m ? m[1] : ""}<root>${m ? m[2] : xml}</root>`, { filter: options.filter, strictMode: options.strictMode });
    const state = { content: "", level: 0, options: options, path: [] };

    if (parsedXml.declaration) {
        processProcessingInstruction(parsedXml.declaration, state);
    }

    parsedXml.children.forEach((child: XmlParserDocumentChildNode) => {
        processNode(child, state, false);
    });

    return state.content
        .replace(/\r\n/g, "\n")
        .replace(/^(\s*(?:<\?.+?\?>)?\s*)<root>\n?/, "$1")
        .replace(/\n?<\/root>(\s*)$/, "$1")
        .replace(/\n*$/, "\n")
        .replace(new RegExp(`^${options.indentation}`, "mg"), "")
        .replace(/\n/g, options.lineSeparator);
};

export default formatXML;
