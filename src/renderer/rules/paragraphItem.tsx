import React, { Fragment } from "react";
import * as std from "../../law/std";
import { assertNever, NotImplementedError } from "../../util";
import { HTMLComponentProps, HTMLMarginSpan, wrapHTMLComponent } from "./html";
import { DOCXSentenceChildren, HTMLSentenceChildren } from "./sentenceChildren";
import { DOCXColumnsOrSentences, HTMLColumnsOrSentences } from "./columnsOrSentences";
import { DOCXComponentProps, DOCXMargin, w, wrapDOCXComponent } from "./docx";


export interface ParagraphItemProps {
    el: std.ParagraphItem,
    indent: number,
    ArticleTitle?: std.ArticleTitle,
}

export const HTMLParagraphItemCSS = /*css*/`
.paragraph-item-Paragraph {
    clear: both;
    border-left: 0.2em solid transparent;
    padding-left: 0.8em;
    margin: 0 0 0 -1em;
    transition: border-left-color 0.3s;
}

.paragraph-item-Paragraph:hover {
    border-left-color: rgba(255, 166, 0, 0.5);
}

${
    std.paragraphItemTags
        .filter(tag => tag !== "Paragraph")
        .map(tag => ".paragraph-item-" + tag).join(", ")
} {
    clear: both;
}

.paragraph-item-title {
    font-weight: bold;
}

.paragraph-caption {
    margin-top: 0;
    margin-bottom: 0;
}

.paragraph-item-main {
    margin-top: 0;
    margin-bottom: 0;
    padding-left: 1em;
    text-indent: -1em;
}
`;

export const HTMLParagraphItem = wrapHTMLComponent("HTMLParagraphItem", ((props: HTMLComponentProps & ParagraphItemProps) => {

    const { el, htmlOptions, indent, ArticleTitle } = props;

    const blocks: JSX.Element[] = [];

    const ParagraphCaption = (el.children as (typeof el.children)[number][]).find(el => std.isParagraphCaption(el) || std.isArticleCaption(el)) as std.ParagraphCaption | undefined;
    if (ParagraphCaption && std.isArticleCaption(ParagraphCaption)) {
        console.error(`unexpected element! ${JSON.stringify(ParagraphCaption, undefined, 2)}`);
    }
    const ParagraphItemTitle = (el.children as (typeof el.children)[number][]).find(std.isParagraphItemTitle);
    const ParagraphItemSentence = (el.children as (typeof el.children)[number][]).find(std.isParagraphItemSentence);

    if (ParagraphCaption) {
        blocks.push(<>
            <p className={`paragraph-caption indent-${indent + 1}`}>
                <HTMLSentenceChildren els={ParagraphCaption.children} {...{ htmlOptions }} />
            </p>
        </>);
    }

    if (ParagraphItemTitle || ParagraphItemSentence) {
        blocks.push(<>
            <p className={`paragraph-item-main indent-${indent}`}>
                {Boolean(ParagraphItemTitle || ArticleTitle) && (<>
                    <span className={"paragraph-item-title"}>
                        {ParagraphItemTitle && <HTMLSentenceChildren els={ParagraphItemTitle.children} {...{ htmlOptions }} />}
                        {ArticleTitle && <HTMLSentenceChildren els={ArticleTitle.children} {...{ htmlOptions }} />}
                    </span>
                    {Boolean(ParagraphItemSentence) && (
                        <HTMLMarginSpan className="paragraph-item-margin"/>
                    )}
                </>)}
                <span className={"paragraph-item-body"}>
                    <HTMLColumnsOrSentences
                        els={ParagraphItemSentence?.children ?? []}
                        {...{ htmlOptions }}
                    />
                </span>
            </p>
        </>);
    }

    for (const child of el.children) {

        if (
            std.isArticleCaption(child)
            || std.isParagraphCaption(child)
            || std.isParagraphItemTitle(child)
            || std.isParagraphItemSentence(child)
        ) {
            continue;

        } else if (std.isParagraphItem(child)) {
            blocks.push(<HTMLParagraphItem el={child} indent={indent + 1} {...{ htmlOptions }} />); /* >>>> INDENT >>>> */

        } else if (std.isTableStruct(child)) {
            throw new NotImplementedError(child.tag);
            // blocks.push(<TableStructComponent el={child} indent={indent + 1} {...{ htmlOptions }} />); /* >>>> INDENT >>>> */

        } else if (std.isFigStruct(child)) {
            throw new NotImplementedError(child.tag);
            // blocks.push(<FigStructComponent el={child} indent={indent + 1} {...{ htmlOptions }} />); /* >>>> INDENT >>>> */

        } else if (std.isStyleStruct(child)) {
            throw new NotImplementedError(child.tag);
            // blocks.push(<StyleStructComponent el={child} indent={indent + 1} {...{ htmlOptions }} />); /* >>>> INDENT >>>> */

        } else if (std.isList(child)) {
            throw new NotImplementedError(child.tag);
            // blocks.push(<ListComponent el={child} indent={indent + 2} {...{ htmlOptions }} />); /* >>>> INDENT ++++ INDENT >>>> */

        } else if (std.isAmendProvision(child)) {
            throw new NotImplementedError(child.tag);
            // blocks.push(<AmendProvisionComponent el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isClass(child)) {
            throw new NotImplementedError(child.tag);

        }
        else { throw assertNever(child); }
    }

    return (
        <div
            className={`paragraph-item-${el.tag}`}
        >
            {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
        </div>
    );
}));


export const DOCXParagraphItem = wrapDOCXComponent("DOCXParagraphItem", ((props: DOCXComponentProps & ParagraphItemProps) => {

    const { el, docxOptions, indent, ArticleTitle } = props;

    const blocks: JSX.Element[] = [];

    const ParagraphCaption = (el.children as (typeof el.children)[number][]).find(el => std.isParagraphCaption(el) || std.isArticleCaption(el)) as std.ParagraphCaption | undefined;
    if (ParagraphCaption && std.isArticleCaption(ParagraphCaption)) {
        console.error(`unexpected element! ${JSON.stringify(ParagraphCaption, undefined, 2)}`);
    }
    const ParagraphItemTitle = (el.children as (typeof el.children)[number][]).find(std.isParagraphItemTitle);
    const ParagraphItemSentence = (el.children as (typeof el.children)[number][]).find(std.isParagraphItemSentence);

    if (ParagraphCaption) {
        blocks.push(<>
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`Indent${indent + 1}`}/>
                </w.pPr>
                <DOCXSentenceChildren els={ParagraphCaption.children} {...{ docxOptions }} />
            </w.p>
        </>);
    }

    if (ParagraphItemTitle || ParagraphItemSentence) {
        blocks.push(<>
            <w.p>
                <w.pPr>
                    {(ArticleTitle || ParagraphItemTitle) ? (
                        <w.pStyle w:val={`IndentHanging${indent}`}/>
                    ) : (
                        <w.pStyle w:val={`IndentFirstLine${indent}`}/>
                    )}
                </w.pPr>
                {ParagraphItemTitle && <DOCXSentenceChildren els={ParagraphItemTitle.children} {...{ docxOptions }} />}
                {ArticleTitle && <DOCXSentenceChildren els={ArticleTitle.children} emphasis={true} {...{ docxOptions }} />}
                {Boolean((ParagraphItemTitle || ArticleTitle) && ParagraphItemSentence) && (
                    <w.r><w.t>{DOCXMargin}</w.t></w.r>
                )}
                <DOCXColumnsOrSentences
                    els={ParagraphItemSentence?.children ?? []}
                    {...{ docxOptions }}
                />
            </w.p>
        </>);
    }

    for (const child of el.children) {

        if (
            std.isArticleCaption(child)
            || std.isParagraphCaption(child)
            || std.isParagraphItemTitle(child)
            || std.isParagraphItemSentence(child)
        ) {
            continue;

        } else if (std.isParagraphItem(child)) {
            blocks.push(<DOCXParagraphItem el={child} indent={indent + 1} {...{ docxOptions }} />); /* >>>> INDENT >>>> */

        } else if (std.isTableStruct(child)) {
            throw new NotImplementedError(child.tag);
            // blocks.push(<TableStructComponent el={child} indent={indent + 1} {...{ docxOptions }} />); /* >>>> INDENT >>>> */

        } else if (std.isFigStruct(child)) {
            throw new NotImplementedError(child.tag);
            // blocks.push(<FigStructComponent el={child} indent={indent + 1} {...{ docxOptions }} />); /* >>>> INDENT >>>> */

        } else if (std.isStyleStruct(child)) {
            throw new NotImplementedError(child.tag);
            // blocks.push(<StyleStructComponent el={child} indent={indent + 1} {...{ docxOptions }} />); /* >>>> INDENT >>>> */

        } else if (std.isList(child)) {
            throw new NotImplementedError(child.tag);
            // blocks.push(<ListComponent el={child} indent={indent + 2} {...{ docxOptions }} />); /* >>>> INDENT ++++ INDENT >>>> */

        } else if (std.isAmendProvision(child)) {
            throw new NotImplementedError(child.tag);
            // blocks.push(<AmendProvisionComponent el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isClass(child)) {
            throw new NotImplementedError(child.tag);

        }
        else { throw assertNever(child); }
    }

    return (<>
        {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
    </>);
}));
