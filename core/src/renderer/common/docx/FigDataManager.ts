import { LawXMLStruct } from "../../../data/loaders/common";
import { imageSize } from "image-size";
import { DOCXFigData, DOCXFigDataManager } from "./component";
import * as std from "../../../law/std";
import { EL } from "../../../node/el";
import { decodeBase64 } from "../../../util";

function *iterateFig(el: EL): IterableIterator<std.Fig> {
    if (std.isFig(el)) yield el;
    for (const c of el.children) {
        if (typeof c === "string") continue;
        yield* iterateFig(c);
    }
}

export class FigDataManager implements DOCXFigDataManager {
    pdfIcon = {
        rId: "rPdfIcon",
        buf: decodeBase64(pdfIconBinaryBase64),
        fileName: "pdfIcon.emf",
    };
    constructor(
        public figDataMap: Map<string, DOCXFigData>,
    ) { }
    static async create(lawXMLStruct: LawXMLStruct, subsetLaw: EL) {
        const figDataMap: Map<string, DOCXFigData> = new Map();
        for (const el of iterateFig(subsetLaw)) {
            const src = el.attr.src;
            const blob = await lawXMLStruct.getPictBlob(src);
            if (!blob) continue;
            const size = (() => {
                try {
                    return imageSize(new Uint8Array(blob.buf));
                } catch {
                    return null;
                }
            })();
            try {
                const isEmbeddedPDF = blob.type === "application/pdf";
                const figData: DOCXFigData = {
                    isEmbeddedPDF,
                    id: 1000000 + figDataMap.size,
                    rId: `fig${figDataMap.size + 1}`,
                    cx: (size?.width ?? 100) * 9525,
                    cy: (size?.height ?? 141) * 9525,
                    name: src,
                    fileName: src.split("/").slice(-1)[0],
                    blob,
                };
                figDataMap.set(src, figData);
            } catch {
                //
            }
        }
        return new FigDataManager(figDataMap);
    }
    getFigData(src: string): DOCXFigData | null {
        return this.figDataMap.get(src) ?? null;
    }
    getFigDataItems(): [src: string, figData: DOCXFigData][] {
        return [...this.figDataMap.entries()];
    }
}

export default FigDataManager;

export const pdfIconBinaryBase64 = "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JAAAAAAAgD0AAAAAAAAAAAAAgD0AAAAAAAAAAAIAAAAnAAAAGAAAAAEAAAAAAAAAAAAAAAAAAAAlAAAADAAAAAEAAAATAAAADAAAAAEAAAA7AAAACAAAABsAAAAQAAAA6g8AAGodAABZAAAAJAAAAAAAAAAAAAAA//////////8CAAAA6g/HI38QxyNYAAAATAAAAAAAAAAAAAAA//////////8MAAAAYhHJIxMSiSOTEgYjExOEIlUTsiFXE5AgVRNuHxMTnx6TEiEeExKkHWIRZx1/EGodPQAAAAgAAAAbAAAAEAAAAIgHAABnHQAAWQAAACQAAAAAAAAAAAAAAP//////////AgAAAIgHeCCpCHggWAAAAEwAAAAAAAAAAAAAAP//////////DAAAAE8JeCDKCVYgGwoQIGwKyx+UCmQflArbHpMKUR5oCvEdEwq4Hb0JgB0/CWUdmQhnHT0AAAAIAAAAGwAAABAAAAARFwAA6RsAAFkAAABAAAAAAAAAAAAAAAD//////////wkAAADYHOkb2Bx6HfEYeh3xGOofRhzqH0YceyHxGHsh8RhIJREXSCU9AAAACAAAABsAAAAQAAAACg4AAOkbAAA2AAAAEAAAAJ0QAADpGwAAWAAAAEwAAAAAAAAAAAAAAP//////////DAAAAA8S6BsxE0kcAhQNHdMU0R09Ff0eQRWQIDwVIyLTFFIjBRQbJDcT5CQdEkkltxBIJTYAAAAQAAAACg4AAEglAAA9AAAACAAAABsAAAAQAAAAqAUAAOkbAAA2AAAAEAAAAL0IAADpGwAAWAAAAGQAAAAAAAAAAAAAAP//////////EgAAAHAJ5xsQCv8bngouHCsLXhyaC60c7AsbHT4Mih1oDB8eagzbHmgMkB8+DCYg7AubIJoLECErC2choAqfIRUK2CF4CfQhygjzIVkAAAAoAAAAAAAAAAAAAAD//////////wMAAACIB/MhiAdIJagFSCU9AAAACAAAADwAAAAIAAAAPgAAABgAAABaAAAAvgEAAM4BAABVAgAAEwAAAAwAAAABAAAAJQAAAAwAAAAAAACAJAAAACQAAAAAAIBBAAAAAAAAAAAAAIBBAAAAAAAAAAACAAAARgAAAIwAAACAAAAARU1GKypAAAAkAAAAGAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAACpAAAAkAAAAGAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAACZAAAAQAAAABAAAAAAAAAAIQAMEGAAAAAwAAAACEMDbAAAAAAMAABA0QAMADAAAAAAAAABMAAAAZAAAANv////b////TAIAAPkCAADb////2////3ICAAAfAwAAKQCqAAAAAAAAAAAAAACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIgAAAAwAAAD/////RgAAABwAAAAQAAAARU1GKwJAAAAMAAAAAAAAAA4AAAAUAAAAAAAAABAAAAAUAAAA";
