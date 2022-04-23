import { EL } from "..";
import { SpanTextPos } from "../../span/spanTextPos";


export interface VarRefOptions {
    refName: string,
    declarationID: string,
    refPos: SpanTextPos,
    range: [start: number, end: number] | null,
}

export class ____VarRef extends EL {
    public override get isControl(): true {
        return true;
    }
    private refPosCache: [str: string, value: SpanTextPos] | null = null;
    public refPos(): SpanTextPos {
        if (this.refPosCache !== null && this.refPosCache[0] === this.attr.refPos) {
            return this.refPosCache[1];
        } else {
            const refPos = JSON.parse(this.attr.refPos) as SpanTextPos;
            this.refPosCache = [this.attr.refPos, refPos];
            return refPos;
        }
    }
    public override attr: {
        refName: string,
        declarationID: string,
        refPos: string,
    };
    constructor(options: VarRefOptions) {
        super("____VarRef", {}, [], options.range);

        const { refName, declarationID, refPos } = options;

        this.attr = {
            refName,
            declarationID,
            refPos: JSON.stringify(refPos),
        };

        this.children.push(refName);
    }
}
