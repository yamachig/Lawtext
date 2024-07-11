import type { LawXMLStruct } from "../../../data/loaders/common";
import { imageSize } from "image-size";
import type { DOCXFigData, DOCXFigDataManager, DOCXFigEmbedFile, DOCXFigImageFile } from "./component";
import * as std from "../../../law/std";
import type { EL } from "../../../node/el";
import { decodeBase64 } from "../../../util";
import { getPdfjs } from "./getPdfjs";

function *iterateFig(el: EL): IterableIterator<std.Fig> {
    if (std.isFig(el)) yield el;
    for (const c of el.children) {
        if (typeof c === "string") continue;
        yield* iterateFig(c);
    }
}

const createCanvas = async (width: number, height: number) => {
    return (
        global.OffscreenCanvas
            ? new OffscreenCanvas(width, height)
            : (new (await import("canvas")).Canvas(width, height))
    );
};

export const pdfToPNG = async (pdfData: ArrayBuffer) => {
    const pdfjs = await getPdfjs();
    const pngs: {buf: ArrayBuffer, width: number, height: number, pageNumber: number}[] = [];
    const pdfTask = pdfjs.getDocument({ data: pdfData.slice(0) });
    const pdf = await pdfTask.promise;
    for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: 3 });
        const canvas = await createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext("2d");
        if (!context) {
            console.error("pdfToPNG: Unexpected empty context");
            continue;
        }
        await page.render({
            canvasContext: context as unknown as CanvasRenderingContext2D,
            viewport,
            background: "white",
        }).promise;

        const buf = (
            ("convertToBlob" in canvas)
                ? await (await canvas.convertToBlob()).arrayBuffer()
                : canvas.toBuffer()
        );

        pngs.push({
            buf,
            width: canvas.width,
            height: canvas.height,
            pageNumber: i + 1,
        });

    }
    return pngs;
};

export const pdfPageCXMax = 5364000;
export const pdfPageCYMax = 8000000;

export interface FigDataManagerOptions {
    lawXMLStruct: LawXMLStruct,
    subsetLaw: EL,
    figPDFType?: "srcText" | "embed" | "render" | "embedAndRender",
    onProgress?: (info: {current: number, length: number, item: string}) => unknown,
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
    static async create(options: FigDataManagerOptions) {
        const {
            lawXMLStruct,
            subsetLaw,
            figPDFType,
            onProgress,
        } = {
            figPDFType: "embed" as const,
            ...options,
        };
        let counter = 0;
        const figDataMap: Map<string, DOCXFigData> = new Map();
        const figs = [...iterateFig(subsetLaw)];
        for (const [current, el] of figs.entries()) {
            if (onProgress) onProgress({ current, length: figs.length, item: el.attr.src });
            const src = el.attr.src;
            const blob = await lawXMLStruct.getPictBlob(src);
            if (!blob) continue;

            if (blob.type === "application/pdf") {
                const file: DOCXFigEmbedFile | null = (
                    (figPDFType === "embed" || figPDFType === "embedAndRender")
                        ? {
                            id: 1000000 + counter,
                            rId: `fig${counter + 1}`,
                            name: src.split("/").slice(-1)[0],
                            blob,
                        }
                        : null
                );
                counter++;
                const pages: DOCXFigImageFile[] | null = (
                    (figPDFType === "render" || figPDFType === "embedAndRender")
                        ? (await pdfToPNG(blob.buf)).map(({ buf, width, height, pageNumber }, i) => {
                            const cScale = Math.min(
                                (Math.min(width * 9525, pdfPageCXMax) / (width * 9525)),
                                (Math.min(height * 9525, pdfPageCYMax) / (height * 9525)),
                            );
                            return {
                                id: 1000000 + counter + i,
                                rId: `fig${counter + 1 + i}`,
                                cx: Math.round(width * 9525 * cScale),
                                cy: Math.round(height * 9525 * cScale),
                                name: `${src.split("/").slice(-1)[0]}.page${pageNumber}.png`,
                                blob: {
                                    buf,
                                    type: "image/png",
                                },
                            };
                        })
                        : null
                );

                if (pages)counter += pages.length;

                if (file) {
                    if (pages) {
                        figDataMap.set(src, { src, type: "embeddedAndRenderedPDF", file, pages });
                    } else {
                        figDataMap.set(src, { src, type: "embeddedPDF", file });
                    }
                } else {
                    if (pages) {
                        figDataMap.set(src, { src, type: "renderedPDF", pages });
                    } else {
                        console.error("FigDataManager.create: Unexpected empty file and pages");
                    }
                }

            } else {
                const size = (() => {
                    try {
                        return imageSize(new Uint8Array(blob.buf));
                    } catch {
                        return null;
                    }
                })();
                try {
                    figDataMap.set(src, {
                        type: "image",
                        src,
                        image: {
                            id: 1000000 + counter,
                            rId: `fig${counter + 1}`,
                            cx: (size?.width ?? 100) * 9525,
                            cy: (size?.height ?? 141) * 9525,
                            name: src.split("/").slice(-1)[0],
                            blob,
                        },
                    });
                    counter++;
                } catch {
                    //
                }
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
