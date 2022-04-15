import React, { Fragment } from "react";
import * as std from "../../law/std";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXComponentProps, wrapDOCXComponent, w } from "./docx";
import { DOCXAnyELsToBlocks, HTMLAnyELsToBlocks } from "./any";
import TextBoxRun from "./docx/TextBoxRun";


export interface ArithFormulaRunProps {
    el: std.ArithFormula,
}

export const HTMLArithFormulaRunCSS = /*css*/`
`;

export const HTMLArithFormulaRun = wrapHTMLComponent("HTMLArithFormulaRun", ((props: HTMLComponentProps & ArithFormulaRunProps) => {

    const { el, htmlOptions } = props;

    const rawBlocks = HTMLAnyELsToBlocks({
        els: el.children,
        indent: 0,
        htmlOptions,
    });

    if (rawBlocks.every(Array.isArray)) {
        const runs = (rawBlocks as JSX.Element[][]).flat();

        return (<>
            <span className="arith-formula">
                {runs.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
            </span>
        </>);

    } else {

        const blocks: JSX.Element[] = [];

        for (const rawBlock of rawBlocks) {
            if (Array.isArray(rawBlock)) {
                blocks.push(<>
                    <div className="arith-formula-runs">
                        {rawBlock.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
                    </div>
                </>);
            } else {
                blocks.push(rawBlock);
            }
        }

        return (
            <span className="arith-formula" style={{ display: "inline-block" }}>
                {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
            </span>
        );
    }
}));

export const DOCXArithFormulaRun = wrapDOCXComponent("DOCXArithFormulaRun", ((props: DOCXComponentProps & ArithFormulaRunProps) => {

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
            <TextBoxRun id={10000 + el.id} name={`ArithFormula${el.id}`}>
                {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
            </TextBoxRun>
        );
    }
}));
