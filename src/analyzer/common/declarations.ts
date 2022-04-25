
import { ____Declaration } from "../../node/el/controls/declaration";


export class Declarations {
    public db: Map<string, ____Declaration> = new Map();

    public getInSpan(sentenceIndex: number): ____Declaration[] {
        const declarations: ____Declaration[] = [];
        for (const declaration of this.db.values()) {
            if (
                declaration.scope().some(range =>
                    range.start.sentenceIndex <= sentenceIndex &&
                    sentenceIndex < range.end.sentenceIndex,
                )
            ) {
                declarations.push(declaration);
            }
        }
        declarations.sort((a, b) => -(a.attr.name.length - b.attr.name.length));
        return declarations;
    }

    public add(declaration: ____Declaration): void {
        this.db.set(declaration.attr.declarationID, declaration);
    }

    get length(): number {
        return this.db.size;
    }

    public get(declarationID: string): ____Declaration {
        return this.db.get(declarationID) as ____Declaration;
    }
}
