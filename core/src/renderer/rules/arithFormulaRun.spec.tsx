import React from "react";
import { assert } from "chai";
import { DOCXArithFormulaRun, HTMLArithFormulaRun } from "./arithFormulaRun";
import loadEL from "../../node/el/loadEL";
import * as std from "../../law/std";
import { renderToStaticMarkup } from "../common";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import path from "path";
import { promisify } from "util";
import fs from "fs";
import ensureTempTestDir from "../../../test/ensureTempTestDir";
import { renderDocxAsync, w } from "../common/docx";
import { DOCXColumnsOrSentencesRun, HTMLColumnsOrSentencesRun } from "./columnsOrSentencesRun";

describe("Test HTML arithFormulaRun", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEL({
            tag: "ArithFormula",
            attr: {},
            children: [
                {
                    tag: "Sentence",
                    attr: {},
                    children: ["Ｐｃ′／Ｐｃ×０．８＋Ｐｉ′／Ｐｉ×０．２"],
                },
            ],
        }) as std.ArithFormula;
        const expectedHTML = /*html*/`\
<span class="arith-formula">Ｐｃ′／Ｐｃ×０．８＋Ｐｉ′／Ｐｉ×０．２</span>
`;
        const element = <HTMLArithFormulaRun el={input} htmlOptions={{}} />;
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
        const tempParsedHtml = path.join(ensureTempTestDir(), "renderer.arithFormulaRun-1.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });

    it("Success case", async () => {
        const input = loadEL({
            tag: "Sentence",
            attr: {},
            children: [
                "testtest1",
                {
                    tag: "ArithFormula",
                    attr: {},
                    children: [
                        {
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
                        },
                    ],
                },
                "testtest2",
            ],
        }) as std.Sentence;
        const expectedHTML = /*html*/`\
testtest1<span class="arith-formula" style="display:inline-block"><div class="paragraph-item-Item paragraph-item-any"><div class="paragraph-item-decoration-block" style="--paragraph-item-indent:0em"><div class="paragraph-item-decoration-left-border"></div></div><div class="paragraph-item-main indent-0"><span class="paragraph-item-title">一</span><span class="paragraph-item-margin">　</span><span class="paragraph-item-body"><span class="lawtext-column">法令</span><span class="lawtext-column-margin">　</span><span class="lawtext-column">法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。</span></span></div></div></span>testtest2
`;
        const element = <HTMLColumnsOrSentencesRun els={[input]} htmlOptions={{}} />;
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
        const tempParsedHtml = path.join(ensureTempTestDir(), "renderer.arithFormulaRun-2.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});


describe("Test DOCX arithFormulaRun", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {

        const input = loadEL({
            tag: "ArithFormula",
            attr: {},
            children: [
                {
                    tag: "Sentence",
                    attr: {},
                    children: ["Ｐｃ′／Ｐｃ×０．８＋Ｐｉ′／Ｐｉ×０．２"],
                },
            ],
        }) as std.ArithFormula;
        const expectedDOCX = /*xml*/`\
<w:r>
  <w:t>Ｐｃ′／Ｐｃ×０．８＋Ｐｉ′／Ｐｉ×０．２</w:t>
</w:r>
`;
        const element = <DOCXArithFormulaRun el={input} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(<w.p>{element}</w.p>);
        const tempParsedDocx = path.join(ensureTempTestDir(), "renderer.arithFormulaRun-1.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });

    it("Success case", async () => {

        const input = loadEL({
            tag: "Sentence",
            attr: {},
            children: [
                "testtest1",
                {
                    tag: "ArithFormula",
                    attr: {},
                    children: [
                        {
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
                        },
                    ],
                },
                "testtest2",
            ],
        }) as std.Sentence;
        const arithFormula = input.children.find(std.isArithFormula);
        if (arithFormula) arithFormula.id = 1111;
        const expectedDOCX = /*xml*/`\
<w:r>
  <w:t>testtest1</w:t>
</w:r>
<w:r>
  <w:drawing>
    <wp:inline distT="0" distB="0" distL="0" distR="0">
      <wp:extent cx="0" cy="0"></wp:extent>
      <wp:docPr id="11111" name="ArithFormula1111"></wp:docPr>
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
                    <w:pStyle w:val="IndentHanging0"></w:pStyle>
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
<w:r>
  <w:t>testtest2</w:t>
</w:r>
`;
        const element = <DOCXColumnsOrSentencesRun els={[input]} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(<w.p>{element}</w.p>);
        const tempParsedDocx = path.join(ensureTempTestDir(), "renderer.arithFormulaRun-2.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});
