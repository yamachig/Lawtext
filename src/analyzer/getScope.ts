import { assertNever } from "../util";
import { Container, ContainerType } from "../node/container";
import { EL } from "../node/el";
import { getContainerType } from "./common";
import { RelPos, ____PF, ____Pointer, ____PointerRanges } from "../node/el/controls/pointer";
import * as std from "../law/std";
import { __Parentheses, __Text, RangeInfo } from "../node/el/controls";
import { parseNamedNum } from "../law/num";

const locateContainerFromParent = (parentContainer: Container, fragment: ____PF) => {
    return parentContainer.find(
        c =>
            (
                (
                    (c.el.tag === fragment.attr.targetType)
                    || (
                        (fragment.attr.targetType === "SUBITEM")
                        && (/^Subitem\d+$/.exec(c.el.tag) !== null)
                    )
                )
                && ((c.num ?? null) === fragment.attr.num)
            )
            || (
                (fragment.attr.targetType === "PROVISO")
                && (c.el.tag === "Sentence")
                && (c.el.attr.Function === "proviso")
            ),
    );
};

const locateContainerOfHeadFragment = (
    head: ____PF,
    prevLocatedContainerForSame: Container | null,
    prevLocatedContainerForNamed: Container | null,
    currentContainer: Container,
): Container | Container[] | null => {

    if ((head.attr.relPos === RelPos.SAME)) {
        // e.g.: "同条"

        return (
            prevLocatedContainerForSame
                ?.thisOrClosest(c => c.el.tag === head.attr.targetType)
                ?? null
        );

    } else if (head.attr.relPos === RelPos.HERE) {
        // e.g.: "この条"

        const scopeContainer = currentContainer
            .thisOrClosest(c => c.el.tag === head.attr.targetType);

        if (scopeContainer) {
            return scopeContainer;
        } else {
            return null;
        }

    } else if (head.attr.relPos === RelPos.PREV) {
        // e.g.: "前条"

        const scopeContainer = currentContainer
            .thisOrClosest(c => c.el.tag === head.attr.targetType);

        if (scopeContainer) {
            let count = head.attr.count === "all" ? Number.MAX_SAFE_INTEGER : Number(head.attr.count);
            if (count > 0) {
                const ret: Container[] = [];
                for (const prevContainer of scopeContainer.prevAll(c => c.el.tag === head.attr.targetType)) {
                    ret.unshift(prevContainer);
                    count--;
                    if (count <= 0) break;
                }
                return ret.length > 0 ? ret : null;
            } else {
                return (
                    (getContainerType(head.attr.targetType) === ContainerType.ARTICLES)
                        ? scopeContainer.prev(c => c.el.tag === head.attr.targetType)
                        : scopeContainer.prevSub(c => c.el.tag === head.attr.targetType)
                );
            }
        } else {
            return null;
        }

    } else if (head.attr.relPos === RelPos.NEXT) {
        // e.g.: "次条"

        const scopeContainer = currentContainer
            .thisOrClosest(c => c.el.tag === head.attr.targetType);

        if (scopeContainer) {
            let count = head.attr.count === "all" ? Number.MAX_SAFE_INTEGER : Number(head.attr.count);
            if (count > 0) {
                const ret: Container[] = [];
                for (const nextContainer of scopeContainer.nextAll(c => c.el.tag === head.attr.targetType)) {
                    ret.push(nextContainer);
                    count--;
                    if (count <= 0) break;
                }
                return ret.length > 0 ? ret : null;
            } else {
                return (
                    (getContainerType(head.attr.targetType) === ContainerType.ARTICLES)
                        ? scopeContainer.next(c => c.el.tag === head.attr.targetType)
                        : scopeContainer.nextSub(c => c.el.tag === head.attr.targetType)
                );
            }
        } else {
            return null;
        }

    } else if (head.attr.relPos === RelPos.NAMED) {
        // e.g.: "第二条", "第二項"

        if (getContainerType(head.attr.targetType) === ContainerType.TOPLEVEL) {
            // e.g.: "附則", "別表第二"

            return currentContainer.findAncestorChildrenSub(c => {
                if (c.el.tag !== head.attr.targetType) return false;
                const titleEl = c.el.children.find(el =>
                    el instanceof EL && (el.tag === `${c.el.tag}Title` || el.tag === `${c.el.tag}Label`)) as EL | undefined;
                return (new RegExp(`^${head.attr.name}(?:[(（]|\\s|$)`)).exec(titleEl?.text() ?? "") !== null;
            });

        } else if (head.attr.targetType === "SUBITEM") {
            // e.g. "イ"

            const container = (
                (
                    prevLocatedContainerForNamed
                        ?.children.find(c => c.name === head.attr.name)

                )
                ?? (
                    prevLocatedContainerForNamed
                        ?.ancestorChildrenSub(c => c.name === head.attr.name)
                        .next().value
                )
                ?? null
            );

            if (container) {
                // e.g.: "第二条第二項第二号" -> "イ"

                return container;

            } else {
                // e.g.: "イ"

                const func = (c: Container) => c.name === head.attr.name;
                return currentContainer.children.find(func) ?? currentContainer.findAncestorChildrenSub(func);
            }

        } else {

            let parentTag: string | null = null;
            {
                const paragraphItemTagIndex = (std.paragraphItemTags as readonly string[]).indexOf(head.attr.targetType);
                if (paragraphItemTagIndex >= 0) {
                    parentTag = ["Article", ...std.paragraphItemTags][paragraphItemTagIndex];
                } else {
                    const articleGroupTagIndex = (std.articleGroupTags as readonly string[]).indexOf(head.attr.targetType);
                    if (articleGroupTagIndex > 0) {
                        parentTag = std.articleGroupTags[articleGroupTagIndex - 1];
                    }
                }
            }

            const parentContainer = (parentTag !== null) ? (
                prevLocatedContainerForNamed
                    ?.thisOrClosest(c => c.el.tag === parentTag)
            ) : null;

            if (parentContainer) {
                // e.g.: "第二条第二項" -> "第三項"

                return locateContainerFromParent(parentContainer, head);

            } else {
                // e.g.: "第二項"

                const func = (c: Container) => (
                    (
                        (c.el.tag === head.attr.targetType)
                    )
                    && ((c.num || null) === head.attr.num)
                );
                return (
                    (getContainerType(head.attr.targetType) === ContainerType.ARTICLES)
                        ? (currentContainer.children.find(func) ?? currentContainer.findAncestorChildren(func))
                        : (currentContainer.subChildren.find(func) ?? currentContainer.findAncestorChildrenSub(func))
                );
            }
        }
    }
    else { throw assertNever(head.attr.relPos); }
};

const locatePointer = (
    origPointer: ____Pointer,
    prevLocatedContainerForSame: Container | null,
    prevLocatedContainerForNamed: Container | null,
    currentContainer: Container,
): {
    locatedContainersForFragments: Container[][],
    lastLocatedContainer: Container | null,
} => {

    const origFragments = origPointer.fragments();
    for (const fragment of origFragments) {
        const num = parseNamedNum(fragment.attr.name);
        if (num) fragment.attr.num = num;
    }
    const _headContainer = locateContainerOfHeadFragment(
        origFragments[0],
        prevLocatedContainerForSame,
        prevLocatedContainerForNamed,
        currentContainer,
    );
    const headContainers = Array.isArray(_headContainer) ? _headContainer : (_headContainer && [_headContainer]);

    const locatedContainersForFragments: Container[][] = [];
    let lastLocatedContainer = headContainers && headContainers[headContainers.length - 1];

    if (headContainers) {
        if (origFragments.length === 1) {
            locatedContainersForFragments.push(headContainers);
            origFragments[0].targetContainerIDs = [...new Set([...origFragments[0].targetContainerIDs, ...headContainers.map(c => c.containerID)])];

        } else {
            let parentContainer = headContainers[headContainers.length - 1];
            locatedContainersForFragments.push([parentContainer]);
            origFragments[0].targetContainerIDs = [...new Set([...origFragments[0].targetContainerIDs, parentContainer.containerID])];

            for (const fragment of origFragments.slice(1)) {
                const container = locateContainerFromParent(parentContainer, fragment);

                if (container) {
                    locatedContainersForFragments.push([container]);
                    fragment.targetContainerIDs = [...new Set([...fragment.targetContainerIDs, container.containerID])];
                    parentContainer = container;
                    lastLocatedContainer = container;
                } else {
                    break;
                }
            }
        }
    }
    return { locatedContainersForFragments, lastLocatedContainer };

};

export type OnBeforeModifierParentheses = (
    modifierParentheses: __Parentheses,
    origRanges: ____PointerRanges,
    prevLocatedContainerForSame: Container | null,
    prevLocatedContainerForNamed: Container | null,
    currentContainer: Container,
) => {
    lastLocatedContainer: Container | null,
}

interface ObjRangeInfo {
    from: Container[],
    to?: Container[],
    exclude?: RangeInfo[],
}

const locateRanges = (
    origRanges: ____PointerRanges,
    prevLocatedContainerForSame: Container | null,
    prevLocatedContainerForNamed: Container | null,
    currentContainer: Container,
    onBeforeModifierParentheses?: OnBeforeModifierParentheses,
): {
    ranges: ObjRangeInfo[],
    lastLocatedContainer: Container | null,
} => {

    const ranges: ObjRangeInfo[] = [];
    const pointerRangeList = origRanges.ranges();

    for (const pointerRange of pointerRangeList) {
        const [fromPointer, toPointer] = pointerRange.pointers();
        const from = locatePointer(
            fromPointer,
            prevLocatedContainerForSame,
            prevLocatedContainerForNamed,
            currentContainer,
        );
        prevLocatedContainerForSame = from.lastLocatedContainer;
        prevLocatedContainerForNamed = from.lastLocatedContainer;

        let range: ObjRangeInfo;

        if (!toPointer) {
            if (from.locatedContainersForFragments.length === 0) continue;
            range = {
                from: from.locatedContainersForFragments[from.locatedContainersForFragments.length - 1],
            };
        } else {
            const to = locatePointer(
                toPointer,
                prevLocatedContainerForSame,
                prevLocatedContainerForNamed,
                currentContainer,
            );
            prevLocatedContainerForSame = from.lastLocatedContainer;
            prevLocatedContainerForNamed = from.lastLocatedContainer;

            if (from.locatedContainersForFragments.length === 0) continue;
            if (to.locatedContainersForFragments.length === 0) continue;
            range = {
                from: from.locatedContainersForFragments[from.locatedContainersForFragments.length - 1],
                to: to.locatedContainersForFragments[to.locatedContainersForFragments.length - 1],
            };
        }

        const modifierParentheses = pointerRange.modifierParentheses();
        if (modifierParentheses) {
            if (onBeforeModifierParentheses) {
                const { lastLocatedContainer } = onBeforeModifierParentheses(
                    modifierParentheses,
                    origRanges,
                    prevLocatedContainerForSame,
                    prevLocatedContainerForNamed,
                    currentContainer,
                );
                prevLocatedContainerForSame = lastLocatedContainer;
                prevLocatedContainerForNamed = lastLocatedContainer;
            }

            const pContent = modifierParentheses.content;
            if (pContent.children.length === 2) {
                const [exRanges, exText] = pContent.children;
                if (exRanges instanceof ____PointerRanges && exText instanceof __Text && exText.text() === "を除く。") {
                    range.exclude = [...exRanges.targetContainerIDRanges];
                }
            }
        }

        ranges.push(range);
    }


    return { ranges, lastLocatedContainer: prevLocatedContainerForSame };
};

export const getScope = (
    currentContainer: Container,
    prevLocatedContainerForSame: Container | null,
    prevLocatedContainerForNamed: Container | null,
    pointerRangesToBeModified: ____PointerRanges,
    onBeforeModifierParentheses?: OnBeforeModifierParentheses,
): {
    ranges: RangeInfo[],
    lastLocatedContainer: Container | null,
} => {
    const rangeInfos: RangeInfo[] = [];
    const { ranges, lastLocatedContainer } = locateRanges(
        pointerRangesToBeModified,
        prevLocatedContainerForSame,
        prevLocatedContainerForNamed,
        currentContainer,
        onBeforeModifierParentheses,
    );
    const fromToSet = new Set<string>();
    const pushRangeInfo = (options: {from: string, to?: string, exclude?: RangeInfo[]}) => {
        const fromTo = `FROM${options.from}====TO${options.to ? `-${options.to}` : ""}`;
        if (fromToSet.has(fromTo)) return;
        fromToSet.add(fromTo);
        rangeInfos.push(options);
    };
    for (const range of ranges) {
        const { from, to, exclude } = range;
        if (from.length === 0 || (to && to.length === 0)) {
            continue;
        }

        const fromContainerIDs = from.map(c => c.containerID);
        const toContainerIDs = to ? to.map(c => c.containerID) : null;

        if (fromContainerIDs && toContainerIDs) {
            for (let i = 0; i < fromContainerIDs.length - 1; i++) pushRangeInfo({ from: fromContainerIDs[i], exclude });
            pushRangeInfo({ from: fromContainerIDs[fromContainerIDs.length - 1], to: toContainerIDs[0], exclude });
            for (let i = 0; i < toContainerIDs.length - 1; i++) pushRangeInfo({ from: toContainerIDs[i], exclude });
        } else if (fromContainerIDs) {
            for (const containerID of fromContainerIDs) pushRangeInfo({ from: containerID, exclude });
        }
    }
    if (rangeInfos.length > 0) {
        pointerRangesToBeModified.targetContainerIDRanges = [...rangeInfos];
    }
    return {
        ranges: [...rangeInfos],
        lastLocatedContainer,
    };
};

export default getScope;
