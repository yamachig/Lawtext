import { assertNever } from "../util";
import { Era } from "./std";


// c.f. https://laws.e-gov.go.jp/file/LawIdNamingConvention.pdf

export enum LawIDType {
    Constitution = "Constitution",
    Act = "Act",
    CabinetOrder = "CabinetOrder",
    ImperialOrder = "ImperialOrder",
    DajokanFukoku = "DajokanFukoku",
    DajokanTasshi = "DajokanTasshi",
    DajokanFutatsu = "DajokanFutatsu",
    MinisterialOrdinance = "MinisterialOrdinance",
    Jinji = "Jinji",
    Rule = "Rule",
    PrimeMinisterDecision = "PrimeMinisterDecision",
}

export const lawIDTypes = Object.values(LawIDType);

export const ptnLawID: {[K in LawIDType]: string} = {

    // e.g. `321CONSTITUTION` (昭和二十一年憲法)
    [LawIDType.Constitution]: "\
(?<era>\\d)\
(?<year>\\d{2})\
CONSTITUTION\
",

    // e.g. `335AC0000000105` (昭和三十五年法律第百五号)
    [LawIDType.Act]: "\
(?<era>\\d)\
(?<year>\\d{2})\
AC\
(?<category>\\d{7})\
(?<num>\\d{3})\
",

    // e.g. `415CO0000000263` (平成十五年政令第二百六十三号)
    [LawIDType.CabinetOrder]: "\
(?<era>\\d)\
(?<year>\\d{2})\
CO\
(?<category>\\d{7})\
(?<num>\\d{3})\
",

    // e.g. `318IO0000000618` (昭和十八年勅令第六百十八号)
    [LawIDType.ImperialOrder]: "\
(?<era>\\d)\
(?<year>\\d{2})\
IO\
(?<category>\\d{7})\
(?<num>\\d{3})\
",

    // e.g. `105DF0000000337` (明治五年太政官布告第三百三十七号)
    [LawIDType.DajokanFukoku]: "\
(?<era>\\d)\
(?<year>\\d{2})\
DF\
(?<category>\\d{7})\
(?<num>\\d{3})\
",

    // e.g. `110DT0000000097` (明治十年太政官達第九十七号)
    [LawIDType.DajokanTasshi]: "\
(?<era>\\d)\
(?<year>\\d{2})\
DT\
(?<category>\\d{7})\
(?<num>\\d{3})\
",

    // e.g. `106DH0000000016` (明治六年太政官布達第十六号)
    [LawIDType.DajokanFutatsu]: "\
(?<era>\\d)\
(?<year>\\d{2})\
DH\
(?<category>\\d{7})\
(?<num>\\d{3})\
",

    // e.g. `427M60001080001` (平成二十七年文部科学省・環境省令第一号)
    [LawIDType.MinisterialOrdinance]: "\
(?<era>\\d)\
(?<year>\\d{2})\
M\
(?<category>[0-9a-fA-F]{8})\
(?<num>\\d{3})\
",

    // e.g. `333RJNJ09024000` (昭和三十三年人事院規則九―二四), `427RJNJ09017142` (平成二十七年人事院規則九―一七―一四二)
    [LawIDType.Jinji]: "\
(?<era>\\d)\
(?<year>\\d{2})\
R\
JNJ\
(?<num1>\\d{2})\
(?<num2>\\d{3})\
(?<num3>\\d{3})\
",

    // e.g. `322R00000001001` (昭和二十二年会計検査院規則第一号)
    [LawIDType.Rule]: "\
(?<era>\\d)\
(?<year>\\d{2})\
R\
(?<category>[0-9a-fA-F]{8})\
(?<num>\\d{3})\
",

    // e.g. `427RPMD10100000` ( 平成二十七年十月十日内閣総理大臣決定)
    [LawIDType.PrimeMinisterDecision]: "\
(?<era>\\d)\
(?<year>\\d{2})\
R\
PMD\
(?<date>[0-9a-fA-F]{4})\
(?<num>\\d{4})\
",
};

const reLawID = Object.fromEntries(Object.entries(ptnLawID).map(([key, value]) => [key, new RegExp(`^${value}$`)] as const)) as {[K in LawIDType]: RegExp};

const eraNumToEra = {
    "1": Era.Meiji,
    "2": Era.Taisho,
    "3": Era.Showa,
    "4": Era.Heisei,
    "5": Era.Reiwa,
} as const;

export interface LawIDStructConstitution {
    text: string,
    type: LawIDType.Constitution,
    era: Era,
    year: string,
}

export enum LawIDActCategory {
    Cabinet = "0000000",
    HouseOfRepresentative = "1000000",
    HouseOfCouncillors = "0100000",
}

export interface LawIDStructAct {
    text: string,
    type: LawIDType.Act,
    era: Era,
    year: string,
    category: LawIDActCategory,
    rawNum: string,
    num: string,
}

export enum LawIDCabinetOrderEffect {
    CabinetOrder = "0000000",
    Act = "1000000",
}

export interface LawIDStructCabinetOrder {
    text: string,
    type: LawIDType.CabinetOrder,
    era: Era,
    year: string,
    category: LawIDCabinetOrderEffect,
    rawNum: string,
    num: string,
}

export interface LawIDStructImperialOrder {
    text: string,
    type: LawIDType.ImperialOrder,
    era: Era,
    year: string,
    category: LawIDCabinetOrderEffect,
    rawNum: string,
    num: string,
}

export interface LawIDStructDajokanFukoku {
    text: string,
    type: LawIDType.DajokanFukoku,
    era: Era,
    year: string,
    category: LawIDCabinetOrderEffect,
    rawNum: string,
    num: string,
}

export interface LawIDStructDajokanTasshi {
    text: string,
    type: LawIDType.DajokanTasshi,
    era: Era,
    year: string,
    category: LawIDCabinetOrderEffect,
    rawNum: string,
    num: string,
}

export interface LawIDStructDajokanFutatsu {
    text: string,
    type: LawIDType.DajokanFutatsu,
    era: Era,
    year: string,
    category: LawIDCabinetOrderEffect,
    rawNum: string,
    num: string,
}

export interface LawIDStructMinisterialOrdinance {
    text: string,
    type: LawIDType.MinisterialOrdinance,
    era: Era,
    year: string,
    category: string,
    rawNum: string,
    num: string,
}

export interface LawIDStructJinji {
    text: string,
    type: LawIDType.Jinji,
    era: Era,
    year: string,
    rawNumPart1: string,
    rawNumPart2: string,
    rawNumPart3: string,
    num: string,
}

export interface LawIDStructRule {
    text: string,
    type: LawIDType.Rule,
    era: Era,
    year: string,
    category: string,
    rawNum: string,
    num: string,
}

export interface LawIDStructPrimeMinisterDecision {
    text: string,
    type: LawIDType.PrimeMinisterDecision,
    era: Era,
    year: string,
    date: string,
    rawNum: string,
    num: string,
}

export type LawIDStruct =
    | LawIDStructConstitution
    | LawIDStructAct
    | LawIDStructCabinetOrder
    | LawIDStructImperialOrder
    | LawIDStructDajokanFukoku
    | LawIDStructDajokanTasshi
    | LawIDStructDajokanFutatsu
    | LawIDStructMinisterialOrdinance
    | LawIDStructJinji
    | LawIDStructRule
    | LawIDStructPrimeMinisterDecision
    ;

export const parseLawID = (text: string): LawIDStruct | null => {
    for (const type of lawIDTypes) {
        const re = reLawID[type];
        const m = re.exec(text);
        if (!m || !m.groups) continue;

        if (type === LawIDType.MinisterialOrdinance) {
            return {
                text,
                type,
                era: (eraNumToEra as {[K: string]: Era})[m.groups.era],
                year: m.groups.year,
                category: m.groups.category,
                rawNum: m.groups.num,
                num: m.groups.num.replace(/^(?:0(?!$))+/, ""),
            };
        }
        else if (type === LawIDType.Act) {
            return {
                text,
                type,
                era: (eraNumToEra as {[K: string]: Era})[m.groups.era],
                year: m.groups.year,
                category: m.groups.category as LawIDActCategory,
                rawNum: m.groups.num,
                num: m.groups.num.replace(/^(?:0(?!$))+/, ""),
            };
        }
        else if (type === LawIDType.CabinetOrder || type === LawIDType.ImperialOrder || type === LawIDType.DajokanFukoku || type === LawIDType.DajokanTasshi || type === LawIDType.DajokanFutatsu) {
            return {
                text,
                type,
                era: (eraNumToEra as {[K: string]: Era})[m.groups.era],
                year: m.groups.year,
                category: m.groups.category as LawIDCabinetOrderEffect,
                rawNum: m.groups.num,
                num: m.groups.num.replace(/^(?:0(?!$))+/, ""),
            };
        }
        else if (type === LawIDType.Jinji) {
            const numParts: string[] = [
                m.groups.num1.replace(/^(?:0(?!$))+/, ""),
                m.groups.num2.replace(/^(?:0(?!$))+/, ""),
            ];
            if (m.groups.num3 !== "000") {
                numParts.push(m.groups.num3.replace(/^(?:0(?!$))+/, ""));
            }
            return {
                text,
                type,
                era: (eraNumToEra as {[K: string]: Era})[m.groups.era],
                year: m.groups.year,
                rawNumPart1: m.groups.num1,
                rawNumPart2: m.groups.num2,
                rawNumPart3: m.groups.num3,
                num: numParts.join("_"),
            };
        }
        else if (type === LawIDType.Rule) {
            return {
                text,
                type,
                era: (eraNumToEra as {[K: string]: Era})[m.groups.era],
                year: m.groups.year,
                category: m.groups.category,
                rawNum: m.groups.num,
                num: m.groups.num.replace(/^(?:0(?!$))+/, ""),
            };
        }
        else if (type === LawIDType.PrimeMinisterDecision) {
            return {
                text,
                type,
                era: (eraNumToEra as {[K: string]: Era})[m.groups.era],
                year: m.groups.year,
                date: m.groups.date,
                rawNum: m.groups.num,
                num: m.groups.num.replace(/^0+/, ""),
            };
        }
        else if (type === LawIDType.Constitution) {
            return {
                text,
                type,
                era: (eraNumToEra as {[K: string]: Era})[m.groups.era],
                year: m.groups.year,
            };
        }
        else { throw assertNever(type); }
    }

    return null;
};

export interface LawRevIDStruct {
    law: LawIDStruct,
    date: string,
    amendLaw: LawIDStruct | null,
}

export const parseLawIDOrLawRevID = (text: string): LawRevIDStruct | LawIDStruct | null => {

    const parts = text.split("_");
    if (parts.length === 1) {
        return parseLawID(parts[0]);
    } else if (parts.length === 3) {
        const law = parseLawID(parts[0]);
        if (!law) return null;
        const date = parts[1];
        if (!/^\d{8}$/.test(date)) return null;
        const amendLaw = parseLawID(parts[2]);
        if (!amendLaw && (parts[2] !== "000000000000000")) return null;
        return { law, date, amendLaw };
    } else {
        return null;
    }
};
