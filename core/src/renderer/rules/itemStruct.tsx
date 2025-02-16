import React from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import type { HTMLComponentProps } from "../common/html";
import { elProps, wrapHTMLComponent } from "../common/html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import type { DOCXComponentProps } from "../common/docx/component";
import { wrapDOCXComponent } from "../common/docx/component";
import { w } from "../common/docx/tags";
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

    const blocks: React.JSX.Element[] = [];

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

    const bodyBlocks: React.JSX.Element[] = [];

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

    const blocks: React.JSX.Element[] = [];

    const ItemStructTitle = (el.children as (typeof el.children)[number][]).find(el => (
        std.isTableStructTitle(el)
        || std.isFigStructTitle(el)
        || std.isNoteStructTitle(el)
        || std.isFormatStructTitle(el)
        || std.isStyleStructTitle(el)
    )) as std.TableStructTitle | std.FigStructTitle | std.NoteStructTitle | std.FormatStructTitle | std.StyleStructTitle | undefined;

    const hasFig = Boolean(el.children.find(c => std.isFig(c) || (std.isNoteLike(c) && c.children.length !== 0 && std.isFig(c.children[0]))));

    if (ItemStructTitle) {
        blocks.push((
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`Indent${indent}`}/>
                    {hasFig && <w.keepNext/>}
                    {hasFig && <w.keepLines/>}
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
