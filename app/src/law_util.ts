import * as std from "lawtext/dist/src/law/std";
import { LawInfo } from "lawtext/dist/src/data/lawinfo";

export const traceTitles = (el: Element, _titles: string[] = []): string[] => {
    const titles: string[] = [..._titles];
    for (const childNode of Array.from(el.childNodes)) {
        if (childNode.nodeType !== 1) continue;
        const child = childNode as Element;
        if (
            child.nodeType === 1 &&
            (child.tagName.endsWith("Title") && ![
                "LawTitle",
                "PartTitle",
                "ChapterTitle",
                "SectionTitle",
                "SubsectionTitle",
                "DivisionTitle",
            ].includes(child.tagName)) ||
            child.tagName.endsWith("Label") ||
            (child.tagName.endsWith("Num") && child.tagName !== "LawNum" && child.tagName !== "RelatedArticleNum")
        ) {
            titles.unshift(child.textContent ?? "");
        }
    }
    const parent = el.parentElement;
    if (!parent) return titles;
    return traceTitles(parent, titles);
};

export const getLawTitleWithNum = (law: std.Law): string => {
    const lawNum = law.children.find((el) => el.tag === "LawNum") as std.LawNum;
    const lawBody = law.children.find((el) => el.tag === "LawBody") as std.LawBody;
    const lawTitle = lawBody && lawBody.children.find((el) => el.tag === "LawTitle") as std.LawTitle;

    let sLawNum = lawNum ? lawNum.text : "";
    const sLawTitle = lawTitle ? lawTitle.text : "";
    sLawNum = (sLawNum && sLawTitle) ? (`（${sLawNum}）`) : sLawNum;

    return sLawTitle + sLawNum;
};

export const getLawtextAppUrl = (lawOrLawNum: string | LawInfo, lawtextAppRoot?: string): string => {
    const lawNum = typeof lawOrLawNum === "string" ? lawOrLawNum : lawOrLawNum.LawNum;
    const root = lawtextAppRoot ?? `${location.protocol}//${location.host}${location.pathname}`;
    return encodeURI(`${root}#${lawNum}`);
};
