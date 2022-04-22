import { EL } from "..";
import { __Parentheses } from "./parentheses";
import { __Text } from "./text";


export * from "./parentheses";
export * from "./text";

export const controlFromEL = (el: EL): EL => {
    if (el.tag === "__Parentheses") {
        return Object.setPrototypeOf(el.copy(false, true), __Parentheses.prototype);
    } else if (el.tag === "__Text") {
        return Object.setPrototypeOf(el.copy(false, true), __Text.prototype);
    } else {
        return el;
    }
};
