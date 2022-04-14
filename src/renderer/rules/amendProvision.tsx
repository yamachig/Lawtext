import React, { Fragment } from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXColumnsOrSentencesRun, HTMLColumnsOrSentencesRun } from "./columnsOrSentencesRun";
import { DOCXComponentProps, w, wrapDOCXComponent } from "./docx";
import { AnyELProps, DOCXAnyEL, HTMLAnyEL } from "./any";


export interface AmendProvisionProps {
    el: std.AmendProvision,
    indent: number,
}

export const HTMLAmendProvisionCSS = /*css*/`
.amend-provision-main {    
    margin-top: 0;
    margin-bottom: 0;
    text-indent: 1em;
}
`;

export const HTMLAmendProvision = wrapHTMLComponent("HTMLAmendProvision", ((props: HTMLComponentProps & AmendProvisionProps) => {

    const { el, htmlOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    for (const child of el.children) {

        if (std.isAmendProvisionSentence(child)) {
            blocks.push(<>
                <p className={`amend-provision-main indent-${indent}`}>
                    <HTMLColumnsOrSentencesRun els={child.children} {...{ htmlOptions }} />
                </p>
            </>);

        } else if (std.isNewProvision(child)) {
            for (const subchild of child.children) {
                blocks.push(<HTMLAnyEL {...({ el: subchild, indent: indent + 1 } as AnyELProps)} {...{ htmlOptions }} />);
            }
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
            for (const subchild of child.children) {
                blocks.push(<DOCXAnyEL {...({ el: subchild, indent: indent + 1 } as AnyELProps)} {...{ docxOptions }} />);
            }
        }
        else { throw assertNever(child); }
    }

    return (<>
        {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
    </>);
}));
