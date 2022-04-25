import { SentenceEnvsStruct } from "../getSentenceEnvs";
import * as std from "../../law/std";
import { ErrorMessage } from "../../parser/cst/error";
import { WithErrorValue } from "../../parser/std/util";
import { processNameInline } from "./processNameInline";
import { ____Declaration } from "../../node/el/controls";
import { Container } from "../../node/container";
import { ignoreAnalysisTag } from "../common";
import { SentenceEnv } from "../../node/container/sentenceEnv";


export const detectDeclarationsOfEL = (elToBeModified: std.StdEL | std.__EL, sentenceEnv: SentenceEnv, container: Container): WithErrorValue<____Declaration[]> => {

    const declarations: ____Declaration[] = [];
    const errors: ErrorMessage[] = [];

    {
        const result = processNameInline(
            elToBeModified,
            sentenceEnv,
            container,
        );
        if (result){
            declarations.push(result.value.declaration);
            errors.push(...result.errors);
        }
    }


    for (const child of elToBeModified.children) {
        if (typeof child === "string") {
            continue;

        } else if ((ignoreAnalysisTag as readonly string[]).includes(child.tag)) {
            continue;

        } else {
            const detectLawnameResult = detectDeclarationsOfEL(
                child as std.StdEL | std.__EL,
                sentenceEnv,
                container,
            );
            declarations.push(...detectLawnameResult.value);
            errors.push(...detectLawnameResult.errors);

        }

    }


    return { value: declarations, errors };
};


export const detectDeclarations = (sentenceEnvsStruct: SentenceEnvsStruct): WithErrorValue<____Declaration[]> => {

    const declarations: ____Declaration[] = [];
    const errors: ErrorMessage[] = [];

    for (const sentenceEnv of sentenceEnvsStruct.sentenceEnvs) {
        const result = detectDeclarationsOfEL(sentenceEnv.el, sentenceEnv, sentenceEnv.container);
        if (result){
            declarations.push(...result.value);
            errors.push(...result.errors);
        }
    }


    return { value: declarations, errors };
};

export default detectDeclarations;
