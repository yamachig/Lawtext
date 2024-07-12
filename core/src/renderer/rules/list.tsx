import React from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import type { HTMLComponentProps } from "../common/html";
import { elProps, wrapHTMLComponent } from "../common/html";
import { DOCXColumnsOrSentencesRun, HTMLColumnsOrSentencesRun } from "./columnsOrSentencesRun";
import type { DOCXComponentProps } from "../common/docx/component";
import { wrapDOCXComponent } from "../common/docx/component";
import { w } from "../common/docx/tags";
import { withKey } from "../common";


export interface ListProps {
    el: std.ListOrSublist,
    indent: number,
}

export const HTMLListCSS = /*css*/`
.list-main {    
}
`;

export const HTMLList = wrapHTMLComponent("HTMLList", ((props: HTMLComponentProps & ListProps) => {

    const { el, htmlOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    for (const child of el.children) {

        if (std.isListOrSublistSentence(child)) {
            blocks.push((
                <div className={`list-main indent-${indent}`} {...elProps(child, htmlOptions)}>
                    <HTMLColumnsOrSentencesRun els={child.children} {...{ htmlOptions }} />
                </div>
            ));

        } else if (std.isListOrSublist(child)) {
            blocks.push(<HTMLList el={child} indent={indent + 2} {...{ htmlOptions }} />);

        }
        else { throw assertNever(child); }
    }

    return (
        <div
            className={`list-${el.tag}`}
            {...elProps(el, htmlOptions)}
        >
            {withKey(blocks)}
        </div>
    );
}));

export const DOCXList = wrapDOCXComponent("DOCXList", ((props: DOCXComponentProps & ListProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    for (const child of el.children) {

        if (std.isListOrSublistSentence(child)) {
            blocks.push((
                <w.p>
                    <w.pPr>
                        <w.pStyle w:val={`Indent${indent}`}/>
                    </w.pPr>
                    <DOCXColumnsOrSentencesRun els={child.children} {...{ docxOptions }} />
                </w.p>
            ));

        } else if (std.isListOrSublist(child)) {
            blocks.push(<DOCXList el={child} indent={indent + 2} {...{ docxOptions }} />);

        }
        else { throw assertNever(child); }
    }

    return (
        <>
            {withKey(blocks)}
        </>
    );
}));
