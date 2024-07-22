
import React from "react";
import type { HTMLComponentProps, WrapperComponentProps } from "lawtext/dist/src/renderer/common/html";
import type { ParagraphItemProps, HTMLParagraphItem } from "lawtext/dist/src/renderer/rules/paragraphItem";
import { createGlobalStyle } from "styled-components";
import type { LawViewOptions } from "../common";
import makePath from "lawtext/dist/src/path/v1/make";
import { isArticleTitle } from "lawtext/dist/src/law/std";
import * as std from "lawtext/dist/src/law/std";
import { digitsToKanjiNum } from "lawtext/dist/src/law/num";

export const HTMLParagraphItemMenuCSS = createGlobalStyle/*css*/`
.paragraph-item-menu {
    margin-left: -1.5em;
    @media (max-width: 767.98px) {
        margin-left: -1.2em;
    }
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
    if (articleContainer && articleContainer.children.find(pc => std.isParagraph(pc.el)) === container) {
        const article = articleContainer.el;
        articlePath = makePath(articleContainer);
        articleTitle = article.children.find(isArticleTitle)?.text() ?? "この条";
    }

    const path = (
        articleContainer
        && container.el.tag === "Paragraph"
        && container.subParent?.subChildren.filter(c => c.el.tag === "Paragraph").length === 1
    )
        ? makePath(articleContainer)
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

    const containerStack = container.linealAscendant(c => {
        if (std.isParagraph(c.el)) {
            const paragraphNum = c.el.children.find(std.isParagraphNum);
            if (!c.parent) return true;
            if (
                (std.isArticle(c.parent.el) || std.isMainProvision(c.parent.el) || std.isSupplProvision(c.parent.el)) &&
                c.parent.children.filter(pc => std.isParagraph(pc.el)).length === 1 &&
                paragraphNum && paragraphNum.text() === ""
            ) {
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    });

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

        } else if (std.isArticle(c.el)) {
            const articleTitle = c.el.children
                .find(std.isArticleTitle);
            if (articleTitle) names.push(articleTitle.text());

        } else if (std.isParagraph(c.el)) {
            names.push(`第${digitsToKanjiNum(c.el.attr.Num, "non-positional")}項`);

        } else if (std.isItem(c.el)) {
            const itemTitle = (c.el.children as std.StdEL[])
                .find(std.isParagraphItemTitle);
            if (itemTitle) {
                const itemTitleText = itemTitle.text();
                const dividerPos = itemTitleText.search(/[のノ]/);
                if (dividerPos >= 0) {
                    names.push(`第${itemTitleText.slice(0, dividerPos)}号${itemTitleText.slice(dividerPos)}`);
                } else {
                    names.push(`第${itemTitleText}号`);
                }
            }

        } else if (std.isParagraphItem(c.el)) {
            const itemTitle = (c.el.children as std.StdEL[])
                .find(std.isParagraphItemTitle);
            if (itemTitle) names.push(itemTitle.text());

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

    const onClickCopyArticleTitle: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
        navigator.clipboard.writeText(`${lawTitleAndNum}${articleTitle}`);
        e.preventDefault();
        return false;
    };

    return <div className="paragraph-item-menu">
        <div className="btn-group dropdown">
            <button className="btn btn-sm btn-outline-secondary paragraph-item-menu-button dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            </button>
            <ul className="dropdown-menu">
                <li><h6 className="dropdown-header">{name}</h6></li>
                {path && (
                    <li>
                        <a
                            className="dropdown-item"
                            href={`#/${options.firstPart}/${path}`}
                            onClick={onClickParagraphItemLink}
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
                {articlePath && (articleTitle !== name) && (<>
                    <li><hr className="dropdown-divider"/></li>
                    <li><h6 className="dropdown-header">{articleTitle}</h6></li>
                    <li>
                        <a
                            className="dropdown-item"
                            href={`#/${options.firstPart}/${articlePath}`}
                            onClick={onClickArticleLink}
                        >{articleTitle}へのリンクをコピー</a>
                    </li>
                    <li>
                        <a
                            className="dropdown-item lh-1"
                            href={`#/${options.firstPart}/${articlePath}`}
                            onClick={onClickCopyArticleTitle}
                        >名称をコピー：<br/><small style={{ whiteSpace: "normal" }} className="text-muted">「{lawTitleAndNum}{articleTitle}」</small></a>
                    </li>
                </>)}
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
