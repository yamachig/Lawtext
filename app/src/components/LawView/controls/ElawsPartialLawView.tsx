import * as std from "lawtext/dist/src/law/std/index.js";
import { xmlToEL } from "lawtext/dist/src/node/el/xmlToEL.js";
import { detectPointers } from "lawtext/dist/src/analyzer/detectPointers.js";
import type { HTMLComponentProps } from "lawtext/dist/src/renderer/common/html.js";
import { HTMLAnyELs } from "lawtext/dist/src/renderer/rules/any.js";
import * as elawsApi from "lawtext/dist/src/elawsOpenapi/index.js";
import React from "react";
import { decodeBase64 } from "lawtext/dist/src/util/index.js";
import parsePath from "lawtext/dist/src/path/v1/parse.js";
import type { PathFragment, PathFragmentLaw } from "lawtext/dist/src/path/v1/common.js";


export interface ElawsPartialLawViewProps {
    lawNum: string,
    lawTitle?: string,
    elm: string,
    textFragments?: string[],
}

type ElementPathFragment = Exclude<PathFragment, PathFragmentLaw>;

const pathFragmentToElmFragment = (fragment: ElementPathFragment): string => {
    const num = fragment.num ?? fragment.attr.find(({ key }) => key === "Num")?.value ?? null;
    return (num !== null) ? `${fragment.tag}_${num}` : `${fragment.tag}[${fragment.nth ?? "1"}]`;
};

export const targetPathToElm = (targetPath: string, resolveTag?: (tag: string) => string | null): string | null => {
    const pathFragments: ElementPathFragment[] = [];
    for (const segment of targetPath === "" ? [] : targetPath.split("/")) {
        const rawTag = /^[^=[\]]+/.exec(segment)?.[0] ?? "";
        if (rawTag === "Law") continue;

        let result = parsePath(segment);
        if (!result.ok) {
            const tag = resolveTag?.(rawTag) ?? null;
            if (tag === null) break;
            result = parsePath(`${tag}${segment.slice(rawTag.length)}`);
            if (!result.ok) break;
        }
        pathFragments.push(...result.value.filter((f): f is ElementPathFragment => f.type !== "LAW"));
    }
    if (pathFragments.length === 0) return null;

    const elmFragments = pathFragments.map(pathFragmentToElmFragment);
    if (pathFragments[0].type !== "TOPLEVEL") elmFragments.unshift("MainProvision");
    return elmFragments.join("-");
};

const isMainProvisionChild = (el: std.StdEL): el is std.MainProvision["children"][number] => (
    std.isArticle(el)
    || std.isParagraph(el)
    || std.isArticleGroup(el)
);

const paragraphItemTitleTagOf = (tag: (typeof std.paragraphItemTags)[number]) => (
    tag === "Paragraph" ? "ParagraphNum" : `${tag}Title` as const
);

export const ElawsPartialLawView = (props: HTMLComponentProps & ElawsPartialLawViewProps) => {
    const { lawNum, lawTitle: lawTitleProp, elm, textFragments, htmlOptions } = props;

    const [{ loading, els }, setState] = React.useState({ loading: true, els: (null as std.StdEL[] | null) });

    const titleText = textFragments ? textFragments.join("") : "";

    React.useEffect(() => {
        (async () => {
            const elData = (await elawsApi.getLawData({
                throwOnError: true,
                path: {
                    law_id_or_num_or_revision_id: lawNum,
                },
                query: {
                    response_format: "json",
                    law_full_text_format: "xml",
                    elm,
                },
            })).data;
            const lawTitle = lawTitleProp ?? elData.revision_info?.law_title;
            const el = xmlToEL(new TextDecoder().decode(decodeBase64(elData.law_full_text as string))) as std.StdEL;
            if (std.isParagraphItem(el)) {
                let title = el.children.find(std.isParagraphItemTitle);
                if (!title) {
                    title = std.newStdEL(paragraphItemTitleTagOf(el.tag), {}, []) as std.ParagraphItemTitle;
                    (el.children as std.StdEL[]).unshift(title);
                }
                if (titleText) {
                    title.children.splice(0, title.children.length, titleText);
                } else if (title.text() === "" && std.isParagraph(el) && el.attr.Num === "1") {
                    title.children.push("１");
                }
            } else if (std.isArticle(el) && titleText) {
                const title = el.children.find(std.isArticleTitle);
                if (title) {
                    title.children.splice(0, title.children.length, titleText);
                }
            }

            const inMainProvision = isMainProvisionChild(el);
            const law = std.newStdEL("Law", {}, [
                std.newStdEL("LawNum", {}, [lawNum]),
                std.newStdEL("LawBody", {}, [
                    ...(lawTitle ? [std.newStdEL("LawTitle", {}, [lawTitle])] : []),
                    ...(inMainProvision ? [std.newStdEL("MainProvision", {}, [el])] : []),
                ]),
            ]);
            detectPointers(law);
            if (!inMainProvision) detectPointers(el);
            setState({ loading: false, els: inMainProvision ? [law] : [law, el] });
        })();
    }, [elm, lawNum, lawTitleProp, titleText]);

    if (loading) {
        return <div className="text-secondary"><span className="spinner-border" style={{ width: "1em", height: "1em" }}role="status"/> e-Gov法令APIから法令データを取得しています...</div>;
    }

    if (!els) {
        return <div>e-Gov法令APIから法令データを取得できませんでした。</div>;
    }

    return (<HTMLAnyELs els={els} indent={0} {...{ htmlOptions }} />);
};

export default ElawsPartialLawView;
