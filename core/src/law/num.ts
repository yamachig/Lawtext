/* eslint-disable @stylistic/quote-props */
import { assertNever } from "../util";

const reKanjiNum = /((\S*)千)?((\S*)百)?((\S*)十)?(\S*)/;

export const parseKanjiNum = (text: string): number | null => {
    if (text === "元") return 1;
    const m = reKanjiNum.exec(text);
    if (m) {
        if (!m[1] && !m[2] && !m[3] && m[7] && m[7].length > 1) {
            const ds = m[7].split("").map(c => (kanjiDigitToNumDict[c as keyof typeof kanjiDigitToNumDict] || 0).toString()).join("");
            const ret = Number(ds);
            if (Number.isNaN(ret)) return null;
            return ret;
        } else {
            const d1000 = m[1] ? kanjiDigitToNumDict[m[2] as keyof typeof kanjiDigitToNumDict] || 1 : 0;
            const d100 = m[3] ? kanjiDigitToNumDict[m[4] as keyof typeof kanjiDigitToNumDict] || 1 : 0;
            const d10 = m[5] ? kanjiDigitToNumDict[m[6] as keyof typeof kanjiDigitToNumDict] || 1 : 0;
            const d1 = kanjiDigitToNumDict[m[7] as keyof typeof kanjiDigitToNumDict] || 0;
            return d1000 * 1000 + d100 * 100 + d10 * 10 + d1;
        }
    }
    return null;
};

const kanjiDigitToNumDict = {
    "〇": 0, "一": 1, "二": 2, "三": 3, "四": 4,
    "五": 5, "六": 6, "七": 7, "八": 8, "九": 9,
} as const;
const numToKanjiDigitDict = {
    0: "〇", 1: "一", 2: "二", 3: "三", 4: "四",
    5: "五", 6: "六", 7: "七", 8: "八", 9: "九",
} as Record<number, string>;
const digitToKanjiDigitDict = {
    "0": "〇", "1": "一", "2": "二", "3": "三", "4": "四",
    "5": "五", "6": "六", "7": "七", "8": "八", "9": "九",
} as Record<string, string>;

export const digitsToKanjiNum = (digits: number | string, type: "positional" | "non-positional"): string => {
    if (type === "positional") {
        const numStr = replaceWideNum(typeof digits === "string" ? digits : digits.toString());
        return Array.from(numStr).map(n => digitToKanjiDigitDict[n]).join("");
    } else {
        const num = typeof digits === "string" ? Number(replaceWideNum(digits)) : digits;
        const d1 = num % 10;
        const d10 = Math.floor((num % 100) / 10);
        const d100 = Math.floor((num % 1000) / 100);
        const d1000 = Math.floor(num / 1000);
        const parts: string[] = [];
        if (d1000) parts.push(`${d1000 === 1 ? "" : numToKanjiDigitDict[d1000]}千`);
        if (d100) parts.push(`${d100 === 1 ? "" : numToKanjiDigitDict[d100]}百`);
        if (d10) parts.push(`${d10 === 1 ? "" : numToKanjiDigitDict[d10]}十`);
        if (d1) parts.push(numToKanjiDigitDict[d1]);
        return parts.join("");
    }
};

export const circledDigitChars = "⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿";
export const irohaChars = "イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセスン";
export const aiuChars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

const reKanjiNamedNum = /^(○?)第?([〇一二三四五六七八九十百千]+)\S*?([のノ―〇一二三四五六七八九十百千]*)$/;
const reArabicNamedNum = /^(○?)第?([0123456789０１２３４５６７８９]+)\S*?([のノ―0123456789０１２３４５６７８９]*)$/;
const reIrohaChar = new RegExp(`[${irohaChars}]`);
const reAiuChar = new RegExp(`[${aiuChars}]`);
const reCircledDigit = new RegExp(`[${circledDigitChars}]`);
const reItemNum = /^\D*(\d+)\D*$/;

const parseRomanNum = (text: string): number => {
    let num = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1] || "";
        if (/[iIｉＩ]/.exec(char)) {
            if (/[vVｖＶxXｘＸ]/.exec(nextChar)) num -= 1;
            else num += 1;
        }
        if (/[vVｖＶ]/.exec(char)) {
            num += 5;
        }
        if (/[xXｘＸ]/.exec(char)) {
            num += 10;
        }
    }
    return num;
};

const reWideDigits: Array<[RegExp, string]> = [
    [/０/g, "0"],
    [/１/g, "1"],
    [/２/g, "2"],
    [/３/g, "3"],
    [/４/g, "4"],
    [/５/g, "5"],
    [/６/g, "6"],
    [/７/g, "7"],
    [/８/g, "8"],
    [/９/g, "9"],
];

const replaceWideNum = (text: string): string => {
    let ret = text;

    for (const [reWide, narrow] of reWideDigits) {
        ret = ret.replace(reWide, narrow);
    }
    return ret;
};

export enum KanaMode {
    Iroha = "Iroha",
    Aiu = "Aiu",
}

export const parseNamedNum = (text: string, kanaMode: KanaMode = KanaMode.Iroha): string => {
    const numsGroup: string[] = [];

    const subtexts = text
        .split(/\s+/)[0]
        .replace("及び", "、")
        .replace("から", "、")
        .replace("まで", "")
        .replace("～", "、")
        .replace("・", "、")
        .replace("乃至", "、")
        .replace("及ビ", "、")
        .replace("及", "、")
        .split("、");

    for (const subtext of subtexts) {

        {
            const m = reKanjiNamedNum.exec(subtext);
            if (m) {
                const nums = [parseKanjiNum(m[2])];
                if (m[3]) {
                    const bs = m[3].split(/[のノ―]/g);
                    for (const b of bs) {
                        if (!b) continue;
                        nums.push(parseKanjiNum(b));
                    }
                }
                numsGroup.push(nums.join("_"));
                continue;
            }
        }

        {
            const m = reArabicNamedNum.exec(subtext);
            if (m) {
                const nums = [replaceWideNum(m[2])];
                if (m[3]) {
                    const bs = m[3].split(/[のノ―]/g);
                    for (const b of bs) {
                        if (!b) continue;
                        nums.push(replaceWideNum(b));
                    }
                }
                numsGroup.push(nums.join("_"));
                continue;
            }
        }

        if (kanaMode === KanaMode.Iroha) {
            const m = reIrohaChar.exec(subtext);
            if (m) {
                numsGroup.push(String(irohaChars.indexOf(m[0]) + 1));
                continue;
            }

        } else if (kanaMode === KanaMode.Aiu) {
            const m = reAiuChar.exec(subtext);
            if (m) {
                numsGroup.push(String(aiuChars.indexOf(m[0]) + 1));
                continue;
            }

        } else { throw assertNever(kanaMode); }

        {
            const m = reCircledDigit.exec(subtext);
            if (m) {
                numsGroup.push(String(circledDigitChars.indexOf(m[0])));
                continue;
            }
        }

        {
            const replacedSubtext = replaceWideNum(subtext);
            const m = reItemNum.exec(replacedSubtext);
            if (m) {
                numsGroup.push(m[1]);
                continue;
            }
            const romanNum = parseRomanNum(replacedSubtext);
            if (romanNum !== 0) {
                numsGroup.push(String(romanNum));
            }
        }

    }

    return numsGroup.join(":");
};


// export const setItemNum = (els: EL[]): void => {
//     const items: Array<Diff<std.ParagraphItem, std.Paragraph>> = [];

//     for (const el of els) {
//         if (std.isParagraphItem(el) && el.tag !== "Paragraph") {
//             items.push(el);
//         }
//     }

//     if (items.length) {
//         let kanaMode = KanaMode.Iroha;
//         for (const child of items[0].children) {
//             if (std.isParagraphItemTitle(child)) {
//                 if (/ア/.exec(child.text())) {
//                     kanaMode = KanaMode.Aiu;
//                     break;
//                 }
//             }
//         }
//         for (const item of items) {
//             let paragraphItemTitle = "";
//             for (const child of item.children) {
//                 if (std.isParagraphItemTitle(child)) {
//                     paragraphItemTitle = child.text();
//                     break;
//                 }
//             }
//             const num = parseNamedNum(paragraphItemTitle, kanaMode);
//             if (num) {
//                 item.attr.Num = num;
//             }
//         }
//     }
// };


