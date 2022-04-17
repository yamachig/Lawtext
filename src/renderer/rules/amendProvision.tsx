import React, { Fragment } from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import { HTMLComponentProps, wrapHTMLComponent } from "../common/html";
import { DOCXColumnsOrSentencesRun, HTMLColumnsOrSentencesRun } from "./columnsOrSentencesRun";
import { DOCXComponentProps, w, wrapDOCXComponent } from "../common/docx";
import { DOCXAnyELs, HTMLAnyELs } from "./any";


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

    const blocks: JSX.Element[] = [];

    for (const child of el.children) {

        if (std.isAmendProvisionSentence(child)) {
            blocks.push(<>
                <div className={`amend-provision-main indent-${indent}`}>
                    <HTMLColumnsOrSentencesRun els={child.children} {...{ htmlOptions }} />
                </div>
            </>);

        } else if (std.isNewProvision(child)) {
            blocks.push(<>
                <div className="new-provision">
                    <HTMLAnyELs els={child.children} indent={indent + 1} {...{ htmlOptions }} />
                </div>
            </>);
        }
        else { throw assertNever(child); }
    }

    return (
        <div
            className="amend-provision"
        >
            {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
        </div>
    );
}));

export const DOCXAmendProvision = wrapDOCXComponent("DOCXAmendProvision", ((props: DOCXComponentProps & AmendProvisionProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    for (const child of el.children) {

        if (std.isAmendProvisionSentence(child)) {
            blocks.push(<>
                <w.p>
                    <w.pPr>
                        <w.pStyle w:val={`Indent${indent}`}/>
                    </w.pPr>
                    <DOCXColumnsOrSentencesRun els={child.children} {...{ docxOptions }} />
                </w.p>
            </>);

        } else if (std.isNewProvision(child)) {
            blocks.push(<DOCXAnyELs els={child.children} indent={indent + 1} {...{ docxOptions }} />);
        }
        else { throw assertNever(child); }
    }

    return (<>
        {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
    </>);
}));
