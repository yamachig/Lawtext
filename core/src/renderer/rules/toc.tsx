import React from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import type { HTMLComponentProps } from "../common/html";
import { elProps, wrapHTMLComponent } from "../common/html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import type { DOCXComponentProps } from "../common/docx/component";
import { wrapDOCXComponent } from "../common/docx/component";
import { w } from "../common/docx/tags";
import type { SentenceChildEL } from "../../node/cst/inline";
import { isSentenceChildEL } from "../../node/cst/inline";
import type { EL } from "../../node/el";
import { withKey } from "../common";


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
    font-weight: bold;
}

`;

export const HTMLTOC = wrapHTMLComponent("HTMLTOC", ((props: HTMLComponentProps & TOCProps) => {

    const { el, htmlOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const TOCLabel = el.children.find(std.isTOCLabel);

    if (TOCLabel) {
        blocks.push((
            <div className={`toc-label indent-${indent}`} {...elProps(TOCLabel, htmlOptions)}>
                <HTMLSentenceChildrenRun els={TOCLabel.children} {...{ htmlOptions }} />
            </div>
        ));
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
        blocks.push((
            <div className={"toc-body"}>
                {withKey(bodyBlocks)}
            </div>
        ));
    }

    return (
        <div className={"toc"} {...elProps(el, htmlOptions)}>
            {withKey(blocks)}
        </div>
    );
}));

export const DOCXTOC = wrapDOCXComponent("DOCXTOC", ((props: DOCXComponentProps & TOCProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const TOCLabel = el.children.find(std.isTOCLabel);

    if (TOCLabel) {
        blocks.push((
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`Indent${indent}`}/>
                </w.pPr>
                <DOCXSentenceChildrenRun els={TOCLabel.children} emphasis={true} {...{ docxOptions }} />
            </w.p>
        ));
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
        {withKey(blocks)}
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
        blocks.push((
            <div className={`toc-item-main indent-${indent}`}>
                {(TOCItemTitle !== undefined) && (
                    <span className={"toc-item-title"} {...elProps(TOCItemTitle, htmlOptions)}>
                        <HTMLSentenceChildrenRun els={TOCItemTitle.children} {...{ htmlOptions }} />
                    </span>
                )}
                {(ArticleRange !== undefined) && (
                    <span className={"article-range"} {...elProps(ArticleRange, htmlOptions)}>
                        <HTMLSentenceChildrenRun els={ArticleRange.children} {...{ htmlOptions }} />
                    </span>
                )}
            </div>
        ));
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
            blocks.push((
                <div className={`toc-item-main indent-${indent}`}>
                    <HTMLSentenceChildrenRun els={sentenceChildren} {...{ htmlOptions }} />
                </div>
            ));
            i = j - 1;

        }
        else { throw assertNever(child); }
    }

    return (
        <div
            className={`toc-item-${el.tag}`}
            {...elProps(el, htmlOptions)}
        >
            {withKey(blocks)}
        </div>
    );
}));

export const DOCXTOCItem = wrapDOCXComponent("DOCXTOCItem", ((props: DOCXComponentProps & TOCItemProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const TOCItemTitle = (el.children as (typeof el.children)[number][]).find(c => std.isArticleGroupTitle(c) || std.isSupplProvisionLabel(c) || std.isArticleTitle(c)) as std.ArticleGroupTitle | std.SupplProvisionLabel | std.ArticleTitle | undefined;
    const ArticleRange = (el.children as (typeof el.children)[number][]).find(c => std.isArticleRange(c) || std.isArticleCaption(c)) as std.ArticleRange | std.ArticleCaption | undefined;

    if (TOCItemTitle || ArticleRange) {
        blocks.push((
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`Indent${indent}`}/>
                </w.pPr>
                {(TOCItemTitle !== undefined) && <DOCXSentenceChildrenRun els={TOCItemTitle.children} {...{ docxOptions }} />}
                {(ArticleRange !== undefined) && <DOCXSentenceChildrenRun els={ArticleRange.children} {...{ docxOptions }} />}
            </w.p>
        ));
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
            blocks.push((
                <w.p>
                    <w.pPr>
                        <w.pStyle w:val={`Indent${indent}`}/>
                    </w.pPr>
                    <DOCXSentenceChildrenRun els={sentenceChildren} {...{ docxOptions }} />
                </w.p>
            ));
            i = j - 1;

        }
        else { throw assertNever(child); }
    }

    return (<>
        {withKey(blocks)}
    </> );
}));
