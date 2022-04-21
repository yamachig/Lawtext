import React from "react";
import { assert } from "chai";
import { loadEl } from "../../node/el";
import * as std from "../../law/std";
import { DOCXLaw, HTMLLaw } from "./law";
import { renderToStaticMarkup } from "../common";
import { renderDocxAsync } from "../common/docx";
import os from "os";
import path from "path";
import fs from "fs";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import { promisify } from "util";

const tempDir = path.join(os.tmpdir(), "lawtext_core_test");

describe("Test HTML law", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEl({
            tag: "Law",
            attr: {
                Era: "Heisei",
                Lang: "ja",
                LawType: "Act",
                Num: "88",
                Year: "5",
            },
            children: [
                {
                    tag: "LawNum",
                    attr: {},
                    children: ["平成五年法律第八十八号"],
                },
                {
                    tag: "LawBody",
                    attr: {},
                    children: [
                        {
                            tag: "LawTitle",
                            attr: {},
                            children: ["行政手続法"],
                        },
                        {
                            tag: "MainProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "Chapter",
                                    attr: {
                                        Delete: "false",
                                        Hide: "false",
                                        Num: "1",
                                    },
                                    children: [
                                        {
                                            tag: "ChapterTitle",
                                            attr: {},
                                            children: ["第一章　総則"],
                                        },
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
                                                    children: ["（目的等）"],
                                                },
                                                {
                                                    tag: "ArticleTitle",
                                                    attr: {},
                                                    children: ["第一条"],
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
                                                                    children: ["この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。"],
                                                                },
                                                            ],
                                                        },
                                                    ],
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
                                                            children: ["２"],
                                                        },
                                                        {
                                                            tag: "ParagraphSentence",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。"],
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
                        },
                    ],
                },
            ],
        }) as std.Law;
        const expectedHTML = /*html*/`\
<div class="law">
  <div class="law-title indent-0">行政手続法</div>
  <div class="law-num indent-0">（平成五年法律第八十八号）</div>
  <div class="empty">
    <br/>
  </div>
  <div class="law-body">
    <div class="main-provision">
      <div class="main-provision-body">
        <div class="article-group">
          <div class="article-group-title indent-3">第一章　総則</div>
          <div class="empty">
            <br/>
          </div>
          <div class="article-group-body">
            <div class="article">
              <div class="article-caption indent-1">（目的等）</div>
              <div class="article-body">
                <div class="paragraph-item-Paragraph">
                  <div class="paragraph-item-main indent-0">
                    <span class="article-title">第一条</span>
                    <span class="paragraph-item-margin">　</span>
                    <span class="paragraph-item-body">この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。</span>
                  </div>
                </div>
                <div class="paragraph-item-Paragraph">
                  <div class="paragraph-item-main indent-0">
                    <span class="paragraph-item-title">２</span>
                    <span class="paragraph-item-margin">　</span>
                    <span class="paragraph-item-body">処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`;
        const element = <HTMLLaw el={input} indent={0} htmlOptions={{}} />;
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
        const tempParsedHtml = path.join(tempDir, "renderer.law.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});

describe("Test DOCX law", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEl({
            tag: "Law",
            attr: {
                Era: "Heisei",
                Lang: "ja",
                LawType: "Act",
                Num: "88",
                Year: "5",
            },
            children: [
                {
                    tag: "LawNum",
                    attr: {},
                    children: ["平成五年法律第八十八号"],
                },
                {
                    tag: "LawBody",
                    attr: {},
                    children: [
                        {
                            tag: "LawTitle",
                            attr: {},
                            children: ["行政手続法"],
                        },
                        {
                            tag: "MainProvision",
                            attr: {},
                            children: [
                                {
                                    tag: "Chapter",
                                    attr: {
                                        Delete: "false",
                                        Hide: "false",
                                        Num: "1",
                                    },
                                    children: [
                                        {
                                            tag: "ChapterTitle",
                                            attr: {},
                                            children: ["第一章　総則"],
                                        },
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
                                                    children: ["（目的等）"],
                                                },
                                                {
                                                    tag: "ArticleTitle",
                                                    attr: {},
                                                    children: ["第一条"],
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
                                                                    children: ["この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。"],
                                                                },
                                                            ],
                                                        },
                                                    ],
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
                                                            children: ["２"],
                                                        },
                                                        {
                                                            tag: "ParagraphSentence",
                                                            attr: {},
                                                            children: [
                                                                {
                                                                    tag: "Sentence",
                                                                    attr: {},
                                                                    children: ["処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。"],
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
                        },
                    ],
                },
            ],
        }) as std.Law;
        const expectedDOCX = /*xml*/`\
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent0"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>行政手続法</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent0"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>（</w:t>
  </w:r>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>平成五年法律第八十八号</w:t>
  </w:r>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>）</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="EmptyParagraph"></w:pStyle>
  </w:pPr>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="IndentHanging3"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>第一章　総則</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="EmptyParagraph"></w:pStyle>
  </w:pPr>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>（目的等）</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="IndentHanging0"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>第一条</w:t>
  </w:r>
  <w:r>
    <w:t>　</w:t>
  </w:r>
  <w:r>
    <w:t>この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="IndentHanging0"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>２</w:t>
  </w:r>
  <w:r>
    <w:t>　</w:t>
  </w:r>
  <w:r>
    <w:t>処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。</w:t>
  </w:r>
</w:p>
`;
        const element = <DOCXLaw el={input} indent={0} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(element);
        const tempParsedDocx = path.join(tempDir, "renderer.law.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});
