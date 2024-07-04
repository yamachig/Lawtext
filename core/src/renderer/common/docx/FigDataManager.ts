import { LawXMLStruct } from "../../../data/loaders/common";
import { imageSize } from "image-size";
import { DOCXFigData, DOCXFigDataManager } from "./component";
import * as std from "../../../law/std";
import { EL } from "../../../node/el";

function *iterateFig(el: EL): IterableIterator<std.Fig> {
    if (std.isFig(el)) yield el;
    for (const c of el.children) {
        if (typeof c === "string") continue;
        yield* iterateFig(c);
    }
}

export class FigDataManager implements DOCXFigDataManager {
    constructor(
        public lawXMLStruct: LawXMLStruct,
        public figDataMap: Map<string, DOCXFigData>,
        public subsetLaw: EL,
    ) { }
    static async create(lawXMLStruct: LawXMLStruct, subsetLaw: EL) {
        const figDataMap: Map<string, DOCXFigData> = new Map();
        for (const el of iterateFig(subsetLaw)) {
            const src = el.attr.src;
            const blob = await lawXMLStruct.getPictBlob(src);
            if (!blob) continue;
            try {
                const size = imageSize(new Uint8Array(blob.buf));
                const figData: DOCXFigData = {
                    id: 1000000 + figDataMap.size,
                    rId: `fig${figDataMap.size + 1}`,
                    cx: (size.width ?? 100) * 9525,
                    cy: (size.height ?? 100) * 9525,
                    name: src,
                    fileName: src.split("/").slice(-1)[0],
                    blob,
                };
                figDataMap.set(src, figData);
            } catch {
                //
            }
        }
        return new FigDataManager(lawXMLStruct, figDataMap, subsetLaw);
    }
    getFigData(src: string): DOCXFigData | null {
        return this.figDataMap.get(src) ?? null;
    }
    getFigDataItems(): [src: string, figData: DOCXFigData][] {
        return [...this.figDataMap.entries()];
    }
}

export default FigDataManager;
