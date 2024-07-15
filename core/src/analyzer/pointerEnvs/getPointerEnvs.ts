import { parseNamedNum } from "../../law/num";
// import { lawNumLikeToLawNum } from "../../law/lawNum";
import type * as std from "../../law/std";
import type { SentenceEnv } from "../../node/container/sentenceEnv";
import type { ____Pointer } from "../../node/el/controls";
import { ____PointerRanges } from "../../node/el/controls";
import { PointerEnv } from "../../node/pointerEnv";
import type { ErrorMessage } from "../../parser/cst/error";
import type { WithErrorValue } from "../../parser/std/util";
import { isIgnoreAnalysis } from "../common";
import type { SentenceEnvsStruct } from "../getSentenceEnvs";


const getPointerEnvsForEL = (
    el: std.StdEL | std.__EL,
    sentenceEnv: SentenceEnv,
    __prevPointerEnv: PointerEnv | null,
    __namingParent: PointerEnv | null,
): (
    WithErrorValue<{
        pointerEnvByEL: Map<____Pointer, PointerEnv>;
        pointerRangesList: ____PointerRanges[];
        firstPointerEnv: PointerEnv;
        lastPointerEnv: PointerEnv;
    }> | null
) => {
    const prevPointerEnv = __prevPointerEnv;
    const namingParent = __namingParent;

    const pointerEnvByEL: Map<____Pointer, PointerEnv> = new Map();
    let firstPointerEnv: PointerEnv | null = null;
    let lastPointerEnv: PointerEnv | null = null;
    const pointerRangesList: ____PointerRanges[] = [];
    const errors: ErrorMessage[] = [];

    if (el instanceof ____PointerRanges) {

        const pointerRanges = el;
        pointerRangesList.push(pointerRanges);

        // A PointerRanges establishes a new naming context if no naming parent is given.
        // e.g.
        //     "第七十五条第一項又は第七十六条第四項（第四号を除く。）若しくは第五項（第五号を除く。）"
        //     -> "第五項" referes to "第七十六条第五項"
        // Not the case:
        //     "第三十八条の二十一第一項の規定は第二項の規定による" at "第四条の二第五項"
        //     -> "第二項" referes to "第四条の二第二項" because "第二項" is not included in the previous PointerRanges object.
        //
        // If a naming parent is given, the given naming parent is inherited.
        // e.g.
        //     "第七十五条第一項又は第七十六条第四項（第四号を除く。）若しくは第五項（第五号を除く。）"
        //     -> "第四号" referes to "第七十六条第四項第四号" because the modifierParentheses gives the naming parent.
        let pointerRangesNamingParent = namingParent;

        for (const pointerRange of pointerRanges.ranges()) {

            for (const pointer of pointerRange.pointers()) {

                const fragments = pointer.fragments();
                for (const fragment of fragments) {
                    const num = parseNamedNum(fragment.attr.name);
                    if (num) fragment.attr.num = num;
                }

                const pointerEnv = new PointerEnv({
                    pointer,
                    sentenceEnv,
                });

                if (pointerRangesNamingParent) {
                    pointerEnv.namingParent = pointerRangesNamingParent;
                    pointerRangesNamingParent.namingChildren.push(pointerEnv);
                }

                const lastOrPrevPointerEnv = lastPointerEnv ?? prevPointerEnv;

                if (lastOrPrevPointerEnv) {
                    pointerEnv.seriesPrev = lastOrPrevPointerEnv;
                    lastOrPrevPointerEnv.seriesNext = pointerEnv;
                }

                if (!firstPointerEnv) firstPointerEnv = pointerEnv;
                lastPointerEnv = pointerEnv;
                pointerRangesNamingParent = pointerEnv;
                pointerEnvByEL.set(pointer, pointerEnv);
            }

            {
                const modifierParentheses = pointerRange.modifierParentheses();
                if (modifierParentheses) {
                    // // modifierParentheses establishes a new naming context.
                    // // e.g.
                    // //     "第二十四条の二第二項各号（第二号を除く。）のいずれかに該当するに至つたとき"
                    // //     -> "第二号" referes to "第二十四条の二第二項第二号"
                    const result = getPointerEnvsForEL(
                        modifierParentheses,
                        sentenceEnv,
                        lastPointerEnv ?? prevPointerEnv,
                        pointerRangesNamingParent,
                    );
                    if (result){
                        if (!firstPointerEnv) firstPointerEnv = result.value.firstPointerEnv;
                        // Not update pointerRangesNamingParent
                        lastPointerEnv = result.value.lastPointerEnv;

                        for (const [k, v] of result.value.pointerEnvByEL) {
                            pointerEnvByEL.set(k, v);
                        }
                        pointerRangesList.push(...result.value.pointerRangesList);
                        errors.push(...result.errors);

                    }
                }
            }
        }

    } else {

        for (const child of el.children) {
            if (typeof child === "string") {
                continue;

            } else if (isIgnoreAnalysis(child)) {
                continue;
            }

            const result = getPointerEnvsForEL(
                child as std.StdEL | std.__EL,
                sentenceEnv,
                lastPointerEnv ?? prevPointerEnv,
                namingParent,
            );

            if (result){
                if (!firstPointerEnv) firstPointerEnv = result.value.firstPointerEnv;
                lastPointerEnv = result.value.lastPointerEnv;

                for (const [k, v] of result.value.pointerEnvByEL) {
                    pointerEnvByEL.set(k, v);
                }
                pointerRangesList.push(...result.value.pointerRangesList);
                errors.push(...result.errors);
            }
        }
    }

    if (!firstPointerEnv || !lastPointerEnv) return null;

    return {
        value: {
            pointerEnvByEL,
            pointerRangesList,
            firstPointerEnv,
            lastPointerEnv,
        },
        errors,
    };
};

export interface PointerEnvsStruct {
    pointerEnvByEL: Map<____Pointer, PointerEnv>;
    pointerRangesList: ____PointerRanges[];
    rootPointerEnvs: PointerEnv[];
}

export const getPointerEnvs = (sentenceEnvsStruct: SentenceEnvsStruct): WithErrorValue<PointerEnvsStruct> => {

    const pointerEnvByEL: Map<____Pointer, PointerEnv> = new Map();
    const rootPointerEnvs: PointerEnv[] = [];
    const pointerRangesList: ____PointerRanges[] = [];
    const errors: ErrorMessage[] = [];

    // The previous PointerEnv in the same Container is inherited as a lastPointerEnv.
    // e.g.
    //     "第二十条第一項から第三項まで、第六項及び第九項の規定は、認定開設者について準用する。" + "この場合において、同条第六項中"
    //     -> "同条第六項" referes to "第二十条第六項"
    let prevPointerEnv: PointerEnv | null = null;
    const prevContainerID: string | null = null;

    for (const sentenceEnv of sentenceEnvsStruct.sentenceEnvs) {
        const containerID = sentenceEnv.container.containerID;
        if (containerID !== prevContainerID) prevPointerEnv = null;

        const result = getPointerEnvsForEL(
            sentenceEnv.el,
            sentenceEnv,
            prevPointerEnv,
            null,
        );
        if (result){
            for (const [k, v] of result.value.pointerEnvByEL) {
                pointerEnvByEL.set(k, v);
            }
            rootPointerEnvs.push(result.value.firstPointerEnv);
            pointerRangesList.push(...result.value.pointerRangesList);
            errors.push(...result.errors);
            prevPointerEnv = result.value.lastPointerEnv;
        }
    }

    return {
        value: { pointerEnvByEL, rootPointerEnvs, pointerRangesList },
        errors,
    };
};

export default getPointerEnvs;
