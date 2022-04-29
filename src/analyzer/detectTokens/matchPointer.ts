import { ____Pointer } from "../../node/el/controls";
import { initialEnv } from "../../parser/cst/env";
import { $pointer, reSuppressPointerRanges } from "../stringParser/rules/$pointer";
import { __Text } from "../../node/el/controls";
import { ErrorMessage } from "../../parser/cst/error";
import { WithErrorValue } from "../../parser/std/util";
import { SentenceChildEL } from "../../node/cst/inline";

export const matchPointer = (textEL: __Text): (
    | WithErrorValue<{
        newItems: SentenceChildEL[],
        pointer: ____Pointer,
        proceedOffset: number,
    }>
    | null
) => {
    const errors: ErrorMessage[] = [];
    const text = textEL.text();
    for (let textIndex = 0; textIndex < text.length; textIndex++) {
        reSuppressPointerRanges.lastIndex = textIndex;
        const suppressMatch = reSuppressPointerRanges.exec(text);
        if (suppressMatch) {
            textIndex += suppressMatch[0].length - 1;
            reSuppressPointerRanges.lastIndex = 0;
            continue;
        }

        const result = $pointer.match(
            textIndex,
            text,
            initialEnv({ baseOffset: textEL.range ? textEL.range[0] : 0 }),
        );
        if (result.ok) {
            const pointer = result.value;
            const newItems: SentenceChildEL[] = [];

            if (textIndex > 0) {
                newItems.push(new __Text(
                    text.substring(0, textIndex),
                    textEL.range && [textEL.range[0], textEL.range[0] + textIndex],
                ));
            }

            newItems.push(pointer);

            if (result.nextOffset < text.length) {
                newItems.push(new __Text(
                    text.substring(result.nextOffset),
                    textEL.range && [
                        textEL.range[0] + result.nextOffset,
                        textEL.range[1],
                    ],
                ));
            }

            return {
                value: {
                    newItems,
                    pointer,
                    proceedOffset: textIndex > 0 ? 2 : 1,
                },
                errors,
            };
        }
    }
    return null;
};

export default matchPointer;
