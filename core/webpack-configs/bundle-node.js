/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @stylistic/js/quote-props */
const path = require("path");
const webpack = require("webpack");

const rootDir = path.dirname(__dirname);

/** @returns {import("webpack").Configuration} */
module.exports = (env, argv) => {
    const distDir = path.resolve(
        rootDir,
        (argv.mode === "development") ? "dist-bundle-dev" : "dist-bundle-prod",
    );
    return {
        target: "node",
        mode: (argv.mode === "development") ? "development" : "production",
        entry: [path.resolve(rootDir, "./src/main.ts")],
        output: {
            filename: "node/lawtext_cli.js",
            path: distDir,
            library: {
                name: "lawtext",
                type: "umd",
            },
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
            alias: {
                "canvas": false,
                "pdfjs-dist": false,
            },
            fallback: {
                "path": require.resolve("path-browserify"),
            },
        },
        module: {
            rules: [{ test: /\.tsx?$/, use: "ts-loader" }],
        },
        plugins: [
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1,
            }),
        ],
    };
};
