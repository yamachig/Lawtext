import type { Container } from "../container/index.ts";
import { ContainerType } from "../container/index.ts";
import * as std from "../../law/std/index.ts";
import { digitsToKanjiNum } from "../../law/num.ts";
import type { PathEntry } from "../../path/v1/make.ts";
import { makePathEntries } from "../../path/v1/make.ts";

const numToKanji = (num: string): string | null => {
    const parts = num.split("_");
    if (!parts.every(p => /^\d+$/.test(p))) return null;
    return parts.map(p => digitsToKanjiNum(p, "non-positional")).join("の");
};

const leadingPartOfTitle = (title: string): string => {
    // eslint-disable-next-line no-irregular-whitespace
    return title.trim().split(/[\s　（(]/)[0];
};

const getNum = (container: Container): string | null => {
    const attrNum = (container.el.attr as Record<string, string | undefined>).Num;
    return attrNum || container.num;
};

export const containerToPointerText = (container: Container): string | null => {
    const el = container.el;
    const num = getNum(container);
    const name = container.name ? container.name.trim() : null;

    if (std.isArticle(el)) {
        if (name) return name;
        const [first, ...rest] = (num ? num.split("_") : []).map(numToKanji);
        if (!first || rest.some(r => r === null)) return null;
        return `第${first}条${rest.map(r => `の${r}`).join("")}`;

    } else if (std.isParagraph(el)) {
        const kanji = numToKanji(num ?? "1");
        return kanji ? `第${kanji}項` : null;

    } else if (std.isItem(el)) {
        const kanji = num && numToKanji(num);
        return kanji ? `第${kanji}号` : (name || null);

    } else if (std.isParagraphItem(el)) {
        return name || null;

    } else if (std.isSupplProvision(el)) {
        return "附則";

    } else if (el.tag === "MainProvision") {
        return "本則";

    } else if (el.tag === "EnactStatement") {
        return "制定文";

    } else if (el.tag === "Preamble") {
        return "前文";

    } else if (container.type === ContainerType.TOPLEVEL || container.type === ContainerType.ARTICLES) {
        return name ? leadingPartOfTitle(name) : null;

    } else {
        return name || null;
    }
};

export interface MakeTextFragmentsOptions {
    namedTextByContainer: Map<Container, string>,
}

export const makeTextFragments = (container: Container, options: MakeTextFragmentsOptions): string[] => {
    const { namedTextByContainer } = options;
    const entries: PathEntry[] = makePathEntries(container, [], { useAlias: false });
    return entries
        .map(({ container: c }) => namedTextByContainer.get(c) ?? containerToPointerText(c))
        .filter((t): t is string => t !== null);
};
