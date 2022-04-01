import * as std from "../law/std";
import { isControl, isStdEL } from "../law/std";
import { EL } from "../node/el";
import { anyToLines } from "../parser/std/rules/$any";
import { lawToLines } from "../parser/std/rules/$law";
import { NotImplementedError } from "../util";

export const render = (el: EL, indentTexts: string[] = []): string => {
    let ret = "";
    if (std.isLaw(el)) {
        const lines = lawToLines(el, indentTexts);
        ret += lines.map(l => l.text()).join("");
    } else if (isStdEL(el) || isControl(el)) {
        const lines = anyToLines(el, indentTexts);
        ret += lines.map(l => l.text()).join("");
    } else {
        throw new NotImplementedError(`render ${el.tag}`);
    }
    ret = ret.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n").replace(/(\r?\n\r?\n)(?:\r?\n)+/g, "$1");
    return ret;
};
const renderLawtext = render;
export default renderLawtext;

