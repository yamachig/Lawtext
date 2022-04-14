import React from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import { ArticleProps, DOCXArticle, HTMLArticle } from "./article";
import { ArticleGroupProps, DOCXArticleGroup, HTMLArticleGroup } from "./articleGroup";
import { DOCXComponentProps, wrapDOCXComponent } from "./docx";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXParagraphItem, HTMLParagraphItem, ParagraphItemProps } from "./paragraphItem";

export type AnyELProps =
    | ArticleGroupProps
    | ArticleProps
    | ParagraphItemProps

export const isArticleGroupProps = (props: AnyELProps): props is ArticleGroupProps =>
    std.isArticleGroup(props.el);

export const isArticleProps = (props: AnyELProps): props is ArticleProps =>
    std.isArticle(props.el);

export const isParagraphItemProps = (props: AnyELProps): props is ParagraphItemProps =>
    std.isParagraphItem(props.el);

export const HTMLAnyEL = wrapHTMLComponent("HTMLAnyEL", ((props: HTMLComponentProps & AnyELProps) => {
    if (isArticleGroupProps(props)) {
        return <HTMLArticleGroup {...props} />;
    } else if (isArticleProps(props)) {
        return <HTMLArticle {...props} />;
    } else if (isParagraphItemProps(props)) {
        return <HTMLParagraphItem {...props} />;
    }
    else { throw assertNever(props); }
}));

export const DOCXAnyEL = wrapDOCXComponent("DOCXAnyEL", ((props: DOCXComponentProps & AnyELProps) => {
    if (isArticleGroupProps(props)) {
        return <DOCXArticleGroup {...props} />;
    } else if (isArticleProps(props)) {
        return <DOCXArticle {...props} />;
    } else if (isParagraphItemProps(props)) {
        return <DOCXParagraphItem {...props} />;
    }
    else { throw assertNever(props); }
}));

