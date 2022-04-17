import { MatchFail } from "generic-parser/lib/core";
import { EL } from "./el";

export const parenthesesTypeStrings = [
    "round",
    "square",
    "curly",
    "squareb",
] as const;
export type ParenthesesType = typeof parenthesesTypeStrings[number];

export class __Parentheses extends EL {

    public content: string;
    public override get isControl(): true {
        return true;
    }
    public override attr: {
        type: ParenthesesType,
        depth: string,
    };

    constructor(
        type: ParenthesesType,
        depth: number,
        start: string,
        end: string,
        content: Array<string | EL>,
        text: string,
        range: {
            start: [start: number, end: number],
            content: [start: number, end: number],
            end: [start: number, end: number],
        } | null = null,
    ) {
        super("__Parentheses");
        this.attr = {
            type,
            depth: `${depth}`,
        };
        if (range){
            this.range = [range.start[0], range.end[1]];
        }
        this.append(new EL("__PStart", { type }, [start], range && range.start));
        this.extend([new EL("__PContent", { type }, content, range && range.content)]);
        this.append(new EL("__PEnd", { type }, [end], range && range.end));

        this.content = text.slice(start.length, text.length - end.length);
    }
}


export class __Text extends EL {
    public override get isControl(): true {
        return true;
    }

    constructor(
        text: string,
        range: [start: number, end: number] | null = null,
    ) {
        super("__Text", {}, [text], range);
    }
}


export class __MatchFail extends EL {
    public override get isControl(): true {
        return true;
    }

    constructor(
        matchFail: MatchFail,
        children: (string | EL)[],
        range: [start: number, end: number] | null = null,
    ) {
        super("__MatchFail", {}, children, range);
        this.matchFail = matchFail;
    }

    get matchFail(): MatchFail {
        if (!this.attr.matchFail) throw new Error();
        return JSON.parse(this.attr.matchFail);
    }

    set matchFail(matchFail: MatchFail) {
        this.attr.matchFail = JSON.stringify(matchFail);
    }
}
