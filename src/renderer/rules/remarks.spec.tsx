import React from "react";
import { assert } from "chai";
import { loadEl } from "../../node/el";
import * as std from "../../law/std";
import { DOCXRemarks, HTMLRemarks } from "./remarks";
import { renderToStaticMarkup } from "./common";
import { renderDocxAsync } from "./docx";
import os from "os";
import path from "path";
import fs from "fs";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import { promisify } from "util";

const tempDir = path.join(os.tmpdir(), "lawtext_core_test");

describe("Test HTML remarks", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEl({
            tag: "Remarks",
            attr: {},
            children: [
                {
                    tag: "RemarksLabel",
                    attr: {},
                    children: ["備考"],
                },
                {
                    tag: "Sentence",
                    attr: {},
                    children: ["路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。"],
                },
            ],
        }) as std.Remarks;
        const expectedHTML = /*html*/`\
<div class="remarks">
  <p class="remarks-label indent-0">備考</p>
  <div class="remarks-body">
    <p class="remarks-sentence indent-1">路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。</p>
  </div>
</div>
`;
        const element = <HTMLRemarks el={input} indent={0} htmlOptions={{}} />;
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
        const tempParsedHtml = path.join(tempDir, "renderer.remarks.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});

describe("Test DOCX remarks", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEl({
            tag: "Remarks",
            attr: {},
            children: [
                {
                    tag: "RemarksLabel",
                    attr: {},
                    children: ["備考"],
                },
                {
                    tag: "Sentence",
                    attr: {},
                    children: ["路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。"],
                },
            ],
        }) as std.Remarks;
        const expectedDOCX = /*xml*/`\
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent0"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>備考</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>路程の計算については、水路及び陸路四分の一キロメートルをもつて鉄道一キロメートルとみなす。</w:t>
  </w:r>
</w:p>
`;
        const element = <DOCXRemarks el={input} indent={0} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(element);
        const tempParsedDocx = path.join(tempDir, "renderer.remarks.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});
