import { digitsToKanjiNum, parseKanjiNum, parseNamedNum } from "./num";
import { eras } from "./std";

export const ptnLawNum = "(?:\
(?<era>明治|大正|昭和|平成|令和)(?<year>[一二三四五六七八九十]+|元)年\
(?:\
(?:\
(?<type1>[^ 　\t\r\n<>()（）[\\]［］{}｛｝「」]+?)\
(?:第(?<num1>[〇一二三四五六七八九十百千]+)号)\
)\
|\
(?:\
(?<type2>人事院規則)\
(?<num2>[―〇一二三四五六七八九]+)\
)\
|\
(?:\
([一二三四五六七八九十]+)月([一二三四五六七八九十]+)日\
(?<type3>内閣総理大臣決定)\
)\
|\
(?:\
(?<type4>憲法|勅令|内務省・鉄道省令|逓信省・鉄道省令|逓信省・農林省令|農林省・大蔵省・内務省令第(?<num3>〇)号)\
)\
)\
)";

export const ptnLawNumArabic = "(?:\
(?<a_era>明治|大正|昭和|平成|令和)(?<a_year>[0123456789０１２３４５６７８９]+)年\
(?:\
(?:\
(?<a_type1>[^ 　\t\r\n<>()（）[\\]［］{}｛｝「」]+?)\
(?:第(?<a_num1>[0123456789０１２３４５６７８９]+)号)\
)\
|\
(?:\
(?<a_type2>人事院規則)\
(?<a_num2>[―0123456789０１２３４５６７８９]+)\
)\
|\
(?:\
([0123456789０１２３４５６７８９]+)月([0123456789０１２３４５６７８９]+)日\
(?<a_type3>内閣総理大臣決定)\
)\
|\
(?:\
(?<a_type4>憲法|勅令|内務省・鉄道省令|逓信省・鉄道省令|逓信省・農林省令|農林省・大蔵省・内務省令第(?<a_num3>[0０])号)\
)\
)\
)";

export const ptnLawNumLike = `(?:\
(?:${ptnLawNum})\
|\
(?:日本国憲法)\
|\
(?:${ptnLawNumArabic})\
)`;

const reLawNumArabic = new RegExp(`^${ptnLawNumArabic}$`);
export const lawNumLikeToLawNum = (lawNum: string): string => {
    if (/日本国憲法$/.test(lawNum)) {
        return "昭和二十一年憲法";
    } else if (reLawNumArabic.test(lawNum)) {
        return lawNum.replace(/[0123456789０１２３４５６７８９]+/g, digits => digitsToKanjiNum(digits, "non-positional"));
    } else {
        return lawNum;
    }
};

const lawTypes = [
    [/^(?:憲法)$/, "Constitution"] as const,
    [/^(?:法律)$/, "Act"] as const,
    [/^(?:政令|太政官布告|太政官達|太政官布達)$/, "CabinetOrder"] as const,
    [/^(?:勅令)$/, "ImperialOrder"] as const,
    [/^(?:海上保安庁令)$/, "Rule"] as const,
    [/^(?:\S+令)$/, "MinisterialOrdinance"] as const,
    [/^\S*(?:中央労働委員会規則|公正取引委員会規則|電波監理委員会規則|公安審査委員会規則|国家公安委員会規則|国家公安委員会規程|公害等調整委員会規則|運輸安全委員会規則|原子力規制委員会規則|特定個人情報保護委員会規則|個人情報保護委員会規則|カジノ管理委員会規則)$/, "MinisterialOrdinance"] as const,
    [/^(?:\S+規則)$/, "Rule"] as const,
    [/^(?:内閣総理大臣決定)$/, "Rule"] as const,
];

const getLawtype = (text: string): (typeof lawTypes)[number][1] | null => {
    for (const [re, type] of lawTypes) {
        if (re.exec(text)) return type;
    }
    return null;
};

interface LawNumStruct {
    Era: (typeof eras)[keyof typeof eras] | null,
    Year: number | null,
    LawType: (typeof lawTypes)[number][1] | null,
    Num: string | null,
}

const reLawNum = new RegExp(`^${ptnLawNum}$`);
export const parseLawNum = (lawNum: string): LawNumStruct => {

    const ret: LawNumStruct = {
        Era: null,
        Year: null,
        LawType: null,
        Num: null,
    };
    const m = lawNum.match(reLawNum);
    if (m) {
        const { era, year, type1, type2, type3, type4, num1, num2, num3 } = m.groups ?? {};
        const type = [
            type1 ?? "",
            type2 ?? "",
            type3 ?? "",
            type4 ?? "",
        ].join("");
        const num = [
            num1 ?? "",
            num2 ?? "",
            num3 ?? "",
        ].join("");
        if (era in eras) ret.Era = eras[era as keyof typeof eras];
        ret.Year = parseKanjiNum(year);
        ret.LawType = getLawtype(type);
        ret.Num = parseNamedNum(num) || null;
    }

    return ret;
};
