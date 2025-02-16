import React from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import type { HTMLComponentProps } from "../common/html";
import { elProps, wrapHTMLComponent } from "../common/html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import type { DOCXComponentProps } from "../common/docx/component";
import { wrapDOCXComponent } from "../common/docx/component";
import { w } from "../common/docx/tags";
import { DOCXParagraphItem, HTMLParagraphItem } from "./paragraphItem";
import { DOCXSupplNote, HTMLSupplNote } from "./supplNote";
import { withKey } from "../common";


export interface ArticleProps {
    el: std.Article,
    indent: number,
}

export const HTMLArticleCSS = /*css*/`
.article {
    clear: both;
}

`;

export const HTMLArticle = wrapHTMLComponent("HTMLArticle", ((props: HTMLComponentProps & ArticleProps) => {

    const { el, htmlOptions, indent } = props;

    const blocks: React.JSX.Element[] = [];

    const ArticleCaption = el.children.find(std.isArticleCaption);
    const ArticleTitle = el.children.find(std.isArticleTitle);
    const Paragraphs = el.children.filter(std.isParagraph);

    if (ArticleCaption) {
        blocks.push((
            <div className={`article-caption indent-${indent + 1}`} {...elProps(ArticleCaption, htmlOptions)}>
                <HTMLSentenceChildrenRun els={ArticleCaption.children} {...{ htmlOptions }} />
            </div>
        )); /* >>>> INDENT >>>> */
    }

    const bodyBlocks: React.JSX.Element[] = [];

    for (const [i, child] of Paragraphs.entries()) {
        if (i === 0 && ArticleTitle) {
            bodyBlocks.push(<HTMLParagraphItem el={child} indent={indent} ArticleTitle={ArticleTitle} {...{ htmlOptions }}/>);
        } else {
            bodyBlocks.push(<HTMLParagraphItem el={child} indent={indent} {...{ htmlOptions }}/>);
        }
    }

    for (const child of el.children) {
        if (
            std.isArticleCaption(child)
            || std.isArticleTitle(child)
            || std.isParagraph(child)
        ) {
            continue;

        } else if (child.tag === "SupplNote") {
            bodyBlocks.push(<HTMLSupplNote el={child} indent={indent} {...{ htmlOptions }}/>);

        }
        else { assertNever(child); }
    }

    if (bodyBlocks.length > 0) {
        blocks.push((
            <div className={"article-body"}>
                {withKey(bodyBlocks)}
            </div>
        ));
    }

    return (
        <div className={"article"} {...elProps(el, htmlOptions)}>
            {withKey(blocks)}
        </div>
    );
}));

export const DOCXArticle = wrapDOCXComponent("DOCXArticle", ((props: DOCXComponentProps & ArticleProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: React.JSX.Element[] = [];

    const ArticleCaption = el.children.find(std.isArticleCaption);
    const ArticleTitle = el.children.find(std.isArticleTitle);
    const Paragraphs = el.children.filter(std.isParagraph);

    if (ArticleCaption) {
        blocks.push((
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`Indent${indent + 1}`}/>
                </w.pPr>
                <DOCXSentenceChildrenRun els={ArticleCaption.children} {...{ docxOptions }} />
            </w.p>
        )); /* >>>> INDENT >>>> */
    }

    const bodyBlocks: React.JSX.Element[] = [];

    for (const [i, child] of Paragraphs.entries()) {
        if (i === 0 && ArticleTitle) {
            bodyBlocks.push(<DOCXParagraphItem el={child} indent={indent} ArticleTitle={ArticleTitle} {...{ docxOptions }}/>);
        } else {
            bodyBlocks.push(<DOCXParagraphItem el={child} indent={indent} {...{ docxOptions }}/>);
        }
    }

    for (const child of el.children) {
        if (
            std.isArticleCaption(child)
            || std.isArticleTitle(child)
            || std.isParagraph(child)
        ) {
            continue;

        } else if (child.tag === "SupplNote") {
            bodyBlocks.push(<DOCXSupplNote el={child} indent={indent} {...{ docxOptions }}/>);

        }
        else { assertNever(child); }
    }

    if (bodyBlocks.length > 0) {
        blocks.push(<>
            {withKey(bodyBlocks)}
        </>);
    }

    return (<>
        {withKey(blocks)}
    </>);
}));
