import HtmlWebPackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import path from "path";
import webpack from "webpack";
import type { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";
import WatchMessagePlugin from "./WatchMessagePlugin.ts";
import CreateAppZipPlugin from "./CreateAppZipPlugin.ts";
import QueryDocsPlugin from "./QueryDocsPlugin.ts";
import TerserPlugin from "terser-webpack-plugin";

const rootDir = path.dirname(import.meta.dirname);

export default (env: Record<string, string>, argv: Record<string, string>): webpack.Configuration & { devServer: WebpackDevServerConfiguration } => {
    const distDir = path.resolve(rootDir, "dist-" + (argv.mode === "production" ? "prod" : "dev"));
    const config: webpack.Configuration & { devServer: WebpackDevServerConfiguration } = {
        entry: {
            index: path.resolve(rootDir, "./src/index.tsx"),
        },
        output: {
            filename: "[name].js",
            workerChunkFilename: "[name].js",
            path: env.DEV_SERVER ? "/" : distDir,
            clean: true,
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
            extensionAlias: {
                ".js": [".js", ".ts", ".tsx"],
            },
            alias: {
                ...(env.DEV_SERVER ? {} : {
                    "lawtext/dist/src/law/getLawList.js": path.resolve(rootDir, "./webpack-configs/getLawList.js"),
                    "../law/getLawList.js": path.resolve(rootDir, "./webpack-configs/getLawList.js"),
                    "./preloadedLawList.json": false,
                }),
            },
            fallback: {
                "buffer": import.meta.resolve("buffer/"),
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
            runtimeChunk: "single",
            splitChunks: {
                cacheGroups: {
                    ignoredModulesGroup: {
                        test: (module: webpack.Module) => module.identifier().includes("ignored|"),
                        name: "index",
                        chunks: "all",
                        priority: 30,
                        enforce: true,
                    },
                    nodeModulesInMainGroup: {
                        test: (module: webpack.Module) => {
                            const identifier = module.identifier();
                            return identifier.includes("node_modules")
                                && !/[\\/]pdfjs-dist[\\/]legacy[\\/]build[\\/]pdf(?:\.worker)?\.mjs$/.test(identifier);
                        },
                        name: "index",
                        chunks: "all",
                        priority: 30,
                        enforce: true,
                    },
                    pdfjsGroup: {
                        test: /[\\/]node_modules[\\/]pdfjs-dist[\\/]legacy[\\/]build[\\/]pdf\.mjs$/,
                        name: "pdf",
                        chunks: "async",
                        priority: 20,
                        enforce: true,
                    },
                },
            },
        },

        module: {
            rules: [
                {
                    test: /pdfjs-dist[\\/]legacy[\\/]build[\\/]pdf(?:\.worker)?\.mjs$/,
                    loader: "string-replace-loader",
                    options: {
                        search: /import\.meta\.url/g,
                        replace: "globalThis.location.href",
                    },
                },
                {
                    test: /\.(?:jsx?|tsx?)$/,
                    enforce: "pre",
                    use: ["source-map-loader"],
                },
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
                        {
                            loader: "sass-loader",
                            options: {
                                sassOptions: {
                                    quietDeps: true,
                                },
                            },
                        },
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
            {
                apply: (compiler) => {
                    compiler.hooks.compilation.tap("PdfWorkerChunkNamePlugin", (compilation) => {
                        compilation.hooks.afterChunks.tap("PdfWorkerChunkNamePlugin", () => {
                            for (const chunk of compilation.chunks) {
                                if (!chunk.getEntryOptions()?.worker) continue;
                                const isPdfWorker = [...compilation.chunkGraph.getChunkModulesIterable(chunk)]
                                    .some(module => module.identifier().includes("pdf.worker.mjs"));
                                if (isPdfWorker) chunk.name = "pdf.worker";
                            }
                        });
                    });
                },
            },
            new WatchMessagePlugin(),
            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[id].css",
            }),
            new HtmlWebPackPlugin({
                template: path.resolve(rootDir, "./src/index.ejs"),
                filename: "index.html",
            }),
            ...(env.DEV_SERVER ? [] : [new QueryDocsPlugin()]),
            ...(env.DEV_SERVER ? [] : [new CreateAppZipPlugin()]),
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
