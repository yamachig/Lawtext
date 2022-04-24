import { ____PointerRanges } from "../node/el/controls/pointer";
import * as std from "../law/std";
import { initialEnv } from "../parser/cst/env";
import $pointerRanges from "./stringParser/rules/$pointerRanges";
import { __Text } from "../node/el/controls";
import { ignoreAnalysisTag } from "./common";
import { ErrorMessage } from "../parser/cst/error";
import { WithErrorValue } from "../parser/std/util";

export const detectPointerRanges = (elToBeModified: std.StdEL | std.__EL): WithErrorValue<____PointerRanges[]> => {

    const pointerRangesList: ____PointerRanges[] = [];
    const errors: ErrorMessage[] = [];

    for (let childIndex = 0; childIndex < elToBeModified.children.length; childIndex++) {
        const child = elToBeModified.children[childIndex];
        if (typeof child === "string") {
            continue;
        } else if (child instanceof __Text) {
            const text = child.text();
            for (let textIndex = 0; textIndex < text.length; textIndex++) {
                const result = $pointerRanges.match(
                    textIndex,
                    text,
                    initialEnv({ baseOffset: child.range ? child.range[0] : 0 }),
                );
                if (result.ok) {
                    errors.push(...result.value.errors);
                    const newItems: (std.StdEL | std.__EL)[] = [];

                    if (textIndex > 0) {
                        newItems.push(new __Text(
                            text.substring(0, textIndex),
                            child.range && [child.range[0], child.range[0] + textIndex],
                        ));
                    }

                    newItems.push(result.value.value);
                    pointerRangesList.push(result.value.value);

                    if (result.nextOffset < text.length) {
                        newItems.push(new __Text(text.substring(result.nextOffset)));
                    }

                    elToBeModified.children.splice(
                        childIndex,
                        1,
                        ...newItems,
                    );

                    if (textIndex > 0) childIndex += 1;

                    break;
                }
            }
        } else if ((ignoreAnalysisTag as readonly string[]).includes(child.tag)) {
            continue;

        } else {
            const newResult = detectPointerRanges(child as std.StdEL | std.__EL);
            pointerRangesList.push(...newResult.value);
            errors.push(...newResult.errors);
        }
    }

    return { value: pointerRangesList, errors } as const;
};

export default detectPointerRanges;
