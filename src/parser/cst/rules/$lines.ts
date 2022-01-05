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
import $otherLine from "./$otherLine";
import { WithErrorRule } from "../util";
import { Line } from "../../../node/cst/line";

export const $lines: WithErrorRule<Line[]> = factory.withName("lines")
    .sequence(s => s
        .and(r => r
            .zeroOrMore(r => r
                .choice(c => c
                    .or(() => $blankLine)
                    .or(() => $tocHeadLine)
                    .or(() => $articleGroupHeadLine)
                    .or(() => $supplProvisionHeadLine)
                    .or(() => $supplProvisionAppdxItemHeadLine)
                    .or(() => $appdxItemHeadLine)
                    .or(() => $articleLine)
                    .or(() => $paragraphItemLine)
                    .or(() => $tableColumnLine)
                    .or(() => $otherLine)
                )
            )
        , "lines")
        .action(({ lines }) => {
            return {
                value: lines.map(line => line.value),
                errors: lines.map(line => line.errors).flat(),
            };
        })
    )
    ;

export default $lines;

