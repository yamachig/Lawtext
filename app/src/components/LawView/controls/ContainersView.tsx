
import React, { Fragment } from "react";
import * as std from "lawtext/dist/src/law/std";
import type { HTMLComponentProps } from "lawtext/dist/src/renderer/common/html";
import { HTMLMarginSpan } from "lawtext/dist/src/renderer/common/html";
import { HTMLSentenceChildrenRun } from "lawtext/dist/src/renderer/rules/sentenceChildrenRun";
import { HTMLAnyELs } from "lawtext/dist/src/renderer/rules/any";
import type { LawViewOptions } from "../common";
import { EL } from "lawtext/dist/src/node/el";
import { NotImplementedError } from "lawtext/dist/src/util";


export interface ContainersViewProps { containerIDs: string[] }

export const ContainersView = (props: HTMLComponentProps & ContainersViewProps) => {
    const { containerIDs, htmlOptions } = props;
    const options = htmlOptions.options as LawViewOptions;

    const analysis = options.lawData.analysis;
    if (!analysis) return null;

    const ret: JSX.Element[] = [];

    for (const containerID of containerIDs) {

        const container = analysis.containers.get(containerID);
        if (!container) return null;
        const containerStack = container.linealAscendant(c => {
            if (std.isParagraph(c.el)) {
                const paragraphNum = c.el.children.find(std.isParagraphNum);
                if (!c.parent) return true;
                if (
                    std.isArticle(c.parent.el) &&
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

        const titleTags = [
            "LawTitle",
            "ArticleTitle",
            ...std.paragraphItemTitleTags,
            ...std.articleGroupTitleTags,
            ...std.appdxItemTitleTags,
            ...std.supplProvisionAppdxItemTitleTags,
            "SupplProvisionLabel",
            "TableStructTitle",
        ];
        const ignoreTags = ["ArticleCaption", "ParagraphCaption", ...titleTags];

        for (const c of containerStack) {
            if ((std.isLaw(container.el) || std.isMainProvision(container.el)) && std.isLaw(c.el)) {
                const lawTitle = c.el.children.find(std.isLawBody)?.children.find(std.isLawTitle);
                const lawNum = c.el.children.find(std.isLawNum);
                if (lawTitle && lawNum) {
                    names.push(`${lawTitle.text()}（${lawNum.text()}）`);
                } else if (lawTitle) {
                    names.push(lawTitle.text());
                } else if (lawNum) {
                    names.push(lawNum.text());
                }

            } else if (std.isEnactStatement(c.el)) {
                names.push("（制定文）");

            } else if (std.isArticleGroup(container.el) && std.isArticleGroup(c.el)) {
                const articleGroupTitle = (c.el.children as (typeof c.el.children)[number][])
                    .find(std.isArticleGroupTitle);
                if (articleGroupTitle) names.push(articleGroupTitle.text());

            } else if (std.isSupplProvision(c.el)) {
                const supplProvisionLabel = c.el.children
                    .find(std.isSupplProvisionLabel);
                if (supplProvisionLabel) names.push(supplProvisionLabel.text());

            } else if (std.isAppdxItem(c.el) || std.isSupplProvisionAppdxItem(c.el)) {
                const appdxItemTitle = c.el.children
                    .find(c => std.isAppdxItemTitle(c) || std.isSupplProvisionAppdxItemTitle(c));
                if (appdxItemTitle) names.push(appdxItemTitle.text());

            } else if (std.isArticle(c.el)) {
                const articleTitle = c.el.children
                    .find(std.isArticleTitle);
                if (articleTitle) names.push(articleTitle.text());

            } else if (std.isParagraph(c.el)) {
                const paragraphNum = c.el.children
                    .find(std.isParagraphNum);
                if (paragraphNum) names.push(paragraphNum.text() || "１");

            } else if (std.isParagraphItem(c.el)) {
                const itemTitle = (c.el.children as EL[])
                    .find(std.isParagraphItemTitle);
                if (itemTitle) names.push(itemTitle.text());

            } else if (std.isTableStruct(c.el)) {
                const tableStructTitleEl = c.el.children
                    .find(std.isTableStructTitle);
                const tableStructTitle = tableStructTitleEl
                    ? tableStructTitleEl.text()
                    : "表";
                names.push(tableStructTitle + "（抜粋）");

            } else {
                continue;
            }
        }

        const containerElTitleTag = std.isMainProvision(container.el) ? "LawTitle" : titleTags
            .find(s => s.startsWith(container.el.tag));

        if (containerElTitleTag) {
            const containerEl = new EL(
                std.isMainProvision(container.el) ? "Law" : container.el.tag,
                {},
                [
                    ...(
                        (std.isLaw(container.el) || std.isMainProvision(container.el))
                            ? [new EL("LawBody", {}, [new EL("LawTitle", {}, [names.join("／")])])]
                            : [new EL(containerElTitleTag, {}, [names.join("／")])]
                    ),
                    ...(
                        (std.isLaw(container.el) || std.isMainProvision(container.el) || std.isArticleGroup(container.el) || std.isSupplProvision(container.el))
                            ? []
                            : (container.el.children as EL[])
                                .filter(child => ignoreTags.indexOf(child.tag) < 0)
                    ),
                ],
            );
            ret.push(<HTMLAnyELs els={[containerEl as std.StdEL]} indent={0} {...{ htmlOptions }} />);

        } else if (std.isEnactStatement(container.el)) {
            ret.push(
                <div style={{ paddingLeft: "1em", textIndent: "-1em" }}>
                    <span>{names.join("／")}</span>
                    <HTMLMarginSpan/>
                    <HTMLSentenceChildrenRun els={container.el.children} {...{ htmlOptions }} />
                </div>,
            );

        } else {
            throw new NotImplementedError(container.el.tag);

        }
    }
    return <>{ret.map((el, i) => <Fragment key={i}>{el}</Fragment>)}</>;
};

export default ContainersView;
