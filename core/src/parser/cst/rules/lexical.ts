import { irohaChars } from "../../../law/num";
import { factory } from "../factory";

export const ptn$_ = "[ 　\t]*";
export const $_ = factory
    .withName("OPTIONAL_WHITESPACES")
    .regExp(new RegExp(`^${ptn$_}`))
;

export const ptn$__ = "[ 　\t]+";
export const $__ = factory
    .withName("WHITESPACES")
    .regExp(new RegExp(`^${ptn$__}`))
;

export const ptn$_EOL = "[ 　\t]*\r?\n";
export const $_EOL = factory
    .withName("OPTIONAL_WHITESPACES_AND_EOL")
    .regExp(new RegExp(`^${ptn$_EOL}`))
;

export const kanjiDigits = "〇一二三四五六七八九十百千";
export const $kanjiDigits = factory
    .withName("kanjiDigits")
    .regExp(new RegExp(`^[${kanjiDigits}]+`))
    ;

export const arabicDigits = "0123456789０１２３４５６７８９";
export const $arabicDigits = factory
    .withName("arabicDigits")
    .regExp(new RegExp(`^[${arabicDigits}]+`))
    ;

export const romanDigits = "iIｉＩvVｖＶxXｘＸ";
export const $romanDigits = factory
    .withName("romanDigits")
    .regExp(new RegExp(`^[${romanDigits}]+`))
    ;

export const $irohaChar = factory
    .withName("irohaChar")
    .regExp(new RegExp(`^[${irohaChars}]`))
    ;

