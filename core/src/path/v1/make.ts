import type { Container } from "../../node/container";
import { ContainerType } from "../../node/container";
import { assertNever } from "../../util";
import type { PathFragment, PathFragmentArticlesContainer, PathFragmentSentencesContainer, PathFragmentTopLevel } from "./common";
import { sentencesContainerAlias, topLevelAlias } from "./common";


export const makePathFragments = (container: Container, childFragments: PathFragment[]): PathFragment[] => {
    if (!container.parent || container.type === ContainerType.ROOT) {
        return childFragments;

    } else if (container.type === ContainerType.TOPLEVEL) {

        if (container.el.tag === "MainProvision" && childFragments.length > 0) {
            return makePathFragments(container.parent, childFragments);
        }

        const alias = (Object.entries(topLevelAlias).find(([, value]) => value === container.el.tag) ?? [container.el.tag])[0];

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
            return makePathFragments(container.parent, [fragment, ...childFragments]);

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
            return makePathFragments(container.parent, [fragment, ...childFragments]);
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
        return makePathFragments(container.parent, [fragment, ...childFragments]);

    } else if (container.type === ContainerType.SENTENCES) {

        if (!container.subParent) return childFragments;

        const alias = (Object.entries(sentencesContainerAlias).find(([, value]) => value === container.el.tag) ?? [container.el.tag])[0];

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

        return makePathFragments(
            (
                (
                    (container.subParent.el.tag === "Paragraph") &&
                    (container.subParent.subParent) &&
                    (container.subParent.subParent.subChildren.length === 1)
                )
                    ? container.subParent.subParent
                    : container.subParent
            ),
            [fragment, ...childFragments],
        );

    }
    else { throw assertNever(container.type); }

};

export const make = (container: Container): string => {
    const fragments = makePathFragments(container, []);
    return fragments.map(f => f.text).join("/");
};
export default make;
