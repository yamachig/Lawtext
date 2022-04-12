import React from "react";
import ReactDOMServer from "react-dom/server";
import { assert } from "chai";
import { HTMLSentenceChildren } from "./sentenceChildren";
import { loadEl } from "../../node/el";
import * as std from "../../law/std";


describe("Test HTML sentenceChildren", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", () => {
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
`.replace(/\r?\n$/g, "").replace(/\r?\n\s*/g, "");
        const element = <HTMLSentenceChildren els={input.children} htmlOptions={{}} />;
        const rendered = ReactDOMServer.renderToStaticMarkup(element);
        assert.strictEqual(rendered, expectedHTML);
    });
});
