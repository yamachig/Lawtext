// import * as std from "../../../law/std";
import { __Text, ____PointerRanges } from "../../../node/el/controls";
import factory from "../factory";
import type { WithErrorRule } from "../util";

const reAfterScope = /(?:の規定)?/;
const reAfterInferior = /(?:において|中(?:の)?|の|における)(?:(?:使用する)?用語は)?(?:解釈に(?:関して|ついて)は)?(?:、)?/;
const reAfterImport = /(?:において|で)使用する用語の例による(?:ほか|外)(?:、)?/;
const reNameRef = /(?:次|左)(?:の各号)?に掲げる用語(?:の意義|の定義)?は(?:、)?/;
const reOther = /(?:別段の定め(?:が|の)ある場合を除き)(?:、)?/;
const reDefRef = /(?:それぞれ)?(?:次|左|当該各号)(?:の各号)?(?:に|の)(?:定める|示す|掲げる|定義に従う|とおりとする|例による|意味に用いる|ところによる|ものとする)+。/;

const reCombinedWithoutInferiorIncludingImport = new RegExp(`^${reAfterScope.source}${reAfterInferior.source}(?:(.*?)${reAfterImport.source})?(?:${reNameRef.source})?(?:${reOther.source})?${reDefRef.source}$`);

const reCombinedBeforeInferior = new RegExp(`^${reAfterScope.source}(?:又は)$`);
const reCombinedAfterInferiorIncludingImport = new RegExp(`^(?:の規定)?${reAfterInferior.source}(?:(.*?)${reAfterImport.source})?(?:${reNameRef.source})?(?:${reOther.source})?${reDefRef.source}$`);

const reCombinedAfterInferiorBeforeImport = new RegExp(`^(?:の規定)?${reAfterInferior.source}(.*)$`);

const reCombinedBeforeImportWithoutInferior = new RegExp(`^${reAfterScope.source}${reAfterInferior.source}(.*)$`);
const reCombinedAfterImport = new RegExp(`^(.*)?${reAfterImport.source}(?:${reNameRef.source})?(?:${reOther.source})?${reDefRef.source}$`);

export const $nameListHead: WithErrorRule<{
    pointerRanges: ____PointerRanges,
    // pointerRangesModifier: __Parentheses | null,
}> = factory
    .withName("nameListHead")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    (item instanceof ____PointerRanges)
                ) { return item; } else { return null; }
            })
        , "pointerRanges")
        // .and(r => r
        //     .zeroOrOne(r => r
        //         .oneMatch(({ item }) => {
        //             if (
        //                 (item instanceof __Parentheses)
        //             ) { return item; } else { return null; }
        //         })
        //     )
        // , "pointerRangesModifier")
        .and(r => r
            .choice(c => c
                .orSequence(r => r
                    .and(r => r
                        .oneMatch(({ item }) => {
                            let m: RegExpExecArray | null;
                            if (
                                (item instanceof __Text)
                                && (m = reCombinedWithoutInferiorIncludingImport.exec(item.text()))
                            ) {
                                return [
                                    item,
                                    [m.index, m.index + m[0].length],
                                ];
                            } else { return null; }
                        })
                    )
                )
                .orSequence(r => r
                    .andOmit(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof __Text)
                                && reCombinedBeforeInferior.test(item.text())
                            ) { return item; } else { return null; }
                        })
                    )
                    .andOmit(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof ____PointerRanges)
                            ) { return item; } else { return null; }
                        })
                    )
                    .andOmit(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof __Text)
                                && reCombinedAfterInferiorIncludingImport.test(item.text())
                            ) { return item; } else { return null; }
                        })
                    )
                )
                .orSequence(r => r
                    .and(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof __Text)
                                && reCombinedBeforeImportWithoutInferior.test(item.text())
                            ) { return item; } else { return null; }
                        })
                    )
                    .and(r => r
                        .oneOrMore(r => r
                            .oneMatch(({ item }) => {
                                if (
                                    !(
                                        (item instanceof __Text)
                                        && reCombinedAfterImport.test(item.text())
                                    )
                                ) { return item; } else { return null; }
                            })
                        )
                    )
                    .and(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof __Text)
                                && reCombinedAfterImport.test(item.text())
                            ) { return item; } else { return null; }
                        })
                    )
                )
                .orSequence(r => r
                    .andOmit(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof __Text)
                                && reCombinedBeforeInferior.test(item.text())
                            ) { return item; } else { return null; }
                        })
                    )
                    .andOmit(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof ____PointerRanges)
                            ) { return item; } else { return null; }
                        })
                    )
                    .and(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof __Text)
                                && reCombinedAfterInferiorBeforeImport.test(item.text())
                            ) { return item; } else { return null; }
                        })
                    )
                    .and(r => r
                        .zeroOrMore(r => r
                            .oneMatch(({ item }) => {
                                if (
                                    !(
                                        (item instanceof __Text)
                                        && !reCombinedAfterImport.test(item.text())
                                    )
                                ) { return item; } else { return null; }
                            })
                        )
                    )
                    .and(r => r
                        .oneMatch(({ item }) => {
                            if (
                                (item instanceof __Text)
                                && reCombinedAfterImport.test(item.text())
                            ) { return item; } else { return null; }
                        })
                    )
                )
            )
        , "importSentenceChildren")
        .action(({ pointerRanges, importSentenceChildren }) => {
            const value = {
                pointerRanges,
                // pointerRangesModifier,
                importSentenceChildren: importSentenceChildren ? importSentenceChildren.flat() : null,
            };
            return { value, errors: [] };
        })
    )
    ;

export default $nameListHead;
