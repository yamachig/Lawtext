import React from "react";
import { assert } from "chai";
import { DOCXArithFormulaRun, HTMLArithFormulaRun } from "./arithFormulaRun";
import { loadEl } from "../../node/el";
import * as std from "../../law/std";
import { renderToStaticMarkup } from "./common";
import formatXML from "../../util/formatXml";

describe("Test HTML arithFormulaRun", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", () => {
        const input = loadEl({
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
    });
});


describe("Test DOCX arithFormulaRun", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", () => {

        const input = loadEl({
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
    });
});
