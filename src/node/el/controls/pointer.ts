import { EL } from "..";
import * as std from "../../../law/std";
import { SentenceTextRange } from "../../container/sentenceEnv";
import { SentenceChildEL } from "../../cst/inline";

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
    | "Law"
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
    | "INFERIOR"
);

export interface PFOptions {
    relPos: RelPos;
    targetType: PointerTargetType;
    name: string;
    num?: string | null;
    count?: "all" | `${number}` | null;
    range: [start: number, end: number] | null,
    locatedContainerID?: string | null,
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
        locatedContainerID?: string,
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
            locatedContainerID = null,
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
        if (locatedContainerID) this.attr.locatedContainerID = locatedContainerID;

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
}

export interface PointerRangesOptions {
    children: (____PointerRange | SentenceChildEL)[],
    range: [start: number, end: number] | null,
    locatedScope?: SentenceTextRange[],
}

export class ____PointerRanges extends EL {
    public override tag = "____PointerRanges" as const;
    public override get isControl(): true { return true; }
    public override attr: {
        locatedScope?: string,
    };
    public override children: (____PointerRange | SentenceChildEL)[];

    private locatedScopeCache: [str: string, value: SentenceTextRange[]] | null = null;
    public get locatedScope(): SentenceTextRange[] | null {
        if (this.locatedScopeCache !== null && this.locatedScopeCache[0] === this.attr.locatedScope) {
            return this.locatedScopeCache[1];
        } else {
            if (!this.attr.locatedScope) return null;
            const scope = JSON.parse(this.attr.locatedScope) as SentenceTextRange[];
            this.locatedScopeCache = [this.attr.locatedScope, scope];
            return scope;
        }
    }

    constructor(options: PointerRangesOptions) {
        super("____PointerRanges", {}, [], options.range);
        this.children = options.children;
        this.attr = {};
        if (options.locatedScope !== undefined) this.attr.locatedScope = JSON.stringify(options.locatedScope);
    }
    public ranges(): ____PointerRange[] {
        return this.children.filter(c => c instanceof ____PointerRange) as ____PointerRange[];
    }
}
