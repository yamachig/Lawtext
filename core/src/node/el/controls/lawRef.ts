import { EL } from "..";


export interface LawRefOptions {
    includingDeclarationID?: string,
    suggestedLawTitle?: string,
    lawNum: string,
    range: [start: number, end: number] | null,
}

export class ____LawRef extends EL {
    public override tag = "____LawRef" as const;
    public override get isControl(): true { return true; }
    public override attr: {
        includingDeclarationID?: string,
        suggestedLawTitle?: string,
        lawNum: string,
    };

    constructor(options: LawRefOptions) {
        super("____LawRef", {}, [], options.range);

        const { includingDeclarationID, suggestedLawTitle, lawNum } = options;

        this.attr = {
            ...(
                (includingDeclarationID !== undefined)
                    ? { includingDeclarationID }
                    : {}
            ),
            ...(
                (suggestedLawTitle !== undefined)
                    ? { suggestedLawTitle }
                    : {}
            ),
            lawNum,
        };
    }
}
