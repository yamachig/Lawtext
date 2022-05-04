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
import { Declarations } from "../common/declarations";
import { processAmbiguousNameInline } from "./processAmbiguousNameInline";
import { PointerEnvsStruct } from "../pointerEnvs/getPointerEnvs";


export const detectDeclarationsByEL = (
    elToBeModified: std.StdEL | std.__EL,
    sentenceEnv: SentenceEnv,
    sentenceEnvsStruct: SentenceEnvsStruct,
    pointerEnvsStruct: PointerEnvsStruct,
): WithErrorValue<____Declaration[]> => {

    const declarations: ____Declaration[] = [];
    const errors: ErrorMessage[] = [];

    {
        const result = processLawRef(
            elToBeModified,
            sentenceEnv,
            sentenceEnvsStruct,
            pointerEnvsStruct,
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
            sentenceEnvsStruct,
            pointerEnvsStruct,
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
                sentenceEnvsStruct,
                pointerEnvsStruct,
            );
            declarations.push(...detectLawnameResult.value);
            errors.push(...detectLawnameResult.errors);

        }

    }


    return { value: declarations, errors };
};


export const detectDeclarationsBySentence = (
    sentenceEnv: SentenceEnv,
    sentenceEnvsStruct: SentenceEnvsStruct,
    pointerEnvsStruct: PointerEnvsStruct,
): WithErrorValue<____Declaration[]> => {

    const declarations: ____Declaration[] = [];
    const errors: ErrorMessage[] = [];

    {
        const result = processNameList(
            sentenceEnv,
            sentenceEnvsStruct,
            pointerEnvsStruct,
        );
        if (result){
            declarations.push(...result.value);
            errors.push(...result.errors);
        }
    }

    {
        const result = detectDeclarationsByEL(
            sentenceEnv.el,
            sentenceEnv,
            sentenceEnvsStruct,
            pointerEnvsStruct,
        );
        if (result){
            declarations.push(...result.value);
            errors.push(...result.errors);
        }
    }


    return { value: declarations, errors };
};


export const detectDeclarations = (
    sentenceEnvsStruct: SentenceEnvsStruct,
    pointerEnvsStruct: PointerEnvsStruct,
): WithErrorValue<Declarations> => {

    const declarations = new Declarations();
    const errors: ErrorMessage[] = [];

    for (const sentenceEnv of sentenceEnvsStruct.sentenceEnvs) {
        const result = detectDeclarationsBySentence(sentenceEnv, sentenceEnvsStruct, pointerEnvsStruct);
        if (result){
            for (const declaration of result.value) declarations.add(declaration);
            errors.push(...result.errors);
        }
    }

    {
        const result = processAmbiguousNameInline(sentenceEnvsStruct, declarations, pointerEnvsStruct);
        errors.push(...result.errors);
        for (const declaration of result.value.toAddDeclarations) declarations.add(declaration);
    }
    return { value: declarations, errors };
};

export default detectDeclarations;
