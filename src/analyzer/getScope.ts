import { throwError } from "../util";
import { Container, ContainerType } from "../node/container";
import { Span } from "../node/span";
import { EL } from "../node/el";
import { RelPos, Pointer, Ranges } from "../node/pointer";
import { $ranges } from "./range";
import { initialEnv } from "../parser/cst/env";
import { getContainerType, ignoreSpanTag } from "./common";

export interface ScopeRangeOptions {
    startSpanIndex: number,
    startTextIndex: number,
    endSpanIndex: number, // half open
    endTextIndex: number, // half open
}

export class ScopeRange {
    public startSpanIndex: number;
    public startTextIndex: number;
    public endSpanIndex: number;
    public endTextIndex: number;
    constructor(options: ScopeRangeOptions) {
        this.startSpanIndex = options.startSpanIndex;
        this.startTextIndex = options.startTextIndex;
        this.endSpanIndex = options.endSpanIndex;
        this.endTextIndex = options.endTextIndex;
    }
}

const parseRanges = (text: string): Ranges => { // closed
    if (text === "") return [];
    const result = $ranges.match(0, text, initialEnv({}));
    if (result.ok) return result.value.value;
    else return [];
};

const locatePointer = (
    origPointer: Pointer,
    prevPointer: Pointer | null,
    currentSpan: Span,
): Pointer => {

    let locatedPointer: Pointer;

    const head = origPointer[0];
    const headType = getContainerType(head.tag);
    const currentContainer = currentSpan.env.container;

    if ((ignoreSpanTag as readonly string[]).indexOf(head.tag) >= 0) {
        locatedPointer = origPointer;

    } else if (head.relPos === RelPos.SAME) {
        // console.warn("RelPos.SAME is detected. Skipping:", currentSpan, origPointer);
        const copy = head.copy();
        copy.locatedContainer = currentContainer
            .thisOrClosest(c => c.type === ContainerType.TOPLEVEL);
        locatedPointer = [copy];

    } else if (
        head.relPos === RelPos.HERE ||
        head.relPos === RelPos.PREV ||
        head.relPos === RelPos.NEXT
    ) {
        const scopeContainer = currentContainer
            .thisOrClosest(c => c.el.tag === head.tag);

        if (scopeContainer) {
            head.locatedContainer =
                (head.relPos === RelPos.HERE)
                    ? scopeContainer
                    : (headType === ContainerType.ARTICLES)
                        ? (head.relPos === RelPos.PREV)
                            ? scopeContainer.prev(c => c.el.tag === head.tag)
                            : (head.relPos === RelPos.NEXT)
                                ? scopeContainer.next(c => c.el.tag === head.tag)
                                : throwError()
                        : (head.relPos === RelPos.PREV)
                            ? scopeContainer.prevSub(c => c.el.tag === head.tag)
                            : (head.relPos === RelPos.NEXT)
                                ? scopeContainer.nextSub(c => c.el.tag === head.tag)
                                : throwError();
        }

        locatedPointer = origPointer;

    } else {
        const foundIndex = prevPointer
            ? prevPointer.findIndex(fragment => fragment.tag === head.tag)
            : -1;
        if (
            prevPointer &&
            1 <= foundIndex
        ) {
            locatedPointer = [
                ...prevPointer.slice(0, foundIndex),
                ...origPointer,
            ];

        } else if (headType === ContainerType.TOPLEVEL) {
            head.locatedContainer = currentContainer.findAncestorChildrenSub(c => {
                if (c.el.tag !== head.tag) return false;
                const titleEl = c.el.children.find(el =>
                    el instanceof EL && el.tag === `${c.el.tag}Title`) as EL;
                return (new RegExp(`^${head.name}(?:[(（]|\\s|$)`)).exec(titleEl.text()) !== null;
            });

            locatedPointer = origPointer;

        } else {
            const func = (c: Container) =>
                (
                    c.el.tag === head.tag ||
                    head.tag === "SUBITEM" && /^Subitem\d+$/.exec(c.el.tag) !== null
                ) &&
                (c.el.attr.Num || null) === head.num;
            head.locatedContainer =
                headType === ContainerType.ARTICLES
                    ? currentContainer.findAncestorChildren(func)
                    : currentContainer.findAncestorChildrenSub(func);

            locatedPointer = origPointer;
        }
    }

    if (locatedPointer[0].locatedContainer) {
        let parentContainer = locatedPointer[0].locatedContainer;
        for (const fragment of locatedPointer.slice(1)) {
            if (!parentContainer) break;
            // let fragment_rank = container_tags.indexOf(fragment.tag);
            // if (fragment_rank < 0) fragment_rank = Number.POSITIVE_INFINITY;
            fragment.locatedContainer =
                parentContainer.find(
                    c =>
                        (
                            (
                                c.el.tag === fragment.tag ||
                                fragment.tag === "SUBITEM" &&
                                /^Subitem\d+$/.exec(c.el.tag) !== null
                            ) &&
                            (c.el.attr.Num || null) === fragment.num
                        ) ||
                        fragment.tag === "PROVISO" &&
                        c.el.tag === "Sentence" &&
                        c.el.attr.Function === "proviso",
                    // c => fragment_rank < container_tags.indexOf(c.el.tag),
                );
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            parentContainer = fragment.locatedContainer!;
        }
    }

    return locatedPointer;
};

const locateRanges = (origRanges: Ranges, currentSpan: Span) => {
    const ranges: Ranges = [];

    let prevPointer: Pointer | null = null;
    for (const [origFrom, origTo] of origRanges) {
        const from = locatePointer(origFrom, prevPointer, currentSpan);
        prevPointer = from;
        let to: Pointer | null;
        if (origFrom === origTo) {
            to = from;
        } else {
            to = locatePointer(origTo, prevPointer, currentSpan);
            prevPointer = to;
        }
        ranges.push([from, to]);
    }

    return ranges;
};

export const getScope = (currentSpan: Span, scopeText: string, following: boolean, followingIndex: number): ScopeRange[] => {
    const ret: ScopeRange[] = [];
    const ranges = locateRanges(parseRanges(scopeText), currentSpan);
    for (const [from, to] of ranges) {
        const fromc = from[from.length - 1].locatedContainer;
        const toc = to[to.length - 1].locatedContainer;
        if (fromc && toc) {
            if (following) {
                ret.push(new ScopeRange({
                    startSpanIndex: followingIndex,
                    startTextIndex: 0,
                    endSpanIndex: toc.spanRange[1],
                    endTextIndex: 0,
                }));
            } else {
                ret.push(new ScopeRange({
                    startSpanIndex: fromc.spanRange[0],
                    startTextIndex: 0,
                    endSpanIndex: toc.spanRange[1],
                    endTextIndex: 0,
                }));
            }
        } else {
            // console.warn("Scope couldn't be detected:", { from, to });
        }
    }
    // console.log(scope_text, ranges, ret);
    return ret;
};

export default getScope;
