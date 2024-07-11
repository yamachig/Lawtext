import React from "react";

export const DOCXMargin = "　";

export interface DOCXFigImageFile {
    rId: string,
    name: string,
    id: number,
    cx: number,
    cy: number,
    blob: {
        buf: ArrayBuffer;
        type: string;
    },
}

export interface DOCXFigEmbedFile {
    rId: string,
    name: string,
    id: number,
    blob: {
        buf: ArrayBuffer;
        type: string;
    },
}

export interface DOCXFigDataBase {
    src: string,
}

export interface DOCXFigDataImage extends DOCXFigDataBase {
    type: "image",
    image: DOCXFigImageFile,
}

export interface DOCXFigDataEmbeddedPDF extends DOCXFigDataBase {
    type: "embeddedPDF",
    file: DOCXFigEmbedFile,
}

export interface DOCXFigDataRenderedPDF extends DOCXFigDataBase {
    type: "renderedPDF",
    pages: DOCXFigImageFile[],
}

export interface DOCXFigDataEmbeddedAndRenderedPDF extends DOCXFigDataBase {
    type: "embeddedAndRenderedPDF",
    file: DOCXFigEmbedFile,
    pages: DOCXFigImageFile[],
}

export type DOCXFigData = DOCXFigDataImage | DOCXFigDataEmbeddedPDF | DOCXFigDataRenderedPDF |DOCXFigDataEmbeddedAndRenderedPDF;

export interface DOCXFigDataManager {
    getFigData(src: string): DOCXFigData | null;
    getFigDataItems(): [src: string, figData: DOCXFigData][];
    pdfIcon: {
        rId: string;
        buf: ArrayBuffer;
        fileName: string,
    };
}

export interface DOCXOptions {
    figDataManager?: DOCXFigDataManager;
}
export interface DOCXComponentProps {
    docxOptions: DOCXOptions;
}

export function wrapDOCXComponent<P, TComponentID extends string>(docxComponentID: TComponentID, Component: React.ComponentType<P & DOCXComponentProps>) {
    void docxComponentID;
    const ret = ((props: P & DOCXComponentProps) => {
        return <Component {...props} />;
    }) as React.FC<P & DOCXComponentProps> & {componentID: TComponentID};
    ret.componentID = docxComponentID;
    return ret;
}

export type ComponentWithTag<TTag extends string> = {
    <P>(props: React.PropsWithChildren<P>): React.DOMElement<P & {
        children?: React.ReactNode;
    }, Element>;
    displayName: `ComponentWithTag<${TTag}>`;
}

export function makeComponentWithTag <TTag extends string>(tag: TTag): ComponentWithTag<TTag> {
    const func = function ComponentWithTag<P>(props: React.PropsWithChildren<P>) {
        return React.createElement(tag, props);
    };
    func.displayName = `ComponentWithTag<${tag}>` as const;
    return func;
}

const RelationshipsTag = makeComponentWithTag("Relationships");
const Relationship = makeComponentWithTag("Relationship");

export const Relationships: React.FC<{relationships: {Id: string, Type: string, Target: string}[]}> = props => (
    <RelationshipsTag xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        {props.relationships.map((r, key) => <Relationship {...r} key={key}/>)}
    </RelationshipsTag>
);

const TypesTag = makeComponentWithTag("Types");
const Default = makeComponentWithTag("Default");
const Override = makeComponentWithTag("Override");

export const Types: React.FC<{
    types: (
        {tag: "Default", Extension: string, ContentType: string} |
        {tag: "Override", PartName: string, ContentType: string}
    )[],
}> = props => (
    <TypesTag xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        {props.types.map((type, key) => type.tag === "Default"
            ? <Default key={key} Extension={type.Extension} ContentType={type.ContentType} />
            : <Override key={key} PartName={type.PartName} ContentType={type.ContentType}/>,
        )}
    </TypesTag>
);
