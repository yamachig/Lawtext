import React, { Fragment } from "react";
import * as std from "../../law/std";
import { Diff, NotImplementedError } from "../../util";
import { containerInfoOf, ELComponentProps, HTMLComponentProps, MARGIN, wrapHTMLComponent } from "./common";
import { HTMLSentenceChildren } from "./sentenceChildren";
import { isParagraphItem } from "../../law/std";
import { HTMLColumnsOrSentences } from "./columnsOrSentences";


interface HTMLParagraphItemProps extends HTMLComponentProps, ELComponentProps { el: std.ParagraphItem, indent: number, ArticleTitle?: std.ArticleTitle }

export const isHTMLParagraphItemProps = (props: HTMLComponentProps & ELComponentProps): props is HTMLParagraphItemProps => isParagraphItem(props.el);

export const HTMLParagraphItem = wrapHTMLComponent<HTMLParagraphItemProps>("HTMLParagraphItem", (props => {

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
        blocks.push(
            <div className={"paragraph-item-caption"} style={{ marginLeft: `${indent + 1}em` }}>
                <HTMLSentenceChildren els={ParagraphCaption.children} {...{ htmlOptions }} />
            </div>,
        ); /* >>>> INDENT >>>> */
    }

    const SentenceChildren = ParagraphItemSentence ? ParagraphItemSentence.children : [];
    blocks.push(
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
        </div>,
    );

    for (const child of Children) {
        if (std.isParagraphItem(child)) {
            blocks.push(<HTMLParagraphItem el={child} indent={indent + 1} {...{ htmlOptions }} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "TableStruct") {
            throw new NotImplementedError(child.tag);
            // blocks.push(<TableStructComponent el={child} indent={indent + 1} {...{ htmlOptions }} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "FigStruct") {
            throw new NotImplementedError(child.tag);
            // blocks.push(<FigStructComponent el={child} indent={indent + 1} {...{ htmlOptions }} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "StyleStruct") {
            throw new NotImplementedError(child.tag);
            // blocks.push(<StyleStructComponent el={child} indent={indent + 1} {...{ htmlOptions }} />); /* >>>> INDENT >>>> */

        } else if (child.tag === "List") {
            throw new NotImplementedError(child.tag);
            // blocks.push(<ListComponent el={child} indent={indent + 2} {...{ htmlOptions }} />); /* >>>> INDENT ++++ INDENT >>>> */

        } else if (child.tag === "AmendProvision") {
            throw new NotImplementedError(child.tag);
            // blocks.push(<AmendProvisionComponent el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (child.tag === "Class") {
            throw new NotImplementedError(child.tag);

        } else {
            throw new NotImplementedError(child.tag);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // blocks.push(<AnyLawComponent el={child} indent={indent} key={(child as any).id} {...{ htmlOptions }} />);

        }
    }

    if (el.tag === "Paragraph") {
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
}),
);
