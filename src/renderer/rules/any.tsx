import React from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import { AppdxItemProps, DOCXAppdxItem, HTMLAppdxItem } from "./appdxItem";
import { ArticleProps, DOCXArticle, HTMLArticle } from "./article";
import { ArticleGroupProps, DOCXArticleGroup, HTMLArticleGroup } from "./articleGroup";
import { DOCXComponentProps, wrapDOCXComponent } from "./docx";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXItemStruct, HTMLItemStruct, ItemStructProps } from "./itemStruct";
import { DOCXLaw, HTMLLaw, LawProps } from "./law";
import { DOCXParagraphItem, HTMLParagraphItem, ParagraphItemProps } from "./paragraphItem";
import { DOCXRemarks, HTMLRemarks, RemarksProps } from "./remarks";
import { DOCXTable, HTMLTable, TableProps } from "./table";

export type AnyELProps =
    | LawProps
    | ArticleGroupProps
    | ArticleProps
    | ParagraphItemProps
    | TableProps
    | ItemStructProps
    | AppdxItemProps
    | RemarksProps

export const isLawProps = (props: AnyELProps): props is LawProps =>
    std.isLaw(props.el);

export const isArticleGroupProps = (props: AnyELProps): props is ArticleGroupProps =>
    std.isArticleGroup(props.el)
    || std.isMainProvision(props.el);

export const isArticleProps = (props: AnyELProps): props is ArticleProps =>
    std.isArticle(props.el);

export const isParagraphItemProps = (props: AnyELProps): props is ParagraphItemProps =>
    std.isParagraphItem(props.el);

export const isTableProps = (props: AnyELProps): props is TableProps =>
    std.isTable(props.el);

export const isItemStructProps = (props: AnyELProps): props is ItemStructProps =>
    std.isTableStructTitle(props.el)
    || std.isFigStructTitle(props.el)
    || std.isNoteStructTitle(props.el)
    || std.isFormatStructTitle(props.el)
    || std.isStyleStructTitle(props.el);

export const isAppdxItemProps = (props: AnyELProps): props is AppdxItemProps =>
    std.isAppdxItem(props.el)
    || std.isSupplProvisionAppdxItem(props.el);

export const isRemarksProps = (props: AnyELProps): props is RemarksProps =>
    std.isRemarks(props.el);

export const HTMLAnyEL = wrapHTMLComponent("HTMLAnyEL", ((props: HTMLComponentProps & AnyELProps) => {
    if (isLawProps(props)) {
        return <HTMLLaw {...props} />;
    } else if (isArticleGroupProps(props)) {
        return <HTMLArticleGroup {...props} />;
    } else if (isArticleProps(props)) {
        return <HTMLArticle {...props} />;
    } else if (isParagraphItemProps(props)) {
        return <HTMLParagraphItem {...props} />;
    } else if (isTableProps(props)) {
        return <HTMLTable {...props} />;
    } else if (isItemStructProps(props)) {
        return <HTMLItemStruct {...props} />;
    } else if (isAppdxItemProps(props)) {
        return <HTMLAppdxItem {...props} />;
    } else if (isRemarksProps(props)) {
        return <HTMLRemarks {...props} />;
    }
    else { throw assertNever(props); }
}));

export const DOCXAnyEL = wrapDOCXComponent("DOCXAnyEL", ((props: DOCXComponentProps & AnyELProps) => {
    if (isLawProps(props)) {
        return <DOCXLaw {...props} />;
    } else if (isArticleGroupProps(props)) {
        return <DOCXArticleGroup {...props} />;
    } else if (isArticleProps(props)) {
        return <DOCXArticle {...props} />;
    } else if (isParagraphItemProps(props)) {
        return <DOCXParagraphItem {...props} />;
    } else if (isTableProps(props)) {
        return <DOCXTable {...props} />;
    } else if (isItemStructProps(props)) {
        return <DOCXItemStruct {...props} />;
    } else if (isAppdxItemProps(props)) {
        return <DOCXAppdxItem {...props} />;
    } else if (isRemarksProps(props)) {
        return <DOCXRemarks {...props} />;
    }
    else { throw assertNever(props); }
}));

