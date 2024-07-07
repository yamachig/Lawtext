import React from "react";
import { assert } from "chai";
import loadEL from "../../node/el/loadEL";
import * as std from "../../law/std";
import { DOCXList, HTMLList } from "./list";
import { renderToStaticMarkup } from "../common";
import { renderDocxAsync } from "../common/docx/file";
import ensureTempTestDir from "../../../test/ensureTempTestDir";
import path from "path";
import fs from "fs";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import { promisify } from "util";

describe("Test HTML list", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEL({
            tag: "List",
            attr: {},
            children: [
                {
                    tag: "ListSentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["管区行政評価局"],
                        },
                    ],
                },
                {
                    tag: "Sublist1",
                    attr: {},
                    children: [
                        {
                            tag: "Sublist1Sentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["総合通信局"],
                                },
                            ],
                        },
                    ],
                },
            ],
        }) as std.List;
        const expectedHTML = /*html*/`\
<div class="list-List">
  <div class="list-main indent-1">管区行政評価局</div>
  <div class="list-Sublist1">
    <div class="list-main indent-3">総合通信局</div>
  </div>
</div>
`;
        const element = <HTMLList el={input} indent={1} htmlOptions={{}} />;
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
        const tempParsedHtml = path.join(ensureTempTestDir(), "renderer.list.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});

describe("Test DOCX list", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEL({
            tag: "List",
            attr: {},
            children: [
                {
                    tag: "ListSentence",
                    attr: {},
                    children: [
                        {
                            tag: "Sentence",
                            attr: {},
                            children: ["管区行政評価局"],
                        },
                    ],
                },
                {
                    tag: "Sublist1",
                    attr: {},
                    children: [
                        {
                            tag: "Sublist1Sentence",
                            attr: {},
                            children: [
                                {
                                    tag: "Sentence",
                                    attr: {},
                                    children: ["総合通信局"],
                                },
                            ],
                        },
                    ],
                },
            ],
        }) as std.List;
        const expectedDOCX = /*xml*/`\
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>管区行政評価局</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent3"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>総合通信局</w:t>
  </w:r>
</w:p>
`;
        const element = <DOCXList el={input} indent={1} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(element);
        const tempParsedDocx = path.join(ensureTempTestDir(), "renderer.list.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});
