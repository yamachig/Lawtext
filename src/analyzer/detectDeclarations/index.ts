import { Declarations } from "../common/declarations";
import { SpansStruct } from "../getSpans";
import * as std from "../../law/std";
import { ErrorMessage } from "../../parser/cst/error";
import { WithErrorValue } from "../../parser/std/util";
import detectNameInline from "./detectNameInline";


export const detectDeclarations = (elToBeModified: std.StdEL | std.__EL, spansStruct: SpansStruct): WithErrorValue<Declarations> => {

    const declarations = new Declarations();
    const errors: ErrorMessage[] = [];

    const detectLawNameResult = detectNameInline(elToBeModified, spansStruct, spansStruct.rootContainer);
    for (const declaration of detectLawNameResult.value) declarations.add(declaration);
    errors.push(...detectLawNameResult.errors);

    return { value: declarations, errors };
};

export default detectDeclarations;
