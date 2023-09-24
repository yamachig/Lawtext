import factory from "../factory";
import { WithErrorRule } from "../util";
import { $arabicDigits, $kanjiDigits } from "./lexical";


export const $articleGroupNum: WithErrorRule<{
    typeChar: "編" | "章" | "節" | "款" | "目",
    text: string,
}> = factory
    .withName("articleGroupNum")
    .choice(c => c
        .or(r => r
            .sequence(c => c
                .and(r => r.seqEqual("第"))
                .and(() => $kanjiDigits)
                .and(r => r.regExp(/^[編章節款目]/), "typeChar")
                .and(r => r
                    .zeroOrMore(r => r
                        .sequence(c => c
                            .and(r => r.regExp(/^[のノ]/))
                            .and(() => $kanjiDigits)
                        )
                    )
                )
                .action(({ text, typeChar }) => {
                    return {
                        value: {
                            typeChar: typeChar as ("編" | "章" | "節" | "款" | "目"),
                            text: text(),
                        },
                        errors: [],
                    };
                })
            )
        )
        .or(r => r
            .sequence(c => c
                .and(r => r.seqEqual("第"))
                .and(() => $arabicDigits)
                .and(r => r.regExp(/^[編章節款目]/), "typeChar")
                .and(r => r
                    .zeroOrMore(r => r
                        .sequence(c => c
                            .and(r => r.regExp(/^[のノ]/))
                            .and(() => $arabicDigits)
                        )
                    )
                )
                .action(({ text, typeChar }) => {
                    return {
                        value: {
                            typeChar: typeChar as ("編" | "章" | "節" | "款" | "目"),
                            text: text(),
                        },
                        errors: [],
                    };
                })
            )
        )
    )
    ;

export default $articleGroupNum;
