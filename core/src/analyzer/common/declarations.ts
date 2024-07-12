
import type { SentenceTextRange } from "../../node/container/sentenceEnv";
import type { ____Declaration } from "../../node/el/controls/declaration";


export class Declarations {
    public db: Map<string, ____Declaration> = new Map();

    public filterByRange(sentenceTextRange: SentenceTextRange): Declarations {
        const declarations = new Declarations();
        for (const declaration of this.db.values()) {
            if (
                declaration.scope.some(range => (
                    (
                        (range.start.sentenceIndex < sentenceTextRange.start.sentenceIndex)
                        || (
                            (range.start.sentenceIndex === sentenceTextRange.start.sentenceIndex)
                            && (range.start.textOffset <= sentenceTextRange.start.textOffset)
                        )
                    )
                    && (
                        (sentenceTextRange.end.sentenceIndex < range.end.sentenceIndex)
                        || (
                            (sentenceTextRange.end.sentenceIndex === range.end.sentenceIndex)
                            && (sentenceTextRange.end.textOffset <= range.end.textOffset)
                        )
                    )
                ))
            ) {
                declarations.add(declaration);
            }
        }
        return declarations;
    }

    public values(): ____Declaration[] {
        return [...this.db.values()].sort((a, b) => -(a.attr.name.length - b.attr.name.length));
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
