import { Container } from "./container";


export enum RelPos {
    // eslint-disable-next-line no-unused-vars
    PREV = "PREV",
    // eslint-disable-next-line no-unused-vars
    HERE = "HERE",
    // eslint-disable-next-line no-unused-vars
    NEXT = "NEXT",
    // eslint-disable-next-line no-unused-vars
    SAME = "SAME",
    // eslint-disable-next-line no-unused-vars
    NAMED = "NAMED",
}
export const isRelPos = (object: unknown): object is RelPos => {
    return (
        object === RelPos.PREV ||
        object === RelPos.HERE ||
        object === RelPos.NEXT ||
        object === RelPos.NAMED
    );
};

export class PointerFragment {
    public relPos: RelPos;
    public tag: string;
    public name: string;
    public num: string | null;
    public locatedContainer: Container | null;

    constructor(
        relPos: RelPos,
        tag: string,
        name: string,
        num: string | null,
        locatedContainer: Container | null = null,
    ) {
        this.relPos = relPos;
        this.tag = tag;
        this.name = name;
        this.num = num;
        this.locatedContainer = locatedContainer;
    }

    public copy(): PointerFragment {
        return new PointerFragment(
            this.relPos,
            this.tag,
            this.name,
            this.num,
            this.locatedContainer,
        );
    }
}

export type Pointer = PointerFragment[];
export type Range = [Pointer, Pointer]; // closed
export type Ranges = Range[];
