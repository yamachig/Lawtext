import React from "react";
import { assert } from "chai";
import { loadEl } from "../../node/el";
import * as std from "../../law/std";
import { DOCXAppdxItem, HTMLAppdxItem } from "./appdxItem";
import { renderToStaticMarkup } from "./common";
import { renderDocxAsync } from "./docx";
import os from "os";
import path from "path";
import fs from "fs";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import { promisify } from "util";

const tempDir = path.join(os.tmpdir(), "lawtext_core_test");

describe("Test HTML appdxItem", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEl({
            tag: "AppdxTable",
            attr: {},
            children: [
                {
                    tag: "AppdxTableTitle",
                    attr: {},
                    children: ["付録別表第二"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第十九条、第二十一条関係）"],
                },
                {
                    tag: "TableStruct",
                    attr: {},
                    children: [
                        {
                            tag: "Table",
                            attr: {},
                            children: [
                                {
                                    tag: "TableRow",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "TableColumn",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["情報照会者"],
                                                },
                                            ],
                                        },
                                        {
                                            tag: "TableColumn",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["事務"],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        }) as std.AppdxItem;
        const expectedHTML = /*html*/`\
<div class="appdx-item">
  <div class="appdx-item-head indent-1">
    <span class="appdx-item-title">付録別表第二</span>
    <span class="related-article-num">（第十九条、第二十一条関係）</span>
  </div>
  <div class="appdx-item-body">
    <div class="item-struct">
      <div class="item-struct-body">
        <table class="table indent-1">
          <tr class="table-row">
            <td class="table-column">
              <div>情報照会者</div>
            </td>
            <td class="table-column">
              <div>事務</div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</div>
`;
        const element = <HTMLAppdxItem el={input} indent={1} htmlOptions={{}} />;
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
        const tempParsedHtml = path.join(tempDir, "renderer.appdxItem.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});

describe("Test DOCX appdxItem", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEl({
            tag: "AppdxTable",
            attr: {},
            children: [
                {
                    tag: "AppdxTableTitle",
                    attr: {},
                    children: ["付録別表第二"],
                },
                {
                    tag: "RelatedArticleNum",
                    attr: {},
                    children: ["（第十九条、第二十一条関係）"],
                },
                {
                    tag: "TableStruct",
                    attr: {},
                    children: [
                        {
                            tag: "Table",
                            attr: {},
                            children: [
                                {
                                    tag: "TableRow",
                                    attr: {},
                                    children: [
                                        {
                                            tag: "TableColumn",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["情報照会者"],
                                                },
                                            ],
                                        },
                                        {
                                            tag: "TableColumn",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["事務"],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        }) as std.AppdxItem;
        const expectedDOCX = /*xml*/`\
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>付録別表第二</w:t>
  </w:r>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>（第十九条、第二十一条関係）</w:t>
  </w:r>
</w:p>
<w:tbl>
  <w:tblPr>
    <w:tblStyle w:val="IndentTable1"></w:tblStyle>
  </w:tblPr>
  <w:tr>
    <w:tc>
      <w:tcPr></w:tcPr>
      <w:p>
        <w:r>
          <w:t>情報照会者</w:t>
        </w:r>
      </w:p>
    </w:tc>
    <w:tc>
      <w:tcPr></w:tcPr>
      <w:p>
        <w:r>
          <w:t>事務</w:t>
        </w:r>
      </w:p>
    </w:tc>
  </w:tr>
</w:tbl>
`;
        const element = <DOCXAppdxItem el={input} indent={1} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(element);
        const tempParsedDocx = path.join(tempDir, "renderer.appdxItem.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});
