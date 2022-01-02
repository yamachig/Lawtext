import factory from "../factory";
import { $kanjiDigits } from "../../lexical";


export const $articleTitle = factory
    .withName("articleTitle")
    .choice(c => c
        .or(r => r
            .sequence(c => c
                .and(r => r.seqEqual("第"))
                .and(() => $kanjiDigits)
                .and(r => r.oneOf(["条", "條"]))
                .and(r => r
                    .zeroOrMore(r => r
                        .sequence(c => c
                            .and(r => r.oneOf("のノ"))
                            .and(() => $kanjiDigits)
                        )
                    )
                )
                .action(({ text }) => {
                    return text();
                })
            )
        )
    )
    ;

export default $articleTitle;
