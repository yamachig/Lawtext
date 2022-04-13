import React from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import { ArticleProps, DOCXArticle, HTMLArticle } from "./article";
import { DOCXComponentProps, wrapDOCXComponent } from "./docx";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXParagraphItem, HTMLParagraphItem, ParagraphItemProps } from "./paragraphItem";

export type AnyELProps =
    | ParagraphItemProps
    | ArticleProps

export const isParagraphItemProps = (props: AnyELProps): props is ParagraphItemProps =>
    std.isParagraphItem(props.el);

export const isArticleProps = (props: AnyELProps): props is ArticleProps =>
    std.isArticle(props.el);

export const HTMLAnyEL = wrapHTMLComponent("HTMLAnyEL", ((props: HTMLComponentProps & AnyELProps) => {
    if (isParagraphItemProps(props)) {
        return <HTMLParagraphItem {...props} />;
    } else if (isArticleProps(props)) {
        return <HTMLArticle {...props} />;
    }
    else { throw assertNever(props); }
}));

export const DOCXAnyEL = wrapDOCXComponent("DOCXAnyEL", ((props: DOCXComponentProps & AnyELProps) => {
    if (isParagraphItemProps(props)) {
        return <DOCXParagraphItem {...props} />;
    } else if (isArticleProps(props)) {
        return <DOCXArticle {...props} />;
    }
    else { throw assertNever(props); }
}));

