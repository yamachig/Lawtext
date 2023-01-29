
import React from "react";
import { HTMLComponentProps, WrapperComponentProps } from "lawtext/dist/src/renderer/common/html";
import { ParagraphItemProps, HTMLParagraphItem } from "lawtext/dist/src/renderer/rules/paragraphItem";
import { createGlobalStyle } from "styled-components";
import { LawViewOptions } from "../common";
import makePath from "lawtext/dist/src/path/v1/make";
import { isArticleTitle } from "lawtext/dist/src/law/std";

export const HTMLParagraphItemMenuCSS = createGlobalStyle/*css*/`
.paragraph-item-menu {
    margin-left: -1.5em;
    margin-top: -0.15em;
}

.paragraph-item-menu-button {
    opacity: 0%;
    transition: opacity 0.3s;

    font-size: 0.7em;
    padding: 0 0 0 0.15em;
    width: calc(1em/0.7);
    height: calc(1em/0.7);
    line-height: 0.5em;
    background: var(--bs-body-bg);
}

.paragraph-item-any:hover > * > * > * > .paragraph-item-menu-button, .paragraph-item-menu-button:hover {
    opacity: 100%;
}
`;

export const HTMLParagraphItemMenu: React.FC<HTMLComponentProps & ParagraphItemProps> = props => {
    const { el, htmlOptions } = props;
    const options = htmlOptions.options as LawViewOptions;

    const analysis = options.lawData.analysis;
    if (!analysis) return null;
    const container = analysis.containersByEL.get(el);
    if (!container) return null;
    let articlePath: string | null = null;
    let articleTitle: string | null = null;

    const articleContainer = container.parentsSub(c => c.el.tag === "Article").next().value;
    if (articleContainer) {
        const article = articleContainer.el;
        articlePath = makePath(articleContainer);
        articleTitle = article.children.find(isArticleTitle)?.text() ?? "この条";
    }

    const path = (
        articlePath
        && container.el.tag === "Paragraph"
        && container.subParent?.subChildren.filter(c => c.el.tag === "Paragraph").length === 1
    )
        ? null
        : makePath(container);

    const onClickParagraphItemLink: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
        navigator.clipboard.writeText(`${location.protocol}//${location.host}${location.pathname}#/${options.firstPart}/${path}`);
        e.preventDefault();
        return false;
    };

    const onClickArticleLink: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
        if (articlePath) navigator.clipboard.writeText(`${location.protocol}//${location.host}${location.pathname}#/${options.firstPart}/${articlePath}`);
        e.preventDefault();
        return false;
    };

    return <div className="paragraph-item-menu">
        <div className="btn-group dropstart">
            <button className="btn btn-sm btn-outline-secondary paragraph-item-menu-button dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            </button>
            <ul className="dropdown-menu">
                {path && (
                    <li>
                        <a
                            className="dropdown-item"
                            href={`#/${options.firstPart}/${path}`}
                            onClick={onClickParagraphItemLink}
                        >この項目へのリンクをコピー</a>
                    </li>
                )}
                {articlePath && (
                    <li>
                        <a
                            className="dropdown-item"
                            href={`#/${options.firstPart}/${articlePath}`}
                            onClick={onClickArticleLink}
                        >{articleTitle}へのリンクをコピー</a>
                    </li>
                )}
            </ul>
        </div>
    </div>;
};

export const WrapHTMLParagraphItem: React.FC<WrapperComponentProps> = props => {
    const { childProps: _childProps, ChildComponent: _ChildComponent } = props;
    const ChildComponent = _ChildComponent as unknown as typeof HTMLParagraphItem;
    const childProps = _childProps as HTMLComponentProps & ParagraphItemProps;
    return <ChildComponent {...childProps} decorations={[HTMLParagraphItemMenu]} />;
};

export default WrapHTMLParagraphItem;
