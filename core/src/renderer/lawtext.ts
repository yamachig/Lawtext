import * as std from "../law/std/index.ts";
import { isControl, isStdEL } from "../law/std/index.ts";
import type { EL } from "../node/el/index.ts";
import { anyToLines } from "../parser/std/rules/$any.ts";
import { lawToLines } from "../parser/std/rules/$law.ts";
import { NotImplementedError } from "../util/index.ts";

export const renderLawtext = (el: EL, indentTexts: string[] = []): string => {
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
    ret = ret.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n").replace(/(\r?\n\r?\n)(?:\r?\n)+/g, "$1").replace(/(?:\r?\n)?$/, "\r\n").replace(/(?:\r?\n)+$/, "\r\n");
    return ret;
};

export default renderLawtext;

