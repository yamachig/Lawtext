import { EL } from "..";
import * as std from "../../../law/std";

export enum RelPos {
    PREV = "PREV",
    HERE = "HERE",
    NEXT = "NEXT",
    SAME = "SAME",
    NAMED = "NAMED",
}

export const isRelPos = (object: unknown): object is RelPos => {
    return (
        object === RelPos.PREV ||
        object === RelPos.HERE ||
        object === RelPos.NEXT ||
        object === RelPos.NAMED
    );
};

export type PointerTargetType = (
    | (typeof std.articleGroupTags)[number]
    | "Article"
    | "Paragraph"
    | "Item"
    | "SupplProvision"
    | "TableStruct"
    | (typeof std.appdxItemTags)[number]
    | "FIRSTPART"
    | "LATTERPART"
    | "PROVISO"
    | "SUBITEM"
);

export interface PFOptions {
    relPos: RelPos;
    targetType: PointerTargetType;
    name: string;
    num: string | null;
    range: [start: number, end: number] | null,
    // locatedContainerID?: string | null,
}

export class __PF extends EL {

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    public override tag: unknown = "__PF" as unknown;
    public override attr: {
        relPos: RelPos,
        targetType: PointerTargetType,
        name: string,
        num?: string,
        // locatedContainerID?: string,
    };
    constructor(options: PFOptions) {
        super("__PF", {}, [], options.range);

        const { relPos, targetType, name, num } = {
            // locatedContainerID: null,
            ...options,
        };

        this.attr = {
            relPos,
            targetType: targetType,
            name,
        };
        if (num) this.attr.num = num;
        // if (locatedContainerID) this.attr.locatedContainerID = locatedContainerID;

        this.children.push(name);
    }
}

export interface PointerOptions {
    children: (__PF | EL | string)[],
    range: [start: number, end: number] | null,
}

export class __Pointer extends EL {
    constructor(options: PointerOptions) {
        super("__Pointer", {}, options.children as (EL | string)[], options.range);
    }
    public fragments(): __PF[] {
        return this.children.filter(c => typeof c !== "string" && c.tag === "__PF") as __PF[];
    }
}

export interface RangeOptions {
    from: __Pointer,
    midChildren: (EL | string)[],
    to: __Pointer | null, // closed
    trailingChildren: (EL | string)[],
    range: [start: number, end: number] | null,
}

export class __Range extends EL {
    constructor(options: RangeOptions) {
        super(
            "__Range",
            {},
            [
                options.from,
                ...options.midChildren,
                ...(options.to ? [options.to] : []),
                ...options.trailingChildren,
            ],
            options.range,
        );
    }
    public pointers(): [__Pointer] | [__Pointer, __Pointer] {
        return this.children.filter(c => typeof c !== "string" && c.tag === "__Pointer") as [__Pointer] | [__Pointer, __Pointer];
    }
}

export interface RangesOptions {
    children: (__Range | EL | string)[],
    range: [start: number, end: number] | null,
}

export class __Ranges extends EL {
    constructor(options: RangesOptions) {
        super("__Ranges", {}, options.children, options.range);
    }
    public ranges(): __Range[] {
        return this.children.filter(c => typeof c !== "string" && c.tag === "__Range") as __Range[];
    }
}
