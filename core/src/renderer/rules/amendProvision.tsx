import React from "react";
import * as std from "../../law/std/index.ts";
import { assertNever } from "../../util/index.ts";
import type { HTMLComponentProps } from "../common/html.tsx";
import { elProps, wrapHTMLComponent } from "../common/html.tsx";
import { DOCXColumnsOrSentencesRun, HTMLColumnsOrSentencesRun } from "./columnsOrSentencesRun.tsx";
import type { DOCXComponentProps } from "../common/docx/component.tsx";
import { wrapDOCXComponent } from "../common/docx/component.tsx";
import { w } from "../common/docx/tags.ts";
import { DOCXAnyELs, HTMLAnyELs } from "./any.tsx";
import { withKey } from "../common/index.tsx";


export interface AmendProvisionProps {
    el: std.AmendProvision,
    indent: number,
}

export const HTMLAmendProvisionCSS = /*css*/`
.amend-provision-main {    
    text-indent: 1em;
}
`;

export const HTMLAmendProvision = wrapHTMLComponent("HTMLAmendProvision", ((props: HTMLComponentProps & AmendProvisionProps) => {

    const { el, htmlOptions, indent } = props;

    const blocks: React.JSX.Element[] = [];

    for (const child of el.children) {

        if (std.isAmendProvisionSentence(child)) {
            blocks.push((
                <div className={`amend-provision-main indent-${indent}`}>
                    <HTMLColumnsOrSentencesRun els={child.children} {...{ htmlOptions }} />
                </div>
            ));

        } else if (std.isNewProvision(child)) {
            blocks.push((
                <div className="new-provision" {...elProps(child, htmlOptions)}>
                    <HTMLAnyELs els={child.children} indent={indent + 1} {...{ htmlOptions }} />
                </div>
            ));
        }
        else { throw assertNever(child); }
    }

    return (
        <div
            className="amend-provision"
            {...elProps(el, htmlOptions)}
        >
            {withKey(blocks)}
        </div>
    );
}));

export const DOCXAmendProvision = wrapDOCXComponent("DOCXAmendProvision", ((props: DOCXComponentProps & AmendProvisionProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: React.JSX.Element[] = [];

    for (const child of el.children) {

        if (std.isAmendProvisionSentence(child)) {
            blocks.push((
                <w.p>
                    <w.pPr>
                        <w.pStyle w:val={`Indent${indent}`}/>
                    </w.pPr>
                    <DOCXColumnsOrSentencesRun els={child.children} {...{ docxOptions }} />
                </w.p>
            ));

        } else if (std.isNewProvision(child)) {
            blocks.push(<DOCXAnyELs els={child.children} indent={indent + 1} {...{ docxOptions }} />);
        }
        else { throw assertNever(child); }
    }

    return (<>
        {withKey(blocks)}
    </>);
}));
