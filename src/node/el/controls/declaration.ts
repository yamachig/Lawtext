import { EL } from "../";
import { SentenceTextRange } from "../../container/sentenceEnv";


export interface DeclarationOptions {
    declarationID: string,
    type: string,
    name: string,
    value: string | null,
    scope: SentenceTextRange[],
    nameSentenceTextRange: SentenceTextRange,
    range: [start: number, end: number] | null,
}

export class ____Declaration extends EL {
    public override tag = "____Declaration" as const;
    public override get isControl(): true { return true; }
    public override attr: {
        declarationID: string,
        type: string,
        name: string,
        value?: string,
        scope: string,
        nameSentenceTextRange: string,
    };
    public override children: [string];

    private scopeCache: [str: string, value: SentenceTextRange[]] | null = null;
    public scope(): SentenceTextRange[] {
        if (this.scopeCache !== null && this.scopeCache[0] === this.attr.scope) {
            return this.scopeCache[1];
        } else {
            const scope = JSON.parse(this.attr.scope) as SentenceTextRange[];
            this.scopeCache = [this.attr.scope, scope];
            return scope;
        }
    }
    private nameSentenceTextRangeCache: [str: string, value: SentenceTextRange] | null = null;
    public get nameSentenceTextRange(): SentenceTextRange {
        if (this.nameSentenceTextRangeCache !== null && this.nameSentenceTextRangeCache[0] === this.attr.nameSentenceTextRange) {
            return this.nameSentenceTextRangeCache[1];
        } else {
            const nameSentenceTextRange = JSON.parse(this.attr.nameSentenceTextRange) as SentenceTextRange;
            this.nameSentenceTextRangeCache = [this.attr.nameSentenceTextRange, nameSentenceTextRange];
            return nameSentenceTextRange;
        }
    }
    public set nameSentenceTextRange(value: SentenceTextRange) {
        this.attr.nameSentenceTextRange = JSON.stringify(value);
        this.nameSentenceTextRangeCache = [this.attr.nameSentenceTextRange, value];
    }
    constructor(options: DeclarationOptions) {
        super("____Declaration", {}, [], options.range);

        const { declarationID: id, type, name, value, scope, nameSentenceTextRange } = options;

        this.attr = {
            declarationID: id,
            type,
            name,
            scope: JSON.stringify(scope),
            nameSentenceTextRange: JSON.stringify(nameSentenceTextRange),
        };
        if (value !== null) this.attr.value = value;

        this.children = [name];
    }
}
