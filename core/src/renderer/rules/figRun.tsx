import React from "react";
import * as std from "../../law/std";
import { elProps, HTMLFigData, HTMLComponentProps, wrapHTMLComponent } from "../common/html";
import { DOCXComponentProps, DOCXFigData, wrapDOCXComponent, DOCXFigDataManager } from "../common/docx/component";
import { w, wp, a, pic, o, v } from "../common/docx/tags";
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

export const HTMLFigRunWithFigData = (props: HTMLComponentProps & FigRunProps & { figData: HTMLFigData, fig: std.Fig }) => {

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

    const { el, docxOptions } = props;
    const { figDataManager } = docxOptions;

    if (el.children.length > 0) {
        throw new NotImplementedError(el.outerXML());
    }

    if (figDataManager) {
        const figData = figDataManager.getFigData(el.attr.src);
        return figData === null ? (
            <w.r>
                <w.t>{el.attr.src}</w.t>
            </w.r>
        ) : (
            <DOCXFigRunWithFigData {...props} figData={figData} fig={el} figDataManager={figDataManager} />
        );
    } else {
        return (
            <w.r>
                <w.t>{el.attr.src}</w.t>
            </w.r>
        );
    }
}));

export const DOCXFigRunWithFigData = (props: DOCXComponentProps & FigRunProps & { figData: DOCXFigData, fig: std.Fig, figDataManager: DOCXFigDataManager }) => {

    const { el, figData, figDataManager } = props;

    if (figData.blob.type.startsWith("image/")) {
        return (
            <w.r>
                <w.drawing>
                    <wp.inline>
                        <wp.extent cx={figData.cx} cy={figData.cy} />
                        <wp.effectExtent l="0" t="0" r="0" b="0" />
                        <wp.docPr id={figData.id} name={figData.name} />
                        <a.graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                            <a.graphicData
                                uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                                <pic.pic
                                    xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                                    <pic.nvPicPr>
                                        <pic.cNvPr id={figData.id} name={figData.name} />
                                        <pic.cNvPicPr>
                                            <a.picLocks noChangeAspect="1" noChangeArrowheads="1" />
                                        </pic.cNvPicPr>
                                    </pic.nvPicPr>
                                    <pic.blipFill>
                                        <a.blip r:embed={figData.rId} />
                                        <a.srcRect />
                                        <a.stretch>
                                            <a.fillRect />
                                        </a.stretch>
                                    </pic.blipFill>
                                    <pic.spPr>
                                        <a.xfrm>
                                            <a.off x="0" y="0" />
                                            <a.ext cx={figData.cx} cy={figData.cy} />
                                        </a.xfrm>
                                        <a.prstGeom prst="rect">
                                            <a.avLst />
                                        </a.prstGeom>
                                    </pic.spPr>
                                </pic.pic>
                            </a.graphicData>
                        </a.graphic>
                    </wp.inline>
                </w.drawing>
            </w.r>
        );
    } else if (figData.blob.type === "application/pdf") {
        //"width:39pt;height:51pt"
        return (<w.r>
            <w.object>
                <v.shape id={`icon_${figData.id}`} style={{ width: "39pt", height: "51pt" }}>
                    <v.imagedata r:id={figDataManager.pdfIcon.rId} o:title="" />
                </v.shape>
                <o.OLEObject Type="Embed" ProgID="Acrobat.Document.DC" ShapeID={`icon_${figData.id}`}
                    DrawAspect="Icon" ObjectID={figData.id} r:id={figData.rId} />
            </w.object>
        </w.r>

        );
    } else {
        return (
            <w.r>
                <w.t>{el.attr.src}</w.t>
            </w.r>
        );
    }
};
