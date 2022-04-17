import React from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import { elProps, HTMLComponentProps, wrapHTMLComponent } from "../common/html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import { DOCXComponentProps, w, wrapDOCXComponent } from "../common/docx";
import { DOCXParagraphItem, HTMLParagraphItem } from "./paragraphItem";
import { withKey } from "../common";


export interface RemarksProps {
    el: std.Remarks,
    indent: number,
}

export const HTMLRemarksCSS = /*css*/`
.remarks {
    clear: both;
}

.remarks-label {
    clear: both;
    font-weight: bold;
}

`;

export const HTMLRemarks = wrapHTMLComponent("HTMLRemarks", ((props: HTMLComponentProps & RemarksProps) => {

    const { el, htmlOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const RemarksLabel = el.children.find(std.isRemarksLabel);

    if (RemarksLabel) {
        blocks.push((
            <div className={`remarks-label indent-${indent}`} {...elProps(RemarksLabel, htmlOptions)}>
                <HTMLSentenceChildrenRun els={RemarksLabel.children} {...{ htmlOptions }} />
            </div>
        ));
    }

    const bodyBlocks: JSX.Element[] = [];

    for (const child of el.children) {
        if (
            std.isRemarksLabel(child)
        ) {
            continue;

        } else if (std.isSentence(child)) {
            bodyBlocks.push((
                <div className={`remarks-sentence indent-${indent + 1}`} {...elProps(child, htmlOptions)}>
                    <HTMLSentenceChildrenRun els={child.children} {...{ htmlOptions }} />
                </div>
            ));

        } else if (std.isItem(child)) {
            bodyBlocks.push((
                <HTMLParagraphItem el={child} indent={indent + 1} {...{ htmlOptions }} />
            ));

        }
        else { assertNever(child); }
    }

    if (bodyBlocks.length > 0) {
        blocks.push((
            <div className={"remarks-body"}>
                {withKey(bodyBlocks)}
            </div>
        ));
    }

    return (
        <div className={"remarks"} {...elProps(el, htmlOptions)}>
            {withKey(blocks)}
        </div>
    );
}));

export const DOCXRemarks = wrapDOCXComponent("DOCXRemarks", ((props: DOCXComponentProps & RemarksProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const RemarksLabel = el.children.find(std.isRemarksLabel);

    if (RemarksLabel) {
        blocks.push((
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`Indent${indent}`}/>
                </w.pPr>
                <DOCXSentenceChildrenRun els={RemarksLabel.children} emphasis={true} {...{ docxOptions }} />
            </w.p>
        ));
    }

    for (const child of el.children) {
        if (
            std.isRemarksLabel(child)
        ) {
            continue;

        } else if (std.isSentence(child)) {
            blocks.push((
                <w.p>
                    <w.pPr>
                        <w.pStyle w:val={`Indent${indent + 1}`}/>
                    </w.pPr>
                    <DOCXSentenceChildrenRun els={child.children} {...{ docxOptions }} />
                </w.p>
            ));

        } else if (std.isItem(child)) {
            blocks.push(<DOCXParagraphItem el={child} indent={indent + 1} {...{ docxOptions }} />);

        }
        else { assertNever(child); }
    }

    return (<>
        {withKey(blocks)}
    </>);
}));
