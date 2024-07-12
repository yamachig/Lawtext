import { assertNever } from "../../util";
import type { Container } from "../../node/container";
import { ____PointerRanges } from "../../node/el/controls/pointer";
import type { RangeInfo } from "../../node/el/controls";
import { __Text } from "../../node/el/controls";
import type { PointerEnvsStruct } from "./getPointerEnvs";


interface ObjRangeInfo {
    from: Container[],
    to?: Container[],
    exclude?: ObjRangeInfo[],
}

const objRangeInfoToRangeInfo = (obj: ObjRangeInfo): RangeInfo => {
    return {
        from: obj.from[0].containerID,
        ...(obj.to ? { to: obj.to[0].containerID } : {}),
        ...(obj.exclude ? { exclude: obj.exclude.map(objRangeInfoToRangeInfo) } : {}),
    };
};

const getScopeInfoOfPointerRanges = (
    pointerRanges: ____PointerRanges,
    pointerEnvsStruct: PointerEnvsStruct,
    force = false,
): {
    ranges: ObjRangeInfo[],
} => {

    const ranges: ObjRangeInfo[] = [];
    const pointerRangeList = pointerRanges.ranges();

    for (const pointerRange of pointerRangeList) {
        const [fromPointer, toPointer] = pointerRange.pointers();
        const from = pointerEnvsStruct.pointerEnvByEL.get(fromPointer);
        if (!from) {
            // console.warn(`fromPointer not found: ${JSON.stringify(fromPointer.json(true), null, 2)}`);
            continue;
        }
        from.locate(force);
        if (!from.located) {
            // console.warn(`fromPointer not located: ${JSON.stringify(from.json(), null, 2)}`);
            continue;
        }

        let range: ObjRangeInfo;

        if (!toPointer) {
            if (from.located.type === "external") {
                // Not implemeted
                continue;
            } else if (from.located.type === "internal") {
                if (from.located.fragments.length === 0) continue;
                range = {
                    from: from.located.fragments[from.located.fragments.length - 1].containers,
                };
            }
            else { throw assertNever(from.located); }

        } else {
            const to = pointerEnvsStruct.pointerEnvByEL.get(toPointer);
            if (!to) {
                // console.warn(`toPointer not found: ${JSON.stringify(toPointer.json(true), null, 2)}`);
                continue;
            }
            to.locate(force);
            if (!to.located) {
                // console.warn(`toPointer not located: ${JSON.stringify(to.json(), null, 2)}`);
                continue;
            }

            if (from.located.type === "internal" && to.located.type === "internal") {
                if (from.located.fragments.length === 0) continue;
                if (to.located.fragments.length === 0) continue;
                range = {
                    from: from.located.fragments[from.located.fragments.length - 1].containers,
                    to: to.located.fragments[to.located.fragments.length - 1].containers,
                };

            } else {
                // Not implemeted
                continue;
            }
        }

        const modifierParentheses = pointerRange.modifierParentheses();
        if (modifierParentheses) {
            const pContent = modifierParentheses.content;
            if (pContent.children.length === 2) {
                const [exRanges, exText] = pContent.children;
                if (exRanges instanceof ____PointerRanges && exText instanceof __Text && exText.text() === "を除く。") {
                    range.exclude = getScopeInfoOfPointerRanges(exRanges, pointerEnvsStruct, force).ranges;
                }
            }
        }

        ranges.push(range);
    }


    return { ranges };
};

export const getScope = (
    pointerRangesToBeModified: ____PointerRanges,
    pointerEnvsStruct: PointerEnvsStruct,
    force = false,
): {
    ranges: readonly RangeInfo[],
} => {
    if (!force) {
        const ret = pointerRangesToBeModified.targetContainerIDRanges;
        if (ret.length > 0) return { ranges: ret };
    }

    const rangeInfos: RangeInfo[] = [];
    const { ranges } = getScopeInfoOfPointerRanges(pointerRangesToBeModified, pointerEnvsStruct, force);

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
            for (let i = 0; i < fromContainerIDs.length - 1; i++) pushRangeInfo({ from: fromContainerIDs[i], exclude: exclude?.map(objRangeInfoToRangeInfo) });
            pushRangeInfo({ from: fromContainerIDs[fromContainerIDs.length - 1], to: toContainerIDs[0], exclude: exclude?.map(objRangeInfoToRangeInfo) });
            for (let i = 0; i < toContainerIDs.length - 1; i++) pushRangeInfo({ from: toContainerIDs[i], exclude: exclude?.map(objRangeInfoToRangeInfo) });
        } else if (fromContainerIDs) {
            for (const containerID of fromContainerIDs) pushRangeInfo({ from: containerID, exclude: exclude?.map(objRangeInfoToRangeInfo) });
        }
    }
    if (rangeInfos.length > 0) {
        pointerRangesToBeModified.targetContainerIDRanges = rangeInfos;
    }
    return {
        ranges: rangeInfos,
    };
};

export default getScope;
