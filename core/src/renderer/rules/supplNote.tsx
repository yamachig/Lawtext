import React from "react";
import type * as std from "../../law/std";
import type { HTMLComponentProps } from "../common/html";
import { elProps, wrapHTMLComponent } from "../common/html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import type { DOCXComponentProps } from "../common/docx/component";
import { wrapDOCXComponent } from "../common/docx/component";
import { w } from "../common/docx/tags";


export interface SupplNoteProps {
    el: std.SupplNote,
    indent: number,
}

export const HTMLSupplNoteCSS = /*css*/`
.suppl-note {
    clear: both;
}
`;

export const HTMLSupplNote = wrapHTMLComponent("HTMLSupplNote", ((props: HTMLComponentProps & SupplNoteProps) => {

    const { el, htmlOptions, indent } = props;

    return (
        <div className={`suppl-note indent-${indent}`} {...elProps(el, htmlOptions)}>
            <HTMLSentenceChildrenRun els={el.children} {...{ htmlOptions }} />
        </div>
    );
}));

export const DOCXSupplNote = wrapDOCXComponent("DOCXSupplNote", ((props: DOCXComponentProps & SupplNoteProps) => {

    const { el, docxOptions, indent } = props;

    return (
        <w.p>
            <w.pPr>
                <w.pStyle w:val={`Indent${indent}`}/>
            </w.pPr>
            <DOCXSentenceChildrenRun els={el.children} {...{ docxOptions }} />
        </w.p>
    );
}));
