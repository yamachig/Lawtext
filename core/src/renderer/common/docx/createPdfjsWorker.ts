export const createPdfjsWorker = () => {
    if (typeof window === "undefined" || !("Worker" in window)) return undefined;
    return new Worker(
        new URL(
            "pdfjs-dist/legacy/build/pdf.worker.mjs",
            import.meta.url,
        ),
        { type: "module" },
    );
};
