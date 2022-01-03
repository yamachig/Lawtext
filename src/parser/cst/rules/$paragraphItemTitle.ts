import factory from "../factory";
import { $kanjiDigits } from "./lexical";
import { irohaChars } from "../../../law/lawUtil";
import { ValueRule } from "../util";

export const $stdParagraphNum = factory
    .withName("stdParagraphNum")
    .asSlice(r => r
        .sequence(c => c
            .and(r => r.regExp(/^○?[0123456789０１２３４５６７８９]+/))
        )
    )
    ;

export const $stdItemTitle = factory
    .withName("stdItemTitle")
    .asSlice(r => r
        .sequence(c => c
            .and(() => $kanjiDigits)
            .and(r => r
                .zeroOrMore(r => r
                    .sequence(c => c
                        .and(r => r.oneOf("のノ"))
                        .and(() => $kanjiDigits)
                    )
                )
            )
        )
    )
    ;

export const $stdSubitem1Title = factory
    .withName("stdSubitem1Title")
    .asSlice(r => r
        .sequence(c => c
            .and(r => r.oneOf(irohaChars))
        )
    )
    ;

export const $stdSubitem2Title = factory
    .withName("stdSubitem2Title")
    .asSlice(r => r
        .sequence(c => c
            .and(r => r.oneOf("(（"))
            .and(r => r
                .choice(c => c
                    .or(() => $kanjiDigits)
                    .or(r => r.regExp(/^[0123456789０１２３４５６７８９]+/))
                )
            )
            .and(r => r.oneOf(")）"))
        )
    )
    ;

export const $stdSubitem3Title = factory
    .withName("stdSubitem3Title")
    .asSlice(r => r
        .sequence(c => c
            .and(r => r.oneOf("(（"))
            .and(r => r.regExp(/^[a-zA-Zａ-ｚＡ-Ｚ]+/))
            .and(r => r.oneOf(")）"))
        )
    )
    ;

export const $paragraphItemTitle: ValueRule<string> = factory
    .withName("paragraphItemTitle")
    .asSlice(r => r
        .sequence(s => s
            .and(r => r.zeroOrOne(r => r.seqEqual("○")))
            .and(r => r
                .choice(c => c
                    .or(r => r.regExp(/^[0123456789０１２３４５６７８９]+/))
                    .or(r => r.oneOf(irohaChars))
                    .or(r => r.regExp(/^[〇一二三四五六七八九十百千]+/))
                    .or(r => r.regExp(/^[a-zA-Zａ-ｚＡ-Ｚ]+/))
                    .orSequence(s => s
                        .and(r => r.oneOf("(（"))
                        .and(r => r
                            .choice(c => c
                                .or(r => r.regExp(/^[0123456789０１２３４５６７８９]+/))
                                .or(r => r.oneOf(irohaChars))
                                .or(r => r.regExp(/^[〇一二三四五六七八九十百千]+/))
                                .or(r => r.regExp(/^[a-zA-Zａ-ｚＡ-Ｚ]+/)),
                            ),
                        )
                        .and(r => r.oneOf(")）")),
                    )
                    .or(r => r.oneOf("⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿"))
                    .or(r => r.oneOf("⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇")),
                ),
            )
            .and(r => r
                .zeroOrMore(r => r
                    .sequence(s => s
                        .and(r => r.seqEqual("の"))
                        .and(() => $paragraphItemTitle),
                    ),
                ),
            ),
        )
    )
    ;

export default $paragraphItemTitle;
