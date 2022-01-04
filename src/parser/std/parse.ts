import { initialEnv } from "./env";
import factory from "./factory";
import { Line } from "../../node/cst/line";
import { toVirtualLines } from "./virtualLine";


const $start = factory
    .sequence(c => c
        // .and(() => $law, "law")
        .and(r => r
            .nextIsNot(r => r.anyOne()),
        )
        // .action(({ law }) => {
        //     return law;
        // }),
    );


export const parse = (
    lines: Line[],
    options: Record<string | number | symbol, unknown> = {},
) => {

    const env = initialEnv(options);

    const result = $start.match(
        0,
        toVirtualLines(lines),
        env,
    );

    if (result.ok) return result.value;

    throw new Error("Parse error");
};

export default parse;
