import React from "react";
import type * as std from "../../law/std";
import type { HTMLComponentProps } from "../common/html";
import { elProps, wrapHTMLComponent } from "../common/html";
import type { DOCXComponentProps } from "../common/docx/component";
import { wrapDOCXComponent } from "../common/docx/component";
import { w } from "../common/docx/tags";
import { DOCXAnyELsToBlocks, HTMLAnyELsToBlocks } from "./any";
import TextBoxRun from "../common/docx/TextBoxRun";
import { withKey } from "../common";


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
        const runs = (rawBlocks as React.JSX.Element[][]).flat();

        return ((
            <span className="arith-formula" {...elProps(el, htmlOptions)}>
                {withKey(runs)}
            </span>
        ));

    } else {

        const blocks: React.JSX.Element[] = [];

        for (const rawBlock of rawBlocks) {
            if (Array.isArray(rawBlock)) {
                blocks.push((
                    <div className="arith-formula-runs">
                        {withKey(rawBlock)}
                    </div>
                ));
            } else {
                blocks.push(rawBlock);
            }
        }

        return (
            <span className="arith-formula" style={{ display: "inline-block" }} {...elProps(el, htmlOptions)}>
                {withKey(blocks)}
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
        const runs = (rawBlocks as React.JSX.Element[][]).flat();

        return (<>
            {withKey(runs)}
        </>);

    } else {

        const blocks: React.JSX.Element[] = [];

        for (const rawBlock of rawBlocks) {
            if (Array.isArray(rawBlock)) {
                blocks.push((
                    <w.p>
                        {withKey(rawBlock)}
                    </w.p>
                ));
            } else {
                blocks.push(rawBlock);
            }
        }

        return (
            <TextBoxRun id={10000 + el.id} name={`ArithFormula${el.id}`}>
                {withKey(blocks)}
            </TextBoxRun>
        );
    }
}));
