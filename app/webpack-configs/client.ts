import HtmlWebPackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import path from "path";
import webpack from "webpack";
import type webpack_dev_server from "webpack-dev-server";
import WatchMessagePlugin from "./WatchMessagePlugin";
import CreateAppZipPlugin from "./CreateAppZipPlugin";
import QueryDocsPlugin from "./QueryDocsPlugin";
import fs from "fs";
import { ensureDirSync } from "fs-extra";
import TerserPlugin from "terser-webpack-plugin";

const rootDir = path.dirname(__dirname);

export default (env: Record<string, string>, argv: Record<string, string>): webpack.Configuration & { devServer: webpack_dev_server.Configuration } => {
    const distDir = path.resolve(rootDir, "dist-" + (argv.mode === "production" ? "prod" : "dev"));
    const config: webpack.Configuration & { devServer: webpack_dev_server.Configuration } = {
        entry: {
            index: [path.resolve(rootDir, "./src/index.tsx")],
            ...(env.DEV_SERVER ? { "pdf.worker": "../core/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs" } : {}),
        },
        output: {
            filename: "bundle.[name].js",
            path: env.DEV_SERVER ? "/" : distDir,
            clean: argv.mode === "production",
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
            alias: {
                "@appsrc": path.resolve(rootDir, "./src"),
                "node-fetch": false,
                "canvas": false,
                "fs": false,
                "cli-progress": false,
                "string_decoder": false,
                ...(env.DEV_SERVER ? {} : { "pdfjs-dist": false }),

            },
            fallback: {
                "path": require.resolve("path-browserify"),
                ...(env.DEV_SERVER ? {
                    "buffer": require.resolve("buffer/"),
                } : {}),
            },
        },

        devServer: {
            static: {
                directory: distDir,
                publicPath: "/",
            },
            compress: true,
            // lazy: true,
            liveReload: false,
            // filename: "bundle.js",
            port: env.DEV_SERVER_PORT ? Number(env.DEV_SERVER_PORT) : 8081,
        },

        optimization: {
            minimizer: [
                new CssMinimizerPlugin(),
                new TerserPlugin(),
            ],
        },

        module: {
            rules: [
                // {
                //     test: /\.(?:jsx?|tsx?)$/,
                //     enforce: "pre",
                //     use: ["source-map-loader"],
                // },
                { test: /\.tsx?$/, loader: "ts-loader" },
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: "html-loader",
                        },
                    ],
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader",
                        {
                            loader: "postcss-loader",
                            options: {
                                postcssOptions: {
                                    plugins: ["autoprefixer"],
                                },
                            },
                        },
                        "sass-loader",
                    ],
                },
                {
                    test: /\.xml$/,
                    loader: "raw-loader",
                },
            ],
        },

        plugins: [
            new webpack.ProvidePlugin({
                Buffer: ["buffer", "Buffer"],
            }),
            new WatchMessagePlugin(),
            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[id].css",
            }),
            new HtmlWebPackPlugin({
                template: path.resolve(rootDir, "./src/index.html.tsx"),
                filename: "index.html",
            }),
            ...(env.DEV_SERVER ? [] : [new QueryDocsPlugin()]),
            ...(env.DEV_SERVER ? [] : [new CreateAppZipPlugin()]),
            ...(env.DEV_SERVER ? [] : [
                new (class {
                    public apply(compiler: webpack.Compiler): void {
                        compiler.hooks.afterEmit.tapPromise("CopyPDFjsPlugin", async () => {
                            const targetDir = path.join(compiler.outputPath, "pdfjs");
                            ensureDirSync(targetDir);
                            const sourceDir = "../core/node_modules/pdfjs-dist/build/";
                            if (argv.mode === "production") {
                                fs.copyFileSync(path.join(sourceDir, "pdf.min.mjs"), path.join(targetDir, "pdf.min.mjs"));
                                fs.copyFileSync(path.join(sourceDir, "pdf.worker.min.mjs"), path.join(targetDir, "pdf.worker.min.mjs"));
                            } else {
                                fs.copyFileSync(path.join(sourceDir, "pdf.mjs"), path.join(targetDir, "pdf.mjs"));
                                fs.copyFileSync(path.join(sourceDir, "pdf.mjs.map"), path.join(targetDir, "pdf.mjs.map"));
                                fs.copyFileSync(path.join(sourceDir, "pdf.worker.mjs"), path.join(targetDir, "pdf.worker.mjs"));
                                fs.copyFileSync(path.join(sourceDir, "pdf.worker.mjs.map"), path.join(targetDir, "pdf.worker.mjs.map"));
                            }
                        });
                    }
                })(),
            ]),
        ],

        watchOptions: {
            ignored: [
                "node_modules",
                "dist-dev",
                "dist-prod",
                "dist-dev-local",
                "dist-prod-local",
                "dist-test",
                "dist-bin",
            ],
        },

        devtool: "source-map",
    };
    return config;
};
