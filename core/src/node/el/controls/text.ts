import { EL } from "..";

export class __Text extends EL {
    public override tag = "__Text" as const;
    public override get isControl(): true { return true; }
    public override children: [string];

    constructor(
        text: string,
        range: [start: number, end: number] | null = null,
    ) {
        super("__Text", {}, [], range);
        this.children = [text];
    }
}
