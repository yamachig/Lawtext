import React from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import { HTMLComponentProps, wrapHTMLComponent } from "../common/html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import { DOCXComponentProps, w, wrapDOCXComponent } from "../common/docx";
import { DOCXArticleGroup, HTMLArticleGroup } from "./articleGroup";
import { sentenceChildrenToString } from "../../parser/cst/rules/$sentenceChildren";
import { DOCXAppdxItem, HTMLAppdxItem } from "./appdxItem";
import { DOCXParagraphItem, HTMLParagraphItem } from "./paragraphItem";
import { DOCXTOC, HTMLTOC } from "./toc";
import EmptyParagraph from "../common/docx/EmptyParagraph";
import { withKey } from "../common";


export interface EnactStatementProps {
    el: std.EnactStatement,
    indent: number,
}

export const HTMLEnactStatementCSS = /*css*/`
.enact-statement {
    clear: both;
}
`;

export const HTMLEnactStatement = wrapHTMLComponent("HTMLEnactStatement", ((props: HTMLComponentProps & EnactStatementProps) => {

    const { el, htmlOptions, indent } = props;

    return (
        <div className={`enact-statement indent-${indent}`}>
            <HTMLSentenceChildrenRun els={el.children} {...{ htmlOptions }} />
        </div>
    );
}));

export const DOCXEnactStatement = wrapDOCXComponent("DOCXEnactStatement", ((props: DOCXComponentProps & EnactStatementProps) => {

    const { el, docxOptions, indent } = props;

    return (
        <w.p>
            <w.pPr>
                <w.pStyle w:val={`Indent${indent}`}/>
            </w.pPr>
            <DOCXSentenceChildrenRun els={el.children} {...{ docxOptions }} />
        </w.p>
    );
}));
export interface PreambleProps {
    el: std.Preamble,
    indent: number,
}

export const HTMLPreambleCSS = /*css*/`
.preamble {
    clear: both;
}
`;

export const HTMLPreamble = wrapHTMLComponent("HTMLPreamble", ((props: HTMLComponentProps & PreambleProps) => {

    const { el, htmlOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    for (const child of el.children) {
        if (
            std.isParagraph(child)
        ) {
            blocks.push(<HTMLParagraphItem el={child} indent={indent} {...{ htmlOptions }} />);

        }
        else { assertNever(child); }
    }

    return (
        <div className={"preamble"}>
            {withKey(blocks)}
        </div>
    );
}));

export const DOCXPreamble = wrapDOCXComponent("DOCXPreamble", ((props: DOCXComponentProps & PreambleProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    for (const child of el.children) {
        if (
            std.isParagraph(child)
        ) {
            blocks.push(<DOCXParagraphItem el={child} indent={indent} {...{ docxOptions }} />);

        }
        else { assertNever(child); }
    }

    return (<>
        {withKey(blocks)}
    </>);
}));


export interface LawProps {
    el: std.Law,
    indent: number,
}

export const HTMLLawCSS = /*css*/`
.law-title {
    font-weight: bold;
}

.law-num {
    font-weight: bold;
}
`;

export const HTMLLaw = wrapHTMLComponent("HTMLLaw", ((props: HTMLComponentProps & LawProps) => {

    const { el, htmlOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const LawTitle = el.children.find(std.isLawBody)?.children.find(std.isLawTitle);
    const LawNum = el.children.find(std.isLawNum);

    if (LawTitle) {
        blocks.push((
            <div className={`law-title indent-${indent}`}>
                <HTMLSentenceChildrenRun els={LawTitle.children} {...{ htmlOptions }} />
            </div>
        ));
    }

    if (LawNum) {
        const LawNumString = sentenceChildrenToString(LawNum.children);
        const LawNumChildren = [...LawNum.children];
        if (!/^[(（]/.test(LawNumString)) LawNumChildren.unshift("（");
        if (!/[)）]$/.test(LawNumString)) LawNumChildren.push("）");
        blocks.push((
            <div className={`law-num indent-${indent}`}>
                <HTMLSentenceChildrenRun els={LawNumChildren} {...{ htmlOptions }} />
            </div>
        ));
    }

    const bodyBlocks: JSX.Element[] = [];

    for (const child of el.children.find(std.isLawBody)?.children ?? []) {
        if (
            std.isLawTitle(child)
        ) {
            continue;

        } else if (std.isTOC(child)) {
            if (bodyBlocks.length > 0) bodyBlocks.push(<div className="empty"><br/></div>);
            bodyBlocks.push(<HTMLTOC el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isMainProvision(child) || std.isSupplProvision(child)) {
            if (bodyBlocks.length > 0) bodyBlocks.push(<div className="empty"><br/></div>);
            bodyBlocks.push(<HTMLArticleGroup el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isAppdxItem(child)) {
            if (bodyBlocks.length > 0) bodyBlocks.push(<div className="empty"><br/></div>);
            bodyBlocks.push(<HTMLAppdxItem el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isEnactStatement(child)) {
            if (bodyBlocks.length > 0) bodyBlocks.push(<div className="empty"><br/></div>);
            bodyBlocks.push(<HTMLEnactStatement el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isPreamble(child)) {
            if (bodyBlocks.length > 0) bodyBlocks.push(<div className="empty"><br/></div>);
            bodyBlocks.push(<HTMLPreamble el={child} indent={indent} {...{ htmlOptions }} />);

        }
        else { assertNever(child); }
    }

    if (bodyBlocks.length > 0) {
        if (blocks.length > 0) blocks.push(<div className="empty"><br/></div>);
        blocks.push((
            <div className={"law-body"}>
                {withKey(bodyBlocks)}
            </div>
        ));
    }

    return (
        <div className={"law"}>
            {withKey(blocks)}
        </div>
    );
}));

export const DOCXLaw = wrapDOCXComponent("DOCXLaw", ((props: DOCXComponentProps & LawProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const LawTitle = el.children.find(std.isLawBody)?.children.find(std.isLawTitle);
    const LawNum = el.children.find(std.isLawNum);

    if (LawTitle) {
        blocks.push((
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`Indent${indent}`}/>
                </w.pPr>
                <DOCXSentenceChildrenRun els={LawTitle.children} emphasis={true} {...{ docxOptions }} />
            </w.p>
        ));
    }

    if (LawNum) {
        const LawNumString = sentenceChildrenToString(LawNum.children);
        const LawNumChildren = [...LawNum.children];
        if (!/^[(（]/.test(LawNumString)) LawNumChildren.unshift("（");
        if (!/[)）]$/.test(LawNumString)) LawNumChildren.push("）");
        blocks.push((
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`Indent${indent}`}/>
                </w.pPr>
                <DOCXSentenceChildrenRun els={LawNumChildren} emphasis={true} {...{ docxOptions }} />
            </w.p>
        ));
    }

    for (const child of el.children.find(std.isLawBody)?.children ?? []) {
        if (
            std.isLawTitle(child)
        ) {
            continue;

        } else if (std.isTOC(child)) {
            if (blocks.length > 0) blocks.push(<EmptyParagraph/>);
            blocks.push(<DOCXTOC el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isMainProvision(child) || std.isSupplProvision(child)) {
            if (blocks.length > 0) blocks.push(<EmptyParagraph/>);
            blocks.push(<DOCXArticleGroup el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isAppdxItem(child)) {
            if (blocks.length > 0) blocks.push(<EmptyParagraph/>);
            blocks.push(<DOCXAppdxItem el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isEnactStatement(child)) {
            if (blocks.length > 0) blocks.push(<EmptyParagraph/>);
            blocks.push(<DOCXEnactStatement el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isPreamble(child)) {
            if (blocks.length > 0) blocks.push(<EmptyParagraph/>);
            blocks.push(<DOCXPreamble el={child} indent={indent} {...{ docxOptions }} />);

        }
        else { assertNever(child); }
    }

    return (<>
        {withKey(blocks)}
    </>);
}));
