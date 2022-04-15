import React, { Fragment } from "react";
import * as std from "../../law/std";
import { assertNever, NotImplementedError } from "../../util";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import { DOCXComponentProps, w, wrapDOCXComponent } from "./docx";
import { DOCXArticleGroup, HTMLArticleGroup } from "./articleGroup";
import { sentenceChildrenToString } from "../../parser/cst/rules/$sentenceChildren";
import { DOCXAppdxItem, HTMLAppdxItem } from "./appdxItem";


export interface LawProps {
    el: std.Law,
    indent: number,
}

export const HTMLLawCSS = /*css*/`
.law-title {
    margin-top: 0;
    margin-bottom: 0;
    font-weight: bold;
}

.law-num {
    margin-top: 0;
    margin-bottom: 0;
    font-weight: bold;
}
`;

export const HTMLLaw = wrapHTMLComponent("HTMLLaw", ((props: HTMLComponentProps & LawProps) => {

    const { el, htmlOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const LawTitle = el.children.find(std.isLawBody)?.children.find(std.isLawTitle);
    const LawNum = el.children.find(std.isLawNum);

    if (LawTitle) {
        blocks.push(<>
            <p className={`law-title indent-${indent}`}>
                <HTMLSentenceChildrenRun els={LawTitle.children} {...{ htmlOptions }} />
            </p>
        </>);
    }

    if (LawNum) {
        const LawNumString = sentenceChildrenToString(LawNum.children);
        const LawNumChildren = [...LawNum.children];
        if (!/^[(（]/.test(LawNumString)) LawNumChildren.unshift("（");
        if (!/[)）]$/.test(LawNumString)) LawNumChildren.push("）");
        blocks.push(<>
            <p className={`law-num indent-${indent}`}>
                <HTMLSentenceChildrenRun els={LawNumChildren} {...{ htmlOptions }} />
            </p>
        </>);
    }

    const bodyBlocks: JSX.Element[] = [];

    for (const child of el.children.find(std.isLawBody)?.children ?? []) {
        if (
            std.isLawTitle(child)
        ) {
            continue;

        } else if (std.isTOC(child)) {
            throw new NotImplementedError(child.tag);
            // blocks.push(<TOCComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (std.isMainProvision(child) || std.isSupplProvision(child)) {
            bodyBlocks.push(<HTMLArticleGroup el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isAppdxItem(child)) {
            bodyBlocks.push(<HTMLAppdxItem el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isEnactStatement(child)) {
            throw new NotImplementedError(child.tag);
            // blocks.push(<EnactStatementComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (std.isPreamble(child)) {
            throw new NotImplementedError(child.tag);
            // blocks.push(<PreambleComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        }
        else { assertNever(child); }
    }

    if (bodyBlocks.length > 0) {
        blocks.push(<>
            <div className={"law-body"}>
                {bodyBlocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
            </div>
        </>);
    }

    return (
        <div className={"law"}>
            {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
        </div>
    );
}));

export const DOCXLaw = wrapDOCXComponent("DOCXLaw", ((props: DOCXComponentProps & LawProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const LawTitle = el.children.find(std.isLawBody)?.children.find(std.isLawTitle);
    const LawNum = el.children.find(std.isLawNum);

    if (LawTitle) {
        blocks.push(<>
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`Indent${indent}`}/>
                </w.pPr>
                <DOCXSentenceChildrenRun els={LawTitle.children} emphasis={true} {...{ docxOptions }} />
            </w.p>
        </>);
    }

    if (LawNum) {
        const LawNumString = sentenceChildrenToString(LawNum.children);
        const LawNumChildren = [...LawNum.children];
        if (!/^[(（]/.test(LawNumString)) LawNumChildren.unshift("（");
        if (!/[)）]$/.test(LawNumString)) LawNumChildren.push("）");
        blocks.push(<>
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`Indent${indent}`}/>
                </w.pPr>
                <DOCXSentenceChildrenRun els={LawNumChildren} emphasis={true} {...{ docxOptions }} />
            </w.p>
        </>);
    }

    for (const child of el.children.find(std.isLawBody)?.children ?? []) {
        if (
            std.isLawTitle(child)
        ) {
            continue;

        } else if (std.isTOC(child)) {
            // blocks.push(<TOCComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (std.isMainProvision(child) || std.isSupplProvision(child)) {
            blocks.push(<DOCXArticleGroup el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isAppdxItem(child)) {
            blocks.push(<DOCXAppdxItem el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isEnactStatement(child)) {
            // blocks.push(<EnactStatementComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        } else if (std.isPreamble(child)) {
            // blocks.push(<PreambleComponent el={child} indent={indent} key={child.id} ls={props.ls} />);

        }
        else { assertNever(child); }
    }

    return (<>
        {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
    </>);
}));
