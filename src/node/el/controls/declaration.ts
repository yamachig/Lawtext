import { EL } from "../";
import { SpanTextPos, SpanTextRange } from "../../span/spanTextPos";


export interface DeclarationOptions {
    type: string,
    name: string,
    value: string | null,
    scope: SpanTextRange[],
    namePos: SpanTextPos,
    range: [start: number, end: number] | null,
}

export class ____Declaration extends EL {
    public type: string;
    public name: string;
    public scope: SpanTextRange[];
    public value: string | null;
    public namePos: SpanTextPos;
    constructor(options: DeclarationOptions) {
        super("____Declaration", {}, [], options.range);

        this.type = options.type;
        this.name = options.name;
        this.value = options.value;
        this.scope = options.scope;
        this.namePos = options.namePos;

        this.attr.type = this.type;
        this.attr.name = this.name;
        if (this.value !== null) this.attr.value = this.value;
        this.attr.scope = JSON.stringify(this.scope);
        this.attr.name_pos = JSON.stringify({
            span_index: this.namePos.spanIndex,
            text_index: this.namePos.textIndex,
            length: this.namePos.length,
        });

        this.children.push(this.name);
    }

    public get nameRange(): [number, number] | null {
        return this.namePos.range && [
            this.namePos.range[0] + this.namePos.textIndex,
            this.namePos.range[0] + this.namePos.textIndex + this.namePos.length,
        ];
    }
}
