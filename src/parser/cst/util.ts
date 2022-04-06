import { Rule, Empty } from "generic-parser/lib/core";
import { __Text } from "../../node/control";
import { SentenceChildEL } from "../../node/cst/inline";
import { Env } from "./env";
import { ErrorMessage } from "./error";

export type ValueRule<TValue> = Rule<string, TValue, Env, Empty>
export type WithErrorRule<TValue> = Rule<string, { value: TValue, errors: ErrorMessage[] }, Env, Empty>


export const mergeAdjacentTexts = <T extends SentenceChildEL>(inline: (string | T)[]): (T | __Text)[] => {
    const result: (T | __Text)[] = [];
    for (const item of inline) {
        const lastItem = result.slice(-1)[0] as T | undefined;
        if (
            (typeof lastItem !== "string")
            && lastItem?.tag === "__Text"
            && (typeof item === "string" || item.tag === "__Text")
        ) {
            const itemText = typeof item === "string" ? item : item.text;
            const replacedTail = new __Text(
                lastItem.text + itemText,
                (lastItem.range ? [lastItem.range[0], lastItem.range[1] + itemText.length] : null)
            );
            result.splice(-1, 1);
            result.push(replacedTail);
        } else if (typeof item === "string") {
            result.push(new __Text(
                item,
                (lastItem && lastItem.range ? [lastItem.range[0], lastItem.range[1] + item.length] : null)
            ));
        } else {
            result.push(item);
        }
    }
    return result;
};

export const separateTrailingSpaces = <T extends SentenceChildEL>(inline: (string | T)[]): { inline: (T | __Text)[], spaces: string} => {
    const ret = { inline: mergeAdjacentTexts(inline), spaces: "" };
    if (ret.inline.slice(-1)[0]?.tag === "__Text") {
        const m = /^(.*?)(\s+)$/.exec(ret.inline.slice(-1)[0].text);
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

export const separateLeadingSpaces = <T extends SentenceChildEL>(inline: (string | T)[]): { inline: (T | __Text)[], spaces: string} => {
    const ret = { inline: mergeAdjacentTexts(inline), spaces: "" };
    if (ret.inline[0]?.tag === "__Text") {
        const m = /^(\s+)(.*?)$/.exec(ret.inline[0].text);
        if (m) {
            ret.inline.splice(0, 1);
            if (m[1] !== "") {
                ret.inline.unshift(new __Text(m[1]));
            }
            ret.spaces = m[2];
        }
    }
    return ret;
};
