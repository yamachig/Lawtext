import { EL } from "..";
import { SentenceTextRange } from "../../container/sentenceEnv";


export interface VarRefOptions {
    refName: string,
    declarationID: string,
    refSentenceTextRange: SentenceTextRange,
    range: [start: number, end: number] | null,
}

export class ____VarRef extends EL {
    public override tag = "____VarRef" as const;
    public override get isControl(): true { return true; }
    public override attr: {
        refName: string,
        declarationID: string,
        refSentenceTextRange: string,
    };

    private refSentenceTextRangeCache: [str: string, value: SentenceTextRange] | null = null;
    public get refSentenceTextRange(): SentenceTextRange {
        if (this.refSentenceTextRangeCache !== null && this.refSentenceTextRangeCache[0] === this.attr.refSentenceTextRange) {
            return this.refSentenceTextRangeCache[1];
        } else {
            const refSentenceTextRange = JSON.parse(this.attr.refSentenceTextRange) as SentenceTextRange;
            this.refSentenceTextRangeCache = [this.attr.refSentenceTextRange, refSentenceTextRange];
            return refSentenceTextRange;
        }
    }

    constructor(options: VarRefOptions) {
        super("____VarRef", {}, [], options.range);

        const { refName, declarationID, refSentenceTextRange } = options;

        this.attr = {
            refName,
            declarationID,
            refSentenceTextRange: JSON.stringify(refSentenceTextRange),
        };

        this.children.push(refName);
    }
}
