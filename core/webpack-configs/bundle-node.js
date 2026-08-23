/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @stylistic/js/quote-props */
import path from "path";
import webpack from "webpack";

const rootDir = path.dirname(import.meta.dirname);

/** @returns {import("webpack").Configuration} */
export default (env, argv) => {
    const distDir = path.resolve(
        rootDir,
        (argv.mode === "development") ? "dist-bundle-dev" : "dist-bundle-prod",
    );
    return {
        target: "node",
        mode: (argv.mode === "development") ? "development" : "production",
        entry: [path.resolve(rootDir, "./src/main.ts")],
        experiments: {
            outputModule: true,
        },
        output: {
            filename: "node/lawtext_cli.mjs",
            path: distDir,
            module: true,
            chunkFormat: "module",
            library: {
                type: "module",
            },
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
            extensionAlias: {
                ".js": [".js", ".ts", ".tsx"],
            },
            alias: {
                "canvas": false,
                "pdfjs-dist": false,
            },
            fallback: {
                "path": import.meta.resolve("path-browserify"),
            },
        },
        module: {
            rules: [{ test: /\.tsx?$/, use: "ts-loader" }],
            parser: {
                javascript: {
                    importMeta: false,
                },
            },
        },
        plugins: [
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1,
            }),
        ],
    };
};
