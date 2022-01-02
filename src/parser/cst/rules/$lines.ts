import factory from "../factory";
import $blankLine from "./$blankLine";
import $tocHeadLine from "./$tocHeadLine";
import $articleGroupHeadLine from "./$articleGroupHeadLine";
import $appdxItemHeadLine from "./$appdxItemHeadLine";
import $supplProvisionAppdxItemHeadLine from "./$supplProvisionAppdxItemHeadLine";
import $supplProvisionHeadLine from "./$supplProvisionHeadLine";

export const $lines = factory.withName("lines")
    .zeroOrMore(r => r
        .choice(c => c
            .or(() => $blankLine)
            .or(() => $tocHeadLine)
            .or(() => $articleGroupHeadLine)
            .or(() => $appdxItemHeadLine)
            .or(() => $supplProvisionAppdxItemHeadLine)
            .or(() => $supplProvisionHeadLine)
        )
    )
    ;

export default $lines;

