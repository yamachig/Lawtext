import type { SentenceEnvsStruct } from "./getSentenceEnvs";
import getSentenceEnvs from "./getSentenceEnvs";
import detectVariableReferences from "./detectVariableReferences";
import type { Declarations } from "./common/declarations";
import type { ____VarRef } from "../node/el/controls/varRef";
import type * as std from "../law/std";
import type { ErrorMessage } from "../parser/cst/error";
import detectDeclarations from "./detectDeclarations";
import type { ____PointerRanges } from "../node/el/controls";
import type { PointerEnvsStruct } from "./pointerEnvs/getPointerEnvs";
import getPointerEnvs from "./pointerEnvs/getPointerEnvs";
import getScope from "./pointerEnvs/getScope";
import detectPointers from "./detectPointers";
import { getLawList } from "../law/getLawList";

export interface AnalyzeOptions {
    elToBeModified: std.StdEL | std.__EL,
}

export interface Analysis extends SentenceEnvsStruct, PointerEnvsStruct {
    pointerRangesList: ____PointerRanges[];
    declarations: Declarations,
    variableReferences: ____VarRef[],
    errors: ErrorMessage[],
}

let _lawTitleLength: ((lawNum: string) => number | null) | null = null;

export const getLawTitleLength = async () => {
    if (!_lawTitleLength) {
        const lawList = await getLawList();
        const lawByLawNum = Object.fromEntries(lawList.map((item) => [item.lawNum, item]));

        _lawTitleLength = (lawNum: string): number | null => {
            return lawByLawNum[lawNum]?.lawTitle.length ?? null;
        };
    }
    return _lawTitleLength;
};

export const analyze = async (options: AnalyzeOptions): Promise<Analysis> => {
    const {
        elToBeModified,
    } = options;
    const errors: ErrorMessage[] = [];

    const lawTitleLength = await getLawTitleLength();

    const sentenceEnvsStruct = getSentenceEnvs(elToBeModified);

    const appdxPointersResult = detectPointers(elToBeModified);
    errors.push(...appdxPointersResult.errors);
    const appdxPointers = appdxPointersResult.value;

    const getPointerEnvsResult = getPointerEnvs({ sentenceEnvsStruct, appdxPointers });
    errors.push(...getPointerEnvsResult.errors);
    const pointerEnvsStruct = getPointerEnvsResult.value;

    // detectDeclarations partially locates PointerRanges, assuming the located PointerRanges are all internal.
    const detectDeclarationsResult = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct, lawTitleLength);
    const declarations = detectDeclarationsResult.value.declarations;
    const lawRefByDeclarationID = detectDeclarationsResult.value.lawRefByDeclarationID;
    errors.push(...detectDeclarationsResult.errors);

    const detectVariableReferencesResult = detectVariableReferences(sentenceEnvsStruct, declarations, lawRefByDeclarationID, pointerEnvsStruct);
    const variableReferences = detectVariableReferencesResult.value.varRefs;
    errors.push(...detectVariableReferencesResult.errors);

    // Locate remaining PointerRanges. This time, the remaining PointerRanges are located considering LawRef's and VarRef's for laws.
    for (const pointerRanges of pointerEnvsStruct.pointerRangesList) {
        getScope({
            pointerRangesToBeModified: pointerRanges,
            pointerEnvsStruct,
            locateOptions: {
                declarations: declarations.db,
                lawRefByDeclarationID,
                force: true,
            },
        });
    }

    return {
        declarations,
        variableReferences,
        ...sentenceEnvsStruct,
        ...pointerEnvsStruct,
        errors,
    };
};
