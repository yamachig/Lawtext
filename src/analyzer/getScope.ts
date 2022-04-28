import { assertNever } from "../util";
import { Container, ContainerType } from "../node/container";
import { EL } from "../node/el";
import { getContainerType } from "./common";
import { RelPos, ____PF, ____Pointer, ____PointerRanges } from "../node/el/controls/pointer";
import * as std from "../law/std";

type LocatedPointerInfo = [fragment: ____PF, container: Container][];

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
) => {

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
            return (
                (getContainerType(head.attr.targetType) === ContainerType.ARTICLES)
                    ? scopeContainer.prev(c => c.el.tag === head.attr.targetType)
                    : scopeContainer.prevSub(c => c.el.tag === head.attr.targetType)
            );
        } else {
            return null;
        }

    } else if (head.attr.relPos === RelPos.NEXT) {
        // e.g.: "次条"

        const scopeContainer = currentContainer
            .thisOrClosest(c => c.el.tag === head.attr.targetType);

        if (scopeContainer) {
            return (
                (getContainerType(head.attr.targetType) === ContainerType.ARTICLES)
                    ? scopeContainer.next(c => c.el.tag === head.attr.targetType)
                    : scopeContainer.nextSub(c => c.el.tag === head.attr.targetType)
            );
        } else {
            return null;
        }

    } else if (head.attr.relPos === RelPos.NAMED) {
        // e.g.: "第二条", "第二項"

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

        } else if (getContainerType(head.attr.targetType) === ContainerType.TOPLEVEL) {
            // e.g.: "附則", "別表第二"

            return currentContainer.findAncestorChildrenSub(c => {
                if (c.el.tag !== head.attr.targetType) return false;
                const titleEl = c.el.children.find(el =>
                    el instanceof EL && el.tag === `${c.el.tag}Title`) as EL;
                return (new RegExp(`^${head.attr.name}(?:[(（]|\\s|$)`)).exec(titleEl.text()) !== null;
            });

        } else {
            // e.g.: "第二項"

            const func = (c: Container) => (
                (
                    (c.el.tag === head.attr.targetType)
                    || (
                        (head.attr.targetType === "SUBITEM")
                        && (/^Subitem\d+$/.exec(c.el.tag) !== null)
                    )
                )
                && ((c.num || null) === head.attr.num)
            );
            return (
                (getContainerType(head.attr.targetType) === ContainerType.ARTICLES)
                    ? currentContainer.findAncestorChildren(func)
                    : currentContainer.findAncestorChildrenSub(func)
            );
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
    pointerInfo: LocatedPointerInfo,
    lastLocatedContainer: Container | null,
} => {

    const origFragments = origPointer.fragments();
    const headContainer = locateContainerOfHeadFragment(
        origFragments[0],
        prevLocatedContainerForSame,
        prevLocatedContainerForNamed,
        currentContainer,
    );

    const pointerInfo: LocatedPointerInfo = [];
    let lastLocatedContainer = headContainer;

    if (headContainer) {
        pointerInfo.push([origFragments[0], headContainer]);

        let parentContainer = headContainer;
        for (const fragment of origFragments.slice(1)) {
            const container = locateContainerFromParent(parentContainer, fragment);

            if (container) {
                pointerInfo.push([fragment, container]);
                parentContainer = container;
                lastLocatedContainer = container;
            } else {
                break;
            }
        }
    }
    return { pointerInfo, lastLocatedContainer };

};

const locateRanges = (
    origRanges: ____PointerRanges,
    prevLocatedContainerForSame: Container | null,
    prevLocatedContainerForNamed: Container | null,
    currentContainer: Container,
) => {
    const ranges: ([fromOnly: LocatedPointerInfo]|[from:LocatedPointerInfo, toIncluded:LocatedPointerInfo])[] = [];
    const rangeELs = origRanges.ranges();

    let processed = false;
    if (rangeELs.length === 1) {
        const pointerELs = rangeELs[0].pointers();
        if (pointerELs.length === 1) {
            const fragments = pointerELs[0].fragments();
            if (fragments.length === 1) {
                const fragmentEL = fragments[0];

                if (fragmentEL.attr.relPos === RelPos.PREV && fragmentEL.attr.count !== null) {
                    processed = true;
                    let count = fragmentEL.attr.count === "all" ? Number.MAX_SAFE_INTEGER : Number(fragmentEL.attr.count);

                    const scopeContainer = currentContainer
                        .thisOrClosest(c => c.el.tag === fragmentEL.attr.targetType);

                    if (scopeContainer && count > 0) {
                        for (const prevContainer of scopeContainer.prevAll(c => c.el.tag === fragmentEL.attr.targetType)) {
                            ranges.unshift([[[fragmentEL, prevContainer]]]);
                            count--;
                            if (count <= 0) break;
                        }
                    }
                }
            }
        }
    }

    if (!processed) {
        for (const [origFrom, origTo] of rangeELs.map(r => r.pointers())) {
            const from = locatePointer(
                origFrom,
                prevLocatedContainerForSame,
                prevLocatedContainerForNamed,
                currentContainer,
            );
            prevLocatedContainerForSame = from.lastLocatedContainer;
            prevLocatedContainerForNamed = from.lastLocatedContainer;
            if (!origTo) {
                ranges.push([from.pointerInfo]);
            } else {
                const to = locatePointer(
                    origTo,
                    prevLocatedContainerForSame,
                    prevLocatedContainerForNamed,
                    currentContainer,
                );
                prevLocatedContainerForSame = from.lastLocatedContainer;
                prevLocatedContainerForNamed = from.lastLocatedContainer;
                ranges.push([from.pointerInfo, to.pointerInfo]);
            }
        }
    }

    return { ranges, lastLocatedContainer: prevLocatedContainerForSame };
};

export const getScope = (
    currentContainer: Container,
    prevLocatedContainerForSame: Container | null,
    prevLocatedContainerForNamed: Container | null,
    pointerRangesToBeModified: ____PointerRanges,
): {
    ranges: (string | [from:string, toIncluded:string])[],
    lastLocatedContainer: Container | null,
} => {
    const targetContainerIDRanges = new Set<string | [from:string, toIncluded:string]>();
    const { ranges, lastLocatedContainer } = locateRanges(
        pointerRangesToBeModified,
        prevLocatedContainerForSame,
        prevLocatedContainerForNamed,
        currentContainer,
    );
    for (const fromTo of ranges) {
        const [from, to] = fromTo;
        if (from.length === 0 || (to && to.length === 0)) {
            continue;
        }

        let fromContainerID: string | null = null;
        for (const [fragment, container] of from) {
            fragment.targetContainerIDs = [...new Set([...fragment.targetContainerIDs, container.containerID])];
            fromContainerID = container.containerID;
        }
        let toContainerID: string | null = null;
        if (to) {
            for (const [fragment, container] of to) {
                fragment.targetContainerIDs = [...new Set([...fragment.targetContainerIDs, container.containerID])];
                toContainerID = container.containerID;
            }
        }

        if (fromContainerID && toContainerID) {
            targetContainerIDRanges.add([fromContainerID, toContainerID]);
        } else if (fromContainerID) {
            targetContainerIDRanges.add(fromContainerID);
        }
    }
    if (targetContainerIDRanges.size > 0) {
        pointerRangesToBeModified.targetContainerIDRanges = [...targetContainerIDRanges];
    }
    return {
        ranges: [...targetContainerIDRanges],
        lastLocatedContainer,
    };
};

export default getScope;
