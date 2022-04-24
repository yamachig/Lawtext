import { ____PointerRanges } from "../../node/el/controls/pointer";
import * as std from "../../law/std";
import { initialEnv } from "../../parser/cst/env";
import $pointerRanges from "../stringParser/rules/$pointerRanges";
import { __Text } from "../../node/el/controls";
import { ErrorMessage } from "../../parser/cst/error";
import { WithErrorValue } from "../../parser/std/util";

export const matchPointerRanges = (textEL: __Text): (
    | WithErrorValue<{
        newItems: (std.StdEL | std.__EL)[],
        pointerRanges: ____PointerRanges,
        proceedOffset: number,
    }>
    | null
) => {
    const errors: ErrorMessage[] = [];
    const text = textEL.text();
    for (let textIndex = 0; textIndex < text.length; textIndex++) {
        const result = $pointerRanges.match(
            textIndex,
            text,
            initialEnv({ baseOffset: textEL.range ? textEL.range[0] : 0 }),
        );
        if (result.ok) {
            const pointerRanges = result.value.value;
            errors.push(...result.value.errors);
            const newItems: (std.StdEL | std.__EL)[] = [];

            if (textIndex > 0) {
                newItems.push(new __Text(
                    text.substring(0, textIndex),
                    textEL.range && [textEL.range[0], textEL.range[0] + textIndex],
                ));
            }

            newItems.push(pointerRanges);

            if (result.nextOffset < text.length) {
                newItems.push(new __Text(text.substring(result.nextOffset)));
            }

            return {
                value: {
                    newItems,
                    pointerRanges,
                    proceedOffset: textIndex > 0 ? 1 : 2,
                },
                errors,
            };
        }
    }
    return null;
};

export default matchPointerRanges;
