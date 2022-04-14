import React, { Fragment } from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import { DOCXComponentProps, w, wrapDOCXComponent } from "./docx";
import { DOCXParagraphItem, HTMLParagraphItem } from "./paragraphItem";


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
    margin-top: 0;
    margin-bottom: 0;
    font-weight: bold;
}

.remarks-sentence {
    margin-top: 0;
    margin-bottom: 0;
}
`;

export const HTMLRemarks = wrapHTMLComponent("HTMLRemarks", ((props: HTMLComponentProps & RemarksProps) => {

    const { el, htmlOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const RemarksLabel = el.children.find(std.isRemarksLabel);

    if (RemarksLabel) {
        blocks.push(<>
            <p className={`remarks-label indent-${indent}`}>
                <HTMLSentenceChildrenRun els={RemarksLabel.children} {...{ htmlOptions }} />
            </p>
        </>);
    }

    const bodyBlocks: JSX.Element[] = [];

    for (const child of el.children) {
        if (
            std.isRemarksLabel(child)
        ) {
            continue;

        } else if (std.isSentence(child)) {
            bodyBlocks.push(<>
                <p className={`remarks-sentence indent-${indent + 1}`}>
                    <HTMLSentenceChildrenRun els={child.children} {...{ htmlOptions }} />
                </p>
            </>);

        } else if (std.isItem(child)) {
            bodyBlocks.push(<>
                <HTMLParagraphItem el={child} indent={indent + 1} {...{ htmlOptions }} />
            </>);

        }
        else { assertNever(child); }
    }

    if (bodyBlocks.length > 0) {
        blocks.push(<>
            <div className={"remarks-body"}>
                {bodyBlocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
            </div>
        </>);
    }

    return (
        <div className={"remarks"}>
            {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
        </div>
    );
}));

export const DOCXRemarks = wrapDOCXComponent("DOCXRemarks", ((props: DOCXComponentProps & RemarksProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const RemarksLabel = el.children.find(std.isRemarksLabel);

    if (RemarksLabel) {
        blocks.push(<>
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`Indent${indent}`}/>
                </w.pPr>
                <DOCXSentenceChildrenRun els={RemarksLabel.children} emphasis={true} {...{ docxOptions }} />
            </w.p>
        </>);
    }

    for (const child of el.children) {
        if (
            std.isRemarksLabel(child)
        ) {
            continue;

        } else if (std.isSentence(child)) {
            blocks.push(<>
                <w.p>
                    <w.pPr>
                        <w.pStyle w:val={`Indent${indent + 1}`}/>
                    </w.pPr>
                    <DOCXSentenceChildrenRun els={child.children} {...{ docxOptions }} />
                </w.p>
            </>);

        } else if (std.isItem(child)) {
            blocks.push(<DOCXParagraphItem el={child} indent={indent + 1} {...{ docxOptions }} />);

        }
        else { assertNever(child); }
    }

    return (<>
        {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
    </>);
}));
