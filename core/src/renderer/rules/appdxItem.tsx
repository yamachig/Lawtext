import React from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import type { HTMLComponentProps } from "../common/html";
import { elProps, wrapHTMLComponent } from "../common/html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import type { DOCXComponentProps } from "../common/docx/component";
import { wrapDOCXComponent } from "../common/docx/component";
import { w } from "../common/docx/tags";
import { DOCXItemStruct, HTMLItemStruct } from "./itemStruct";
import { DOCXParagraphItem, HTMLParagraphItem } from "./paragraphItem";
import { DOCXRemarks, HTMLRemarks } from "./remarks";
import { DOCXArithFormulaRun, HTMLArithFormulaRun } from "./arithFormulaRun";
import { withKey } from "../common";


export interface AppdxItemProps {
    el: std.AppdxItem | std.SupplProvisionAppdxItem,
    indent: number,
}

export const HTMLAppdxItemCSS = /*css*/`
.appdx-item {
    clear: both;
}

.appdx-item-head {
    clear: both;
    font-weight: bold;
}

`;

export const HTMLAppdxItem = wrapHTMLComponent("HTMLAppdxItem", ((props: HTMLComponentProps & AppdxItemProps) => {

    const { el, htmlOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const AppdxItemTitle = (el.children as (typeof el.children)[number][]).find(el => (
        std.isAppdxItemTitle(el)
        || std.isSupplProvisionAppdxItemTitle(el)
    )) as std.AppdxItemTitle | std.SupplProvisionAppdxItemTitle | undefined;

    const RelatedArticleNum = (el.children as (typeof el.children)[number][]).find(std.isRelatedArticleNum);

    if (AppdxItemTitle || RelatedArticleNum) {
        blocks.push((
            <div className={`appdx-item-head indent-${indent}`}>
                {(AppdxItemTitle !== undefined) && (
                    <span className="appdx-item-title" {...elProps(AppdxItemTitle, htmlOptions)}>
                        <HTMLSentenceChildrenRun els={AppdxItemTitle.children} {...{ htmlOptions }} />
                    </span>
                )}
                {(RelatedArticleNum !== undefined) && (
                    <span className="related-article-num" {...elProps(RelatedArticleNum, htmlOptions)}>
                        <HTMLSentenceChildrenRun els={RelatedArticleNum.children} {...{ htmlOptions }} />
                    </span>
                )}
            </div>
        ));
    }

    const bodyBlocks: JSX.Element[] = [];

    for (const child of el.children) {
        if (
            std.isAppdxItemTitle(child)
            || std.isSupplProvisionAppdxItemTitle(child)
            || std.isRelatedArticleNum(child)
        ) {
            continue;

        } else if (std.isRemarks(child)) {
            bodyBlocks.push(<HTMLRemarks el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isTableStruct(child) || std.isFigStruct(child) || std.isNoteLikeStruct(child)) {
            bodyBlocks.push(<HTMLItemStruct el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isItem(child)) {
            bodyBlocks.push(<HTMLParagraphItem el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isArithFormula(child)) {
            bodyBlocks.push((
                <div className={`appdx-item-runs indent-${indent}`} {...elProps(child, htmlOptions)}>
                    <HTMLArithFormulaRun el={child} {...{ htmlOptions }} />
                </div>
            ));

        }
        else { assertNever(child); }
    }

    if (bodyBlocks.length > 0) {
        blocks.push((
            <div className="appdx-item-body">
                {withKey(bodyBlocks)}
            </div>
        ));
    }

    return (
        <div className="appdx-item" {...elProps(el, htmlOptions)}>
            {withKey(blocks)}
        </div>
    );
}));

export const DOCXAppdxItem = wrapDOCXComponent("DOCXAppdxItem", ((props: DOCXComponentProps & AppdxItemProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const AppdxItemTitle = (el.children as (typeof el.children)[number][]).find(el => (
        std.isAppdxItemTitle(el)
        || std.isSupplProvisionAppdxItemTitle(el)
    )) as std.AppdxItemTitle | std.SupplProvisionAppdxItemTitle | undefined;

    const RelatedArticleNum = (el.children as (typeof el.children)[number][]).find(std.isRelatedArticleNum);

    const hasFig = Boolean(el.children.find((c =>
        (std.isTableStruct(c) || std.isFigStruct(c) || std.isNoteLikeStruct(c))
        && c.children.length !== 0
        && (
            std.isFig(c.children[0])
            || (
                std.isNoteLike(c.children[0])
                && c.children[0].children.length !== 0
                && std.isFig(c.children[0].children[0])
            )
        )
    )));

    if (AppdxItemTitle || RelatedArticleNum) {
        blocks.push((
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`Indent${indent}`}/>
                    {hasFig && <w.keepNext/>}
                    {hasFig && <w.keepLines/>}
                </w.pPr>
                {(AppdxItemTitle !== undefined) && (
                    <DOCXSentenceChildrenRun els={AppdxItemTitle.children} emphasis={true} {...{ docxOptions }} />
                )}
                {(RelatedArticleNum !== undefined) && (
                    <DOCXSentenceChildrenRun els={RelatedArticleNum.children} emphasis={true} {...{ docxOptions }} />
                )}
            </w.p>
        ));
    }

    for (const child of el.children) {
        if (
            std.isAppdxItemTitle(child)
            || std.isSupplProvisionAppdxItemTitle(child)
            || std.isRelatedArticleNum(child)
        ) {
            continue;

        } else if (std.isRemarks(child)) {
            blocks.push(<DOCXRemarks el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isTableStruct(child) || std.isFigStruct(child) || std.isNoteLikeStruct(child)) {
            blocks.push(<DOCXItemStruct el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isItem(child)) {
            blocks.push(<DOCXParagraphItem el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isArithFormula(child)) {
            blocks.push((
                <w.p>
                    <w.pPr>
                        <w.pStyle w:val={`Indent${indent}`}/>
                    </w.pPr>
                    <DOCXArithFormulaRun el={child} {...{ docxOptions }} />
                </w.p>
            ));

        }
        else { assertNever(child); }
    }

    return (<>
        {withKey(blocks)}
    </>);
}));
