import { EL } from "..";


export interface LawRefOptions {
    includingDeclarationID: string,
    range: [start: number, end: number] | null,
}

export class ____LawRef extends EL {
    public override tag = "____LawRef" as const;
    public override get isControl(): true { return true; }
    public override attr: {
        includingDeclarationID: string,
    };

    constructor(options: LawRefOptions) {
        super("____LawRef", {}, [], options.range);

        const { includingDeclarationID } = options;

        this.attr = {
            includingDeclarationID,
        };
    }
}
