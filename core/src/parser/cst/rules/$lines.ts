import factory from "../factory.ts";
import $blankLine from "./$blankLine.ts";
import $tocHeadLine from "./$tocHeadLine.ts";
import $articleGroupHeadLine from "./$articleGroupHeadLine.ts";
import $appdxItemHeadLine from "./$appdxItemHeadLine.ts";
import $supplProvisionAppdxItemHeadLine from "./$supplProvisionAppdxItemHeadLine.ts";
import $supplProvisionHeadLine from "./$supplProvisionHeadLine.ts";
import $articleLine from "./$articleLine.ts";
import $paragraphItemLine from "./$paragraphItemLine.ts";
import $tableColumnLine from "./$tableColumnLine.ts";
import $otherLine from "./$otherLine.ts";
import type { WithErrorRule } from "../util.ts";
import type { Line } from "../../../node/cst/line.ts";

export const $lines: WithErrorRule<Line[]> = factory.withName("lines")
    .sequence(s => s
        .and(r => r
            .zeroOrMore(r => r
                .choice(c => c
                    .or(() => $blankLine)
                    .or(() => $tableColumnLine)
                    .or(() => $tocHeadLine)
                    .or(() => $articleGroupHeadLine)
                    .or(() => $paragraphItemLine)
                    .or(() => $supplProvisionHeadLine)
                    .or(() => $supplProvisionAppdxItemHeadLine)
                    .or(() => $appdxItemHeadLine)
                    .or(() => $articleLine)
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

