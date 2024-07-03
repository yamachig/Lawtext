import React from "react";
import { assert } from "chai";
import loadEL from "../../node/el/loadEL";
import * as std from "../../law/std";
import { DOCXNoteLike, HTMLNoteLike } from "./noteLike";
import { renderToStaticMarkup } from "../common";
import { renderDocxAsync } from "../common/docx";
import ensureTempTestDir from "../../../test/ensureTempTestDir";
import path from "path";
import fs from "fs";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import { promisify } from "util";

describe("Test HTML noteLike", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEL({
            tag: "NoteStruct",
            attr: {},
            children: [
                {
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
                            children: ["備考文１"],
                        },
                    ],
                },
                {
                    tag: "Note",
                    attr: {},
                    children: [
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
                },
                {
                    tag: "Remarks",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["備考文２"],
                        },
                    ],
                },
            ],
        }) as std.NoteLike;
        const expectedHTML = /*html*/`\
<div class="note-like">
  <div class="remarks">
    <div class="remarks-label indent-1">備考</div>
    <div class="remarks-body">
      <div class="remarks-sentence indent-2">備考文１</div>
    </div>
  </div>
  <div class="note-like">
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
  <div class="remarks">
    <div class="remarks-body">
      <div class="remarks-sentence indent-2">備考文２</div>
    </div>
  </div>
</div>
`;
        const element = <HTMLNoteLike el={input} indent={1} htmlOptions={{}} />;
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
        const tempParsedHtml = path.join(ensureTempTestDir(), "renderer.noteLike.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});

describe("Test DOCX noteLike", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEL({
            tag: "NoteStruct",
            attr: {},
            children: [
                {
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
                            children: ["備考文１"],
                        },
                    ],
                },
                {
                    tag: "Note",
                    attr: {},
                    children: [
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
                },
                {
                    tag: "Remarks",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["備考文２"],
                        },
                    ],
                },
            ],
        }) as std.NoteLike;
        const expectedDOCX = /*xml*/`\
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>備考</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent2"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>備考文１</w:t>
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
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent2"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>備考文２</w:t>
  </w:r>
</w:p>
`;
        const element = <DOCXNoteLike el={input} indent={1} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(element);
        const tempParsedDocx = path.join(ensureTempTestDir(), "renderer.noteLike.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});
