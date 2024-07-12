import factory from "../factory";
import type { WithErrorRule } from "../util";
import { arabicDigits, kanjiDigits } from "./lexical";


export const $articleTitle: WithErrorRule<string> = factory
    .withName("articleTitle")
    .sequence(c => c
        .and(r => r
            .choice(c => c
                .or(r => r
                    .regExp(new RegExp(`^第[${kanjiDigits}]+[条條](?:[のノ][${kanjiDigits}]+)*`)) // e.g. "第十二条", "第一条の二", "第一条の二の三"
                )
                .or(r => r
                    .regExp(new RegExp(`^第[${arabicDigits}]+[条條](?:[のノ][${arabicDigits}]+)*`)) // e.g. "第１２条", "第1条の2", "第１条の２の３"
                )
            )
        , "title")
        .action(({ title }) => {
            return { value: title, errors: [] };
        })
    )
    ;

export default $articleTitle;
