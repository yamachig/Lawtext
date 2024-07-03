import React from "react";
import { assert } from "chai";
import loadEL from "../../node/el/loadEL";
import * as std from "../../law/std";
import { DOCXSupplNote, HTMLSupplNote } from "./supplNote";
import { renderToStaticMarkup } from "../common";
import { renderDocxAsync } from "../common/docx";
import ensureTempTestDir from "../../../test/ensureTempTestDir";
import path from "path";
import fs from "fs";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import { promisify } from "util";

describe("Test HTML supplNote", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEL({
            tag: "SupplNote",
            attr: {},
            children: ["（罰則　第百十九条第一項第一号の二、同条第二項、第百二十一条第一項第一号）"],
        }) as std.SupplNote;
        const expectedHTML = /*html*/`\
<div class="suppl-note indent-0">（罰則　第百十九条第一項第一号の二、同条第二項、第百二十一条第一項第一号）</div>
`;
        const element = <HTMLSupplNote el={input} indent={0} htmlOptions={{}} />;
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
        const tempParsedHtml = path.join(ensureTempTestDir(), "renderer.supplNote.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});

describe("Test DOCX supplNote", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEL({
            tag: "SupplNote",
            attr: {},
            children: ["（罰則　第百十九条第一項第一号の二、同条第二項、第百二十一条第一項第一号）"],
        }) as std.SupplNote;
        const expectedDOCX = /*xml*/`\
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent0"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>（罰則　第百十九条第一項第一号の二、同条第二項、第百二十一条第一項第一号）</w:t>
  </w:r>
</w:p>
`;
        const element = <DOCXSupplNote el={input} indent={0} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(element);
        const tempParsedDocx = path.join(ensureTempTestDir(), "renderer.supplNote.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});
