import React, { Fragment } from "react";
import * as std from "../../law/std";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import { DOCXComponentProps, w, wrapDOCXComponent } from "./docx";
import { AnyELProps, DOCXAnyEL, HTMLAnyEL } from "./any";


export interface NoteLikeProps {
    el: std.NoteLike,
    indent: number,
}

export const HTMLNoteLikeCSS = /*css*/`

`;

export const HTMLNoteLike = wrapHTMLComponent("HTMLNoteLike", ((props: HTMLComponentProps & NoteLikeProps) => {

    const { el, htmlOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    for (const child of el.children) {
        if (typeof child === "string") {
            blocks.push(<>
                <p className={`indent-${indent}`}>
                    <HTMLSentenceChildrenRun els={[child]} {...{ htmlOptions }} />
                </p>
            </>);
        } else {
            blocks.push(<HTMLAnyEL {...({ el: child, indent } as AnyELProps)} {...{ htmlOptions }} />);
        }
    }

    return (
        <div className="note-like">
            {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
        </div>
    );
}));

export const DOCXNoteLike = wrapDOCXComponent("DOCXNoteLike", ((props: DOCXComponentProps & NoteLikeProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    for (const child of el.children) {
        if (typeof child === "string") {
            blocks.push(<>
                <w.p>
                    <w.pPr>
                        <w.pStyle w:val={`Indent${indent}`}/>
                    </w.pPr>
                    <DOCXSentenceChildrenRun els={[child]} {...{ docxOptions }} />
                </w.p>
            </>);
        } else {
            blocks.push(<DOCXAnyEL {...({ el: child, indent } as AnyELProps)} {...{ docxOptions }} />);
        }
    }

    return (<>
        {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
    </>);
}));
