import { EL } from "../el";
import { Env } from "../container/env";

export interface SpanOptions {
    index: number,
    el: EL,
    env: Env,
}

export class Span {
    public index: number;
    public el: EL;
    public env: Env;
    constructor(options: SpanOptions) {
        const { index, el, env } = options;
        this.index = index;
        this.el = el;
        this.env = env;
    }
}
