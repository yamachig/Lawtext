import React from "react";
import { assert } from "chai";
import { DOCXFigRun, HTMLFigRun } from "./figRun";
import { loadEl } from "../../node/el";
import * as std from "../../law/std";
import { renderToStaticMarkup } from "../common";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import path from "path";
import { promisify } from "util";
import fs from "fs";
import os from "os";
import { renderDocxAsync, w } from "../common/docx";

const tempDir = path.join(os.tmpdir(), "lawtext_core_test");

describe("Test HTML figRun", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
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
        const html = /*html*/`\
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
${htmlCSS}
</style>
</head>
<body>
${rendered}
</body>
</html>
`;
        const tempParsedHtml = path.join(tempDir, "renderer.figRun.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});


describe("Test DOCX figRun", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {

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
        const u8 = await renderDocxAsync(<w.p>{element}</w.p>);
        const tempParsedDocx = path.join(tempDir, "renderer.figRun.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});
