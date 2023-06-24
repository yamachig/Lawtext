import React from "react";
import * as std from "../../law/std";
import { assertNever, NotImplementedError } from "../../util";
import { elProps, HTMLComponentProps, HTMLMarginSpan, wrapHTMLComponent } from "../common/html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import { DOCXColumnsOrSentencesRun, HTMLColumnsOrSentencesRun } from "./columnsOrSentencesRun";
import { DOCXComponentProps, DOCXMargin, w, wrapDOCXComponent } from "../common/docx";
import { DOCXItemStruct, HTMLItemStruct } from "./itemStruct";
import { DOCXList, HTMLList } from "./list";
import { DOCXAmendProvision, HTMLAmendProvision } from "./amendProvision";
import { withKey } from "../common";

export interface ParagraphItemProps {
    el: std.ParagraphItem,
    indent: number,
    ArticleTitle?: std.ArticleTitle,
    decorations?: React.ComponentType<HTMLComponentProps & ParagraphItemProps>[],
}

export const HTMLParagraphItemCSS = /*css*/`
.paragraph-item-any {
    position: relative;
}

.paragraph-item-any > div:not(.paragraph-item-decoration-block) {
    position: relative;
}

.paragraph-item-decoration-block {
    position: absolute;
    width: calc(100% - var(--paragraph-item-indent, 0));
    left: var(--paragraph-item-indent, 0);
    height: 100%;
}

.paragraph-item-decoration-left-border {
    margin: 0 0 0 -1em;
    border-left: 0.1em solid transparent;
    width: 100%;
    height: 100%;
    transition: border-left-color 0.3s;
}

.paragraph-item-any:hover > * > .paragraph-item-decoration-left-border {
    border-left-color: rgba(255, 166, 0, 0.5);
}

${
    std.paragraphItemTags
        .filter(tag => tag !== "Paragraph")
        .map(tag => ".paragraph-item-" + tag).join(", ")
} {
    clear: both;
}

.article-title {
    font-weight: bold;
}

.paragraph-item-title {
    font-weight: bold;
}


.paragraph-item-main {
    position: relative;
    padding-left: 1em;
    text-indent: -1em;
}
`;

const HTMLParagraphItemLeftBorder: React.FC = () => {
    return <div className="paragraph-item-decoration-left-border"></div>;
};

export const HTMLParagraphItem = wrapHTMLComponent("HTMLParagraphItem", ((props: HTMLComponentProps & ParagraphItemProps) => {

    const { el, htmlOptions, indent, ArticleTitle } = props;

    const blocks: JSX.Element[] = [];

    const ParagraphCaption = (el.children as (typeof el.children)[number][]).find(el => std.isParagraphCaption(el) || std.isArticleCaption(el)) as std.ParagraphCaption | undefined;
    if (ParagraphCaption && std.isArticleCaption(ParagraphCaption)) {
        console.error(`unexpected element! ${JSON.stringify(ParagraphCaption, undefined, 2)}`);
    }
    const ParagraphItemTitle = (el.children as (typeof el.children)[number][]).find(std.isParagraphItemTitle);
    const ParagraphItemSentence = (el.children as (typeof el.children)[number][]).find(std.isParagraphItemSentence);
    const OldParatraphNum = (
        (std.isParagraph(el) && el.attr.OldNum === "true")
            ? String.fromCharCode("①".charCodeAt(0) - 1 + Number(el.attr.Num))
            : undefined
    );

    if (ParagraphCaption) {
        blocks.push((
            <div className={`paragraph-caption indent-${indent + 1}`} {...elProps(ParagraphCaption, htmlOptions)}>
                <HTMLSentenceChildrenRun els={ParagraphCaption.children} {...{ htmlOptions }} />
            </div>
        ));
    }

    if (ParagraphItemTitle || ParagraphItemSentence) {
        blocks.push((
            <div className={`paragraph-item-main indent-${indent}`}>
                {Boolean(ParagraphItemTitle || ArticleTitle || OldParatraphNum) && ((
                    <>
                        {ParagraphItemTitle && ((!ArticleTitle && !OldParatraphNum) || (ParagraphItemTitle.children.length > 0)) && (
                            <span className={"paragraph-item-title"} {...elProps(ParagraphItemTitle, htmlOptions)}>
                                <HTMLSentenceChildrenRun els={ParagraphItemTitle.children} {...{ htmlOptions }} />
                            </span>
                        )}
                        {ArticleTitle && (
                            <span className={"article-title"} {...elProps(ArticleTitle, htmlOptions)}>
                                <HTMLSentenceChildrenRun els={ArticleTitle.children} {...{ htmlOptions }} />
                            </span>
                        )}
                        {OldParatraphNum && (
                            <span className={"old-paragraph-num"}>
                                <HTMLSentenceChildrenRun els={[OldParatraphNum]} {...{ htmlOptions }} />
                            </span>
                        )}
                        {Boolean(ParagraphItemSentence) && (
                            <HTMLMarginSpan className="paragraph-item-margin"/>
                        )}
                    </>
                ))}
                <span className={"paragraph-item-body"}>
                    <HTMLColumnsOrSentencesRun
                        els={ParagraphItemSentence?.children ?? []}
                        {...{ htmlOptions }}
                    />
                </span>
            </div>
        ));
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

        } else if (std.isTableStruct(child) || std.isFigStruct(child) || std.isStyleStruct(child)) {
            blocks.push(<HTMLItemStruct el={child} indent={indent + 1} {...{ htmlOptions }} />); /* >>>> INDENT >>>> */

        } else if (std.isList(child)) {
            blocks.push(<HTMLList el={child} indent={indent + 2} {...{ htmlOptions }} />); /* >>>> INDENT ++++ INDENT >>>> */

        } else if (std.isAmendProvision(child)) {
            blocks.push(<HTMLAmendProvision el={child} indent={indent + 1} {...{ htmlOptions }} />); /* >>>> INDENT >>>> */

        } else if (std.isClass(child)) {
            throw new NotImplementedError(child.tag);

        }
        else { throw assertNever(child); }
    }

    const decorations = [HTMLParagraphItemLeftBorder, ...(props.decorations ?? [])];

    return (
        <div
            className={`paragraph-item-${el.tag} paragraph-item-any`}
            {...elProps(el, htmlOptions)}
        >
            {(decorations.length > 0) && <>
                {decorations.map((D, i) => (
                    <div key={i} className={"paragraph-item-decoration-block"} style={{ ["--paragraph-item-indent" as string]: `${indent}em` }}>
                        <D {...props}/>
                    </div>
                ))}
            </>}
            {withKey(blocks)}
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
    const OldParatraphNum = (
        (std.isParagraph(el) && el.attr.OldNum === "true")
            ? String.fromCharCode("①".charCodeAt(0) - 1 + Number(el.attr.Num))
            : undefined
    );

    if (ParagraphCaption) {
        blocks.push((
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`Indent${indent + 1}`}/>
                </w.pPr>
                <DOCXSentenceChildrenRun els={ParagraphCaption.children} {...{ docxOptions }} />
            </w.p>
        ));
    }

    if (ParagraphItemTitle || ParagraphItemSentence) {
        blocks.push((
            <w.p>
                <w.pPr>
                    {(ArticleTitle || ParagraphItemTitle) ? (
                        <w.pStyle w:val={`IndentHanging${indent}`}/>
                    ) : (
                        <w.pStyle w:val={`IndentFirstLine${indent}`}/>
                    )}
                </w.pPr>
                {ParagraphItemTitle && ((!ArticleTitle && !OldParatraphNum) || (ParagraphItemTitle.children.length > 0)) && (
                    <DOCXSentenceChildrenRun els={ParagraphItemTitle.children} {...{ docxOptions }} />
                )}
                {ArticleTitle && (
                    <DOCXSentenceChildrenRun els={ArticleTitle.children} emphasis={true} {...{ docxOptions }} />
                )}
                {OldParatraphNum && (
                    <DOCXSentenceChildrenRun els={[OldParatraphNum]} {...{ docxOptions }} />
                )}
                {Boolean((ParagraphItemTitle || ArticleTitle) && ParagraphItemSentence) && (
                    <w.r><w.t>{DOCXMargin}</w.t></w.r>
                )}
                <DOCXColumnsOrSentencesRun
                    els={ParagraphItemSentence?.children ?? []}
                    {...{ docxOptions }}
                />
            </w.p>
        ));
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

        } else if (std.isTableStruct(child) || std.isFigStruct(child) || std.isStyleStruct(child)) {
            blocks.push(<DOCXItemStruct el={child} indent={indent + 1} {...{ docxOptions }} />); /* >>>> INDENT >>>> */

        } else if (std.isList(child)) {
            blocks.push(<DOCXList el={child} indent={indent + 2} {...{ docxOptions }} />); /* >>>> INDENT ++++ INDENT >>>> */

        } else if (std.isAmendProvision(child)) {
            blocks.push(<DOCXAmendProvision el={child} indent={indent + 1} {...{ docxOptions }} />); /* >>>> INDENT >>>> */

        } else if (std.isClass(child)) {
            throw new NotImplementedError(child.tag);

        }
        else { throw assertNever(child); }
    }

    return (<>
        {withKey(blocks)}
    </>);
}));
