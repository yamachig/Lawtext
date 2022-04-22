import { Env } from "../../node/env";
import { Span } from "../../node/span";

export interface PosOptions {
    span: Span,
    spanIndex: number,
    textIndex: number,
    length: number,
    env: Env,
}

export class Pos {
    public span: Span;
    public spanIndex: number;
    public textIndex: number;
    public length: number;
    public env: Env;
    constructor(options: PosOptions) {
        this.span = options.span;
        this.spanIndex = options.spanIndex;
        this.textIndex = options.textIndex;
        this.length = options.length;
        this.env = options.env;
    }
}
