import React from "react";
import { assert } from "chai";
import { loadEl } from "../../node/el";
import * as std from "../../law/std";
import { DOCXColumnsOrSentencesRun, HTMLColumnsOrSentencesRun } from "./columnsOrSentencesRun";
import { renderToStaticMarkup } from "./common";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import path from "path";
import { promisify } from "util";
import fs from "fs";
import os from "os";
import { renderDocxAsync, w } from "./docx";

const tempDir = path.join(os.tmpdir(), "lawtext_core_test");


describe("Test HTML columnsOrSentencesRun", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEl({
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
        }) as std.ItemSentence;
        const expectedHTML = /*html*/`\
<span class="lawtext-column">法令</span>
<span class="lawtext-column-margin">　</span>
<span class="lawtext-column">法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。</span>
`;
        const element = <HTMLColumnsOrSentencesRun els={input.children} htmlOptions={{}} />;
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
        const tempParsedHtml = path.join(tempDir, "renderer.columnsOrSentencesRun.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});


describe("Test DOCX columnsOrSentencesRun", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEl({
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
        }) as std.ItemSentence;
        const expectedDOCX = /*xml*/`\
<w:r>
  <w:t>法令</w:t>
</w:r>
<w:r>
  <w:t>　</w:t>
</w:r>
<w:r>
  <w:t>法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。</w:t>
</w:r>
`;
        const element = <DOCXColumnsOrSentencesRun els={input.children} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(<w.p>{element}</w.p>);
        const tempParsedDocx = path.join(tempDir, "renderer.columnsOrSentencesRun.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});
