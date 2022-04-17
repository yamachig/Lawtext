import React from "react";
import { assert } from "chai";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import { loadEl } from "../../node/el";
import * as std from "../../law/std";
import { renderToStaticMarkup } from "../common";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import path from "path";
import { promisify } from "util";
import fs from "fs";
import os from "os";
import { renderDocxAsync, w } from "../common/docx";

const tempDir = path.join(os.tmpdir(), "lawtext_core_test");

describe("Test HTML sentenceChildrenRun", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEl({
            tag: "Sentence",
            attr: {},
            children: [
                {
                    tag: "__Text",
                    attr: {},
                    children: ["この法律において"],
                },
                {
                    tag: "__Parentheses",
                    attr: {
                        depth: "1",
                        type: "square",
                    },
                    children: [
                        {
                            tag: "__PStart",
                            attr: {
                                type: "square",
                            },
                            children: ["「"],
                        },
                        {
                            tag: "__PContent",
                            attr: { type: "square" },
                            children: [
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["スパイクタイヤ"],
                                },
                            ],
                        },
                        {
                            tag: "__PEnd",
                            attr: { "type": "square" },
                            children: ["」"],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["とは、積雪又は凍結の状態にある路面において滑ることを防止するために金属"],
                },
                {
                    tag: "Ruby",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["鋲"],
                        },
                        {
                            tag: "Rt",
                            attr: {},
                            children: [
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["びよう"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["その他これに類する物をその接地部に固定したタイヤをいう。"],
                },
            ],
        }) as std.Sentence;
        const expectedHTML = /*html*/`\
この法律において「スパイクタイヤ」とは、積雪又は凍結の状態にある路面において滑ることを防止するために金属<ruby>鋲<rt>びよう</rt></ruby>その他これに類する物をその接地部に固定したタイヤをいう。
`;
        const element = <HTMLSentenceChildrenRun els={input.children} htmlOptions={{}} />;
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
        const tempParsedHtml = path.join(tempDir, "renderer.sentenceChildrenRun.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});


describe("Test DOCX sentenceChildrenRun", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {

        const input = loadEl({
            tag: "Sentence",
            attr: {},
            children: [
                {
                    tag: "__Text",
                    attr: {},
                    children: ["この法律において"],
                },
                {
                    tag: "__Parentheses",
                    attr: {
                        depth: "1",
                        type: "square",
                    },
                    children: [
                        {
                            tag: "__PStart",
                            attr: {
                                type: "square",
                            },
                            children: ["「"],
                        },
                        {
                            tag: "__PContent",
                            attr: { type: "square" },
                            children: [
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["スパイクタイヤ"],
                                },
                            ],
                        },
                        {
                            tag: "__PEnd",
                            attr: { "type": "square" },
                            children: ["」"],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["とは、積雪又は凍結の状態にある路面において滑ることを防止するために金属"],
                },
                {
                    tag: "Ruby",
                    attr: {},
                    children: [
                        {
                            tag: "__Text",
                            attr: {},
                            children: ["鋲"],
                        },
                        {
                            tag: "Rt",
                            attr: {},
                            children: [
                                {
                                    tag: "__Text",
                                    attr: {},
                                    children: ["びよう"],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["その他これに類する物をその接地部に固定したタイヤをいう。"],
                },
            ],
        }) as std.Sentence;
        const expectedDOCX = /*xml*/`\
<w:r>
  <w:t>この法律において</w:t>
</w:r>
<w:r>
  <w:t>「スパイクタイヤ」</w:t>
</w:r>
<w:r>
  <w:t>とは、積雪又は凍結の状態にある路面において滑ることを防止するために金属</w:t>
</w:r>
<w:r>
  <w:ruby>
    <w:rt>
      <w:r>
        <w:t>びよう</w:t>
      </w:r>
    </w:rt>
    <w:rubyBase>
      <w:r>
        <w:t>鋲</w:t>
      </w:r>
    </w:rubyBase>
  </w:ruby>
</w:r>
<w:r>
  <w:t>その他これに類する物をその接地部に固定したタイヤをいう。</w:t>
</w:r>
`;
        const element = <DOCXSentenceChildrenRun els={input.children} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(<w.p>{element}</w.p>);
        const tempParsedDocx = path.join(tempDir, "renderer.sentenceChildrenRun.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});
