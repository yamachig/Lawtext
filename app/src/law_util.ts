import * as std from "@coresrc/std_law";

export const traceTitles = (el: Element, _titles: string[] = []): string[] => {
    const titles: string[] = [..._titles];
    for (const child of Array.from(el.children)) {
        if (
            (child.tagName.endsWith("Title") && child.tagName !== "LawTitle") ||
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
