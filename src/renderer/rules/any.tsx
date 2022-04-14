import React from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import { ArticleProps, DOCXArticle, HTMLArticle } from "./article";
import { ArticleGroupProps, DOCXArticleGroup, HTMLArticleGroup } from "./articleGroup";
import { DOCXComponentProps, wrapDOCXComponent } from "./docx";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXLaw, HTMLLaw, LawProps } from "./law";
import { DOCXParagraphItem, HTMLParagraphItem, ParagraphItemProps } from "./paragraphItem";
import { DOCXTable, HTMLTable, TableProps } from "./table";

export type AnyELProps =
    | LawProps
    | ArticleGroupProps
    | ArticleProps
    | ParagraphItemProps
    | TableProps

export const isLawProps = (props: AnyELProps): props is LawProps =>
    std.isLaw(props.el);

export const isArticleGroupProps = (props: AnyELProps): props is ArticleGroupProps =>
    std.isArticleGroup(props.el) || std.isMainProvision(props.el);

export const isArticleProps = (props: AnyELProps): props is ArticleProps =>
    std.isArticle(props.el);

export const isParagraphItemProps = (props: AnyELProps): props is ParagraphItemProps =>
    std.isParagraphItem(props.el);

export const isTableProps = (props: AnyELProps): props is TableProps =>
    std.isTable(props.el);

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
    }
    else { throw assertNever(props); }
}));

