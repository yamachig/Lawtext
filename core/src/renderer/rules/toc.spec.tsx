import React from "react";
import { assert } from "chai";
import loadEL from "../../node/el/loadEL";
import * as std from "../../law/std";
import { DOCXTOC, HTMLTOC } from "./toc";
import { renderToStaticMarkup } from "../common";
import { renderDocxAsync } from "../common/docx";
import ensureTempTestDir from "../../../test/ensureTempTestDir";
import path from "path";
import fs from "fs";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import { promisify } from "util";

describe("Test HTML toc", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEL({
            tag: "TOC",
            attr: {},
            children: [
                {
                    tag: "TOCLabel",
                    attr: {},
                    children: ["目次"],
                },
                {
                    tag: "TOCPreambleLabel",
                    attr: {},
                    children: ["前文"],
                },
                {
                    tag: "TOCArticle",
                    attr: {},
                    children: [
                        {
                            tag: "ArticleTitle",
                            attr: {},
                            children: ["第一条"],
                        },
                        {
                            tag: "ArticleCaption",
                            attr: {},
                            children: ["都市計画法の施行期日"],
                        },
                    ],
                },
                {
                    tag: "TOCChapter",
                    attr: {},
                    children: [
                        {
                            tag: "ChapterTitle",
                            attr: {},
                            children: ["第一章　総則"],
                        },
                        {
                            tag: "ArticleRange",
                            attr: {},
                            children: ["（第一条―第四条）"],
                        },
                    ],
                },
                {
                    tag: "TOCChapter",
                    attr: {},
                    children: [
                        {
                            tag: "ChapterTitle",
                            attr: {},
                            children: ["第二章　申請に対する処分"],
                        },
                        {
                            tag: "ArticleRange",
                            attr: {},
                            children: ["（第五条―第十一条）"],
                        },
                    ],
                },
                {
                    tag: "TOCChapter",
                    attr: {},
                    children: [
                        {
                            tag: "ChapterTitle",
                            attr: {},
                            children: ["第三章　不利益処分"],
                        },
                        {
                            tag: "TOCSection",
                            attr: {},
                            children: [
                                {
                                    tag: "SectionTitle",
                                    attr: {},
                                    children: ["第一節　通則"],
                                },
                                {
                                    tag: "ArticleRange",
                                    attr: {},
                                    children: ["（第十二条―第十四条）"],
                                },
                            ],
                        },
                        {
                            tag: "TOCSection",
                            attr: {},
                            children: [
                                {
                                    tag: "SectionTitle",
                                    attr: {},
                                    children: ["第二節　聴聞"],
                                },
                                {
                                    tag: "ArticleRange",
                                    attr: {},
                                    children: ["（第十五条―第二十八条）"],
                                },
                            ],
                        },
                        {
                            tag: "TOCSection",
                            attr: {},
                            children: [
                                {
                                    tag: "SectionTitle",
                                    attr: {},
                                    children: ["第三節　弁明の機会の付与"],
                                },
                                {
                                    tag: "ArticleRange",
                                    attr: {},
                                    children: ["（第二十九条―第三十一条）"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "TOCChapter",
                    attr: {},
                    children: [
                        {
                            tag: "ChapterTitle",
                            attr: {},
                            children: ["第四章　行政指導"],
                        },
                        {
                            tag: "ArticleRange",
                            attr: {},
                            children: ["（第三十二条―第三十六条の二）"],
                        },
                    ],
                },
                {
                    tag: "TOCChapter",
                    attr: {},
                    children: [
                        {
                            tag: "ChapterTitle",
                            attr: {},
                            children: ["第四章の二　処分等の求め"],
                        },
                        {
                            tag: "ArticleRange",
                            attr: {},
                            children: ["（第三十六条の三）"],
                        },
                    ],
                },
                {
                    tag: "TOCChapter",
                    attr: {},
                    children: [
                        {
                            tag: "ChapterTitle",
                            attr: {},
                            children: ["第五章　届出"],
                        },
                        {
                            tag: "ArticleRange",
                            attr: {},
                            children: ["（第三十七条）"],
                        },
                    ],
                },
                {
                    tag: "TOCChapter",
                    attr: {},
                    children: [
                        {
                            tag: "ChapterTitle",
                            attr: {},
                            children: ["第六章　意見公募手続等"],
                        },
                        {
                            tag: "ArticleRange",
                            attr: {},
                            children: ["（第三十八条―第四十五条）"],
                        },
                    ],
                },
                {
                    tag: "TOCChapter",
                    attr: {},
                    children: [
                        {
                            tag: "ChapterTitle",
                            attr: {},
                            children: ["第七章　補則"],
                        },
                        {
                            tag: "ArticleRange",
                            attr: {},
                            children: ["（第四十六条）"],
                        },
                    ],
                },
                {
                    tag: "TOCSupplProvision",
                    attr: {},
                    children: [
                        {
                            tag: "SupplProvisionLabel",
                            attr: {},
                            children: ["附則"],
                        },
                    ],
                },
            ],
        }) as std.TOC;
        const expectedHTML = /*html*/`\
<div class="toc">
  <div class="toc-label indent-0">目次</div>
  <div class="toc-body">
    <div class="toc-item-TOCPreambleLabel">
      <div class="toc-item-main indent-1">前文</div>
    </div>
    <div class="toc-item-TOCArticle">
      <div class="toc-item-main indent-1">
        <span class="toc-item-title">第一条</span>
        <span class="article-range">都市計画法の施行期日</span>
      </div>
    </div>
    <div class="toc-item-TOCChapter">
      <div class="toc-item-main indent-1">
        <span class="toc-item-title">第一章　総則</span>
        <span class="article-range">（第一条―第四条）</span>
      </div>
    </div>
    <div class="toc-item-TOCChapter">
      <div class="toc-item-main indent-1">
        <span class="toc-item-title">第二章　申請に対する処分</span>
        <span class="article-range">（第五条―第十一条）</span>
      </div>
    </div>
    <div class="toc-item-TOCChapter">
      <div class="toc-item-main indent-1">
        <span class="toc-item-title">第三章　不利益処分</span>
      </div>
      <div class="toc-item-TOCSection">
        <div class="toc-item-main indent-2">
          <span class="toc-item-title">第一節　通則</span>
          <span class="article-range">（第十二条―第十四条）</span>
        </div>
      </div>
      <div class="toc-item-TOCSection">
        <div class="toc-item-main indent-2">
          <span class="toc-item-title">第二節　聴聞</span>
          <span class="article-range">（第十五条―第二十八条）</span>
        </div>
      </div>
      <div class="toc-item-TOCSection">
        <div class="toc-item-main indent-2">
          <span class="toc-item-title">第三節　弁明の機会の付与</span>
          <span class="article-range">（第二十九条―第三十一条）</span>
        </div>
      </div>
    </div>
    <div class="toc-item-TOCChapter">
      <div class="toc-item-main indent-1">
        <span class="toc-item-title">第四章　行政指導</span>
        <span class="article-range">（第三十二条―第三十六条の二）</span>
      </div>
    </div>
    <div class="toc-item-TOCChapter">
      <div class="toc-item-main indent-1">
        <span class="toc-item-title">第四章の二　処分等の求め</span>
        <span class="article-range">（第三十六条の三）</span>
      </div>
    </div>
    <div class="toc-item-TOCChapter">
      <div class="toc-item-main indent-1">
        <span class="toc-item-title">第五章　届出</span>
        <span class="article-range">（第三十七条）</span>
      </div>
    </div>
    <div class="toc-item-TOCChapter">
      <div class="toc-item-main indent-1">
        <span class="toc-item-title">第六章　意見公募手続等</span>
        <span class="article-range">（第三十八条―第四十五条）</span>
      </div>
    </div>
    <div class="toc-item-TOCChapter">
      <div class="toc-item-main indent-1">
        <span class="toc-item-title">第七章　補則</span>
        <span class="article-range">（第四十六条）</span>
      </div>
    </div>
    <div class="toc-item-TOCSupplProvision">
      <div class="toc-item-main indent-1">
        <span class="toc-item-title">附則</span>
      </div>
    </div>
  </div>
</div>
`;
        const element = <HTMLTOC el={input} indent={0} htmlOptions={{}} />;
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
        const tempParsedHtml = path.join(ensureTempTestDir(), "renderer.toc.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});

describe("Test DOCX toc", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEL({
            tag: "TOC",
            attr: {},
            children: [
                {
                    tag: "TOCLabel",
                    attr: {},
                    children: ["目次"],
                },
                {
                    tag: "TOCPreambleLabel",
                    attr: {},
                    children: ["前文"],
                },
                {
                    tag: "TOCArticle",
                    attr: {},
                    children: [
                        {
                            tag: "ArticleTitle",
                            attr: {},
                            children: ["第一条"],
                        },
                        {
                            tag: "ArticleCaption",
                            attr: {},
                            children: ["都市計画法の施行期日"],
                        },
                    ],
                },
                {
                    tag: "TOCChapter",
                    attr: {},
                    children: [
                        {
                            tag: "ChapterTitle",
                            attr: {},
                            children: ["第一章　総則"],
                        },
                        {
                            tag: "ArticleRange",
                            attr: {},
                            children: ["（第一条―第四条）"],
                        },
                    ],
                },
                {
                    tag: "TOCChapter",
                    attr: {},
                    children: [
                        {
                            tag: "ChapterTitle",
                            attr: {},
                            children: ["第二章　申請に対する処分"],
                        },
                        {
                            tag: "ArticleRange",
                            attr: {},
                            children: ["（第五条―第十一条）"],
                        },
                    ],
                },
                {
                    tag: "TOCChapter",
                    attr: {},
                    children: [
                        {
                            tag: "ChapterTitle",
                            attr: {},
                            children: ["第三章　不利益処分"],
                        },
                        {
                            tag: "TOCSection",
                            attr: {},
                            children: [
                                {
                                    tag: "SectionTitle",
                                    attr: {},
                                    children: ["第一節　通則"],
                                },
                                {
                                    tag: "ArticleRange",
                                    attr: {},
                                    children: ["（第十二条―第十四条）"],
                                },
                            ],
                        },
                        {
                            tag: "TOCSection",
                            attr: {},
                            children: [
                                {
                                    tag: "SectionTitle",
                                    attr: {},
                                    children: ["第二節　聴聞"],
                                },
                                {
                                    tag: "ArticleRange",
                                    attr: {},
                                    children: ["（第十五条―第二十八条）"],
                                },
                            ],
                        },
                        {
                            tag: "TOCSection",
                            attr: {},
                            children: [
                                {
                                    tag: "SectionTitle",
                                    attr: {},
                                    children: ["第三節　弁明の機会の付与"],
                                },
                                {
                                    tag: "ArticleRange",
                                    attr: {},
                                    children: ["（第二十九条―第三十一条）"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "TOCChapter",
                    attr: {},
                    children: [
                        {
                            tag: "ChapterTitle",
                            attr: {},
                            children: ["第四章　行政指導"],
                        },
                        {
                            tag: "ArticleRange",
                            attr: {},
                            children: ["（第三十二条―第三十六条の二）"],
                        },
                    ],
                },
                {
                    tag: "TOCChapter",
                    attr: {},
                    children: [
                        {
                            tag: "ChapterTitle",
                            attr: {},
                            children: ["第四章の二　処分等の求め"],
                        },
                        {
                            tag: "ArticleRange",
                            attr: {},
                            children: ["（第三十六条の三）"],
                        },
                    ],
                },
                {
                    tag: "TOCChapter",
                    attr: {},
                    children: [
                        {
                            tag: "ChapterTitle",
                            attr: {},
                            children: ["第五章　届出"],
                        },
                        {
                            tag: "ArticleRange",
                            attr: {},
                            children: ["（第三十七条）"],
                        },
                    ],
                },
                {
                    tag: "TOCChapter",
                    attr: {},
                    children: [
                        {
                            tag: "ChapterTitle",
                            attr: {},
                            children: ["第六章　意見公募手続等"],
                        },
                        {
                            tag: "ArticleRange",
                            attr: {},
                            children: ["（第三十八条―第四十五条）"],
                        },
                    ],
                },
                {
                    tag: "TOCChapter",
                    attr: {},
                    children: [
                        {
                            tag: "ChapterTitle",
                            attr: {},
                            children: ["第七章　補則"],
                        },
                        {
                            tag: "ArticleRange",
                            attr: {},
                            children: ["（第四十六条）"],
                        },
                    ],
                },
                {
                    tag: "TOCSupplProvision",
                    attr: {},
                    children: [
                        {
                            tag: "SupplProvisionLabel",
                            attr: {},
                            children: ["附則"],
                        },
                    ],
                },
            ],
        }) as std.TOC;
        const expectedDOCX = /*xml*/`\
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent0"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>目次</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>前文</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>第一条</w:t>
  </w:r>
  <w:r>
    <w:t>都市計画法の施行期日</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>第一章　総則</w:t>
  </w:r>
  <w:r>
    <w:t>（第一条―第四条）</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>第二章　申請に対する処分</w:t>
  </w:r>
  <w:r>
    <w:t>（第五条―第十一条）</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>第三章　不利益処分</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent2"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>第一節　通則</w:t>
  </w:r>
  <w:r>
    <w:t>（第十二条―第十四条）</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent2"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>第二節　聴聞</w:t>
  </w:r>
  <w:r>
    <w:t>（第十五条―第二十八条）</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent2"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>第三節　弁明の機会の付与</w:t>
  </w:r>
  <w:r>
    <w:t>（第二十九条―第三十一条）</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>第四章　行政指導</w:t>
  </w:r>
  <w:r>
    <w:t>（第三十二条―第三十六条の二）</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>第四章の二　処分等の求め</w:t>
  </w:r>
  <w:r>
    <w:t>（第三十六条の三）</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>第五章　届出</w:t>
  </w:r>
  <w:r>
    <w:t>（第三十七条）</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>第六章　意見公募手続等</w:t>
  </w:r>
  <w:r>
    <w:t>（第三十八条―第四十五条）</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>第七章　補則</w:t>
  </w:r>
  <w:r>
    <w:t>（第四十六条）</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>附則</w:t>
  </w:r>
</w:p>
`;
        const element = <DOCXTOC el={input} indent={0} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(element);
        const tempParsedDocx = path.join(ensureTempTestDir(), "renderer.toc.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});
