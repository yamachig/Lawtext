import factory from "../factory";
import $blankLine from "./$blankLine";
import $tocHeadLine from "./$tocHeadLine";
import $articleGroupHeadLine from "./$articleGroupHeadLine";

export const $lines = factory.withName("lines")
    .zeroOrMore(r => r
        .choice(c => c
            .or(() => $blankLine)
            .or(() => $tocHeadLine)
            .or(() => $articleGroupHeadLine)
        )
    )
    ;

export default $lines;

