import factory from "../factory";
import { WithErrorRule } from "../util";
import { kanjiDigits } from "./lexical";


export const $articleTitle: WithErrorRule<string> = factory
    .withName("articleTitle")
    .sequence(c => c
        .and(r => r
            .regExp(new RegExp(`^第[${kanjiDigits}]+[条條](?:[のノ][${kanjiDigits}]+)*`)) // e.g. "第十二条", "第一条の二", "第一条の二の三"
        , "title")
        .action(({ title }) => {
            return { value: title, errors: [] };
        })
    )
    ;

export default $articleTitle;
