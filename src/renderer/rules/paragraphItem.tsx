import React, { Fragment } from "react";
import * as std from "../../law/std";
import { Diff, NotImplementedError } from "../../util";
import { containerInfoOf, ELComponentProps, HTMLComponentProps, MARGIN, wrapHTMLComponent } from "./html";
import { DOCXSentenceChildren, HTMLSentenceChildren } from "./sentenceChildren";
import { isParagraphItem } from "../../law/std";
import { DOCXColumnsOrSentences, HTMLColumnsOrSentences } from "./columnsOrSentences";
import { EL } from "../../node/el";
import { DOCXComponentProps, w } from "./docx";


interface ParagraphItemProps extends ELComponentProps<std.ParagraphItem> {
    indent: number,
    ArticleTitle?: std.ArticleTitle,
}

export const isHTMLParagraphItemProps = (props: ELComponentProps<EL>): props is ParagraphItemProps => isParagraphItem(props.el);

export const HTMLParagraphItem = wrapHTMLComponent<HTMLComponentProps & ParagraphItemProps>("HTMLParagraphItem", (props => {

    const { el, htmlOptions, indent, ArticleTitle } = props;

    const blocks: JSX.Element[] = [];

    let ParagraphCaption: std.ParagraphCaption | null = null;
    let ParagraphItemTitle: std.ParagraphItemTitle | null = null;
    let ParagraphItemSentence: std.ParagraphItemSentence | undefined;
    const Children: Diff<std.ParagraphItem["children"][number], std.ParagraphItemTitle | std.ParagraphItemSentence>[] = [];
    for (const child of el.children) {

        if (std.isParagraphCaption(child)) {
            ParagraphCaption = child;

        } else if (std.isArticleCaption(child)) {
            console.error(`unexpected element! ${JSON.stringify(child, undefined, 2)}`);
            ParagraphCaption = child;

        } else if (std.isParagraphItemTitle(child)) {
            ParagraphItemTitle = child;

        } else if (std.isParagraphItemSentence(child)) {
            ParagraphItemSentence = child;

        } else {
            Children.push(child);

        }
    }

    if (ParagraphCaption) {
        blocks.push(<>
            <div className={"paragraph-item-caption"} style={{ marginLeft: `${indent + 1}em` }}>
                <HTMLSentenceChildren els={ParagraphCaption.children} {...{ htmlOptions }} />
            </div>
        </>); /* >>>> INDENT >>>> */
    }

    const SentenceChildren = ParagraphItemSentence ? ParagraphItemSentence.children : [];
    blocks.push(<>
        <div className={"paragraph-item-main"}>
            <span className={"paragraph-item-title"} style={{ fontWeight: "bold" }}>
                {ParagraphItemTitle && <HTMLSentenceChildren els={ParagraphItemTitle.children} {...{ htmlOptions }} />}
                {ArticleTitle && <HTMLSentenceChildren els={ArticleTitle.children} {...{ htmlOptions }} />}
            </span>
            <span className={"paragraph-item-margin"}>{MARGIN}</span>
            <span className={"paragraph-item-body"}>
                <HTMLColumnsOrSentences
                    els={SentenceChildren}
                    {...{ htmlOptions }}
                />
            </span>
        </div>
    </>);

    for (const child of Children) {
        if (std.isParagraphItem(child)) {
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

        } else {
            throw new NotImplementedError(child.tag);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // blocks.push(<AnyLawComponent el={child} indent={indent} key={(child as any).id} {...{ htmlOptions }} />);

        }
    }

    if (std.isParagraph(el)) {
        if (ArticleTitle) {
            return (
                <div className={`paragraph-item-${el.tag}`}>
                    {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
                </div>
            );
        } else {
            return (
                <div
                    data-container_info={JSON.stringify(containerInfoOf(el))}
                    className={`paragraph-item-${el.tag}`}
                >
                    {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
                </div>
            );
        }
    } else {
        return (
            <div className={`paragraph-item-${el.tag}`}>
                {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
            </div>
        );
    }
}));


export const DOCXParagraphItem: React.FC<DOCXComponentProps & ParagraphItemProps> = props => {

    const { el, docxOptions, indent, ArticleTitle } = props;

    const blocks: JSX.Element[] = [];

    let ParagraphCaption: std.ParagraphCaption | null = null;
    let ParagraphItemTitle: std.ParagraphItemTitle | null = null;
    let ParagraphItemSentence: std.ParagraphItemSentence | undefined;
    const Children: Diff<std.ParagraphItem["children"][number], std.ParagraphItemTitle | std.ParagraphItemSentence>[] = [];
    for (const child of el.children) {

        if (std.isParagraphCaption(child)) {
            ParagraphCaption = child;

        } else if (std.isArticleCaption(child)) {
            console.error(`unexpected element! ${JSON.stringify(child, undefined, 2)}`);
            ParagraphCaption = child;

        } else if (std.isParagraphItemTitle(child)) {
            ParagraphItemTitle = child;

        } else if (std.isParagraphItemSentence(child)) {
            ParagraphItemSentence = child;

        } else {
            Children.push(child);

        }
    }

    if (ParagraphCaption) {
        blocks.push(<>
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`IndentHanging${indent + 1}`}/>
                </w.pPr>
                <DOCXSentenceChildren els={ParagraphCaption.children} {...{ docxOptions }} />
            </w.p>
        </>); /* >>>> INDENT >>>> */
    }

    const SentenceChildren = ParagraphItemSentence ? ParagraphItemSentence.children : [];
    blocks.push(<>
        <w.p>
            <w.pPr>
                {ArticleTitle ? (
                    <w.pStyle w:val={el.tag}/>
                ) : (
                    <w.pStyle w:val={`IndentFirstLine${indent}`}/>
                )}
            </w.pPr>
            {ParagraphItemTitle && <DOCXSentenceChildren els={ParagraphItemTitle.children} {...{ docxOptions }} />}
            {ArticleTitle && <DOCXSentenceChildren els={ArticleTitle.children} {...{ docxOptions }} />}
            <w.r><w.t>{MARGIN}</w.t></w.r>
            <DOCXColumnsOrSentences
                els={SentenceChildren}
                {...{ docxOptions }}
            />
        </w.p>
    </>);

    for (const child of Children) {
        if (std.isParagraphItem(child)) {
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

        } else {
            throw new NotImplementedError(child.tag);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // blocks.push(<AnyLawComponent el={child} indent={indent} key={(child as any).id} {...{ docxOptions }} />);

        }
    }

    return (<>
        {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
    </>);
};
