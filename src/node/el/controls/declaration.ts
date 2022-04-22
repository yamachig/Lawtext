import { EL } from "../";
import { SpanTextPos, SpanTextRange } from "../../span/spanTextPos";


export interface DeclarationOptions {
    declarationID: string,
    type: string,
    name: string,
    value: string | null,
    scope: SpanTextRange[],
    namePos: SpanTextPos,
    range: [start: number, end: number] | null,
}

export class ____Declaration extends EL {
    public override attr: {
        declarationID: string,
        type: string,
        name: string,
        value?: string,
        scope: string,
        namePos: string,
    };
    private scopeCache: [str: string, value: SpanTextRange[]] | null = null;
    public scope(): SpanTextRange[] {
        if (this.scopeCache !== null && this.scopeCache[0] === this.attr.scope) {
            return this.scopeCache[1];
        } else {
            const scope = JSON.parse(this.attr.scope) as SpanTextRange[];
            this.scopeCache = [this.attr.scope, scope];
            return scope;
        }
    }
    private namePosCache: [str: string, value: SpanTextPos] | null = null;
    public namePos(): SpanTextPos {
        if (this.namePosCache !== null && this.namePosCache[0] === this.attr.namePos) {
            return this.namePosCache[1];
        } else {
            const namePos = JSON.parse(this.attr.namePos) as SpanTextPos;
            this.namePosCache = [this.attr.namePos, namePos];
            return namePos;
        }
    }
    constructor(options: DeclarationOptions) {
        super("____Declaration", {}, [], options.range);

        const { declarationID: id, type, name, value, scope, namePos } = options;

        this.attr = {
            declarationID: id,
            type,
            name,
            scope: JSON.stringify(scope),
            namePos: JSON.stringify(namePos),
        };
        if (value !== null) this.attr.value = value;

        this.children.push(name);
    }

    public get nameRange(): [number, number] | null {
        const namePos = this.namePos();
        return namePos.range && [
            namePos.range[0] + namePos.textIndex,
            namePos.range[0] + namePos.textIndex + namePos.length,
        ];
    }
}
