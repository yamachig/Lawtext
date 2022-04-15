import React, { Fragment } from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import { HTMLComponentProps, wrapHTMLComponent, HTMLMarginSpan } from "./html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import { DOCXComponentProps, w, wrapDOCXComponent, DOCXMargin } from "./docx";
import { DOCXParagraphItem, HTMLParagraphItem } from "./paragraphItem";
import { DOCXArticle, HTMLArticle } from "./article";
import { DOCXAppdxItem, HTMLAppdxItem } from "./appdxItem";
import EmptyParagraph from "./docx/EmptyParagraph";


export interface ArticleGroupProps {
    el: std.ArticleGroup | std.MainProvision | std.SupplProvision,
    indent: number,
}

export const HTMLArticleGroupCSS = /*css*/`
.main-provision {
    clear: both;
}

.article-group {
    clear: both;
}

.article-group-title {
    clear: both;
    margin-top: 0;
    margin-bottom: 0;
    font-weight: bold;
}

.suppl-provision {
    clear: both;
}

.suppl-provision-label {
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

    const SupplProvisionLabel = (el.children as (typeof el.children)[number][]).find(std.isSupplProvisionLabel);

    if (ArticleGroupTitle) {
        const titleIndent = std.articleGroupTitleTags.indexOf(ArticleGroupTitle.tag) + 2;
        if (blocks.length > 0) blocks.push(<div className="empty"><br/></div>);
        blocks.push(<>
            <div className={`article-group-title indent-${indent + titleIndent}`}>
                <HTMLSentenceChildrenRun els={ArticleGroupTitle.children} {...{ htmlOptions }} />
            </div>
        </>);
    }

    if (SupplProvisionLabel && std.isSupplProvision(el)) {
        const Extract = el.attr.Extract === "true" ? <><HTMLMarginSpan/>抄</> : "";
        const AmendLawNum = el.attr.AmendLawNum ? `（${el.attr.AmendLawNum}）` : "";
        if (blocks.length > 0) blocks.push(<div className="empty"><br/></div>);
        blocks.push(<>
            <div className={`suppl-provision-label indent-${indent + 3}`}>
                <HTMLSentenceChildrenRun els={SupplProvisionLabel.children} {...{ htmlOptions }} />{AmendLawNum}
                {Extract}
            </div>
        </>);
    }

    const bodyBlocks: JSX.Element[] = [];

    for (const child of el.children) {
        if (
            std.isArticleGroupTitle(child)
            || std.isSupplProvisionLabel(child)
        ) {
            continue;

        } else if (std.isArticle(child)) {
            if (bodyBlocks.length > 0) bodyBlocks.push(<div className="empty"><br/></div>);
            bodyBlocks.push(<HTMLArticle el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isParagraph(child)) {
            if (bodyBlocks.length > 0) bodyBlocks.push(<div className="empty"><br/></div>);
            bodyBlocks.push(<HTMLParagraphItem el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isArticleGroup(child)) {
            if (bodyBlocks.length > 0) bodyBlocks.push(<div className="empty"><br/></div>);
            bodyBlocks.push(<HTMLArticleGroup el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isSupplProvisionAppdxItem(child)) {
            if (bodyBlocks.length > 0) bodyBlocks.push(<div className="empty"><br/></div>);
            bodyBlocks.push(<HTMLAppdxItem el={child} indent={indent} {...{ htmlOptions }} />);

        }
        else { assertNever(child); }
    }

    const classNameBase = (
        std.isMainProvision(el)
            ? "main-provision"
            : std.isSupplProvision(el)
                ? "suppl-provision"
                : "article-group"
    );

    if (bodyBlocks.length > 0) {
        if (blocks.length > 0) blocks.push(<div className="empty"><br/></div>);
        blocks.push(<>
            <div className={`${classNameBase}-body`}>
                {bodyBlocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
            </div>
        </>);
    }

    return (
        <div className={classNameBase}>
            {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
        </div>
    );
}));

export const DOCXArticleGroup = wrapDOCXComponent("DOCXArticleGroup", ((props: DOCXComponentProps & ArticleGroupProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const ArticleGroupTitle = (el.children as (typeof el.children)[number][]).find(std.isArticleGroupTitle);

    const SupplProvisionLabel = (el.children as (typeof el.children)[number][]).find(std.isSupplProvisionLabel);

    if (ArticleGroupTitle) {
        const titleIndent = std.articleGroupTitleTags.indexOf(ArticleGroupTitle.tag) + 2;
        if (blocks.length > 0) blocks.push(<EmptyParagraph/>);
        blocks.push(<>
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`IndentHanging${indent + titleIndent}`}/>
                </w.pPr>
                <DOCXSentenceChildrenRun els={ArticleGroupTitle.children} emphasis={true} {...{ docxOptions }} />
            </w.p>
        </>);
    }

    if (SupplProvisionLabel && std.isSupplProvision(el)) {
        const Extract = el.attr.Extract === "true" ? <>${DOCXMargin}抄</> : "";
        const AmendLawNum = el.attr.AmendLawNum ? `（${el.attr.AmendLawNum}）` : "";
        if (blocks.length > 0) blocks.push(<EmptyParagraph/>);
        blocks.push(<>
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`IndentHanging${indent + 3}`}/>
                </w.pPr>
                <DOCXSentenceChildrenRun els={SupplProvisionLabel.children} emphasis={true} {...{ docxOptions }} />
                {AmendLawNum}
                {Extract}
            </w.p>
        </>);
    }

    for (const child of el.children) {
        if (
            std.isArticleGroupTitle(child)
            || std.isSupplProvisionLabel(child)
        ) {
            continue;

        } else if (std.isArticle(child)) {
            if (blocks.length > 0) blocks.push(<EmptyParagraph/>);
            blocks.push(<DOCXArticle el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isParagraph(child)) {
            if (blocks.length > 0) blocks.push(<EmptyParagraph/>);
            blocks.push(<DOCXParagraphItem el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isArticleGroup(child)) {
            if (blocks.length > 0) blocks.push(<EmptyParagraph/>);
            blocks.push(<DOCXArticleGroup el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isSupplProvisionAppdxItem(child)) {
            if (blocks.length > 0) blocks.push(<EmptyParagraph/>);
            blocks.push(<DOCXAppdxItem el={child} indent={indent} {...{ docxOptions }} />);

        }
        else { assertNever(child); }
    }

    return (<>
        {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
    </>);
}));
