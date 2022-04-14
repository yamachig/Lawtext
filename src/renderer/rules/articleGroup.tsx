import React, { Fragment } from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXSentenceChildren, HTMLSentenceChildren } from "./sentenceChildren";
import { DOCXComponentProps, w, wrapDOCXComponent } from "./docx";
import { DOCXParagraphItem, HTMLParagraphItem } from "./paragraphItem";
import { DOCXArticle, HTMLArticle } from "./article";


export interface ArticleGroupProps {
    el: std.ArticleGroup,
    indent: number,
}

export const HTMLArticleGroupCSS = /*css*/`
.article-group {
    clear: both;
    padding-top: 1em;
}

.article-group-title {
    clear: both;
    margin-top: 0;
    margin-bottom: 0;
    font-weight: bold;
}
`;

export const HTMLArticleGroup = wrapHTMLComponent("HTMLArticleGroup", ((props: HTMLComponentProps & ArticleGroupProps) => {

    const { el, htmlOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const ArticleGroupTitle = (el.children as (typeof el.children)[number][]).find(std.isArticleGroupTitle);

    if (ArticleGroupTitle) {
        const titleIndent = std.articleGroupTitleTags.indexOf(ArticleGroupTitle.tag) + 2;
        blocks.push(<>
            <p className={`article-group-title indent-${indent + titleIndent}`}>
                <HTMLSentenceChildren els={ArticleGroupTitle.children} {...{ htmlOptions }} />
            </p>
        </>);
    }

    const bodyBlocks: JSX.Element[] = [];

    for (const child of el.children) {
        if (
            std.isArticleGroupTitle(child)
        ) {
            continue;

        } else if (std.isArticle(child)) {
            bodyBlocks.push(<HTMLArticle el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isParagraph(child)) {
            bodyBlocks.push(<HTMLParagraphItem el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isArticleGroup(child)) {
            bodyBlocks.push(<HTMLArticleGroup el={child} indent={indent} {...{ htmlOptions }} />);

        }
        else { assertNever(child); }
    }

    if (bodyBlocks.length > 0) {
        blocks.push(<>
            <div className={"article-group-body"}>
                {bodyBlocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
            </div>
        </>);
    }

    return (
        <div className={"article-group"}>
            {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
        </div>
    );
}));

export const DOCXArticleGroup = wrapDOCXComponent("DOCXArticleGroup", ((props: DOCXComponentProps & ArticleGroupProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const ArticleGroupTitle = (el.children as (typeof el.children)[number][]).find(std.isArticleGroupTitle);

    if (ArticleGroupTitle) {
        const titleIndent = std.articleGroupTitleTags.indexOf(ArticleGroupTitle.tag) + 2;
        blocks.push(<>
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`IndentHanging${indent + titleIndent}`}/>
                </w.pPr>
                <DOCXSentenceChildren els={ArticleGroupTitle.children} emphasis={true} {...{ docxOptions }} />
            </w.p>
        </>);
    }

    for (const child of el.children) {
        if (
            std.isArticleGroupTitle(child)
        ) {
            continue;

        } else if (std.isArticle(child)) {
            blocks.push(<DOCXArticle el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isParagraph(child)) {
            blocks.push(<DOCXParagraphItem el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isArticleGroup(child)) {
            blocks.push(<DOCXArticleGroup el={child} indent={indent} {...{ docxOptions }} />);

        }
        else { assertNever(child); }
    }

    return (<>
        {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
    </>);
}));
