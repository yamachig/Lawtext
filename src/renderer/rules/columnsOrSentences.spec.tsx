import React from "react";
import { assert } from "chai";
import { loadEl } from "../../node/el";
import * as std from "../../law/std";
import { DOCXColumnsOrSentences, HTMLColumnsOrSentences } from "./columnsOrSentences";
import { renderToStaticMarkup } from "./common";


describe("Test HTML columnsOrSentences", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", () => {
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
`.replace(/\r?\n$/g, "").replace(/\r?\n\s*/g, "");
        const element = <HTMLColumnsOrSentences els={input.children} htmlOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        assert.strictEqual(rendered, expectedHTML);
    });
});


describe("Test DOCX columnsOrSentences", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", () => {
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
<w:r><w:t>法令</w:t></w:r>
<w:r><w:t>　</w:t></w:r>
<w:r><w:t>法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。</w:t></w:r>
`.replace(/\r?\n$/g, "").replace(/\r?\n\s*/g, "");
        const element = <DOCXColumnsOrSentences els={input.children} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        assert.strictEqual(rendered, expectedDOCX);
    });
});
