import { EL } from "..";
import { SpanTextPos } from "../../span/spanTextPos";
import { ____Declaration } from "./declaration";


export interface VarRefOptions {
    refName: string,
    declaration: ____Declaration,
    refPos: SpanTextPos,
    range: [start: number, end: number] | null,
}

export class ____VarRef extends EL {
    public refName: string;
    public declaration: ____Declaration;
    public refPos: SpanTextPos;
    constructor(options: VarRefOptions) {
        super("____VarRef", {}, [], options.range);

        this.refName = options.refName;
        this.declaration = options.declaration;
        this.refPos = options.refPos;

        this.attr.ref_declaration_index = this.declaration.attr.declaration_index;

        this.children.push(this.refName);
    }
}
