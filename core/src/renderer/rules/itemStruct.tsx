import React from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import { elProps, HTMLComponentProps, wrapHTMLComponent } from "../common/html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import { DOCXComponentProps, w, wrapDOCXComponent } from "../common/docx";
import { DOCXTable, HTMLTable } from "./table";
import { DOCXRemarks, HTMLRemarks } from "./remarks";
import { DOCXNoteLike, HTMLNoteLike } from "./noteLike";
import { DOCXFigRun, HTMLFigRun } from "./figRun";
import { withKey } from "../common";


export interface ItemStructProps {
    el: std.TableStruct | std.FigStruct | std.NoteStruct | std.FormatStruct | std.StyleStruct,
    indent: number,
}

export const HTMLItemStructCSS = /*css*/`
.item-struct {
    clear: both;
}

.item-struct-title {
    clear: both;
    font-weight: bold;
}

`;

export const HTMLItemStruct = wrapHTMLComponent("HTMLItemStruct", ((props: HTMLComponentProps & ItemStructProps) => {

    const { el, htmlOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const ItemStructTitle = (el.children as (typeof el.children)[number][]).find(el => (
        std.isTableStructTitle(el)
        || std.isFigStructTitle(el)
        || std.isNoteStructTitle(el)
        || std.isFormatStructTitle(el)
        || std.isStyleStructTitle(el)
    )) as std.TableStructTitle | std.FigStructTitle | std.NoteStructTitle | std.FormatStructTitle | std.StyleStructTitle | undefined;

    if (ItemStructTitle) {
        blocks.push((
            <div className={`item-struct-title indent-${indent}`} {...elProps(ItemStructTitle, htmlOptions)}>
                <HTMLSentenceChildrenRun els={ItemStructTitle.children} {...{ htmlOptions }} />
            </div>
        ));
    }

    const bodyBlocks: JSX.Element[] = [];

    for (const child of el.children) {
        if (
            std.isTableStructTitle(child)
            || std.isFigStructTitle(child)
            || std.isNoteStructTitle(child)
            || std.isFormatStructTitle(child)
            || std.isStyleStructTitle(child)
        ) {
            continue;

        } else if (std.isRemarks(child)) {
            bodyBlocks.push(<HTMLRemarks el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isTable(child)) {
            bodyBlocks.push(<HTMLTable el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isFig(child)) {
            bodyBlocks.push((
                <div className={`item-struct-runs indent-${indent}`}>
                    <HTMLFigRun el={child} {...{ htmlOptions }} />
                </div>
            ));

        } else if (std.isNoteLike(child)) {
            bodyBlocks.push(<HTMLNoteLike el={child} indent={indent} {...{ htmlOptions }} />);

        }
        else { assertNever(child); }
    }

    if (bodyBlocks.length > 0) {
        blocks.push((
            <div className="item-struct-body">
                {withKey(bodyBlocks)}
            </div>
        ));
    }

    return (
        <div className="item-struct" {...elProps(el, htmlOptions)}>
            {withKey(blocks)}
        </div>
    );
}));

export const DOCXItemStruct = wrapDOCXComponent("DOCXItemStruct", ((props: DOCXComponentProps & ItemStructProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const ItemStructTitle = (el.children as (typeof el.children)[number][]).find(el => (
        std.isTableStructTitle(el)
        || std.isFigStructTitle(el)
        || std.isNoteStructTitle(el)
        || std.isFormatStructTitle(el)
        || std.isStyleStructTitle(el)
    )) as std.TableStructTitle | std.FigStructTitle | std.NoteStructTitle | std.FormatStructTitle | std.StyleStructTitle | undefined;

    if (ItemStructTitle) {
        blocks.push((
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`Indent${indent}`}/>
                </w.pPr>
                <DOCXSentenceChildrenRun els={ItemStructTitle.children} emphasis={true} {...{ docxOptions }} />
            </w.p>
        ));
    }

    for (const child of el.children) {
        if (
            std.isTableStructTitle(child)
            || std.isFigStructTitle(child)
            || std.isNoteStructTitle(child)
            || std.isFormatStructTitle(child)
            || std.isStyleStructTitle(child)
        ) {
            continue;

        } else if (std.isRemarks(child)) {
            blocks.push(<DOCXRemarks el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isTable(child)) {
            blocks.push(<DOCXTable el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isFig(child)) {
            blocks.push(<w.p><DOCXFigRun el={child} {...{ docxOptions }} /></w.p>);

        } else if (std.isNoteLike(child)) {
            blocks.push(<DOCXNoteLike el={child} indent={indent} {...{ docxOptions }} />);

        }
        else { assertNever(child); }
    }

    return (<>
        {withKey(blocks)}
    </>);
}));
