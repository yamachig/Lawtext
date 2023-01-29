
import React from "react";
import { HTMLComponentProps, WrapperComponentProps } from "lawtext/dist/src/renderer/common/html";
import { createGlobalStyle } from "styled-components";
import { LawViewOptions } from "../common";
import makePath from "lawtext/dist/src/path/v1/make";
import * as std from "lawtext/dist/src/law/std";

export const HTMLToplevelAndArticlesMenuCSS = createGlobalStyle/*css*/`
.toplevel-and-articles-wrap {
    position: relative;
}

.toplevel-and-articles-menu {
    position: absolute;
    margin-left: -1.5em;
    margin-top: -0.15em;
}

.toplevel-and-articles-menu-button {
    opacity: 0%;
    transition: opacity 0.3s;

    font-size: 0.7em;
    padding: 0 0 0 0.15em;
    width: calc(1em/0.7);
    height: calc(1em/0.7);
    line-height: 0.5em;
    background: var(--bs-body-bg);
}

.toplevel-and-articles-wrap:hover > .toplevel-and-articles-menu > div > .toplevel-and-articles-menu-button, .toplevel-and-articles-menu-button:hover {
    opacity: 100%;
}
`;

export const HTMLToplevelAndArticlesMenu: React.FC<HTMLComponentProps & { el: std.ArticleGroup | std.AppdxItem | std.SupplProvision | std.EnactStatement | std.Preamble }> = props => {
    const { el, htmlOptions } = props;
    const options = htmlOptions.options as LawViewOptions;

    if (std.isMainProvision(el)) return null;
    const analysis = options.lawData.analysis;
    if (!analysis) return null;
    const container = analysis.containersByEL.get(el);
    if (!container) return null;

    const path = makePath(container);
    const title = (container.el.children.find(el => std.isArticleGroupTitle(el) || std.isAppdxItemTitle(el) || std.isSupplProvisionLabel(el)) as (std.ArticleGroupTitle | std.AppdxItemTitle | std.SupplProvisionLabel | undefined))?.text() ?? "この項目";

    const onClickLink: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
        navigator.clipboard.writeText(`${location.protocol}//${location.host}${location.pathname}#/${options.firstPart}/${path}`);
        e.preventDefault();
        return false;
    };

    return <div className="toplevel-and-articles-menu">
        <div className="btn-group dropstart">
            <button className="btn btn-sm btn-outline-secondary toplevel-and-articles-menu-button dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            </button>
            <ul className="dropdown-menu">
                {path && (
                    <li>
                        <a
                            className="dropdown-item"
                            href={`#/${options.firstPart}/${path}`}
                            onClick={onClickLink}
                        >{title}へのリンクをコピー</a>
                    </li>
                )}
            </ul>
        </div>
    </div>;
};

export const WrapHTMLToplevelAndArticles: React.FC<WrapperComponentProps> = props => {
    const { childProps: _childProps, ChildComponent } = props;
    const childProps = _childProps as HTMLComponentProps & { el: std.ArticleGroup | std.AppdxItem | std.SupplProvision | std.EnactStatement | std.Preamble };
    return (
        <div className="toplevel-and-articles-wrap">
            <HTMLToplevelAndArticlesMenu {...childProps} />
            <ChildComponent {...childProps} />
        </div>
    );
};

export default WrapHTMLToplevelAndArticles;
