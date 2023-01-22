import { parseKanjiNum } from "./num";
import { eras } from "./std";

export const ptnLawNum = "(?:" + [
    "\
(明治|大正|昭和|平成|令和)([一二三四五六七八九十]+|元)年\
([^ 　\t\r\n<>()（）[\\]［］{}｛｝「」]+?)\
(?:第([一二三四五六七八九十百千]+)号)\
",
    "\
(明治|大正|昭和|平成|令和)([一二三四五六七八九十]+|元)年\
人事院規則\
(?:[―〇一二三四五六七八九]+)\
",
    "\
(明治|大正|昭和|平成|令和)([一二三四五六七八九十]+|元)年([一二三四五六七八九十]+)月([一二三四五六七八九十]+)日\
(?:内閣総理大臣決定)\
",
    "\
(明治|大正|昭和|平成|令和)([一二三四五六七八九十]+|元)年\
(?:憲法|勅令|内務省・鉄道省令|逓信省・鉄道省令|逓信省・農林省令|農林省・大蔵省・内務省令第〇号)\
",
].map(s => `(?:${s})`).join("|") + ")";

export const ptnLawNumLike = `(?:\
(?:${ptnLawNum})\
|\
(?:日本国憲法)\
)`;

export const toStdLawNum = (lawNum: string): string => {
    if (/日本国憲法$/.test(lawNum)) {
        return "昭和二十一年憲法";
    } else {
        return lawNum;
    }
};

const lawTypes = [
    ["憲法", "Constitution"] as const,
    ["法律", "Act"] as const,
    ["政令", "CabinetOrder"] as const,
    ["勅令", "ImperialOrder"] as const,
    ["\\S*[^政勅]令", "MinisterialOrdinance"] as const,
    ["\\S*規則", "Rule"] as const,
];

const getLawtype = (text: string): (typeof lawTypes)[number][1] | null => {
    for (const [ptn, type] of lawTypes) {
        const re = new RegExp(`^${ptn}`);
        if (re.exec(text)) return type;
    }
    return null;
};

interface LawNumStruct {
    Era: (typeof eras)[keyof typeof eras] | null,
    Year: number | null,
    LawType: (typeof lawTypes)[number][1] | null,
    Num: number | null,
}

const reLawNum = new RegExp(`^${ptnLawNumLike}$`);
export const parseLawNum = (lawNum: string): LawNumStruct => {

    const ret: LawNumStruct = {
        Era: null,
        Year: null,
        LawType: null,
        Num: null,
    };
    const m = lawNum.match(reLawNum);
    if (m) {
        const [era, year, law_type, num] = m.slice(1);
        if (era in eras) ret.Era = eras[era as keyof typeof eras];
        ret.Year = parseKanjiNum(year);
        ret.LawType = getLawtype(law_type);
        ret.Num = parseKanjiNum(num);
    }

    return ret;
};
