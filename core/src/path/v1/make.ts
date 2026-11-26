import type { Container } from "../../node/container/index.ts";
import { ContainerType } from "../../node/container/index.ts";
import { assertNever } from "../../util/index.ts";
import type { PathFragment, PathFragmentArticlesContainer, PathFragmentSentencesContainer, PathFragmentTopLevel } from "./common.ts";
import { sentencesContainerAlias, topLevelAlias } from "./common.ts";

export interface MakeOptions {
    useAlias: boolean,
};

export interface PathEntry {
    fragment: PathFragment,
    container: Container,
}

export const makePathEntries = (container: Container, childEntries: PathEntry[], options: MakeOptions): PathEntry[] => {

    const { useAlias } = options;

    if (!container.parent || container.type === ContainerType.ROOT) {
        return childEntries;

    } else if (container.type === ContainerType.TOPLEVEL) {

        if (container.el.tag === "MainProvision" && childEntries.length > 0) {
            return makePathEntries(container.parent, childEntries, options);
        }

        const alias = (
            useAlias
                ? (Object.entries(topLevelAlias).find(([, value]) => value === container.el.tag) ?? [container.el.tag])[0]
                : container.el.tag
        );

        if (
            (
                (container.el.tag === "SupplProvision") &&
                !("AmendLawNum" in container.el.attr) &&
                (container.parent.children.filter(c => c.el.tag === container.el.tag && !("AmendLawNum" in c.el.attr)).length === 1)
            ) ||
            (
                !("Num" in container.el.attr) &&
                (container.parent.children.filter(c => c.el.tag === container.el.tag && !("Num" in c.el.attr)).length === 1)
            )
        ) {
            const fragment: PathFragmentTopLevel = {
                type: "TOPLEVEL",
                text: alias,
                tag: container.el.tag as PathFragmentTopLevel["tag"],
                num: null,
                attr: [],
                nth: null,
            };
            return makePathEntries(container.parent, [{ fragment, container }, ...childEntries], options);

        } else {
            let num: string | null = null;
            const attr: {key: string, value: string}[] = [];
            let nth: string | null = null;
            if ("Num" in container.el.attr) {
                num = container.el.attr.Num ?? "";
            } else if ("AmendLawNum" in container.el.attr) {
                attr.push({ key: "AmendLawNum", value: container.el.attr.AmendLawNum ?? "" });
            } else {
                nth = (container.parent.children.filter(c => c.el.tag === container.el.tag).indexOf(container) + 1).toString();
            }

            const modifier = (
                (num !== null)
                    ? `=${num}`
                    : (attr.length !== 0)
                        ? attr.map(({ key, value }) => `[${key}="${value}"]`).join("")
                        : `[${nth}]`
            );

            const fragment: PathFragmentTopLevel = {
                type: "TOPLEVEL",
                text: `${alias}${modifier}`,
                tag: container.el.tag as PathFragmentTopLevel["tag"],
                num,
                attr,
                nth,
            };
            return makePathEntries(container.parent, [{ fragment, container }, ...childEntries], options);
        }

    } else if (container.type === ContainerType.ARTICLES) {

        let num: string | null = null;
        let nth: string | null = null;
        if ("Num" in container.el.attr) {
            num = container.el.attr.Num ?? "";
        } else {
            nth = (container.parent.children.filter(c => c.el.tag === container.el.tag).indexOf(container) + 1).toString();
        }

        const modifier = (
            (num !== null)
                ? `=${num}`
                : `[${nth}]`
        );

        const fragment: PathFragmentArticlesContainer = {
            type: "ARTICLES",
            text: `${container.el.tag}${modifier}`,
            tag: container.el.tag as PathFragmentArticlesContainer["tag"],
            num,
            attr: [],
            nth,
        };
        return makePathEntries(container.parent, [{ fragment, container }, ...childEntries], options);

    } else if (container.type === ContainerType.SENTENCES) {

        if (!container.subParent) return childEntries;

        const alias = (
            useAlias
                ? (Object.entries(sentencesContainerAlias).find(([, value]) => value === container.el.tag) ?? [container.el.tag])[0]
                : container.el.tag
        );

        let num: string | null = null;
        let nth: string | null = null;
        if ("Num" in container.el.attr) {
            num = container.el.attr.Num ?? "";
        } else {
            nth = (container.subParent.subChildren.filter(c => c.el.tag === container.el.tag).indexOf(container) + 1).toString();
        }

        const modifier = (
            (num !== null)
                ? `=${num}`
                : `[${nth}]`
        );

        const fragment: PathFragmentSentencesContainer = {
            type: "SENTENCES",
            text: `${alias}${modifier}`,
            tag: container.el.tag as PathFragmentSentencesContainer["tag"],
            num,
            attr: [],
            nth,
        };

        return makePathEntries(
            (
                (
                    (container.subParent.el.tag === "Paragraph") &&
                    (container.subParent.subParent) &&
                    (container.subParent.subParent.subChildren.length === 1)
                )
                    ? container.subParent.subParent
                    : container.subParent
            ),
            [{ fragment, container }, ...childEntries],
            options,
        );

    }
    else { throw assertNever(container.type); }

};

export const makePathFragments = (container: Container, childFragments: PathFragment[], options: MakeOptions): PathFragment[] => {
    return [
        ...makePathEntries(container, [], options).map(({ fragment }) => fragment),
        ...childFragments,
    ];
};

export const make = (container: Container, options: Partial<MakeOptions> = {}): string => {
    const filledOptions: MakeOptions = {
        useAlias: true,
        ...options,
    };
    const fragments = makePathFragments(container, [], filledOptions);
    return fragments.map(f => f.text).join("/");
};
export default make;
