
import { ____Declaration } from "../../node/el/controls/declaration";


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
