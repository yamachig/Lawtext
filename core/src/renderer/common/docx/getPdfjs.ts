import * as pdfjsWorkerFactory from "./createPdfjsWorker.js";

export type PdfjsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

export interface PdfjsOptions {
    loadPdfjs?: () => Promise<PdfjsModule>;
    workerSrc?: string | URL;
}

let pdfjsOptions: PdfjsOptions = {};
let pdfjsPromise: Promise<PdfjsModule> | undefined;

export const configurePdfjs = (options: PdfjsOptions) => {
    if (pdfjsPromise) {
        throw new Error("PDF.js has already been loaded; configure it before first use.");
    }
    pdfjsOptions = options;
};

export const getPdfjs = () => {
    if (!pdfjsPromise) {
        const loadPdfjs = pdfjsOptions.loadPdfjs ?? (() => import("pdfjs-dist/legacy/build/pdf.mjs"));
        pdfjsPromise = loadPdfjs().then(pdfjs => {
            if (pdfjsOptions.workerSrc !== undefined) {
                pdfjs.GlobalWorkerOptions.workerSrc = String(pdfjsOptions.workerSrc);
            } else {
                const workerPort = pdfjsWorkerFactory.createPdfjsWorker?.();
                if (workerPort) pdfjs.GlobalWorkerOptions.workerPort = workerPort;
            }
            return pdfjs;
        });
    }
    return pdfjsPromise;
};
