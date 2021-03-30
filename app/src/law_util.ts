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
