import React, { Fragment } from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import { DOCXComponentProps, w, wrapDOCXComponent } from "./docx";
import { isSentenceChildEL, SentenceChildEL } from "../../node/cst/inline";
import { EL } from "../../node/el";


export interface TOCProps {
    el: std.TOC,
    indent: number,
}

export const HTMLTOCCSS = /*css*/`
.toc {
    clear: both;
}

.toc-label {
    clear: both;
    margin-top: 0;
    margin-bottom: 0;
    font-weight: bold;
}

.toc-item-main {
    margin-top: 0;
    margin-bottom: 0;
}
`;

export const HTMLTOC = wrapHTMLComponent("HTMLTOC", ((props: HTMLComponentProps & TOCProps) => {

    const { el, htmlOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const TOCLabel = el.children.find(std.isTOCLabel);

    if (TOCLabel) {
        blocks.push(<>
            <p className={`toc-label indent-${indent}`}>
                <HTMLSentenceChildrenRun els={TOCLabel.children} {...{ htmlOptions }} />
            </p>
        </>);
    }

    const bodyBlocks: JSX.Element[] = [];

    for (const child of el.children) {
        if (
            std.isTOCLabel(child)
        ) {
            continue;

        } else if (std.isTOCItem(child)) {
            bodyBlocks.push(<HTMLTOCItem el={child} indent={indent + 1} {...{ htmlOptions }} />);

        }
        else { assertNever(child); }
    }

    if (bodyBlocks.length > 0) {
        blocks.push(<>
            <div className={"toc-body"}>
                {bodyBlocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
            </div>
        </>);
    }

    return (
        <div className={"toc"}>
            {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
        </div>
    );
}));

export const DOCXTOC = wrapDOCXComponent("DOCXTOC", ((props: DOCXComponentProps & TOCProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const TOCLabel = el.children.find(std.isTOCLabel);

    if (TOCLabel) {
        blocks.push(<>
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`Indent${indent}`}/>
                </w.pPr>
                <DOCXSentenceChildrenRun els={TOCLabel.children} emphasis={true} {...{ docxOptions }} />
            </w.p>
        </>);
    }

    for (const child of el.children) {
        if (
            std.isTOCLabel(child)
        ) {
            continue;

        } else if (std.isTOCItem(child)) {
            blocks.push(<DOCXTOCItem el={child} indent={indent + 1} {...{ docxOptions }} />);

        }
        else { assertNever(child); }
    }

    return (<>
        {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
    </>);
}));


export interface TOCItemProps {
    el: std.TOCItem,
    indent: number,
}

export const HTMLTOCItem = wrapHTMLComponent("HTMLTOCItem", ((props: HTMLComponentProps & TOCItemProps) => {

    const { el, htmlOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const TOCItemTitle = (el.children as (typeof el.children)[number][]).find(c => std.isArticleGroupTitle(c) || std.isSupplProvisionLabel(c) || std.isArticleTitle(c)) as std.ArticleGroupTitle | std.SupplProvisionLabel | std.ArticleTitle | undefined;
    const ArticleRange = (el.children as (typeof el.children)[number][]).find(c => std.isArticleRange(c) || std.isArticleCaption(c)) as std.ArticleRange | std.ArticleCaption | undefined;

    if (TOCItemTitle || ArticleRange) {
        blocks.push(<>
            <p className={`toc-item-main indent-${indent}`}>
                {(TOCItemTitle !== undefined) && <HTMLSentenceChildrenRun els={TOCItemTitle.children} {...{ htmlOptions }} />}
                {(ArticleRange !== undefined) && <HTMLSentenceChildrenRun els={ArticleRange.children} {...{ htmlOptions }} />}
            </p>
        </>);
    }

    for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i];

        if (
            std.isArticleGroupTitle(child)
                || std.isSupplProvisionLabel(child)
                || std.isArticleRange(child)
                || std.isArticleTitle(child)
                || std.isArticleCaption(child)
        ) {
            continue;

        } else if (std.isTOCItem(child)) {
            blocks.push(<HTMLTOCItem el={child} indent={indent + 1} {...{ htmlOptions }} />);

        } else if (typeof child === "string" || isSentenceChildEL(child)) {
            // "Line", "QuoteStruct", "ArithFormula", "Ruby", "Sup", "Sub"
            let j = i + 1;
            while (j < el.children.length && (typeof el.children[j] === "string" || isSentenceChildEL(el.children[j] as EL))) j++;
            const sentenceChildren = el.children.slice(i, j) as (SentenceChildEL | string)[];
            blocks.push(<>
                <p className={`toc-item-main indent-${indent}`}>
                    <HTMLSentenceChildrenRun els={sentenceChildren} {...{ htmlOptions }} />
                </p>
            </>);
            i = j - 1;

        }
        else { throw assertNever(child); }
    }

    return (
        <div
            className={`toc-item-${el.tag}`}
        >
            {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
        </div>
    );
}));

export const DOCXTOCItem = wrapDOCXComponent("DOCXTOCItem", ((props: DOCXComponentProps & TOCItemProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const TOCItemTitle = (el.children as (typeof el.children)[number][]).find(c => std.isArticleGroupTitle(c) || std.isSupplProvisionLabel(c) || std.isArticleTitle(c)) as std.ArticleGroupTitle | std.SupplProvisionLabel | std.ArticleTitle | undefined;
    const ArticleRange = (el.children as (typeof el.children)[number][]).find(c => std.isArticleRange(c) || std.isArticleCaption(c)) as std.ArticleRange | std.ArticleCaption | undefined;

    if (TOCItemTitle || ArticleRange) {
        blocks.push(<>
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`Indent${indent}`}/>
                </w.pPr>
                {(TOCItemTitle !== undefined) && <DOCXSentenceChildrenRun els={TOCItemTitle.children} {...{ docxOptions }} />}
                {(ArticleRange !== undefined) && <DOCXSentenceChildrenRun els={ArticleRange.children} {...{ docxOptions }} />}
            </w.p>
        </>);
    }

    for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i];

        if (
            std.isArticleGroupTitle(child)
                || std.isSupplProvisionLabel(child)
                || std.isArticleRange(child)
                || std.isArticleTitle(child)
                || std.isArticleCaption(child)
        ) {
            continue;

        } else if (std.isTOCItem(child)) {
            blocks.push(<DOCXTOCItem el={child} indent={indent + 1} {...{ docxOptions }} />);

        } else if (typeof child === "string" || isSentenceChildEL(child)) {
            // "Line", "QuoteStruct", "ArithFormula", "Ruby", "Sup", "Sub"
            let j = i + 1;
            while (j < el.children.length && (typeof el.children[j] === "string" || isSentenceChildEL(el.children[j] as EL))) j++;
            const sentenceChildren = el.children.slice(i, j) as (SentenceChildEL | string)[];
            blocks.push(<>
                <w.p>
                    <w.pPr>
                        <w.pStyle w:val={`Indent${indent}`}/>
                    </w.pPr>
                    <DOCXSentenceChildrenRun els={sentenceChildren} {...{ docxOptions }} />
                </w.p>
            </>);
            i = j - 1;

        }
        else { throw assertNever(child); }
    }

    return (<>
        {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
    </> );
}));
