import React from "react";
import { assert } from "chai";
import { loadEl } from "../../node/el";
import * as std from "../../law/std";
import { DOCXAmendProvision, HTMLAmendProvision } from "./amendProvision";
import { renderToStaticMarkup } from "./common";
import { renderDocxAsync } from "./docx";
import os from "os";
import path from "path";
import fs from "fs";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import { promisify } from "util";

const tempDir = path.join(os.tmpdir(), "lawtext_core_test");

describe("Test HTML amendProvision", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEl({
            tag: "AmendProvision",
            attr: {},
            children: [
                {
                    tag: "AmendProvisionSentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["第十七条の次に次の一条を加える。"],
                        },
                    ],
                },
                {
                    tag: "NewProvision",
                    attr: {},
                    children: [
                        {
                            tag: "Article",
                            attr: {
                                Delete: "false",
                                Hide: "false",
                            },
                            children: [
                                {
                                    tag: "ArticleCaption",
                                    attr: {},
                                    children: ["（株式等の取得及び保有）"],
                                },
                                {
                                    tag: "ArticleTitle",
                                    attr: {},
                                    children: ["第十七条の二"],
                                },
                                {
                                    tag: "Paragraph",
                                    attr: {
                                        OldStyle: "false",
                                    },
                                    children: [
                                        {
                                            tag: "ParagraphNum",
                                            attr: {},
                                            children: [],
                                        },
                                        {
                                            tag: "ParagraphSentence",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["機構は、科学技術・イノベーション創出の活性化に関する法律（平成二十年法律第六十三号）第三十四条の五第一項及び第二項の規定による株式又は新株予約権の取得及び保有を行うことができる。"],
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
        }) as std.AmendProvision;
        const expectedHTML = /*html*/`\
<div class="amend-provision">
  <p class="amend-provision-main indent-1">第十七条の次に次の一条を加える。</p>
  <div class="article">
    <p class="article-caption indent-3">（株式等の取得及び保有）</p>
    <div class="article-body">
      <div class="paragraph-item-Paragraph">
        <p class="paragraph-item-main indent-2">
          <span class="paragraph-item-title">第十七条の二</span>
          <span class="paragraph-item-margin">　</span>
          <span class="paragraph-item-body">機構は、科学技術・イノベーション創出の活性化に関する法律（平成二十年法律第六十三号）第三十四条の五第一項及び第二項の規定による株式又は新株予約権の取得及び保有を行うことができる。</span>
        </p>
      </div>
    </div>
  </div>
</div>
`;
        const element = <HTMLAmendProvision el={input} indent={1} htmlOptions={{}} />;
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
        const tempParsedHtml = path.join(tempDir, "renderer.amendProvision.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});

describe("Test DOCX amendProvision", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEl({
            tag: "AmendProvision",
            attr: {},
            children: [
                {
                    tag: "AmendProvisionSentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["第十七条の次に次の一条を加える。"],
                        },
                    ],
                },
                {
                    tag: "NewProvision",
                    attr: {},
                    children: [
                        {
                            tag: "Article",
                            attr: {
                                Delete: "false",
                                Hide: "false",
                            },
                            children: [
                                {
                                    tag: "ArticleCaption",
                                    attr: {},
                                    children: ["（株式等の取得及び保有）"],
                                },
                                {
                                    tag: "ArticleTitle",
                                    attr: {},
                                    children: ["第十七条の二"],
                                },
                                {
                                    tag: "Paragraph",
                                    attr: {
                                        OldStyle: "false",
                                    },
                                    children: [
                                        {
                                            tag: "ParagraphNum",
                                            attr: {},
                                            children: [],
                                        },
                                        {
                                            tag: "ParagraphSentence",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["機構は、科学技術・イノベーション創出の活性化に関する法律（平成二十年法律第六十三号）第三十四条の五第一項及び第二項の規定による株式又は新株予約権の取得及び保有を行うことができる。"],
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
        }) as std.AmendProvision;
        const expectedDOCX = /*xml*/`\
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>第十七条の次に次の一条を加える。</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent3"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>（株式等の取得及び保有）</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="IndentHanging2"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>第十七条の二</w:t>
  </w:r>
  <w:r>
    <w:t>　</w:t>
  </w:r>
  <w:r>
    <w:t>機構は、科学技術・イノベーション創出の活性化に関する法律（平成二十年法律第六十三号）第三十四条の五第一項及び第二項の規定による株式又は新株予約権の取得及び保有を行うことができる。</w:t>
  </w:r>
</w:p>
`;
        const element = <DOCXAmendProvision el={input} indent={1} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(element);
        const tempParsedDocx = path.join(tempDir, "renderer.amendProvision.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});
