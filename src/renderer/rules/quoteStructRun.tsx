import React, { Fragment } from "react";
import * as std from "../../law/std";
import { HTMLComponentProps, wrapHTMLComponent } from "../common/html";
import { DOCXComponentProps, wrapDOCXComponent, w } from "../common/docx";
import { DOCXAnyELsToBlocks, HTMLAnyELsToBlocks } from "./any";
import TextBoxRun from "../common/docx/TextBoxRun";


export interface QuoteStructRunProps {
    el: std.QuoteStruct,
}

export const HTMLQuoteStructRunCSS = /*css*/`
`;

export const HTMLQuoteStructRun = wrapHTMLComponent("HTMLQuoteStructRun", ((props: HTMLComponentProps & QuoteStructRunProps) => {

    const { el, htmlOptions } = props;

    const rawBlocks = HTMLAnyELsToBlocks({
        els: el.children,
        indent: 0,
        htmlOptions,
    });

    if (rawBlocks.every(Array.isArray)) {
        const runs = (rawBlocks as JSX.Element[][]).flat();

        return (<>
            <span className="quote-struct">
                {runs.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
            </span>
        </>);

    } else {

        const blocks: JSX.Element[] = [];

        for (const rawBlock of rawBlocks) {
            if (Array.isArray(rawBlock)) {
                blocks.push(<>
                    <div className="quote-struct-runs">
                        {rawBlock.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
                    </div>
                </>);
            } else {
                blocks.push(rawBlock);
            }
        }

        return (
            <span className="quote-struct" style={{ display: "inline-block" }}>
                {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
            </span>
        );
    }
}));

export const DOCXQuoteStructRun = wrapDOCXComponent("DOCXQuoteStructRun", ((props: DOCXComponentProps & QuoteStructRunProps) => {

    const { el, docxOptions } = props;

    const rawBlocks = DOCXAnyELsToBlocks({
        els: el.children,
        indent: 0,
        docxOptions,
    });

    if (rawBlocks.every(Array.isArray)) {
        const runs = (rawBlocks as JSX.Element[][]).flat();

        return (<>
            {runs.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
        </>);

    } else {

        const blocks: JSX.Element[] = [];

        for (const rawBlock of rawBlocks) {
            if (Array.isArray(rawBlock)) {
                blocks.push(<>
                    <w.p>
                        {rawBlock.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
                    </w.p>
                </>);
            } else {
                blocks.push(rawBlock);
            }
        }

        return (
            <TextBoxRun id={10000 + el.id} name={`QuoteStruct${el.id}`}>
                {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
            </TextBoxRun>
        );
    }
}));
