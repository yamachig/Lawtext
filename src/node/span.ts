import { EL } from "./el";
import { Env } from "./env";

export class Span {
    public index: number;
    public el: EL;
    public env: Env;
    public text: string;
    constructor(index: number, el: EL, env: Env) {
        this.index = index;
        this.el = el;
        this.env = env;

        this.text = el.text();
    }
}
