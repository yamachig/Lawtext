/* eslint-disable no-irregular-whitespace */
import { factory } from "../factory";

export const $_ = factory
    .withName("OPTIONAL_WHITESPACES")
    .regExp(/^[ 　\t]*/)
;

export const $__ = factory
    .withName("WHITESPACES")
    .regExp(/^[ 　\t]+/)
;

export const $_EOL = factory
    .withName("OPTIONAL_WHITESPACES_AND_EOL")
    .regExp(/^[ 　\t]*\r?\n/)
;

export const $kanjiDigits = factory
    .withName("kanjiDigits")
    .regExp(/^[〇一二三四五六七八九十百千]+/)
    ;

export const $romanDigits = factory
    .withName("romanDigits")
    .regExp(/^[iIｉＩvVｖＶxXｘＸ]+/)
    ;

export const $irohaChar = factory
    .withName("irohaChar")
    .regExp(/^[イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセスン]/)
    ;

