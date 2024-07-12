import { EL } from ".";
import { controlFromEL } from "./controls";
import type { JsonEL } from "./jsonEL";


export const loadEL = <T extends JsonEL | string>(rawLaw: T): T extends string ? string : EL => {
    if (typeof rawLaw === "string") {
        return rawLaw as unknown as T extends string ? string : EL;
    } else {
        if (!rawLaw.children) {
            console.error("[load_el]", rawLaw);
        }
        const attr = { ...rawLaw.attr };
        let id = undefined as number | undefined;
        let range = undefined as [number, number] | undefined;
        if ("__id" in rawLaw.attr) {
            id = JSON.parse(rawLaw.attr["__id"] ?? "");
            delete attr["__id"];
        }
        if ("__range" in rawLaw.attr) {
            range = JSON.parse(rawLaw.attr["__range"] ?? "");
            delete attr["__range"];
        }
        const _el = new EL(
            rawLaw.tag,
            attr,
            rawLaw.children.map(loadEL),
            range,
            id,
        );
        const el = _el.isControl ? controlFromEL(_el) : _el;
        return el as unknown as T extends string ? string : EL;
    }
};

export default loadEL;
