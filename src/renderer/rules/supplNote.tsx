import React from "react";
import * as std from "../../law/std";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import { DOCXComponentProps, w, wrapDOCXComponent } from "./docx";


export interface SupplNoteProps {
    el: std.SupplNote,
    indent: number,
}

export const HTMLSupplNoteCSS = /*css*/`
.suppl-note {
    clear: both;
    margin-top: 0;
    margin-bottom: 0;
}
`;

export const HTMLSupplNote = wrapHTMLComponent("HTMLSupplNote", ((props: HTMLComponentProps & SupplNoteProps) => {

    const { el, htmlOptions, indent } = props;

    return (
        <p className={`suppl-note indent-${indent}`}>
            <HTMLSentenceChildrenRun els={el.children} {...{ htmlOptions }} />
        </p>
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
