import { EL } from "..";
import { SentenceChildEL } from "../../cst/inline";

export const parenthesesTypeStrings = [
    "round",
    "square",
    "curly",
    "squareb",
] as const;
export type ParenthesesType = typeof parenthesesTypeStrings[number];

export interface ParenthesesOptions {
    type: ParenthesesType,
    depth: number,
    start: string,
    end: string,
    content: SentenceChildEL[],
    range: {
        start: [start: number, end: number],
        content: [start: number, end: number],
        end: [start: number, end: number],
    } | null,
}

export class __Parentheses extends EL {
    public override tag = "__Parentheses" as const;
    public override get isControl(): true { return true; }
    public override attr: {
        type: ParenthesesType,
        depth: string,
    };
    public override children: SentenceChildEL[];

    public get content(): __PContent {
        return this.children.find(c => c instanceof __PContent) as __PContent;
    }
    public get start(): __PStart {
        return this.children.find(c => c instanceof __PStart) as __PStart;
    }
    public get end(): __PEnd {
        return this.children.find(c => c instanceof __PEnd) as __PEnd;
    }

    constructor(options: ParenthesesOptions) {
        super("__Parentheses");
        const { type, depth, start, end, content, range } = options;
        this.attr = {
            type,
            depth: `${depth}`,
        };
        this.children = [
            new __PStart(type, start, range && range.start),
            new __PContent(type, content, range && range.content),
            new __PEnd(type, end, range && range.end),
        ];
        if (range){
            this.range = [range.start[0], range.end[1]];
        }
    }
}


export class __PContent extends EL {
    public override tag = "__PContent" as const;
    public override get isControl(): true { return true; }
    public override attr: {
        type: ParenthesesType,
    };
    public override children: SentenceChildEL[];

    constructor(
        type: ParenthesesType,
        content: SentenceChildEL[],
        range: [start: number, end: number] | null = null,
    ) {
        super("__PContent", {}, [], range);
        this.attr = { type };
        this.children = content;
    }
}


export class __PStart extends EL {
    public override tag = "__PStart" as const;
    public override get isControl(): true { return true; }
    public override attr: {
        type: ParenthesesType,
    };
    public override children: [string];

    constructor(
        type: ParenthesesType,
        text: string,
        range: [start: number, end: number] | null = null,
    ) {
        super("__PStart", {}, [], range);
        this.attr = { type };
        this.children = [text];
    }
}


export class __PEnd extends EL {
    public override tag = "__PEnd" as const;
    public override get isControl(): true { return true; }
    public override attr: {
        type: ParenthesesType,
    };
    public override children: [string];

    constructor(
        type: ParenthesesType,
        text: string,
        range: [start: number, end: number] | null = null,
    ) {
        super("__PEnd", {}, [], range);
        this.attr = { type };
        this.children = [text];
    }
}
