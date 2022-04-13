/*
Based on xml-formatter released under the MIT license
https://github.com/chrisbottin/xml-formatter/blob/9d6c5699bcd1b71ca9c2c2d9517e2be54c539318/LICENSE
*/

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import parser from "xml-parser-xo";

const trim = (str: string) => {
    return str.replace(/^[ \r\n\t\v]+|[ \r\n\t\v]+$/g, "");
};

interface XMLFormatterOptions{
    indentation: string;
    filter?: (node: Record<string, unknown>) => boolean;
    collapseContent: boolean;
    lineSeparator: string;
    whiteSpaceAtEndOfSelfclosingTag: boolean;
}

const defaultXMLFormatterOptions: XMLFormatterOptions = {
    indentation: "  ",
    filter: undefined,
    collapseContent: false,
    lineSeparator: "\n",
    whiteSpaceAtEndOfSelfclosingTag: false,
};

interface XMLFormatterState{
    content: string;
    level: number;
    options: XMLFormatterOptions;
}

interface XMLNode {
    content: string;
    children: XMLNode[];
    type: string;
    attributes: Record<string, string>;
    [key: string]: unknown;
}

const newLine = (state: XMLFormatterState) => {
    if (!state.options.indentation && !state.options.lineSeparator) return;
    state.content += state.options.lineSeparator;
    for (let i = 0; i < state.level; i++) {
        state.content += state.options.indentation;
    }
};

const appendContent = (state: XMLFormatterState, content: string) => {
    state.content += content;
};

const processNode = (node: XMLNode, state: XMLFormatterState, preserveSpace: boolean) => {
    if (typeof node.content === "string") {
        processContentNode(node, state, preserveSpace);
    } else if (node.type === "Element") {
        processElementNode(node, state, preserveSpace);
    } else if (node.type === "ProcessingInstruction") {
        processProcessingInstruction(node, state);
    } else {
        throw new Error("Unknown node type: " + node.type);
    }
};

const processContentNode = (node: XMLNode, state: XMLFormatterState, preserveSpace: boolean) => {
    if (!preserveSpace) {
        node.content = trim(node.content);
    }
    if (node.content.length > 0) {
        if (!preserveSpace && state.content.length > 0) {
            newLine(state);
        }
        appendContent(state, node.content);
    }
};

const processElementNode = (node: XMLNode, state: XMLFormatterState, preserveSpace: boolean) => {
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

        appendContent(state, ">");

        state.level++;

        let nodePreserveSpace = node.attributes["xml:space"] === "preserve";

        if (!nodePreserveSpace && state.options.collapseContent) {
            let containsTextNodes = false;
            let containsTextNodesWithLineBreaks = false;
            let containsNonTextNodes = false;

            node.children.forEach(function (child, index) {
                if (child.type === "Text") {
                    if (child.content.includes("\n")) {
                        containsTextNodesWithLineBreaks = true;
                        child.content = trim(child.content);
                    } else if (index === 0 || index === node.children.length - 1) {
                        if (trim(child.content).length === 0) {
                            // If the text node is at the start or end and is empty, it should be ignored when formatting
                            child.content = "";
                        }
                    }
                    if (child.content.length > 0) {
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

        node.children.forEach(function (child) {
            processNode(child, state, preserveSpace || nodePreserveSpace);
        });

        state.level--;

        if (!preserveSpace && !nodePreserveSpace) {
            newLine(state);
        }
        appendContent(state, "</" + node.name + ">");
    }
};

const processAttributes = (state: XMLFormatterState, attributes: Record<string, string>) => {
    Object.keys(attributes).forEach(function (attr) {
        const escaped = attributes[attr].replace(/"/g, "&quot;");
        appendContent(state, " " + attr + "=\"" + escaped + "\"");
    });
};

const processProcessingInstruction = (node: XMLNode, state: XMLFormatterState) => {
    if (state.content.length > 0) {
        newLine(state);
    }
    appendContent(state, "<?" + node.name);
    processAttributes(state, node.attributes);
    appendContent(state, "?>");
};


export function formatXML(xml: string, _options: Partial<XMLFormatterOptions> = {}): string {
    const options = {
        ...defaultXMLFormatterOptions,
        ..._options,
    };

    const parsedXml = parser(`<root>${xml}</root>`, { filter: options.filter });
    const state = { content: "", level: 0, options: options };

    if (parsedXml.declaration) {
        processProcessingInstruction(parsedXml.declaration, state);
    }

    for (const child of parsedXml.children) {
        processNode(child, state, false);
    }

    return state.content
        .replace(/\r\n/g, "\n")
        .replace(/^<root>\n?/, "")
        .replace(/<\/root>\n?$/, "")
        .replace(/\n*$/, "\n")
        .replace(new RegExp(`^${options.indentation}`, "mg"), "")
        .replace(/\n/g, options.lineSeparator);
}

export default formatXML;
