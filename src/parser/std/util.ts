import { Rule, Empty } from "generic-parser/lib/core";
import { __Parentheses } from "../../node/control";
import { SentencesArray } from "../../node/cst/inline";
import { Line, LineType } from "../../node/cst/line";
import { ErrorMessage } from "../cst/error";
import { Env } from "./env";
import factory from "./factory";
import { Dedent, Indent, isVirtualLine, PhysicalLine, VirtualLine, VirtualOnlyLineType } from "./virtualLine";

export type ValueRule<TValue> = Rule<VirtualLine[], TValue, Env, Empty>
export type WithErrorValue<TValue> = { value: TValue, errors: ErrorMessage[] }
export type WithErrorRule<TValue> = Rule<VirtualLine[], WithErrorValue<TValue>, Env, Empty>

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

export const $indentBlock: ValueRule<VirtualLine[]> = factory
    .withName("indentBlock")
    .asSlice(r => r
        .sequence(s => s
            .and(() => $INDENT)
            .and(r => r
                .zeroOrMore(r => r
                    .choice(c => c
                        .or(() => $blankLine)
                        .orSequence(s => s
                            .and(r => r.nextIsNot(() => $INDENT))
                            .and(r => r.nextIsNot(() => $DEDENT))
                            .and(r => r.anyOne())
                        )
                        .or(() => $indentBlock)
                    )
                )
            )
            .and(() => $DEDENT)
        )
    );


export const makeIndentBlockWithCaptureRule = <TValue>(
    ruleName: string,
    ruleRepeatedOneOrMore: Rule<VirtualLine[], TValue, Env, Empty>,
) => factory
        .withName(ruleName)
        .sequence(s => s
            .andOmit(() => $optBNK_INDENT)
            .andOmit(r => r.zeroOrMore(() => $blankLine))
            .and(r => r
                .oneOrMore(r => r
                    .sequence(s => s
                        .and(r => r
                            .choice(r => r
                                .orSequence(r => r
                                    .and(() => ruleRepeatedOneOrMore, "success")
                                    .action(({ success }) => ({ success, errorLines: [] as VirtualLine[] }))
                                )
                                .orSequence(s => s
                                    .and(r => r
                                        .asSlice(r => r
                                            .choice(c => c
                                                .or(() => $indentBlock)
                                                .orSequence(s => s
                                                    .andOmit(r => r.nextIsNot(() => $optBNK_DEDENT))
                                                    .and(r => r.anyOne())
                                                )
                                            )
                                        )
                                    , "captured")
                                    .action(({ captured }) => ({ success: null, errorLines: captured }))
                                )
                            )
                        )
                        .andOmit(r => r.zeroOrMore(() => $blankLine))
                    )
                )
            , "childrenAndErrors")
            .andOmit(() => $optBNK_DEDENT)
            .action(({ childrenAndErrors, newErrorMessage }) => {
                // const err = childrenAndErrors.filter(c => !c.success);
                // if (err.length > 5) {
                //     console.log(JSON.stringify(err.slice(0, 5), null, 2));
                // }

                for ( let i = 0; i < childrenAndErrors.length; i += 1 ) {
                    while (!childrenAndErrors[i].success && i + 1 < childrenAndErrors.length && !childrenAndErrors[i + 1].success) {
                        childrenAndErrors[i].errorLines.push(...childrenAndErrors.splice(i + 1, 1)[0].errorLines);
                    }
                }

                const children: TValue[] = [];
                const errors: ErrorMessage[] = [];
                for (const { success, errorLines } of childrenAndErrors) {
                    if (success){
                        children.push(success);
                    }
                    if (errorLines.length > 0) {
                        errors.push(newErrorMessage(
                            `${ruleName}: この部分をパースできませんでした。`,
                            [
                                errorLines[0].virtualRange[0],
                                errorLines.slice(-1)[0].virtualRange[1],
                            ],
                        ));
                    }
                }
                return {
                    value: children,
                    errors,
                } as WithErrorValue<TValue[]>;
            })
        );


export const makeDoubleIndentBlockWithCaptureRule = <TValue>(
    ruleName: string,
    ruleRepeatedOneOrMore: Rule<VirtualLine[], TValue, Env, Empty>,
) => factory
        .withName(ruleName)
        .sequence(s => s
            .andOmit(() => $optBNK_INDENT)
            .andOmit(() => $optBNK_INDENT)
            .andOmit(r => r.zeroOrMore(() => $blankLine))
            .and(r => r
                .oneOrMore(r => r
                    .sequence(s => s
                        .and(r => r
                            .choice(r => r
                                .orSequence(r => r
                                    .and(() => ruleRepeatedOneOrMore, "success")
                                    .action(({ success }) => ({ success, errorLines: [] as VirtualLine[] }))
                                )
                                .orSequence(s => s
                                    .and(r => r
                                        .asSlice(r => r
                                            .choice(c => c
                                                .or(() => $indentBlock)
                                                .orSequence(s => s
                                                    .andOmit(r => r.nextIsNot(() => $optBNK_DEDENT))
                                                    .and(r => r.anyOne())
                                                )
                                            )
                                        )
                                    , "captured")
                                    .action(({ captured }) => ({ success: null, errorLines: captured }))
                                )
                            )
                        )
                        .andOmit(r => r.zeroOrMore(() => $blankLine))
                    )
                )
            , "childrenAndErrors1")
            .andOmit(() => $optBNK_DEDENT)
            .and(r => r
                .zeroOrMore(r => r
                    .sequence(s => s
                        .and(r => r
                            .asSlice(r => r
                                .choice(c => c
                                    .or(() => $indentBlock)
                                    .orSequence(s => s
                                        .andOmit(r => r.nextIsNot(() => $optBNK_DEDENT))
                                        .and(r => r.anyOne())
                                    )
                                )
                            )
                        , "captured")
                        .andOmit(r => r.zeroOrMore(() => $blankLine))
                        .action(({ captured }) => ({ success: null, errorLines: captured }))
                    )
                )
            , "errors2")
            .andOmit(() => $optBNK_DEDENT)
            .action(({ childrenAndErrors1, errors2, newErrorMessage }) => {
                const childrenAndErrors = [...childrenAndErrors1, ...errors2];
                for ( let i = 0; i < childrenAndErrors.length; i += 1 ) {
                    while (!childrenAndErrors[i].success && i + 1 < childrenAndErrors.length && !childrenAndErrors[i + 1].success) {
                        childrenAndErrors[i].errorLines.push(...childrenAndErrors.splice(i + 1, 1)[0].errorLines);
                    }
                }

                const children: TValue[] = [];
                const errors: ErrorMessage[] = [];
                for (const { success, errorLines } of childrenAndErrors) {
                    if (success){
                        children.push(success);
                    }
                    if (errorLines.length > 0) {
                        errors.push(newErrorMessage(
                            `${ruleName}: この部分をパースできませんでした。`,
                            [
                                errorLines[0].virtualRange[0],
                                errorLines.slice(-1)[0].virtualRange[1],
                            ],
                        ));
                    }
                }
                return {
                    value: children,
                    errors,
                } as WithErrorValue<TValue[]>;
            })
        );

export const isSingleParentheses = (line: VirtualLine | Line | SentencesArray): __Parentheses | null => {
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
            && columns[0].sentences[0].children[0] instanceof __Parentheses
            && columns[0].sentences[0].children[0].attr.type === "round"
            // && typeof columns[0].sentences[0].children[0] !== "string"
            // && columns[0].sentences[0].children[0].tag === "__Parentheses"
    ) ? columns[0].sentences[0].children[0] : null;
};
