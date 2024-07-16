import type { SentenceEnvsStruct } from "../getSentenceEnvs";
import type * as std from "../../law/std";
import type { ErrorMessage } from "../../parser/cst/error";
import type { WithErrorValue } from "../../parser/std/util";
import { processNameInline } from "./processNameInline";
import type { ____Declaration } from "../../node/el/controls";
import { ____LawRef } from "../../node/el/controls";
import type { SentenceEnv } from "../../node/container/sentenceEnv";
import { processLawRef } from "./processLawRef";
import { isIgnoreAnalysis } from "../common";
import { processNameList } from "./processNameList";
import { Declarations } from "../common/declarations";
import { processAmbiguousNameInline } from "./processAmbiguousNameInline";
import type { PointerEnvsStruct } from "../pointerEnvs/getPointerEnvs";


export const detectDeclarationsByEL = (
    elToBeModified: std.StdEL | std.__EL,
    sentenceEnv: SentenceEnv,
    sentenceEnvsStruct: SentenceEnvsStruct,
    pointerEnvsStruct: PointerEnvsStruct,
): WithErrorValue<{
    declarations: ____Declaration[],
    lawRefs: ____LawRef[],
}> => {

    const declarations: ____Declaration[] = [];
    const lawRefs: ____LawRef[] = [];
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
            lawRefs.push(...result.value.lawRefs);
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

        } else if (child instanceof ____LawRef) {
            continue;

        } else {
            const detectLawnameResult = detectDeclarationsByEL(
                child as std.StdEL | std.__EL,
                sentenceEnv,
                sentenceEnvsStruct,
                pointerEnvsStruct,
            );
            declarations.push(...detectLawnameResult.value.declarations);
            lawRefs.push(...detectLawnameResult.value.lawRefs);
            errors.push(...detectLawnameResult.errors);

        }

    }


    return { value: { declarations, lawRefs }, errors };
};


export const detectDeclarationsBySentence = (
    sentenceEnv: SentenceEnv,
    sentenceEnvsStruct: SentenceEnvsStruct,
    pointerEnvsStruct: PointerEnvsStruct,
): WithErrorValue<{
    declarations: ____Declaration[],
    lawRefs: ____LawRef[],
}> => {

    const declarations: ____Declaration[] = [];
    const lawRefs: ____LawRef[] = [];
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
            declarations.push(...result.value.declarations);
            lawRefs.push(...result.value.lawRefs);
            errors.push(...result.errors);
        }
    }


    return { value: { declarations, lawRefs }, errors };
};


export const detectDeclarations = (
    sentenceEnvsStruct: SentenceEnvsStruct,
    pointerEnvsStruct: PointerEnvsStruct,
): WithErrorValue<{
    declarations: Declarations,
    lawRefByDeclarationID: Map<string, ____LawRef>,
}> => {

    const declarations = new Declarations();
    const lawRefByDeclarationID: Map<string, ____LawRef> = new Map();
    const errors: ErrorMessage[] = [];

    for (const sentenceEnv of sentenceEnvsStruct.sentenceEnvs) {
        const result = detectDeclarationsBySentence(sentenceEnv, sentenceEnvsStruct, pointerEnvsStruct);
        if (result){
            for (const declaration of result.value.declarations) declarations.add(declaration);
            for (const lawRef of result.value.lawRefs) {
                if (lawRef.attr.includingDeclarationID) {
                    lawRefByDeclarationID.set(lawRef.attr.includingDeclarationID, lawRef);
                }
                sentenceEnv.addPointerLike({
                    textRange: sentenceEnv.textRageOfEL(lawRef),
                    pointerLike: lawRef,
                });
            }
            errors.push(...result.errors);
        }
    }

    {
        const result = processAmbiguousNameInline(sentenceEnvsStruct, declarations, pointerEnvsStruct);
        errors.push(...result.errors);
        for (const declaration of result.value.toAddDeclarations) declarations.add(declaration);
    }
    return { value: { declarations, lawRefByDeclarationID }, errors };
};

export default detectDeclarations;
