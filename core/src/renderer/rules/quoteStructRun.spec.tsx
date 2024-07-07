import React from "react";
import { assert } from "chai";
import { DOCXQuoteStructRun, HTMLQuoteStructRun } from "./quoteStructRun";
import loadEL from "../../node/el/loadEL";
import * as std from "../../law/std";
import { renderToStaticMarkup } from "../common";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import path from "path";
import { promisify } from "util";
import fs from "fs";
import ensureTempTestDir from "../../../test/ensureTempTestDir";
import { renderDocxAsync } from "../common/docx/file";
import { w } from "../common/docx/tags";

describe("Test HTML quoteStructRun", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEL({
            tag: "QuoteStruct",
            attr: {},
            children: [
                {
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
                },
            ],
        }) as std.QuoteStruct;
        const expectedHTML = /*html*/`\
<span class="quote-struct" style="display:inline-block">
  <div class="item-struct">
    <div class="item-struct-title indent-0">表一</div>
    <div class="item-struct-body">
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
        </tbody>
      </table>
    </div>
  </div>
</span>
`;
        const element = <HTMLQuoteStructRun el={input} htmlOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        console;
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
        const tempParsedHtml = path.join(ensureTempTestDir(), "renderer.quoteStructRun.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});


describe("Test DOCX quoteStructRun", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {

        const input = loadEL({
            tag: "QuoteStruct",
            attr: {},
            children: [
                {
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
                },
            ],
        }) as std.QuoteStruct;
        const expectedDOCX = /*xml*/`\
<w:r>
  <w:drawing>
    <wp:inline distT="0" distB="0" distL="0" distR="0">
      <wp:extent cx="0" cy="0"></wp:extent>
      <wp:docPr id="${input.id + 10000}" name="QuoteStruct${input.id}"></wp:docPr>
      <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
        <a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">
          <wps:wsp>
            <wps:cNvSpPr txBox="1">
              <a:spLocks noChangeArrowheads="1"></a:spLocks>
            </wps:cNvSpPr>
            <wps:spPr bwMode="auto">
              <a:xfrm>
                <a:off x="0" y="0"></a:off>
              </a:xfrm>
              <a:prstGeom prst="rect">
                <a:avLst></a:avLst>
              </a:prstGeom>
              <a:noFill></a:noFill>
            </wps:spPr>
            <wps:txbx>
              <w:txbxContent>
                <w:p>
                  <w:pPr>
                    <w:pStyle w:val="Indent0"></w:pStyle>
                  </w:pPr>
                  <w:r>
                    <w:rStyle w:val="Emphasis"></w:rStyle>
                    <w:t>表一</w:t>
                  </w:r>
                </w:p>
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
                </w:tbl>
              </w:txbxContent>
            </wps:txbx>
            <wps:bodyPr rot="0" vert="horz" wrap="none" lIns="0" tIns="0" rIns="0" bIns="0" anchor="t" anchorCtr="0">
              <a:spAutoFit></a:spAutoFit>
            </wps:bodyPr>
          </wps:wsp>
        </a:graphicData>
      </a:graphic>
    </wp:inline>
  </w:drawing>
</w:r>
`;
        const element = <DOCXQuoteStructRun el={input} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(<w.p>{element}</w.p>);
        const tempParsedDocx = path.join(ensureTempTestDir(), "renderer.quoteStructRun.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});
