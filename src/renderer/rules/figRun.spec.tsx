import React from "react";
import { assert } from "chai";
import { DOCXFigRun, HTMLFigRun } from "./figRun";
import { loadEl } from "../../node/el";
import * as std from "../../law/std";
import { renderToStaticMarkup } from "./common";
import formatXML from "../../util/formatXml";

describe("Test HTML figRun", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", () => {
        const input = loadEl({
            tag: "Fig",
            attr: { src: "./pict/S27F03901000056-005.jpg" },
            children: [],
        }) as std.Fig;
        const expectedHTML = /*html*/`\
<span class="fig-src">./pict/S27F03901000056-005.jpg</span>
`;
        const element = <HTMLFigRun el={input} htmlOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedHTML,
        );
    });
});


describe("Test DOCX figRun", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", () => {

        const input = loadEl({
            tag: "Fig",
            attr: { src: "./pict/S27F03901000056-005.jpg" },
            children: [],
        }) as std.Fig;
        const expectedDOCX = /*xml*/`\
<w:r>
  <w:t>./pict/S27F03901000056-005.jpg</w:t>
</w:r>
`;
        const element = <DOCXFigRun el={input} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
    });
});
