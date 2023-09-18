import { Rule, Empty } from "generic-parser/lib/core";
import { __Text } from "../../node/el/controls";
import { SentenceChildEL } from "../../node/cst/inline";
import { EL } from "../../node/el";
import { Env } from "./env";
import { ErrorMessage } from "./error";

export type ValueRule<TValue> = Rule<string, TValue, Env, Empty>
export type WithErrorValue<TValue> = { value: TValue, errors: ErrorMessage[] }
export type WithErrorRule<TValue> = Rule<string, { value: TValue, errors: ErrorMessage[] }, Env, Empty>

export const enumAllELs = (el: EL | string): EL[] => {
    const result: EL[] = [];
    if (el instanceof EL) {
        result.push(el);
        result.push(...el.children.map(enumAllELs).flat());
    }
    return result;
};

export const assertAllELsHaveRange = (elOrELs: EL | EL[]): void => {
    for (const el of (elOrELs instanceof EL ? [elOrELs] : elOrELs).map(enumAllELs).flat()) {
        if (!el.range) {
            throw new Error(`${el.tag} has no range`);
        }
    }
};

// export const cancelPointerRanges = (inline: SentenceChildEL[]): SentenceChildEL[] => {
//     const result: SentenceChildEL[] = [];
//     for (const el of inline) {
//         if (el instanceof __Ranges) {
//             result.push(new __Text(el.text(), el.range));
//         } else {
//             const newEL = el.copy(false) as SentenceChildEL;
//             newEL.children = el.children.map(c => typeof c === "string" ? [c] : cancelPointerRanges([c as SentenceChildEL])).flat();
//             result.push(newEL);
//         }
//     }
//     return result;
// };

export const mergeAdjacentTexts = <T extends SentenceChildEL>(inline: T[]): (T | __Text)[] => {
    return mergeAdjacentTextsWithString(inline);
};

export const mergeAdjacentTextsWithString = <T extends SentenceChildEL>(inline: (string | T)[]): (T | __Text)[] => {
    const result: (T | __Text)[] = [];
    for (const item of inline) {
        const lastItem = result.slice(-1)[0] as T | undefined;
        if (
            (typeof lastItem !== "string")
            && lastItem?.tag === "__Text"
            && (typeof item === "string" || item.tag === "__Text")
        ) {
            const itemText = typeof item === "string" ? item : item.text();
            const replacedTail = new __Text(
                lastItem.text() + itemText,
                (lastItem.range ? [lastItem.range[0], lastItem.range[1] + itemText.length] : null)
            );
            result.splice(-1, 1);
            result.push(replacedTail);
        } else if (typeof item === "string") {
            result.push(new __Text(
                item,
                ((lastItem && lastItem.range) ? [lastItem.range[0], lastItem.range[1] + item.length] : null)
            ));
        } else {
            result.push(item);
        }
    }
    return result;
};

export const separateTrailingSpaces = <T extends SentenceChildEL>(inline: (string | T)[]): { inline: (T | __Text)[], spaces: string} => {
    const ret = { inline: mergeAdjacentTextsWithString(inline), spaces: "" };
    if (ret.inline.slice(-1)[0]?.tag === "__Text") {
        const m = /^(.*?)(\s+)$/.exec(ret.inline.slice(-1)[0].text());
        if (m) {
            const orig = ret.inline.splice(-1, 1);
            if (m[1] !== "") {
                ret.inline.push(new __Text(m[1], orig[0].range && [orig[0].range[0], orig[0].range[0] + m[1].length]));
            }
            ret.spaces = m[2];
        }
    }
    return ret;
};
