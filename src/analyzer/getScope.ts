import { throwError } from "../util";
import { Container, ContainerType } from "../node/container";
import { EL } from "../node/el";
import { initialEnv } from "../parser/cst/env";
import { getContainerType } from "./common";
import { RelPos, ____PF, ____Pointer, ____PointerRanges } from "../node/el/controls/pointer";
import { $pointerRanges } from "./stringParser/rules/$pointerRanges";
import { SentenceTextPos, SentenceTextRange } from "../node/container/sentenceEnv";
import * as std from "../law/std";


const parseRanges = (text: string): ____PointerRanges | null => { // closed
    if (text === "") return null;
    const result = $pointerRanges.match(0, text, initialEnv({}));
    if (result.ok) return result.value.value;
    else return null;
};

type LocatedPointerInfo = [fragment: ____PF, container: Container][];

const locatePointer = (
    origPointer: ____Pointer,
    prevLocatedPointerInfo: LocatedPointerInfo | null,
    currentContainer: Container,
): LocatedPointerInfo => {

    const origFragments = origPointer.fragments();
    const head = origFragments[0];
    const headType = getContainerType(head.attr.targetType);

    let locatedFragments: ____PF[];
    let headContainer: Container | null = null;

    if (head.attr.relPos === RelPos.SAME) {
        locatedFragments = origFragments;
        // if (origPointer.fragments().length !== 1) {
        //     console.warn("RelPos.SAME with multiple fragments", currentSpan, origPointer);
        // }
        // headContainer = currentContainer
        //     .thisOrClosest(c => c.type === ContainerType.TOPLEVEL);
        // locatedFragments = [head];

    } else if (
        (head.attr.relPos === RelPos.HERE)
        || (head.attr.relPos === RelPos.PREV)
        || (head.attr.relPos === RelPos.NEXT)
    ) {
        const scopeContainer = currentContainer
            .thisOrClosest(c => c.el.tag === head.attr.targetType);

        if (scopeContainer) {
            headContainer =
                (head.attr.relPos === RelPos.HERE)
                    ? scopeContainer
                    : (headType === ContainerType.ARTICLES)
                        ? (head.attr.relPos === RelPos.PREV)
                            ? scopeContainer.prev(c => c.el.tag === head.attr.targetType)
                            : (head.attr.relPos === RelPos.NEXT)
                                ? scopeContainer.next(c => c.el.tag === head.attr.targetType)
                                : throwError()
                        : (head.attr.relPos === RelPos.PREV)
                            ? scopeContainer.prevSub(c => c.el.tag === head.attr.targetType)
                            : (head.attr.relPos === RelPos.NEXT)
                                ? scopeContainer.nextSub(c => c.el.tag === head.attr.targetType)
                                : throwError();
        }

        locatedFragments = origFragments;

    } else {
        const foundIndex = prevLocatedPointerInfo
            ? prevLocatedPointerInfo.findIndex(([fragment]) => fragment.attr.targetType === head.attr.targetType)
            : -1;
        if (
            prevLocatedPointerInfo
            && (1 <= foundIndex)
        ) {
            locatedFragments = [
                ...prevLocatedPointerInfo.slice(0, foundIndex).map(([fragment]) => fragment),
                ...origFragments,
            ];

        } else if (headType === ContainerType.TOPLEVEL) {
            headContainer = currentContainer.findAncestorChildrenSub(c => {
                if (c.el.tag !== head.attr.targetType) return false;
                const titleEl = c.el.children.find(el =>
                    el instanceof EL && el.tag === `${c.el.tag}Title`) as EL;
                return (new RegExp(`^${head.attr.name}(?:[(（]|\\s|$)`)).exec(titleEl.text()) !== null;
            });

            locatedFragments = origFragments;

        } else {
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
            headContainer =
                headType === ContainerType.ARTICLES
                    ? currentContainer.findAncestorChildren(func)
                    : currentContainer.findAncestorChildrenSub(func);

            locatedFragments = origFragments;
        }
    }

    const retOne: LocatedPointerInfo = [];

    if (headContainer) {
        retOne.push([locatedFragments[0], headContainer]);

        let parentContainer = headContainer;
        for (const fragment of locatedFragments.slice(1)) {
            // if (!parentContainer) break;
            // let fragment_rank = container_tags.indexOf(fragment.tag);
            // if (fragment_rank < 0) fragment_rank = Number.POSITIVE_INFINITY;
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
                    // c => fragment_rank < container_tags.indexOf(c.el.tag),
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
    const ranges: [LocatedPointerInfo, LocatedPointerInfo][] = [];
    const rangeELs = origRanges.ranges();

    let processed = false;
    if (rangeELs.length === 1) {
        const pointerELs = rangeELs[0].pointers();
        if (pointerELs.length === 1) {
            const fragments = pointerELs[0].fragments();
            if (fragments.length === 1) {
                const fragmentEL = fragments[0];

                if (fragmentEL.attr.relPos === RelPos.HERE && fragmentEL.attr.targetType === "Law") {
                    // "この法律" does not contain SupplProvision of other amendments.
                    processed = true;
                    for (const container of currentContainer.thisOrClosest(p => p.type === ContainerType.ROOT)?.children ?? []) {
                        if (std.isSupplProvision(container.el) && container.el.attr.AmendLawNum) {
                            continue;
                        }
                        ranges.push([[[fragmentEL, container]], [[fragmentEL, container]]]);
                    }

                } else if (fragmentEL.attr.relPos === RelPos.PREV && fragmentEL.attr.count !== null) {
                    processed = true;
                    let count = fragmentEL.attr.count === "all" ? Number.MAX_SAFE_INTEGER : Number(fragmentEL.attr.count);

                    const scopeContainer = currentContainer
                        .thisOrClosest(c => c.el.tag === fragmentEL.attr.targetType);

                    if (scopeContainer && count > 0) {
                        for (const prevContainer of scopeContainer.prevAll(c => c.el.tag === fragmentEL.attr.targetType)) {
                            ranges.unshift([[[fragmentEL, prevContainer]], [[fragmentEL, prevContainer]]]);
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
                ranges.push([from, from]);
            } else {
                const to = locatePointer(origTo, prevLocatedPointerInfo, currentContainer);
                ranges.push([from, to]);
            }
        }
        // if (!from || !to || from.length === 0 || to.length === 0) {
        //     console.warn("locateRanges: invalid range", origRanges, currentSpan, from, to);
        // }
    }

    return ranges;
};

export const getScope = (
    currentContainer: Container,
    origRangesOrText: string | ____PointerRanges,
    followingStartPos?: SentenceTextPos,
): SentenceTextRange[] => {
    const ret: SentenceTextRange[] = [];
    const origRanges = origRangesOrText instanceof ____PointerRanges ? origRangesOrText : parseRanges(origRangesOrText);
    if (!origRanges) return ret;
    const ranges = locateRanges(origRanges, currentContainer);
    for (const [from, to] of ranges) {
        if (from.length === 0 || to.length === 0) {
            continue;
        }
        const [, fromc] = from[from.length - 1];
        const [, toc] = to[to.length - 1];
        if (followingStartPos) {
            ret.push({
                start: followingStartPos,
                end: {
                    sentenceIndex: toc.sentenceRange[1],
                    textOffset: 0,
                },
            });
        } else {
            ret.push({
                start: {
                    sentenceIndex: fromc.sentenceRange[0],
                    textOffset: 0,
                },
                end: {
                    sentenceIndex: toc.sentenceRange[1],
                    textOffset: 0,
                },
            });
        }
    }
    // console.log(scope_text, ranges, ret);
    return ret;
};

export default getScope;
