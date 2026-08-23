import { parse as cstParse } from "./cst/parse.ts";
import { initialEnv } from "./std/env.ts";
import $law from "./std/rules/$law.ts";
import { toVirtualLines } from "./std/virtualLine.ts";

export const parse = (lawtext: string) => {
    const lines = cstParse(lawtext);
    const vls = toVirtualLines(lines.value);
    const env = initialEnv({ target: lawtext });
    const law = $law.match(0, vls, env);
    if (law.ok) {
        return {
            value: law.value.value,
            virtualLines: vls,
            errors: [...lines.errors, ...law.value.errors],
        };
    } else {
        throw new Error(`parse failed: offset ${law.offset}; expected ${law.expected}`);
    }
};
