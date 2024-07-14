import { EL } from "..";
import type * as std from "../../../law/std";
import type { SentenceChildEL } from "../../cst/inline";
import { __Parentheses } from "./parentheses";

export enum RelPos {
    PREV = "PREV",
    HERE = "HERE",
    NEXT = "NEXT",
    SAME = "SAME",
    NAMED = "NAMED",
    EACH = "EACH",
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
    | "Law"
    | (typeof std.articleGroupTags)[number]
    | "Article"
    | "Paragraph"
    | "Item"
    | "SupplProvision"
    | "TableStruct"
    | (typeof std.appdxItemTags)[number]
    | "FIRSTPART" // e.g. "前段"
    | "LATTERPART" // e.g. "後段"
    | "PROVISO" // e.g. "ただし書"
    | "SUBITEM" // Subitem1, Subitem2, Subitem3, ...
    | "INFERIOR" // e.g. "の規定に基づく命令"
);

export interface PFOptions {
    relPos: RelPos;
    targetType: PointerTargetType;
    name: string;
    num?: string | null;
    count?: "all" | `${number}` | null;
    range: [start: number, end: number] | null,
}

export class ____PF extends EL {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    public override tag: unknown = "____PF" as unknown;
    public override get isControl(): true { return true; }
    public override attr: {
        relPos: RelPos,
        targetType: PointerTargetType,
        name: string,
        num?: string,
        count?: string,
    };
    public override children: [string];

    constructor(options: PFOptions) {
        super("____PF", {}, [], options.range);

        const {
            relPos,
            targetType,
            name,
            num = null,
            count = null,
        } = {
            ...options,
        };

        this.attr = {
            relPos,
            targetType: targetType,
            name,
        };
        if (num !== null) this.attr.num = num;
        if (count !== null) this.attr.count = count;

        this.children = [name];
    }
}

export interface PointerOptions {
    children: (____PF | SentenceChildEL)[],
    range: [start: number, end: number] | null,
}

export class ____Pointer extends EL {
    public override tag = "____Pointer" as const;
    public override get isControl(): true { return true; }
    public override children: SentenceChildEL[];

    constructor(options: PointerOptions) {
        super("____Pointer", {}, [], options.range);
        this.children = options.children as SentenceChildEL[];
    }
    public fragments(): ____PF[] {
        return this.children.filter(c => c instanceof ____PF) as ____PF[];
    }
}

export interface PointerRangeOptions {
    from: ____Pointer,
    midChildren: SentenceChildEL[],
    to: ____Pointer | null, // closed
    trailingChildren: SentenceChildEL[],
    range: [start: number, end: number] | null,
}

export class ____PointerRange extends EL {
    public override tag = "____PointerRange" as const;
    public override get isControl(): true { return true; }
    public override children: (____Pointer | SentenceChildEL)[];

    constructor(options: PointerRangeOptions) {
        super(
            "____PointerRange",
            {},
            [],
            options.range,
        );
        this.children = [
            options.from,
            ...options.midChildren,
            ...(options.to ? [options.to] : []),
            ...options.trailingChildren,
        ];
    }
    public pointers(): [____Pointer] | [____Pointer, ____Pointer] {
        return this.children.filter(c => c instanceof ____Pointer) as [____Pointer] | [____Pointer, ____Pointer];
    }
    public modifierParentheses(): __Parentheses | null {
        const lastChild = this.children[this.children.length - 1];
        if (lastChild instanceof __Parentheses) {
            return lastChild;
        } else {
            return null;
        }
    }
}

export interface RangeInfo {
    from: string,
    to?: string,
    exclude?: RangeInfo[],
}

export interface PointerRangesOptions {
    children: (____PointerRange | SentenceChildEL)[],
    range: [start: number, end: number] | null,
}

export class ____PointerRanges extends EL {
    public override tag = "____PointerRanges" as const;
    public override get isControl(): true { return true; }
    public override attr: {
        targetContainerIDRanges?: string,
    };
    public override children: (____PointerRange | SentenceChildEL)[];

    private targetContainerIDRangesCache: [
        str: string,
        value: readonly RangeInfo[], // closed
    ] | null = null;
    public get targetContainerIDRanges(): readonly RangeInfo[] {
        if (this.targetContainerIDRangesCache !== null && this.targetContainerIDRangesCache[0] === this.attr.targetContainerIDRanges) {
            return this.targetContainerIDRangesCache[1];
        } else {
            if (!this.attr.targetContainerIDRanges) return [];
            const value = JSON.parse(this.attr.targetContainerIDRanges) as RangeInfo[];
            this.targetContainerIDRangesCache = [this.attr.targetContainerIDRanges, value];
            return value;
        }
    }
    public set targetContainerIDRanges(value: readonly RangeInfo[]) {
        this.attr.targetContainerIDRanges = JSON.stringify(value);
        this.targetContainerIDRangesCache = [this.attr.targetContainerIDRanges, value];
    }

    constructor(options: PointerRangesOptions) {
        super("____PointerRanges", {}, [], options.range);
        this.children = options.children;
        this.attr = {};
    }
    public ranges(): ____PointerRange[] {
        return this.children.filter(c => c instanceof ____PointerRange) as ____PointerRange[];
    }
}
