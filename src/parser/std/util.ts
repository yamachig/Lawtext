import { Rule, Empty } from "generic-parser/lib/core";
import { SentencesArray } from "../../node/cst/inline";
import { Line, LineType } from "../../node/cst/line";
import { Env } from "./env";
import factory from "./factory";
import { Dedent, Indent, isVirtualLine, PhysicalLine, VirtualLine, VirtualOnlyLineType } from "./virtualLine";

export type ValueRule<TValue> = Rule<VirtualLine[], TValue, Env, Empty>

export const $INDENT: ValueRule<Indent> = factory
    .withName("INDENT")
    .oneMatch(({ item }) => item.type === VirtualOnlyLineType.IND ? item : null);

export const $optBNK_INDENT: ValueRule<[...(PhysicalLine[]), Indent]> = factory
    .withName("optBNK_INDENT")
    .sequence(s => s
        .and(r => r.zeroOrMore(() => $blankLine), "optBNK")
        .and(r => r.oneMatch(({ item }) => item.type === VirtualOnlyLineType.IND ? item : null), "INDENT")
        .action(({ optBNK, INDENT }) => [...optBNK, INDENT] as [...(PhysicalLine[]), Indent])
    );

export const $DEDENT: ValueRule<Dedent> = factory
    .withName("DEDENT")
    .oneMatch(({ item }) => item.type === VirtualOnlyLineType.DED ? item : null);

export const $optBNK_DEDENT: ValueRule<[...(PhysicalLine[]), Dedent]> = factory
    .withName("optBNK_DEDENT")
    .sequence(s => s
        .and(r => r.zeroOrMore(() => $blankLine), "optBNK")
        .and(r => r.oneMatch(({ item }) => item.type === VirtualOnlyLineType.DED ? item : null), "DEDENT")
        .action(({ optBNK, DEDENT }) => [...optBNK, DEDENT] as [...(PhysicalLine[]), Dedent])
    );

export const $blankLine = factory
    .withName("blankLine")
    .oneMatch(({ item }) => item.type === LineType.BNK ? item : null);


export const isSingleParentheses = (line: VirtualLine | Line | SentencesArray): boolean => {
    let columns: SentencesArray = [];
    if (Array.isArray(line)){
        columns = line;
    } else if (isVirtualLine(line) && "line" in line && line.line.type === LineType.OTH) {
        columns = line.line.sentencesArray;
    } else if (!isVirtualLine(line) && line.type === LineType.OTH) {
        columns = line.sentencesArray;
    }
    return (
        columns.length === 1
            && columns[0].sentences.length === 1
            && columns[0].sentences[0].children.length === 1
            && typeof columns[0].sentences[0].children[0] !== "string"
            && columns[0].sentences[0].children[0].tag === "__Parentheses"
    );
};
