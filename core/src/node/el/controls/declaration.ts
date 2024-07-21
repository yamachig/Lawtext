import { EL } from "../";
import type * as std from "../../../law/std";
import type { SentenceTextRange } from "../../container/sentenceEnv";

export type DeclarationValue =
    | {
        isCandidate: false,
        text: string,
        sentenceTextRange: SentenceTextRange,
    }
    | {
        isCandidate: true,
        sentenceTextRange: SentenceTextRange,
    }

export interface DeclarationOptions {
    declarationID: string,
    type: string,
    name: string,
    children: (std.Ruby | std.Sup | std.Sub | std.__EL | string)[],
    value: DeclarationValue | null,
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
    public override children: (std.Ruby | std.Sup | std.Sub | std.__EL | string)[];

    private valueCache: [str: ____Declaration["attr"]["value"], value: DeclarationOptions["value"]] | null = null;
    public get value(): DeclarationOptions["value"] {
        if (this.valueCache !== null && this.valueCache[0] === this.attr.value) {
            return this.valueCache[1];
        } else {
            const value = (this.attr.value !== undefined) ? JSON.parse(this.attr.value) as DeclarationOptions["value"] : null;
            this.valueCache = [this.attr.value, value];
            return value;
        }
    }

    private scopeCache: [str: ____Declaration["attr"]["scope"], value: DeclarationOptions["scope"]] | null = null;
    public get scope(): DeclarationOptions["scope"] {
        if (this.scopeCache !== null && this.scopeCache[0] === this.attr.scope) {
            return this.scopeCache[1];
        } else {
            const scope = JSON.parse(this.attr.scope) as DeclarationOptions["scope"];
            this.scopeCache = [this.attr.scope, scope];
            return scope;
        }
    }

    private nameSentenceTextRangeCache: [str: ____Declaration["attr"]["nameSentenceTextRange"], value: DeclarationOptions["nameSentenceTextRange"]] | null = null;
    public get nameSentenceTextRange(): DeclarationOptions["nameSentenceTextRange"] {
        if (this.nameSentenceTextRangeCache !== null && this.nameSentenceTextRangeCache[0] === this.attr.nameSentenceTextRange) {
            return this.nameSentenceTextRangeCache[1];
        } else {
            const nameSentenceTextRange = JSON.parse(this.attr.nameSentenceTextRange) as DeclarationOptions["nameSentenceTextRange"];
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

        const { declarationID: id, type, name, value, scope, nameSentenceTextRange, children } = options;

        this.attr = {
            declarationID: id,
            type,
            name,
            scope: JSON.stringify(scope),
            nameSentenceTextRange: JSON.stringify(nameSentenceTextRange),
        };
        if (value !== null) this.attr.value = JSON.stringify(value);

        this.children = children;
    }
}
