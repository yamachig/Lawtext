import React from "react";
import type * as std from "../../law/std";
import type { HTMLComponentProps } from "../common/html";
import { elProps, wrapHTMLComponent } from "../common/html";
import type { DOCXComponentProps } from "../common/docx/component";
import { wrapDOCXComponent } from "../common/docx/component";
import { DOCXAnyELs, HTMLAnyELs } from "./any";


export interface NoteLikeProps {
    el: std.NoteLike,
    indent: number,
}

export const HTMLNoteLikeCSS = /*css*/`

`;

export const HTMLNoteLike = wrapHTMLComponent("HTMLNoteLike", ((props: HTMLComponentProps & NoteLikeProps) => {

    const { el, htmlOptions, indent } = props;

    return (
        <div className="note-like" {...elProps(el, htmlOptions)}>
            <HTMLAnyELs els={el.children} indent={indent} {...{ htmlOptions }}/>
        </div>
    );
}));

export const DOCXNoteLike = wrapDOCXComponent("DOCXNoteLike", ((props: DOCXComponentProps & NoteLikeProps) => {

    const { el, docxOptions, indent } = props;

    return <DOCXAnyELs els={el.children} indent={indent} {...{ docxOptions }}/>;
}));
