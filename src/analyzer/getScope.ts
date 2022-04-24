import { throwError } from "../util";
import { Container, ContainerType } from "../node/container";
import { EL } from "../node/el";
import { initialEnv } from "../parser/cst/env";
import { getContainerType, ignoreAnalysisTag } from "./common";
import { SpanTextRange } from "../node/span/spanTextPos";
import { RelPos, ____PF, ____Pointer, ____PointerRanges } from "../node/el/controls/pointer";
import { $pointerRanges } from "./stringParser/rules/$pointerRanges";


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

    let locatedFragments: ____PF[];
    let headContainer: Container | null = null;

    const head = origPointer.fragments()[0];
    const headType = getContainerType(head.attr.targetType);

    if ((ignoreAnalysisTag as readonly string[]).indexOf(head.attr.targetType) >= 0) {
        locatedFragments = origPointer.fragments();

    } else if (head.attr.relPos === RelPos.SAME) {
        locatedFragments = origPointer.fragments();
        // if (origPointer.fragments().length !== 1) {
        //     console.warn("RelPos.SAME with multiple fragments", currentSpan, origPointer);
        // }
        // headContainer = currentContainer
        //     .thisOrClosest(c => c.type === ContainerType.TOPLEVEL);
        // locatedFragments = [head];

    } else if (
        head.attr.relPos === RelPos.HERE ||
        head.attr.relPos === RelPos.PREV ||
        head.attr.relPos === RelPos.NEXT
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

        locatedFragments = origPointer.fragments();

    } else {
        const foundIndex = prevLocatedPointerInfo
            ? prevLocatedPointerInfo.findIndex(([fragment]) => fragment.attr.targetType === head.attr.targetType)
            : -1;
        if (
            prevLocatedPointerInfo &&
            1 <= foundIndex
        ) {
            locatedFragments = [
                ...prevLocatedPointerInfo.slice(0, foundIndex).map(([fragment]) => fragment),
                ...origPointer.fragments(),
            ];

        } else if (headType === ContainerType.TOPLEVEL) {
            headContainer = currentContainer.findAncestorChildrenSub(c => {
                if (c.el.tag !== head.attr.targetType) return false;
                const titleEl = c.el.children.find(el =>
                    el instanceof EL && el.tag === `${c.el.tag}Title`) as EL;
                return (new RegExp(`^${head.attr.name}(?:[(（]|\\s|$)`)).exec(titleEl.text()) !== null;
            });

            locatedFragments = origPointer.fragments();

        } else {
            const func = (c: Container) =>
                (
                    c.el.tag === head.attr.targetType ||
                    head.attr.targetType === "SUBITEM" && /^Subitem\d+$/.exec(c.el.tag) !== null
                ) &&
                (c.el.attr.Num || null) === head.attr.num;
            headContainer =
                headType === ContainerType.ARTICLES
                    ? currentContainer.findAncestorChildren(func)
                    : currentContainer.findAncestorChildrenSub(func);

            locatedFragments = origPointer.fragments();
        }
    }

    const ret: LocatedPointerInfo = [];

    if (headContainer) {
        ret.push([locatedFragments[0], headContainer]);

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
                            && ((c.el.attr.Num ?? null) === fragment.attr.num)
                        )
                        || (
                            (fragment.attr.targetType === "PROVISO")
                            && (c.el.tag === "Sentence")
                            && (c.el.attr.Function === "proviso")
                        ),
                    // c => fragment_rank < container_tags.indexOf(c.el.tag),
                );
            if (container) {
                ret.push([fragment, container]);
                parentContainer = container;
            } else {
                break;
            }
        }
    }

    return ret;
};

const locateRanges = (origRanges: ____PointerRanges, currentContainer: Container) => {
    const ranges: [LocatedPointerInfo, LocatedPointerInfo][] = [];

    let prevLocatedPointerInfo: LocatedPointerInfo | null = null;
    for (const [origFrom, origTo] of origRanges.ranges().map(r => r.pointers())) {
        const from = locatePointer(origFrom, prevLocatedPointerInfo, currentContainer);
        prevLocatedPointerInfo = from;
        let to: LocatedPointerInfo | null;
        if (!origTo) {
            to = from;
        } else {
            to = locatePointer(origTo, prevLocatedPointerInfo, currentContainer);
            prevLocatedPointerInfo = to;
        }
        ranges.push([from, to]);
        // if (!from || !to || from.length === 0 || to.length === 0) {
        //     console.warn("locateRanges: invalid range", origRanges, currentSpan, from, to);
        // }
    }

    return ranges;
};

export const getScope = (currentContainer: Container, origRangesOrText: string | ____PointerRanges, following: boolean, followingIndex: number): SpanTextRange[] => {
    const ret: SpanTextRange[] = [];
    const origRanges = origRangesOrText instanceof ____PointerRanges ? origRangesOrText : parseRanges(origRangesOrText);
    if (!origRanges) return ret;
    const ranges = locateRanges(origRanges, currentContainer);
    for (const [from, to] of ranges) {
        if (from.length === 0 || to.length === 0) {
            continue;
        }
        const [, fromc] = from[from.length - 1];
        const [, toc] = to[to.length - 1];
        if (following) {
            ret.push({
                startSpanIndex: followingIndex,
                startTextIndex: 0,
                endSpanIndex: toc.spanRange[1],
                endTextIndex: 0,
            });
        } else {
            ret.push({
                startSpanIndex: fromc.spanRange[0],
                startTextIndex: 0,
                endSpanIndex: toc.spanRange[1],
                endTextIndex: 0,
            });
        }
    }
    // console.log(scope_text, ranges, ret);
    return ret;
};

export default getScope;
