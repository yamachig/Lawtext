import React from "react";
import * as std from "../../law/std";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXComponentProps, w, wrapDOCXComponent } from "./docx";


export interface FigRunProps {
    el: std.Fig,
}

export const HTMLFigRunCSS = /*css*/`
.fig-src {

}
`;

export const HTMLFigRun = wrapHTMLComponent("HTMLFigRun", ((props: HTMLComponentProps & FigRunProps) => {

    const { el } = props;

    return (
        <span className="fig-src">{el.attr.src}</span>
    );
}));

export const DOCXFigRun = wrapDOCXComponent("DOCXFigRun", ((props: DOCXComponentProps & FigRunProps) => {

    const { el } = props;

    return (
        <w.r>
            <w.t>{el.attr.src}</w.t>
        </w.r>
    );
}));
