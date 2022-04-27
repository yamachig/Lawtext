import { assertNever } from "../util";
import { Container, ContainerType } from "../node/container";
import { EL } from "../node/el";
import { getContainerType } from "./common";
import { RelPos, ____PF, ____Pointer, ____PointerRanges } from "../node/el/controls/pointer";

type LocatedPointerInfo = [fragment: ____PF, container: Container][];

const locateContainerOfHeadFragment = (
    head: ____PF,
    prevLocatedPointerInfo: LocatedPointerInfo | null,
    currentContainer: Container,
) => {

    if ((head.attr.relPos === RelPos.SAME)) {
        // e.g.: "同条"

        return null; // Not implemented.

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

        const foundIndex = prevLocatedPointerInfo
            ? prevLocatedPointerInfo.findIndex(([fragment]) => fragment.attr.targetType === head.attr.targetType)
            : -1;

        if (
            prevLocatedPointerInfo
            && (1 <= foundIndex)
        ) {
            // e.g.: "第二条第二項" -> "第三項"

            return prevLocatedPointerInfo[foundIndex][1];

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
    prevLocatedPointerInfo: LocatedPointerInfo | null,
    currentContainer: Container,
): LocatedPointerInfo => {

    const origFragments = origPointer.fragments();
    const headContainer = locateContainerOfHeadFragment(origFragments[0], prevLocatedPointerInfo, currentContainer);

    const retOne: LocatedPointerInfo = [];

    if (headContainer) {
        retOne.push([origFragments[0], headContainer]);

        let parentContainer = headContainer;
        for (const fragment of origFragments.slice(1)) {
            const container =
                parentContainer.find(
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
            if (container) {
                retOne.push([fragment, container]);
                parentContainer = container;
            } else {
                break;
            }
        }
    }
    return retOne;

};

const locateRanges = (origRanges: ____PointerRanges, currentContainer: Container) => {
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
        let prevLocatedPointerInfo: LocatedPointerInfo | null = null;
        for (const [origFrom, origTo] of rangeELs.map(r => r.pointers())) {
            const from = locatePointer(origFrom, prevLocatedPointerInfo, currentContainer);
            prevLocatedPointerInfo = from;
            if (!origTo) {
                ranges.push([from]);
            } else {
                const to = locatePointer(origTo, prevLocatedPointerInfo, currentContainer);
                ranges.push([from, to]);
            }
        }
    }

    return ranges;
};

export const getScope = (
    currentContainer: Container,
    pointerRangesToBeModified: ____PointerRanges,
): (string | [from:string, toIncluded:string])[] => {
    const targetContainerIDRanges = new Set<string | [from:string, toIncluded:string]>();
    const ranges = locateRanges(pointerRangesToBeModified, currentContainer);
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
    return [...targetContainerIDRanges];
};

export default getScope;
