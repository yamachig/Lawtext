import { Rule, Empty } from "generic-parser/lib/core";
import { __Text } from "../../node/control";
import { EL } from "../../node/el";
import { Env } from "./env";

export type ValueRule<TValue> = Rule<string, TValue, Env, Empty>

export const mergeAdjacentTexts = (inline: (string | EL)[]): EL[] => {
    const result: EL[] = [];
    for (const item of inline) {
        if (result.slice(-1)[0]?.tag === "__Text" && (typeof item === "string" || item.tag === "__Text")) {
            const replacedTail = new __Text(result.slice(-1)[0].text + (typeof item === "string" ? item : item.text));
            result.splice(-1, 1);
            result.push(replacedTail);
        } else if (typeof item === "string") {
            result.push(new __Text(item));
        } else {
            result.push(item);
        }
    }
    return result;
};

export const separateTrailingSpaces = (inline: EL[]): { inline: EL[], spaces: string} => {
    const ret = { inline: [...inline], spaces: "" };
    if (ret.inline.slice(-1)[0]?.tag === "__Text") {
        const m = /^(.*?)(\s+)/.exec(ret.inline.slice(-1)[0].text);
        if (m) {
            ret.inline.splice(-1, 1);
            if (m[1] !== "") {
                ret.inline.push(new __Text(m[1]));
            }
            ret.spaces = m[2];
        }
    }
    return ret;
};
