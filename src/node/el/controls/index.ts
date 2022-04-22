import { EL } from "..";
import { ____Declaration } from "./declaration";
import { __Parentheses } from "./parentheses";
import { __Text } from "./text";
import { ____VarRef } from "./varRef";


export * from "./varRef";
export * from "./declaration";
export * from "./parentheses";
export * from "./text";

export const controlFromEL = (el: EL): EL => {
    if (el.tag === "__Parentheses") {
        return Object.setPrototypeOf(el.copy(false, true), __Parentheses.prototype);
    } else if (el.tag === "__Text") {
        return Object.setPrototypeOf(el.copy(false, true), __Text.prototype);
    } else if (el.tag === "____Declaration") {
        return Object.setPrototypeOf(el.copy(false, true), ____Declaration.prototype);
    } else if (el.tag === "____VarRef") {
        return Object.setPrototypeOf(el.copy(false, true), ____VarRef.prototype);
    } else {
        return el;
    }
};
