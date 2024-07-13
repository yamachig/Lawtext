// eslint-disable-next-line tsdoc/syntax
/** @type {() => Promise<typeof import("pdfjs-dist/legacy/build/pdf.mjs")>} */
const getPdfjs = async () => {
    // eslint-disable-next-line tsdoc/syntax
    /** @type {() => Promise<typeof import("pdfjs-dist/legacy/build/pdf.mjs")>} */
    let pdfjs;
    try {
        pdfjs = await eval("import(\"./pdfjs/pdf.min.mjs\")");
    } catch {
        try {
            pdfjs = await eval("import(\"./pdfjs/pdf.mjs\")");
        } catch {
            try {
                pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
            } catch {
                pdfjs = await eval("import(\"pdfjs-dist/legacy/build/pdf.mjs\")");
            }
        }
    }

    try {
        void await eval("import(\"./pdfjs/pdf.worker.min.mjs\")");
        pdfjs.GlobalWorkerOptions.workerSrc = "./pdf.worker.min.mjs";
    } catch {
        try {
            void await eval("import(\"./pdfjs/pdf.worker.mjs\")");
        } catch {
            try {
                void await eval("import(\"pdfjs-dist/legacy/build/pdf.worker.mjs\")");
            } catch {
                pdfjs.GlobalWorkerOptions.workerSrc = "../core/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs";
            }
        }
    }


    return pdfjs;
};
exports.getPdfjs = getPdfjs;
