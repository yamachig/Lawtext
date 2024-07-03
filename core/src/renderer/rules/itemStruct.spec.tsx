import React from "react";
import { assert } from "chai";
import loadEL from "../../node/el/loadEL";
import * as std from "../../law/std";
import { DOCXItemStruct, HTMLItemStruct } from "./itemStruct";
import { renderToStaticMarkup } from "../common";
import { renderDocxAsync } from "../common/docx";
import ensureTempTestDir from "../../../test/ensureTempTestDir";
import path from "path";
import fs from "fs";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import { promisify } from "util";

describe("Test HTML itemStruct", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEL({
            tag: "TableStruct",
            attr: {},
            children: [
                {
                    tag: "TableStructTitle",
                    attr: {},
                    children: ["表一"],
                },
                {
                    tag: "Table",
                    attr: {},
                    children: [
                        {
                            tag: "TableHeaderRow",
                            attr: {},
                            children: [
                                {
                                    tag: "TableHeaderColumn",
                                    attr: {},
                                    children: ["項"],
                                },
                                {
                                    tag: "TableHeaderColumn",
                                    attr: {},
                                    children: ["種名"],
                                },
                            ],
                        },
                        {
                            tag: "TableRow",
                            attr: {},
                            children: [
                                {
                                    tag: "TableColumn",
                                    attr: {
                                        colspan: "2",
                                    },
                                    children: [
                                        {
                                            tag: "Column",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["（１）"],
                                                },
                                            ],
                                        },
                                        {
                                            tag: "Column",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["かも科"],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
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
                                            children: ["１"],
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
                                            children: ["シジュウカラガン"],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        }) as std.TableStruct;
        const expectedHTML = /*html*/`\
<div class="item-struct">
  <div class="item-struct-title indent-1">表一</div>
  <div class="item-struct-body">
    <table class="table indent-1">
      <tbody>
        <tr class="table-row">
          <th class="table-header-column">
            <div>項</div>
          </th>
          <th class="table-header-column">
            <div>種名</div>
          </th>
        </tr>
        <tr class="table-row">
          <td class="table-column" colSpan="2">
            <div>
              <span class="lawtext-column">（１）</span>
              <span class="lawtext-column-margin">　</span>
              <span class="lawtext-column">かも科</span>
            </div>
          </td>
        </tr>
        <tr class="table-row">
          <td class="table-column">
            <div>１</div>
          </td>
          <td class="table-column">
            <div>シジュウカラガン</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
`;
        const element = <HTMLItemStruct el={input} indent={1} htmlOptions={{}} />;
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
        const tempParsedHtml = path.join(ensureTempTestDir(), "renderer.itemStruct.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});

describe("Test DOCX itemStruct", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEL({
            tag: "TableStruct",
            attr: {},
            children: [
                {
                    tag: "TableStructTitle",
                    attr: {},
                    children: ["表一"],
                },
                {
                    tag: "Table",
                    attr: {},
                    children: [
                        {
                            tag: "TableHeaderRow",
                            attr: {},
                            children: [
                                {
                                    tag: "TableHeaderColumn",
                                    attr: {},
                                    children: ["項"],
                                },
                                {
                                    tag: "TableHeaderColumn",
                                    attr: {},
                                    children: ["種名"],
                                },
                            ],
                        },
                        {
                            tag: "TableRow",
                            attr: {},
                            children: [
                                {
                                    tag: "TableColumn",
                                    attr: {
                                        colspan: "2",
                                    },
                                    children: [
                                        {
                                            tag: "Column",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["（１）"],
                                                },
                                            ],
                                        },
                                        {
                                            tag: "Column",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["かも科"],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
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
                                            children: ["１"],
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
                                            children: ["シジュウカラガン"],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        }) as std.TableStruct;
        const expectedDOCX = /*xml*/`\
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>表一</w:t>
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
          <w:t>項</w:t>
        </w:r>
      </w:p>
    </w:tc>
    <w:tc>
      <w:tcPr></w:tcPr>
      <w:p>
        <w:r>
          <w:t>種名</w:t>
        </w:r>
      </w:p>
    </w:tc>
  </w:tr>
  <w:tr>
    <w:tc>
      <w:tcPr>
        <w:gridSpan w:val="2"></w:gridSpan>
      </w:tcPr>
      <w:p>
        <w:r>
          <w:t>（１）</w:t>
        </w:r>
        <w:r>
          <w:t>　</w:t>
        </w:r>
        <w:r>
          <w:t>かも科</w:t>
        </w:r>
      </w:p>
    </w:tc>
  </w:tr>
  <w:tr>
    <w:tc>
      <w:tcPr></w:tcPr>
      <w:p>
        <w:r>
          <w:t>１</w:t>
        </w:r>
      </w:p>
    </w:tc>
    <w:tc>
      <w:tcPr></w:tcPr>
      <w:p>
        <w:r>
          <w:t>シジュウカラガン</w:t>
        </w:r>
      </w:p>
    </w:tc>
  </w:tr>
</w:tbl>
`;
        const element = <DOCXItemStruct el={input} indent={1} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(element);
        const tempParsedDocx = path.join(ensureTempTestDir(), "renderer.itemStruct.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});
