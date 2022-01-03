import factory from "../factory";
import $blankLine from "./$blankLine";
import $tocHeadLine from "./$tocHeadLine";
import $articleGroupHeadLine from "./$articleGroupHeadLine";
import $appdxItemHeadLine from "./$appdxItemHeadLine";
import $supplProvisionAppdxItemHeadLine from "./$supplProvisionAppdxItemHeadLine";
import $supplProvisionHeadLine from "./$supplProvisionHeadLine";
import $articleLine from "./$articleLine";
import $paragraphItemLine from "./$paragraphItemLine";
import $tableColumnLine from "./$tableColumnLine";

export const $lines = factory.withName("lines")
    .zeroOrMore(r => r
        .choice(c => c
            .or(() => $blankLine)
            .or(() => $tocHeadLine)
            .or(() => $articleGroupHeadLine)
            .or(() => $appdxItemHeadLine)
            .or(() => $supplProvisionAppdxItemHeadLine)
            .or(() => $supplProvisionHeadLine)
            .or(() => $articleLine)
            .or(() => $paragraphItemLine)
            .or(() => $tableColumnLine)
        )
    )
    ;

export default $lines;

