import { EL } from "..";
import { __Text } from "./text";
import { __Parentheses, __PContent, __PEnd, __PStart } from "./parentheses";
import { ____Declaration } from "./declaration";
import { ____VarRef } from "./varRef";
import { ____PointerRanges, ____PointerRange, ____Pointer, ____PF } from "./pointer";


export * from "./text";
export * from "./parentheses";
export * from "./varRef";
export * from "./declaration";
export * from "./pointer";

export const controlFromEL = (el: EL): EL => {
    if (el.tag === "__Text") {
        return Object.setPrototypeOf(el.copy(false, true), __Text.prototype);
    } else if (el.tag === "__Parentheses") {
        return Object.setPrototypeOf(el.copy(false, true), __Parentheses.prototype);
    } else if (el.tag === "__PStart") {
        return Object.setPrototypeOf(el.copy(false, true), __PStart.prototype);
    } else if (el.tag === "__PContent") {
        return Object.setPrototypeOf(el.copy(false, true), __PContent.prototype);
    } else if (el.tag === "__PEnd") {
        return Object.setPrototypeOf(el.copy(false, true), __PEnd.prototype);
    } else if (el.tag === "____Declaration") {
        return Object.setPrototypeOf(el.copy(false, true), ____Declaration.prototype);
    } else if (el.tag === "____VarRef") {
        return Object.setPrototypeOf(el.copy(false, true), ____VarRef.prototype);
    } else if (el.tag === "____PointerRanges") {
        return Object.setPrototypeOf(el.copy(false, true), ____PointerRanges.prototype);
    } else if (el.tag === "____PointerRange") {
        return Object.setPrototypeOf(el.copy(false, true), ____PointerRange.prototype);
    } else if (el.tag === "____Pointer") {
        return Object.setPrototypeOf(el.copy(false, true), ____Pointer.prototype);
    } else if (el.tag === "____PF") {
        return Object.setPrototypeOf(el.copy(false, true), ____PF.prototype);
    } else {
        return el;
    }
};
