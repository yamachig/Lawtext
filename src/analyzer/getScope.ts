import { throwError } from "../util";
import { Container, ContainerType } from "../node/container";
import { Span } from "../node/span";
import { EL } from "../node/el";
import { initialEnv } from "../parser/cst/env";
import { getContainerType, ignoreSpanTag } from "./common";
import { SpanTextRange } from "../node/span/spanTextPos";
import { RelPos, __PF, __Pointer, __Ranges } from "../node/el/controls/pointer";
import { $pointerRanges } from "../parser/cst/rules/$pointer";


const parseRanges = (text: string): __Ranges | null => { // closed
    if (text === "") return null;
    const result = $pointerRanges.match(0, text, initialEnv({}));
    if (result.ok) return result.value.value;
    else return null;
};

type LocatedPointerInfo = [fragment: __PF, container: Container][];

const locatePointer = (
    origPointer: __Pointer,
    prevLocatedPointerInfo: LocatedPointerInfo | null,
    currentSpan: Span,
): LocatedPointerInfo => {

    let locatedFragments: __PF[];
    let headContainer: Container | null = null;

    const head = origPointer.fragments()[0];
    const headType = getContainerType(head.tag);
    const currentContainer = currentSpan.env.container;

    if ((ignoreSpanTag as readonly string[]).indexOf(head.tag) >= 0) {
        locatedFragments = origPointer.fragments();

    } else if (head.attr.relPos === RelPos.SAME) {
        if (origPointer.fragments().length !== 1) {
            console.warn("RelPos.SAME with multiple fragments", currentSpan, origPointer);
        }
        headContainer = currentContainer
            .thisOrClosest(c => c.type === ContainerType.TOPLEVEL);
        locatedFragments = [head];

    } else if (
        head.attr.relPos === RelPos.HERE ||
        head.attr.relPos === RelPos.PREV ||
        head.attr.relPos === RelPos.NEXT
    ) {
        const scopeContainer = currentContainer
            .thisOrClosest(c => c.el.tag === head.tag);

        if (scopeContainer) {
            headContainer =
                (head.attr.relPos === RelPos.HERE)
                    ? scopeContainer
                    : (headType === ContainerType.ARTICLES)
                        ? (head.attr.relPos === RelPos.PREV)
                            ? scopeContainer.prev(c => c.el.tag === head.tag)
                            : (head.attr.relPos === RelPos.NEXT)
                                ? scopeContainer.next(c => c.el.tag === head.tag)
                                : throwError()
                        : (head.attr.relPos === RelPos.PREV)
                            ? scopeContainer.prevSub(c => c.el.tag === head.tag)
                            : (head.attr.relPos === RelPos.NEXT)
                                ? scopeContainer.nextSub(c => c.el.tag === head.tag)
                                : throwError();
        }

        locatedFragments = origPointer.fragments();

    } else {
        const foundIndex = prevLocatedPointerInfo
            ? prevLocatedPointerInfo.findIndex(([fragment]) => fragment.tag === head.tag)
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
                if (c.el.tag !== head.tag) return false;
                const titleEl = c.el.children.find(el =>
                    el instanceof EL && el.tag === `${c.el.tag}Title`) as EL;
                return (new RegExp(`^${head.attr.name}(?:[(（]|\\s|$)`)).exec(titleEl.text()) !== null;
            });

            locatedFragments = origPointer.fragments();

        } else {
            const func = (c: Container) =>
                (
                    c.el.tag === head.tag ||
                    head.tag === "SUBITEM" && /^Subitem\d+$/.exec(c.el.tag) !== null
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
                                (c.el.tag === fragment.tag)
                                || (
                                    (fragment.tag === "SUBITEM")
                                    && (/^Subitem\d+$/.exec(c.el.tag) !== null)
                                )
                            )
                            && ((c.el.attr.Num ?? null) === fragment.attr.num)
                        )
                        || (
                            (fragment.tag === "PROVISO")
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

const locateRanges = (origRanges: __Ranges, currentSpan: Span) => {
    const ranges: [LocatedPointerInfo, LocatedPointerInfo][] = [];

    let prevLocatedPointerInfo: LocatedPointerInfo | null = null;
    for (const [origFrom, origTo] of origRanges.ranges().map(r => r.pointers())) {
        const from = locatePointer(origFrom, prevLocatedPointerInfo, currentSpan);
        prevLocatedPointerInfo = from;
        let to: LocatedPointerInfo | null;
        if (origFrom === origTo) {
            to = from;
        } else {
            to = locatePointer(origTo, prevLocatedPointerInfo, currentSpan);
            prevLocatedPointerInfo = to;
        }
        ranges.push([from, to]);
    }

    return ranges;
};

export const getScope = (currentSpan: Span, scopeText: string, following: boolean, followingIndex: number): SpanTextRange[] => {
    const ret: SpanTextRange[] = [];
    const origRanges = parseRanges(scopeText);
    if (!origRanges) return ret;
    const ranges = locateRanges(origRanges, currentSpan);
    for (const [from, to] of ranges) {
        const [, fromc] = from[from.length - 1];
        const [, toc] = to[to.length - 1];
        if (fromc && toc) {
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
        } else {
            // console.warn("Scope couldn't be detected:", { from, to });
        }
    }
    // console.log(scope_text, ranges, ret);
    return ret;
};

export default getScope;
