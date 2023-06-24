import React from "react";
import * as std from "../../law/std";
import { elProps, FigData, HTMLComponentProps, wrapHTMLComponent } from "../common/html";
import { DOCXComponentProps, w, wrapDOCXComponent } from "../common/docx";
import { NotImplementedError } from "../../util";


export interface FigRunProps {
    el: std.Fig,
}

export const HTMLFigRunCSS = /*css*/`
.fig-iframe {
    width: 100%;
    height: 80vh;
    border: 1px solid gray;
}

.fig-img {
    max-width: 100%;
}
`;

export const HTMLFigRun = wrapHTMLComponent("HTMLFigRun", ((props: HTMLComponentProps & FigRunProps) => {

    const { el, htmlOptions } = props;
    const { getFigData } = htmlOptions;

    if (el.children.length > 0) {
        throw new NotImplementedError(el.outerXML());
    }

    if (getFigData) {
        const figData = getFigData(el.attr.src);
        return figData === null ? (
            <>[{el.attr.src}]</>
        ) : (
            <HTMLFigRunWithFigData {...props} figData={figData} fig={el} />
        );
    } else {
        return (
            <span className="fig-src" {...elProps(el, htmlOptions)}>{el.attr.src}</span>
        );
    }
}));

export const HTMLFigRunWithFigData = (props: HTMLComponentProps & FigRunProps & { figData: FigData, fig: std.Fig }) => {

    const { el, figData, htmlOptions, fig } = props;
    const { renderPDFAsLink } = htmlOptions;

    return (
        figData.type.startsWith("image/")
            ? (
                <img className="fig-img" src={figData.url} {...elProps(fig, htmlOptions)} />
            )
            : ((!renderPDFAsLink) && figData.type.includes("pdf"))
                ? (
                    <iframe className="fig-iframe" src={figData.url} sandbox="allow-scripts" {...elProps(fig, htmlOptions)} />
                )
                : (
                    <a
                        className="fig-link"
                        href={figData.url}
                        type={figData.type}
                        target="_blank"
                        rel="noreferrer"
                        {...elProps(fig, htmlOptions)}
                    >{el.attr.src}</a>
                )
    );
};

export const DOCXFigRun = wrapDOCXComponent("DOCXFigRun", ((props: DOCXComponentProps & FigRunProps) => {

    const { el } = props;

    return (
        <w.r>
            <w.t>{el.attr.src}</w.t>
        </w.r>
    );
}));
