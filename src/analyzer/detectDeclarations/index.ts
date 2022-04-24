import { SpansStruct } from "../getSpans";
import * as std from "../../law/std";
import { ErrorMessage } from "../../parser/cst/error";
import { WithErrorValue } from "../../parser/std/util";
import { processNameInline } from "./processNameInline";
import { ____Declaration } from "../../node/el/controls";
import { isSpanEL } from "../../node/span";
import { Container } from "../../node/container";
import { ignoreAnalysisTag } from "../common";


export const detectDeclarations = (elToBeModified: std.StdEL | std.__EL, spansStruct: SpansStruct, prevContainer: Container): WithErrorValue<____Declaration[]> => {

    const declarations: ____Declaration[] = [];
    const errors: ErrorMessage[] = [];

    const container = spansStruct.containersByEL.get(elToBeModified) ?? prevContainer;

    if (elToBeModified.children.some(isSpanEL)) {

        {
            const result = processNameInline(
                elToBeModified.children as (std.StdEL | std.__EL)[],
                spansStruct,
                container,
            );
            if (result){
                declarations.push(result.value.declaration);
                errors.push(...result.errors);
            }
        }

    }


    for (const child of elToBeModified.children) {
        if (typeof child === "string") {
            continue;

        } else if ((ignoreAnalysisTag as readonly string[]).includes(child.tag)) {
            continue;

        } else {
            const detectLawnameResult = detectDeclarations(
                child as std.StdEL | std.__EL,
                spansStruct,
                container,
            );
            declarations.push(...detectLawnameResult.value);
            errors.push(...detectLawnameResult.errors);

        }

    }


    return { value: declarations, errors };
};

export default detectDeclarations;
