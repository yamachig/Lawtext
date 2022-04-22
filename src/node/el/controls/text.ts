import { EL } from "..";

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
