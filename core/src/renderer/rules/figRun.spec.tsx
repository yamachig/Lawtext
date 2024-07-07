import React from "react";
import { assert } from "chai";
import { DOCXFigRun, HTMLFigRun } from "./figRun";
import loadEL from "../../node/el/loadEL";
import * as std from "../../law/std";
import { renderToStaticMarkup } from "../common";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import path from "path";
import { promisify } from "util";
import fs from "fs";
import ensureTempTestDir from "../../../test/ensureTempTestDir";
import { renderDocxAsync } from "../common/docx/file";
import { w } from "../common/docx/tags";
import FigDataManager from "../common/docx/FigDataManager";
import { decodeBase64 } from "../../util";
import { DOCXOptions } from "../common/docx/component";
import { unzip } from "../../util/zip";

describe("Test HTML figRun", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEL({
            tag: "Fig",
            attr: { src: "./pict/S27F03901000056-005.jpg" },
            children: [],
        }) as std.Fig;
        const expectedHTML = /*html*/`\
<span class="fig-src">./pict/S27F03901000056-005.jpg</span>
`;
        const element = <HTMLFigRun el={input} htmlOptions={{}} />;
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
        const tempParsedHtml = path.join(ensureTempTestDir(), "renderer.figRun.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});


describe("Test DOCX figRun", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case: without figDataManager", async () => {

        const input = loadEL({
            tag: "Fig",
            attr: { src: "./pict/S27F03901000056-005.jpg" },
            children: [],
        }) as std.Fig;
        const expectedDOCX = /*xml*/`\
<w:r>
  <w:t>./pict/S27F03901000056-005.jpg</w:t>
</w:r>
`;
        const element = <DOCXFigRun el={input} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(<w.p>{element}</w.p>);
        const tempParsedDocx = path.join(ensureTempTestDir(), "renderer.figRun.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });

    it("Success case: with figDataManager and image", async () => {
        const input = loadEL({
            tag: "Fig",
            attr: { src: "./pict/image.jpg" },
            children: [],
        }) as std.Fig;
        const expectedDOCX = /*xml*/`\
<w:r>
  <w:drawing>
    <wp:inline>
      <wp:extent cx="1219200" cy="733425"></wp:extent>
      <wp:effectExtent l="0" t="0" r="0" b="0"></wp:effectExtent>
      <wp:docPr id="1000001" name="./pict/image.jpg"></wp:docPr>
      <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
          <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:nvPicPr>
              <pic:cNvPr id="1000001" name="./pict/image.jpg"></pic:cNvPr>
              <pic:cNvPicPr>
                <a:picLocks noChangeAspect="1" noChangeArrowheads="1"></a:picLocks>
              </pic:cNvPicPr>
            </pic:nvPicPr>
            <pic:blipFill>
              <a:blip r:embed="fig1"></a:blip>
              <a:srcRect></a:srcRect>
              <a:stretch>
                <a:fillRect></a:fillRect>
              </a:stretch>
            </pic:blipFill>
            <pic:spPr>
              <a:xfrm>
                <a:off x="0" y="0"></a:off>
                <a:ext cx="1219200" cy="733425"></a:ext>
              </a:xfrm>
              <a:prstGeom prst="rect">
                <a:avLst></a:avLst>
              </a:prstGeom>
            </pic:spPr>
          </pic:pic>
        </a:graphicData>
      </a:graphic>
    </wp:inline>
  </w:drawing>
</w:r>
`;

        const figDataManager = new FigDataManager(
            new Map([
                [
                    "./pict/image.jpg",
                    {
                        isEmbeddedPDF: false,
                        id: 1000001,
                        rId: "fig1",
                        cx: 128 * 9525,
                        cy: 77 * 9525,
                        name: "./pict/image.jpg",
                        fileName: "image.jpg",
                        blob: {
                            buf: decodeBase64(FILES["./pict/image.jpg"]),
                            type: "image/jpeg",
                        },
                    },
                ],
            ]),
        );

        const docxOptions: DOCXOptions = { figDataManager };

        const element = <DOCXFigRun el={input} docxOptions={docxOptions} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(<w.p>{element}</w.p>, docxOptions);

        const paths = ["word/media/image.jpg"];
        const zipData = await unzip(u8, { filter: file => paths.includes(file.name) } );
        assert.hasAllKeys(zipData, paths);

        const tempParsedDocx = path.join(ensureTempTestDir(), "renderer.figRun.image.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });

    it("Success case: with figDataManager and object", async () => {
        const input = loadEL({
            tag: "Fig",
            attr: { src: "./pict/object.pdf" },
            children: [],
        }) as std.Fig;
        const expectedDOCX = /*xml*/`\
<w:r>
  <w:object>
    <v:shape id="icon_1000002" style="width:39pt;height:51pt">
      <v:imagedata r:id="rPdfIcon" o:title=""></v:imagedata>
    </v:shape>
    <o:OLEObject Type="Embed" ProgID="Acrobat.Document.DC" ShapeID="icon_1000002" DrawAspect="Icon" ObjectID="1000002" r:id="fig2"></o:OLEObject>
  </w:object>
</w:r>
`;

        const figDataManager = new FigDataManager(
            new Map([
                [
                    "./pict/object.pdf",
                    {
                        isEmbeddedPDF: true,
                        id: 1000002,
                        rId: "fig2",
                        cx: 100 * 9525,
                        cy: 100 * 9525,
                        name: "./pict/object.pdf",
                        fileName: "object.pdf",
                        blob: {
                            buf: decodeBase64(FILES["./pict/object.pdf"]),
                            type: "application/pdf",
                        },
                    },
                ],
            ]),
        );

        const docxOptions: DOCXOptions = { figDataManager };

        const element = <DOCXFigRun el={input} docxOptions={docxOptions} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(<w.p>{element}</w.p>, docxOptions);

        const paths = ["word/embeddings/object.pdf.bin", "word/media/pdfIcon.emf"];
        const zipData = await unzip(u8, { filter: file => paths.includes(file.name) } );
        assert.hasAllKeys(zipData, paths);

        const tempParsedDocx = path.join(ensureTempTestDir(), "renderer.figRun.object.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});


const FILES = {
    "./pict/image.jpg": "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",
    "./pict/object.pdf": "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",
};
