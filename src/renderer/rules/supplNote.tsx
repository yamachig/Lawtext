import React from "react";
import * as std from "../../law/std";
import { HTMLComponentProps, wrapHTMLComponent } from "../common/html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import { DOCXComponentProps, w, wrapDOCXComponent } from "../common/docx";


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
        <div className={`suppl-note indent-${indent}`}>
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
