import { EL } from "..";

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
    content: Array<string | EL>,
    range: {
        start: [start: number, end: number],
        content: [start: number, end: number],
        end: [start: number, end: number],
    } | null,
}

export class __Parentheses extends EL {

    public get content(): EL {
        return this.children.find(c => typeof c !== "string" && c.tag === "__PContent") as EL;
    }
    public get start(): EL {
        return this.children.find(c => typeof c !== "string" && c.tag === "__PStart") as EL;
    }
    public get end(): EL {
        return this.children.find(c => typeof c !== "string" && c.tag === "__PEnd") as EL;
    }
    public override get isControl(): true {
        return true;
    }
    public override attr: {
        type: ParenthesesType,
        depth: string,
    };

    constructor(options: ParenthesesOptions) {
        super("__Parentheses");
        const { type, depth, start, end, content, range } = options;
        this.attr = {
            type,
            depth: `${depth}`,
        };
        if (range){
            this.range = [range.start[0], range.end[1]];
        }
        this.children.push(new EL("__PStart", { type }, [start], range && range.start));
        this.children.push(new EL("__PContent", { type }, content, range && range.content));
        this.children.push(new EL("__PEnd", { type }, [end], range && range.end));
    }
}
