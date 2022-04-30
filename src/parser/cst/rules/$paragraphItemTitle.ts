import factory from "../factory";
import { kanjiDigits } from "./lexical";
import { WithErrorRule } from "../util";
import { irohaChars } from "../../../law/num";

export const $stdParagraphNum = factory
    .withName("stdParagraphNum")
    .regExp(/^○?[0123456789０１２３４５６７８９]+/) // e.g. "１", "○２０"
    ;

export const $stdItemTitle = factory
    .withName("stdItemTitle")
    .regExp(new RegExp(`^[${kanjiDigits}]+(?:[のノ[${kanjiDigits}]+])*`)) // e.g. "十二", "一の二", "一の二の三"
    ;

export const $stdSubitem1Title = factory
    .withName("stdSubitem1Title")
    .regExp(new RegExp(`^[${irohaChars}]`)) // e.g. "イ"
    ;

export const $stdSubitem2Title = factory
    .withName("stdSubitem2Title")
    .regExp(new RegExp(`^[(（](?:[${kanjiDigits}]+|[0123456789０１２３４５６７８９]+)[)）]`)) // e.g. "（十二）", "(１０)", "(1)"
    ;

export const $stdSubitem3Title = factory
    .withName("stdSubitem3Title")
    .regExp(/^[(（][a-zA-Zａ-ｚＡ-Ｚ]+[)）]/) // e.g. "（ａ）", "(b)"
    ;

const paragraphItemTitlePtn1 = "(?:[0123456789０１２３４５６７８９]+|[a-zA-Zａ-ｚＡ-Ｚ])[.．]"; // e.g. "１．", "a."
const paragraphItemTitlePtn2 = `[(（](?:[0123456789０１２３４５６７８９]+|[${irohaChars}]|[${kanjiDigits}]+|[a-zA-Zａ-ｚＡ-Ｚ]+)[)）]`; // e.g. "（十二）", "（イ）", "(１０)", "(a)"
const paragraphItemTitlePtn3 = `(?:[0123456789０１２３４５６７８９]+|[${irohaChars}]|[${kanjiDigits}]+|[a-zA-Zａ-ｚＡ-Ｚ]+|[⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿]|[⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇])`; // e.g. "１０", "イ", "十一", "①", "⑴"
const paragraphItemTitleFragmentPtn = `(?:${paragraphItemTitlePtn1}|${paragraphItemTitlePtn2}|${paragraphItemTitlePtn3})`;
const paragraphItemTitlePtn = `^○?${paragraphItemTitleFragmentPtn}(?:[のノ](?:${paragraphItemTitleFragmentPtn}))*`;
export const $paragraphItemTitle: WithErrorRule<string> = factory
    .withName("paragraphItemTitle")
    .sequence(s => s
        .and(r => r.regExp(new RegExp(paragraphItemTitlePtn)))
        .action(({ text }) => {
            return {
                value: text(),
                errors: [],
            };
        })
    )
    ;

export default $paragraphItemTitle;
