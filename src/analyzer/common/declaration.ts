import { EL } from "../../node/el";
import { ScopeRange } from "../getScope";
import { Pos } from "./pos";


export interface DeclarationOptions {
    type: string,
    name: string,
    value: string | null,
    scope: ScopeRange[],
    namePos: Pos,
    range: [start: number, end: number] | null,
}

export class ____Declaration extends EL {
    public type: string;
    public name: string;
    public scope: ScopeRange[];
    public value: string | null;
    public namePos: Pos;
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

export class Declarations {
    public declarations: ____Declaration[];
    constructor() {
        this.declarations = [];
    }

    public getInSpan(spanIndex: number): ____Declaration[] {
        const declarations: ____Declaration[] = [];
        for (const declaration of this.declarations) {
            if (
                declaration.scope.some(range =>
                    range.startSpanIndex <= spanIndex &&
                    spanIndex < range.endSpanIndex,
                )
            ) {
                declarations.push(declaration);
            }
        }
        declarations.sort((a, b) => -(a.name.length - b.name.length));
        return declarations;
    }

    public add(declaration: ____Declaration): void {
        this.declarations.push(declaration);
    }

    get length(): number {
        return this.declarations.length;
    }

    public get(index: number): ____Declaration {
        return this.declarations[index];
    }
}
