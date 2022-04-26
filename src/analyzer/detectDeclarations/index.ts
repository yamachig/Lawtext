import { SentenceEnvsStruct } from "../getSentenceEnvs";
import * as std from "../../law/std";
import { ErrorMessage } from "../../parser/cst/error";
import { WithErrorValue } from "../../parser/std/util";
import { processNameInline } from "./processNameInline";
import { ____Declaration } from "../../node/el/controls";
import { SentenceEnv } from "../../node/container/sentenceEnv";
import { processLawRef } from "./processLawRef";
import { isIgnoreAnalysis } from "../common";
import { processNameList } from "./processNameList";


export const detectDeclarationsByEL = (elToBeModified: std.StdEL | std.__EL, sentenceEnv: SentenceEnv): WithErrorValue<____Declaration[]> => {

    const declarations: ____Declaration[] = [];
    const errors: ErrorMessage[] = [];

    {
        const result = processLawRef(
            elToBeModified,
            sentenceEnv,
        );
        if (result){
            declarations.push(...result.value.declarations);
            errors.push(...result.errors);
        }
    }

    {
        const result = processNameInline(
            elToBeModified,
            sentenceEnv,
        );
        if (result){
            declarations.push(...result.value.declarations);
            errors.push(...result.errors);
        }
    }


    for (const child of elToBeModified.children) {
        if (typeof child === "string") {
            continue;

        } else if (isIgnoreAnalysis(child)) {
            continue;

        } else {
            const detectLawnameResult = detectDeclarationsByEL(
                child as std.StdEL | std.__EL,
                sentenceEnv,
            );
            declarations.push(...detectLawnameResult.value);
            errors.push(...detectLawnameResult.errors);

        }

    }


    return { value: declarations, errors };
};


export const detectDeclarationsBySentence = (sentenceEnv: SentenceEnv, sentenceEnvsStruct: SentenceEnvsStruct): WithErrorValue<____Declaration[]> => {

    const declarations: ____Declaration[] = [];
    const errors: ErrorMessage[] = [];

    {
        const result = processNameList(sentenceEnv, sentenceEnvsStruct);
        if (result){
            declarations.push(...result.value);
            errors.push(...result.errors);
        }
    }

    {
        const result = detectDeclarationsByEL(sentenceEnv.el, sentenceEnv);
        if (result){
            declarations.push(...result.value);
            errors.push(...result.errors);
        }
    }


    return { value: declarations, errors };
};


export const detectDeclarations = (sentenceEnvsStruct: SentenceEnvsStruct): WithErrorValue<____Declaration[]> => {

    const declarations: ____Declaration[] = [];
    const errors: ErrorMessage[] = [];

    for (const sentenceEnv of sentenceEnvsStruct.sentenceEnvs) {
        const result = detectDeclarationsBySentence(sentenceEnv, sentenceEnvsStruct);
        if (result){
            declarations.push(...result.value);
            errors.push(...result.errors);
        }
    }


    return { value: declarations, errors };
};

export default detectDeclarations;
