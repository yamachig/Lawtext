const getPdfjs = async () => {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

    if (typeof window !== "undefined" && "Worker" in window) {
        pdfjs.GlobalWorkerOptions.workerPort = new Worker(
            new URL(
                "pdfjs-dist/legacy/build/pdf.worker.mjs",
                import.meta.url,
            ),
            { type: "module" },
        );
    }

    return pdfjs;
};

export { getPdfjs };
