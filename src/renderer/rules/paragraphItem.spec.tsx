import React from "react";
import { assert } from "chai";
import { loadEl } from "../../node/el";
import * as std from "../../law/std";
import { DOCXParagraphItem, HTMLParagraphItem } from "./paragraphItem";
import { renderToStaticMarkup } from "./common";
import { renderDocxAsync } from "./docx";
import os from "os";
import path from "path";
import fs from "fs";

const tempDir = path.join(os.tmpdir(), "lawtext_core_test");

describe("Test HTML paragraphItem", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", () => {
        const input = loadEl({
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
        }) as std.Item;
        const expectedHTML = /*html*/`\
<div class="paragraph-item-Item">
  <div class="paragraph-item-main">
    <span class="paragraph-item-title" style="font-weight:bold">一</span>
    <span class="paragraph-item-margin">　</span>
    <span class="paragraph-item-body">
      <span class="lawtext-column">法令</span>
      <span class="lawtext-column-margin">　</span>
      <span class="lawtext-column">法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。</span>
    </span>
  </div>
</div>
`.replace(/\r?\n$/g, "").replace(/\r?\n\s*/g, "");
        const element = <HTMLParagraphItem el={input} indent={1} htmlOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        assert.strictEqual(rendered, expectedHTML);
    });
});

describe("Test DOCX paragraphItem", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", () => {
        const input = loadEl({
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
        }) as std.Item;
        const expectedDOCX = /*xml*/`\
<w:p>
  <w:pPr>
    <w:pStyle w:val="Item"></w:pStyle>
  </w:pPr>
  <w:r><w:t>一</w:t></w:r>
  <w:r><w:t>　</w:t></w:r>
  <w:r><w:t>法令</w:t></w:r>
  <w:r><w:t>　</w:t></w:r><w:r>
  <w:t>法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。</w:t></w:r>
</w:p>
`.replace(/\r?\n$/g, "").replace(/\r?\n\s*/g, "");
        const element = <DOCXParagraphItem el={input} indent={1} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        assert.strictEqual(rendered, expectedDOCX);
        renderDocxAsync(element)
            .then(u8 => {
                const tempParsedDocx = path.join(tempDir, "renderer.paragraphItem.docx");
                fs.writeFileSync(tempParsedDocx, u8);
                console.log(`Saved docx: ${tempParsedDocx}`);
            });
    });
});
