import React from "react";
import { assert } from "chai";
import { loadEl } from "../../node/el";
import * as std from "../../law/std";
import { DOCXArticle, HTMLArticle } from "./article";
import { renderToStaticMarkup } from "../common";
import { renderDocxAsync } from "../common/docx";
import os from "os";
import path from "path";
import fs from "fs";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import { promisify } from "util";

const tempDir = path.join(os.tmpdir(), "lawtext_core_test");

describe("Test HTML article", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEl({
            tag: "Article",
            attr: {
                Delete: "false",
                Hide: "false",
            },
            children: [
                {
                    tag: "ArticleCaption",
                    attr: {},
                    children: ["（定義）"],
                },
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第二条"],
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
                                    children: ["この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。"],
                                },
                            ],
                        },
                        {
                            tag: "Item",
                            attr: {
                                Delete: "false",
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
                        },
                        {
                            tag: "Item",
                            attr: {
                                Delete: "false",
                            },
                            children: [
                                {
                                    tag: "ItemTitle",
                                    attr: {},
                                    children: ["四"],
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
                                                    children: ["不利益処分"],
                                                },
                                            ],
                                        },
                                        {
                                            tag: "Column",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {
                                                        Num: "1",
                                                        Function: "main",
                                                    },
                                                    children: ["行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。"],
                                                },
                                                {
                                                    tag: "Sentence",
                                                    attr: {
                                                        Num: "2",
                                                        Function: "proviso",
                                                    },
                                                    children: ["ただし、次のいずれかに該当するものを除く。"],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    tag: "Subitem1",
                                    attr: {
                                        Delete: "false",
                                    },
                                    children: [
                                        {
                                            tag: "Subitem1Title",
                                            attr: {},
                                            children: ["イ"],
                                        },
                                        {
                                            tag: "Subitem1Sentence",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["事実上の行為及び事実上の行為をするに当たりその範囲、時期等を明らかにするために法令上必要とされている手続としての処分"],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    tag: "Subitem1",
                                    attr: {
                                        Delete: "false",
                                    },
                                    children: [
                                        {
                                            tag: "Subitem1Title",
                                            attr: {},
                                            children: ["ロ"],
                                        },
                                        {
                                            tag: "Subitem1Sentence",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["申請により求められた許認可等を拒否する処分その他申請に基づき当該申請をした者を名あて人としてされる処分"],
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
                                    children: ["次に掲げる処分及び行政指導については、次章から第四章の二までの規定は、適用しない。"],
                                },
                            ],
                        },
                    ],
                },
            ],
        }) as std.Article;
        const expectedHTML = /*html*/`\
<div class="article">
  <div class="article-caption indent-1">（定義）</div>
  <div class="article-body">
    <div class="paragraph-item-Paragraph">
      <div class="paragraph-item-main indent-0">
        <span class="paragraph-item-title">第二条</span>
        <span class="paragraph-item-margin">　</span>
        <span class="paragraph-item-body">この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。</span>
      </div>
      <div class="paragraph-item-Item">
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
      <div class="paragraph-item-Item">
        <div class="paragraph-item-main indent-1">
          <span class="paragraph-item-title">四</span>
          <span class="paragraph-item-margin">　</span>
          <span class="paragraph-item-body">
            <span class="lawtext-column">不利益処分</span>
            <span class="lawtext-column-margin">　</span>
            <span class="lawtext-column">行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。ただし、次のいずれかに該当するものを除く。</span>
          </span>
        </div>
        <div class="paragraph-item-Subitem1">
          <div class="paragraph-item-main indent-2">
            <span class="paragraph-item-title">イ</span>
            <span class="paragraph-item-margin">　</span>
            <span class="paragraph-item-body">事実上の行為及び事実上の行為をするに当たりその範囲、時期等を明らかにするために法令上必要とされている手続としての処分</span>
          </div>
        </div>
        <div class="paragraph-item-Subitem1">
          <div class="paragraph-item-main indent-2">
            <span class="paragraph-item-title">ロ</span>
            <span class="paragraph-item-margin">　</span>
            <span class="paragraph-item-body">申請により求められた許認可等を拒否する処分その他申請に基づき当該申請をした者を名あて人としてされる処分</span>
          </div>
        </div>
      </div>
    </div>
    <div class="paragraph-item-Paragraph">
      <div class="paragraph-item-main indent-0">
        <span class="paragraph-item-title">２</span>
        <span class="paragraph-item-margin">　</span>
        <span class="paragraph-item-body">次に掲げる処分及び行政指導については、次章から第四章の二までの規定は、適用しない。</span>
      </div>
    </div>
  </div>
</div>
`;
        const element = <HTMLArticle el={input} indent={0} htmlOptions={{}} />;
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
        const tempParsedHtml = path.join(tempDir, "renderer.article.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});

describe("Test DOCX article", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEl({
            tag: "Article",
            attr: {
                Delete: "false",
                Hide: "false",
            },
            children: [
                {
                    tag: "ArticleCaption",
                    attr: {},
                    children: ["（定義）"],
                },
                {
                    tag: "ArticleTitle",
                    attr: {},
                    children: ["第二条"],
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
                                    children: ["この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。"],
                                },
                            ],
                        },
                        {
                            tag: "Item",
                            attr: {
                                Delete: "false",
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
                        },
                        {
                            tag: "Item",
                            attr: {
                                Delete: "false",
                            },
                            children: [
                                {
                                    tag: "ItemTitle",
                                    attr: {},
                                    children: ["四"],
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
                                                    children: ["不利益処分"],
                                                },
                                            ],
                                        },
                                        {
                                            tag: "Column",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {
                                                        Num: "1",
                                                        Function: "main",
                                                    },
                                                    children: ["行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。"],
                                                },
                                                {
                                                    tag: "Sentence",
                                                    attr: {
                                                        Num: "2",
                                                        Function: "proviso",
                                                    },
                                                    children: ["ただし、次のいずれかに該当するものを除く。"],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    tag: "Subitem1",
                                    attr: {
                                        Delete: "false",
                                    },
                                    children: [
                                        {
                                            tag: "Subitem1Title",
                                            attr: {},
                                            children: ["イ"],
                                        },
                                        {
                                            tag: "Subitem1Sentence",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["事実上の行為及び事実上の行為をするに当たりその範囲、時期等を明らかにするために法令上必要とされている手続としての処分"],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    tag: "Subitem1",
                                    attr: {
                                        Delete: "false",
                                    },
                                    children: [
                                        {
                                            tag: "Subitem1Title",
                                            attr: {},
                                            children: ["ロ"],
                                        },
                                        {
                                            tag: "Subitem1Sentence",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["申請により求められた許認可等を拒否する処分その他申請に基づき当該申請をした者を名あて人としてされる処分"],
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
                                    children: ["次に掲げる処分及び行政指導については、次章から第四章の二までの規定は、適用しない。"],
                                },
                            ],
                        },
                    ],
                },
            ],
        }) as std.Article;
        const expectedDOCX = /*xml*/`\
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>（定義）</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="IndentHanging0"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>第二条</w:t>
  </w:r>
  <w:r>
    <w:t>　</w:t>
  </w:r>
  <w:r>
    <w:t>この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。</w:t>
  </w:r>
</w:p>
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
<w:p>
  <w:pPr>
    <w:pStyle w:val="IndentHanging1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>四</w:t>
  </w:r>
  <w:r>
    <w:t>　</w:t>
  </w:r>
  <w:r>
    <w:t>不利益処分</w:t>
  </w:r>
  <w:r>
    <w:t>　</w:t>
  </w:r>
  <w:r>
    <w:t>行政庁が、法令に基づき、特定の者を名あて人として、直接に、これに義務を課し、又はその権利を制限する処分をいう。</w:t>
  </w:r>
  <w:r>
    <w:t>ただし、次のいずれかに該当するものを除く。</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="IndentHanging2"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>イ</w:t>
  </w:r>
  <w:r>
    <w:t>　</w:t>
  </w:r>
  <w:r>
    <w:t>事実上の行為及び事実上の行為をするに当たりその範囲、時期等を明らかにするために法令上必要とされている手続としての処分</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="IndentHanging2"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>ロ</w:t>
  </w:r>
  <w:r>
    <w:t>　</w:t>
  </w:r>
  <w:r>
    <w:t>申請により求められた許認可等を拒否する処分その他申請に基づき当該申請をした者を名あて人としてされる処分</w:t>
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
    <w:t>次に掲げる処分及び行政指導については、次章から第四章の二までの規定は、適用しない。</w:t>
  </w:r>
</w:p>
`;
        const element = <DOCXArticle el={input} indent={0} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(element);
        const tempParsedDocx = path.join(tempDir, "renderer.article.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});
