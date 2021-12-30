import { MatchFail } from "generic-parser/lib/core";
import { EL } from "./el";


export class __Parentheses extends EL {

    public content: string;

    constructor(type: string, depth: number, start: string, end: string, content: Array<string | EL>, text: string) {
        super("__Parentheses");

        this.attr.type = type;
        this.attr.depth = `${depth}`;
        this.append(new EL("__PStart", { type }, [start]));
        this.extend([new EL("__PContent", { type }, content)]);
        this.append(new EL("__PEnd", { type }, [end]));

        this.content = text.slice(start.length, text.length - end.length);
    }
}


export class __Text extends EL {

    constructor(text: string) {
        super("__Text", {}, [text]);
    }
}


export class __MatchFail extends EL {

    constructor(matchFail: MatchFail, children: (string | EL)[]) {
        super("__MatchFail", {}, children);
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
