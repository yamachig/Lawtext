import React from "react";
import { assert } from "chai";
import loadEL from "../../node/el/loadEL";
import * as std from "../../law/std";
import { DOCXParagraphItem, HTMLParagraphItem } from "./paragraphItem";
import { renderToStaticMarkup } from "../common";
import { renderDocxAsync } from "../common/docx";
import os from "os";
import path from "path";
import fs from "fs";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import { promisify } from "util";

const tempDir = path.join(os.tmpdir(), "lawtext_core_test");

describe("Test HTML paragraphItem", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEL({
            tag: "Item",
            attr: {

            },
            children: [
                {
                    tag: "ItemTitle",
                    attr: {},
                    children: ["一"],
                },
                {
                    tag: "ItemSentence",
                    attr: {},
                    children: [
                        {
                            tag: "Column",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["法令"],
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
                                    children: ["法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。"],
                                },
                            ],
                        },
                    ],
                },
            ],
        }) as std.Item;
        const expectedHTML = /*html*/`\
<div class="paragraph-item-Item paragraph-item-any">
  <div class="paragraph-item-decoration-block" style="--paragraph-item-indent:1em">
    <div class="paragraph-item-decoration-left-border"></div>
  </div>
  <div class="paragraph-item-main indent-1">
    <span class="paragraph-item-title">一</span>
    <span class="paragraph-item-margin">　</span>
    <span class="paragraph-item-body">
      <span class="lawtext-column">法令</span>
      <span class="lawtext-column-margin">　</span>
      <span class="lawtext-column">法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。</span>
    </span>
  </div>
</div>
`;
        const element = <HTMLParagraphItem el={input} indent={1} htmlOptions={{}} />;
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
        const tempParsedHtml = path.join(tempDir, "renderer.paragraphItem.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});

describe("Test DOCX paragraphItem", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEL({
            tag: "Item",
            attr: {

            },
            children: [
                {
                    tag: "ItemTitle",
                    attr: {},
                    children: ["一"],
                },
                {
                    tag: "ItemSentence",
                    attr: {},
                    children: [
                        {
                            tag: "Column",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["法令"],
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
                                    children: ["法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。"],
                                },
                            ],
                        },
                    ],
                },
            ],
        }) as std.Item;
        const expectedDOCX = /*xml*/`\
<w:p>
  <w:pPr>
    <w:pStyle w:val="IndentHanging1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>一</w:t>
  </w:r>
  <w:r>
    <w:t>　</w:t>
  </w:r>
  <w:r>
    <w:t>法令</w:t>
  </w:r>
  <w:r>
    <w:t>　</w:t>
  </w:r>
  <w:r>
    <w:t>法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。</w:t>
  </w:r>
</w:p>
`;
        const element = <DOCXParagraphItem el={input} indent={1} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(element);
        const tempParsedDocx = path.join(tempDir, "renderer.paragraphItem.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});
