import React, { Fragment } from "react";
import * as std from "../../law/std";
import { assertNever, NotImplementedError } from "../../util";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXSentenceChildren, HTMLSentenceChildren } from "./sentenceChildren";
import { DOCXComponentProps, w, wrapDOCXComponent } from "./docx";
import { DOCXParagraphItem, HTMLParagraphItem } from "./paragraphItem";


export interface ArticleProps {
    el: std.Article,
    indent: number,
}

export const HTMLArticleCSS = /*css*/`
.article {
    clear: both;
    margin-top: 1em;
}

.article-caption {
    margin-top: 0;
    margin-bottom: 0;
}
`;

export const HTMLArticle = wrapHTMLComponent("HTMLArticle", ((props: HTMLComponentProps & ArticleProps) => {

    const { el, htmlOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const ArticleCaption = el.children.find(std.isArticleCaption);
    const ArticleTitle = el.children.find(std.isArticleTitle);
    const Paragraphs = el.children.filter(std.isParagraph);

    if (ArticleCaption) {
        blocks.push(<>
            <p className={`article-caption indent-${indent + 1}`}>
                <HTMLSentenceChildren els={ArticleCaption.children} {...{ htmlOptions }} />
            </p>
        </>); /* >>>> INDENT >>>> */
    }

    const bodyBlocks: JSX.Element[] = [];

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
            throw new NotImplementedError(child.tag);

        }
        else { assertNever(child); }
    }

    if (bodyBlocks.length > 0) {
        blocks.push(<>
            <div className={"article-body"}>
                {bodyBlocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
            </div>
        </>);
    }

    return (
        <div className={"article"}>
            {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
        </div>
    );
}));

export const DOCXArticle = wrapDOCXComponent("DOCXArticle", ((props: DOCXComponentProps & ArticleProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const ArticleCaption = el.children.find(std.isArticleCaption);
    const ArticleTitle = el.children.find(std.isArticleTitle);
    const Paragraphs = el.children.filter(std.isParagraph);

    if (ArticleCaption) {
        blocks.push(<>
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`Indent${indent + 1}`}/>
                </w.pPr>
                <DOCXSentenceChildren els={ArticleCaption.children} {...{ docxOptions }} />
            </w.p>
        </>); /* >>>> INDENT >>>> */
    }

    const bodyBlocks: JSX.Element[] = [];

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
            throw new NotImplementedError(child.tag);

        }
        else { assertNever(child); }
    }

    if (bodyBlocks.length > 0) {
        blocks.push(<>
            {bodyBlocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
        </>);
    }

    return (<>
        {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
    </>);
}));
