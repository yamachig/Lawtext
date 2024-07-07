import React from "react";
import { assert } from "chai";
import loadEL from "../../node/el/loadEL";
import * as std from "../../law/std";
import { DOCXTable, HTMLTable } from "./table";
import { renderToStaticMarkup } from "../common";
import { renderDocxAsync } from "../common/docx/file";
import ensureTempTestDir from "../../../test/ensureTempTestDir";
import path from "path";
import fs from "fs";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import { promisify } from "util";

describe("Test HTML table", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEL({
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
                {
                    tag: "TableRow",
                    attr: {},
                    children: [
                        {
                            tag: "TableColumn",
                            attr: {
                                rowspan: "2",
                            },
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["２"],
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
                                    children: ["２．１"],
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
                                    children: ["２．２"],
                                },
                            ],
                        },
                    ],
                },
            ],
        }) as std.Table;
        const expectedHTML = /*html*/`\
<table class="table indent-0">
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
    <tr class="table-row">
      <td class="table-column" rowspan="2">
        <div>２</div>
      </td>
      <td class="table-column">
        <div>２．１</div>
      </td>
    </tr>
    <tr class="table-row">
      <td class="table-column">
        <div>２．２</div>
      </td>
    </tr>
  </tbody>
</table>
`;
        const element = <HTMLTable el={input} indent={0} htmlOptions={{}} />;
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
        const tempParsedHtml = path.join(ensureTempTestDir(), "renderer.table.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });


    it("Success case", async () => {
        const input = loadEL({
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
                                    children: ["次に掲げる額の合計額"],
                                },
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["ロ　消滅会社等の株主等に対して交付する存続株式会社等の社債、新株予約権又は新株予約権付社債の帳簿価額の合計額"],
                                },
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["ハ　消滅会社等の株主等に対して交付する存続株式会社等の株式等以外の財産の帳簿価額の合計額"],
                                },
                            ],
                        },
                    ],
                },
            ],
        }) as std.Table;
        const expectedHTML = /*html*/`\
<table class="table indent-0">
  <tbody>
    <tr class="table-row">
      <td class="table-column">
        <div>次に掲げる額の合計額</div>
        <div>ロ　消滅会社等の株主等に対して交付する存続株式会社等の社債、新株予約権又は新株予約権付社債の帳簿価額の合計額</div>
        <div>ハ　消滅会社等の株主等に対して交付する存続株式会社等の株式等以外の財産の帳簿価額の合計額</div>
      </td>
    </tr>
  </tbody>
</table>
`;
        const element = <HTMLTable el={input} indent={0} htmlOptions={{}} />;
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
        const tempParsedHtml = path.join(ensureTempTestDir(), "renderer.table.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});

describe("Test DOCX table", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEL({
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
                {
                    tag: "TableRow",
                    attr: {},
                    children: [
                        {
                            tag: "TableColumn",
                            attr: {
                                rowspan: "2",
                            },
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["２"],
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
                                    children: ["２．１"],
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
                                    children: ["２．２"],
                                },
                            ],
                        },
                    ],
                },
            ],
        }) as std.Table;
        const expectedDOCX = /*xml*/`\
<w:tbl>
  <w:tblPr>
    <w:tblStyle w:val="IndentTable0"></w:tblStyle>
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
  <w:tr>
    <w:tc>
      <w:tcPr>
        <w:vMerge w:val="restart"></w:vMerge>
      </w:tcPr>
      <w:p>
        <w:r>
          <w:t>２</w:t>
        </w:r>
      </w:p>
    </w:tc>
    <w:tc>
      <w:tcPr></w:tcPr>
      <w:p>
        <w:r>
          <w:t>２．１</w:t>
        </w:r>
      </w:p>
    </w:tc>
  </w:tr>
  <w:tr>
    <w:tc>
      <w:tcPr>
        <w:vMerge></w:vMerge>
      </w:tcPr>
      <w:p></w:p>
    </w:tc>
    <w:tc>
      <w:tcPr></w:tcPr>
      <w:p>
        <w:r>
          <w:t>２．２</w:t>
        </w:r>
      </w:p>
    </w:tc>
  </w:tr>
</w:tbl>
`;
        const element = <DOCXTable el={input} indent={0} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(element);
        const tempParsedDocx = path.join(ensureTempTestDir(), "renderer.table.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });


    it("Success case", async () => {
        const input = loadEL({
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
                                    children: ["次に掲げる額の合計額"],
                                },
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["ロ　消滅会社等の株主等に対して交付する存続株式会社等の社債、新株予約権又は新株予約権付社債の帳簿価額の合計額"],
                                },
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["ハ　消滅会社等の株主等に対して交付する存続株式会社等の株式等以外の財産の帳簿価額の合計額"],
                                },
                            ],
                        },
                    ],
                },
            ],
        }) as std.Table;
        const expectedDOCX = /*xml*/`\
<w:tbl>
  <w:tblPr>
    <w:tblStyle w:val="IndentTable0"></w:tblStyle>
  </w:tblPr>
  <w:tr>
    <w:tc>
      <w:tcPr></w:tcPr>
      <w:p>
        <w:r>
          <w:t>次に掲げる額の合計額</w:t>
        </w:r>
      </w:p>
      <w:p>
        <w:r>
          <w:t>ロ　消滅会社等の株主等に対して交付する存続株式会社等の社債、新株予約権又は新株予約権付社債の帳簿価額の合計額</w:t>
        </w:r>
      </w:p>
      <w:p>
        <w:r>
          <w:t>ハ　消滅会社等の株主等に対して交付する存続株式会社等の株式等以外の財産の帳簿価額の合計額</w:t>
        </w:r>
      </w:p>
    </w:tc>
  </w:tr>
</w:tbl>
`;
        const element = <DOCXTable el={input} indent={0} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(element);
        const tempParsedDocx = path.join(ensureTempTestDir(), "renderer.table.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});
