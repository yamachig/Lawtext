import { EL } from "..";

export class ____LawNum extends EL {
    public override tag = "____LawNum" as const;
    public override get isControl(): true { return true; }
    public override children: [string];

    constructor(
        text: string,
        range: [start: number, end: number] | null = null,
    ) {
        super("____LawNum", {}, [], range);
        this.children = [text];
    }
}
