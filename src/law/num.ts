import { assertNever } from "../util";

const reKanjiNum = /((\S*)千)?((\S*)百)?((\S*)十)?(\S*)/;

export const parseKanjiNum = (text: string): number | null => {
    const m = reKanjiNum.exec(text);
    if (m) {
        const d1000 = m[1] ? kanjiDigitToNumDict[m[2] as keyof typeof kanjiDigitToNumDict] || 1 : 0;
        const d100 = m[3] ? kanjiDigitToNumDict[m[4] as keyof typeof kanjiDigitToNumDict] || 1 : 0;
        const d10 = m[5] ? kanjiDigitToNumDict[m[6] as keyof typeof kanjiDigitToNumDict] || 1 : 0;
        const d1 = kanjiDigitToNumDict[m[7] as keyof typeof kanjiDigitToNumDict] || 0;
        return d1000 * 1000 + d100 * 100 + d10 * 10 + d1;
    }
    return null;
};

const kanjiDigitToNumDict = {
    "〇": 0, "一": 1, "二": 2, "三": 3, "四": 4,
    "五": 5, "六": 6, "七": 7, "八": 8, "九": 9,
} as const;

export const circledDigitChars = "⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿";
export const irohaChars = "イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセスン";
export const aiuChars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

const reNamedNum = /^(○?)第?([一二三四五六七八九十百千]+)\S*?([のノ一二三四五六七八九十百千]*)$/;
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
    // eslint-disable-next-line no-unused-vars
    Iroha = "Iroha",
    // eslint-disable-next-line no-unused-vars
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
        .replace("及", "、")
        .split("、");

    for (const subtext of subtexts) {

        let m = reNamedNum.exec(subtext);
        if (m) {
            const nums = [parseKanjiNum(m[2])];
            if (m[3]) {
                const bs = m[3].split(/[のノ]/g);
                for (const b of bs) {
                    if (!b) continue;
                    nums.push(parseKanjiNum(b));
                }
            }
            numsGroup.push(nums.join("_"));
            continue;
        }

        if (kanaMode === KanaMode.Iroha) {
            m = reIrohaChar.exec(subtext);
            if (m) {
                numsGroup.push(String(irohaChars.indexOf(m[0]) + 1));
                continue;
            }

        } else if (kanaMode === KanaMode.Aiu) {
            m = reAiuChar.exec(subtext);
            if (m) {
                numsGroup.push(String(aiuChars.indexOf(m[0]) + 1));
                continue;
            }

        } else { throw assertNever(kanaMode); }

        m = reCircledDigit.exec(subtext);
        if (m) {
            numsGroup.push(String(circledDigitChars.indexOf(m[0])));
            continue;
        }

        const replacedSubtext = replaceWideNum(subtext);
        m = reItemNum.exec(replacedSubtext);
        if (m) {
            numsGroup.push(m[1]);
            continue;
        }

        const romanNum = parseRomanNum(replacedSubtext);
        if (romanNum !== 0) {
            numsGroup.push(String(romanNum));
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


