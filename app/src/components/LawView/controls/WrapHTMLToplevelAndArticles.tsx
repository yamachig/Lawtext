
import React from "react";
import type { HTMLComponentProps, WrapperComponentProps } from "lawtext/dist/src/renderer/common/html";
import { createGlobalStyle } from "styled-components";
import type { LawViewOptions } from "../common";
import makePath from "lawtext/dist/src/path/v1/make";
import * as std from "lawtext/dist/src/law/std";
import { initialEnv } from "lawtext/dist/src/parser/cst/env";
import $articleGroupNum from "lawtext/dist/src/parser/cst/rules/$articleGroupNum";

export const HTMLToplevelAndArticlesMenuCSS = createGlobalStyle/*css*/`
.toplevel-and-articles-wrap {
    position: relative;
}

.toplevel-and-articles-menu {
    position: absolute;
    margin-left: -1.5em;
    @media (max-width: 767.98px) {
        margin-left: -1.2em;
    }
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

    const onClickLink: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
        navigator.clipboard.writeText(`${location.protocol}//${location.host}${location.pathname}#/${options.firstPart}/${path}`);
        e.preventDefault();
        return false;
    };

    const containerStack = container.linealAscendant();

    const names: string[] = [];
    let lawTitleAndNum = "";

    for (const c of containerStack) {
        if (std.isLaw(c.el)) {
            const lawTitle = c.el.children.find(std.isLawBody)?.children.find(std.isLawTitle);
            const lawNum = c.el.children.find(std.isLawNum);
            if (lawTitle && lawNum) {
                lawTitleAndNum = `${lawTitle.text()}（${lawNum.text()}）`;
            } else if (lawTitle) {
                lawTitleAndNum = lawTitle.text();
            } else if (lawNum) {
                lawTitleAndNum = lawNum.text();
            }

        } else if (std.isArticleGroup(container.el) && std.isArticleGroup(c.el)) {
            const articleGroupTitle = (c.el.children as (typeof c.el.children)[number][])
                .find(std.isArticleGroupTitle);
            const title = articleGroupTitle?.text() ?? "";

            const env = initialEnv({});

            const result = $articleGroupNum.match(
                0,
                title,
                env,
            );

            if (result.ok) names.push(result.value.value.text);

        } else if (std.isSupplProvision(c.el)) {
            if (!c.el.attr.AmendLawNum) {
                const supplProvisionLabel = c.el.children
                    .find(std.isSupplProvisionLabel);
                if (supplProvisionLabel) names.push(supplProvisionLabel.text()?.replace(/\s/g, ""));
            }

        } else if (std.isAppdxItem(c.el)) {
            const appdxItemTitle = (c.el.children as (typeof c.el.children)[number][])
                .find(std.isAppdxItemTitle);
            const title = appdxItemTitle?.text() ?? "";
            names.push(title);

        } else if (std.isSupplProvisionAppdxItem(c.el)) {
            const supplProvisionAppdxItemTitle = (c.el.children as (typeof c.el.children)[number][])
                .find(std.isSupplProvisionAppdxItemTitle);
            const title = supplProvisionAppdxItemTitle?.text() ?? "";
            names.push(title);

        } else {
            continue;
        }
    }

    const name = names.join("");

    const onClickCopyName: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
        navigator.clipboard.writeText(`${lawTitleAndNum}${name}`);
        e.preventDefault();
        return false;
    };

    return <div className="toplevel-and-articles-menu">
        <div className="btn-group dropdown">
            <button className="btn btn-sm btn-outline-secondary toplevel-and-articles-menu-button dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            </button>
            <ul className="dropdown-menu">
                <li><h6 className="dropdown-header">{name}</h6></li>
                {path && (
                    <li>
                        <a
                            className="dropdown-item"
                            href={`#/${options.firstPart}/${path}`}
                            onClick={onClickLink}
                        >この項目へのリンクをコピー</a>
                    </li>
                )}
                <li>
                    <a
                        className="dropdown-item lh-1"
                        href={`#/${options.firstPart}/${path}`}
                        onClick={onClickCopyName}
                    >名称をコピー：<br/><small style={{ whiteSpace: "normal" }} className="text-muted">「{lawTitleAndNum}{name}」</small></a>
                </li>
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
