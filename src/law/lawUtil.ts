import { EL } from "../node/el";
import * as std from "./std";
import { assertNever, Diff } from "../util";

export const paragraphItemTags = [
    "Paragraph",
    "Item",
    "Subitem1",
    "Subitem2",
    "Subitem3",
    "Subitem4",
    "Subitem5",
    "Subitem6",
    "Subitem7",
    "Subitem8",
    "Subitem9",
    "Subitem10",
] as const;

export type ParagraphItem =
    | std.Paragraph
    | std.Item
    | std.Subitem1
    | std.Subitem2
    | std.Subitem3
    | std.Subitem4
    | std.Subitem5
    | std.Subitem6
    | std.Subitem7
    | std.Subitem8
    | std.Subitem9
    | std.Subitem10
    ;

export const isParagraphItem = (el: EL): el is ParagraphItem =>
    (paragraphItemTags as readonly string[]).includes(el.tag);

export const paragraphItemTitleTags = [
    "ParagraphNum",
    "ItemTitle",
    "Subitem1Title",
    "Subitem2Title",
    "Subitem3Title",
    "Subitem4Title",
    "Subitem5Title",
    "Subitem6Title",
    "Subitem7Title",
    "Subitem8Title",
    "Subitem9Title",
    "Subitem10Title",
] as const;

export type ParagraphItemTitle =
    | std.ParagraphNum
    | std.ItemTitle
    | std.Subitem1Title
    | std.Subitem2Title
    | std.Subitem3Title
    | std.Subitem4Title
    | std.Subitem5Title
    | std.Subitem6Title
    | std.Subitem7Title
    | std.Subitem8Title
    | std.Subitem9Title
    | std.Subitem10Title
    ;

export const isParagraphItemTitle = (el: EL): el is ParagraphItemTitle =>
    (paragraphItemTitleTags as readonly string[]).includes(el.tag);

export const paragraphItemSentenceTags = [
    "ParagraphSentence",
    "ItemSentence",
    "Subitem1Sentence",
    "Subitem2Sentence",
    "Subitem3Sentence",
    "Subitem4Sentence",
    "Subitem5Sentence",
    "Subitem6Sentence",
    "Subitem7Sentence",
    "Subitem8Sentence",
    "Subitem9Sentence",
    "Subitem10Sentence",
] as const;

export type ParagraphItemSentence =
    | std.ParagraphSentence
    | std.ItemSentence
    | std.Subitem1Sentence
    | std.Subitem2Sentence
    | std.Subitem3Sentence
    | std.Subitem4Sentence
    | std.Subitem5Sentence
    | std.Subitem6Sentence
    | std.Subitem7Sentence
    | std.Subitem8Sentence
    | std.Subitem9Sentence
    | std.Subitem10Sentence
    ;

export const isParagraphItemSentence = (el: EL): el is ParagraphItemSentence =>
    (paragraphItemSentenceTags as readonly string[]).includes(el.tag);


export const listTags = ["List", "Sublist1", "Sublist2", "Sublist3"] as const;

export const reLawnum = /(?:(?:明治|大正|昭和|平成|令和)[元〇一二三四五六七八九十]+年(?:(?:\S+?第[〇一二三四五六七八九十百千]+号|人事院規則[―〇一二三四五六七八九]+)|[一二三四五六七八九十]+月[一二三四五六七八九十]+日内閣総理大臣決定|憲法)|明治三十二年勅令|大正十二年内務省・鉄道省令|昭和五年逓信省・鉄道省令|昭和九年逓信省・農林省令|人事院規則一〇―一五)/;

export const lawTypes = [
    ["憲法", "Constitution"] as const,
    ["法律", "Act"] as const,
    ["政令", "CabinetOrder"] as const,
    ["勅令", "ImperialOrder"] as const,
    ["\\S*[^政勅]令", "MinisterialOrdinance"] as const,
    ["\\S*規則", "Rule"] as const,
];


export const getLawtype = (text: string): (typeof lawTypes)[number][1] | null => {
    for (const [ptn, type] of lawTypes) {
        const re = new RegExp(`^${ptn}`);
        if (re.exec(text)) return type;
    }
    return null;
};

export const eras = {
    "明治": "Meiji", "大正": "Taisho",
    "昭和": "Showa", "平成": "Heisei",
    "令和": "Reiwa",
} as const;


export const articleGroupTypeChars = ["編", "章", "節", "款", "目"] as const;

export const articleGroupTags = [
    "Part",
    "Chapter",
    "Section",
    "Subsection",
    "Division",
] as const;

export type ArticleGroup =
    | std.Part
    | std.Chapter
    | std.Section
    | std.Subsection
    | std.Division
    ;

export const isArticleGroup = (el: EL): el is ArticleGroup =>
    (articleGroupTags as readonly string[]).includes(el.tag);

export const articleGroupTitleTags = [
    "PartTitle",
    "ChapterTitle",
    "SectionTitle",
    "SubsectionTitle",
    "DivisionTitle",
] as const;

export type ArticleGroupTitle =
    | std.PartTitle
    | std.ChapterTitle
    | std.SectionTitle
    | std.SubsectionTitle
    | std.DivisionTitle
    ;

export const isArticleGroupTitle = (el: EL): el is ArticleGroupTitle =>
    (articleGroupTitleTags as readonly string[]).includes(el.tag);

export const articleGroupType = {
    "編": "Part", "章": "Chapter", "節": "Section",
    "款": "Subsection", "目": "Division",
    "条": "Article", "項": "Paragraph", "号": "Item", "則": "SupplProvision",
} as const;

export const articleGroupTitleTag = {
    "編": "PartTitle", "章": "ChapterTitle", "節": "SectionTitle",
    "款": "SubsectionTitle", "目": "DivisionTitle", "条": "ArticleTitle",
    "則": "SupplProvisionLabel",
} as const;

export const reKanjiNum = /((\S*)千)?((\S*)百)?((\S*)十)?(\S*)/;

export const parseKanjiNum = (text: string): number | null => {
    const m = reKanjiNum.exec(text);
    if (m) {
        const d1000 = m[1] ? kanjiDigits[m[2] as keyof typeof kanjiDigits] || 1 : 0;
        const d100 = m[3] ? kanjiDigits[m[4] as keyof typeof kanjiDigits] || 1 : 0;
        const d10 = m[5] ? kanjiDigits[m[6] as keyof typeof kanjiDigits] || 1 : 0;
        const d1 = kanjiDigits[m[7] as keyof typeof kanjiDigits] || 0;
        return d1000 * 1000 + d100 * 100 + d10 * 10 + d1;
    }
    return null;
};

export const kanjiDigits = {
    "〇": 0, "一": 1, "二": 2, "三": 3, "四": 4,
    "五": 5, "六": 6, "七": 7, "八": 8, "九": 9,
};

export const reNamedNum = /^(○?)第?([一二三四五六七八九十百千]+)\S*?([のノ一二三四五六七八九十百千]*)$/;
export const irohaChars = "イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセスン";
export const reIrohaChar = /[イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセスン]/;
export const aiuChars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
export const reAiuChar = /[アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン]/;
export const reItemNum = /^\D*(\d+)\D*$/;

export const parseRomanNum = (text: string): number => {
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

export const reWideDigits: Array<[RegExp, string]> = [
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

export const replaceWideNum = (text: string): string => {
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

interface LawNumStruct {
    Era: (typeof eras)[keyof typeof eras] | null,
    Year: number | null,
    LawType: (typeof lawTypes)[number][1] | null,
    Num: number | null,
}

export const parseLawNum = (lawNum: string): LawNumStruct => {

    const ret: LawNumStruct = {
        Era: null,
        Year: null,
        LawType: null,
        Num: null,
    };
    const m = lawNum.match(/^(明治|大正|昭和|平成|令和)([一二三四五六七八九十]+)年(\S+?)(?:第([一二三四五六七八九十百千]+)号)?$/);
    if (m) {
        const [era, year, law_type, num] = m.slice(1);
        if (era in eras) ret.Era = eras[era as keyof typeof eras];
        ret.Year = parseKanjiNum(year);
        ret.LawType = getLawtype(law_type);
        ret.Num = parseKanjiNum(num);
    }

    return ret;
};


export const setItemNum = (els: EL[]): void => {
    const items: Array<Diff<ParagraphItem, std.Paragraph>> = [];

    for (const el of els) {
        if (isParagraphItem(el) && el.tag !== "Paragraph") {
            items.push(el);
        }
    }

    if (items.length) {
        let kanaMode = KanaMode.Iroha;
        for (const child of items[0].children) {
            if (isParagraphItemTitle(child)) {
                if (/ア/.exec(child.text)) {
                    kanaMode = KanaMode.Aiu;
                    break;
                }
            }
        }
        for (const item of items) {
            let paragraphItemTitle = "";
            for (const child of item.children) {
                if (isParagraphItemTitle(child)) {
                    paragraphItemTitle = child.text;
                    break;
                }
            }
            const num = parseNamedNum(paragraphItemTitle, kanaMode);
            if (num) {
                item.attr.Num = num;
            }
        }
    }
};
