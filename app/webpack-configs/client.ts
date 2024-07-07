import HtmlWebPackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import path from "path";
import webpack from "webpack";
import webpack_dev_server from "webpack-dev-server";
import WatchMessagePlugin from "./WatchMessagePlugin";
import CreateAppZipPlugin from "./CreateAppZipPlugin";
import QueryDocsPlugin from "./QueryDocsPlugin";

const rootDir = path.dirname(__dirname);

export default (env: Record<string, string>, argv: Record<string, string>): webpack.Configuration & { devServer: webpack_dev_server.Configuration } => {
    const distDir = path.resolve(rootDir, "dist-" + (argv.mode === "production" ? "prod" : "dev"));
    const config: webpack.Configuration & { devServer: webpack_dev_server.Configuration } = {
        entry: [
            path.resolve(rootDir, "./src/polyfills.ts"),
            path.resolve(rootDir, "./src/index.tsx"),
        ],
        output: {
            filename: "bundle.js",
            path: env.DEV_SERVER ? "/" : distDir,
            clean: argv.mode === "production",
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
            alias: {
                "@appsrc": path.resolve(rootDir, "./src"),
                "node-fetch": false,
                "fs": false,
                "cli-progress": false,
                "string_decoder": false,
            },
            fallback: {
                "path": require.resolve("path-browserify"),
                "buffer": require.resolve("buffer/"),
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
            port: 8081,
        },

        optimization: {
            minimizer: [new CssMinimizerPlugin()],
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
                template: path.resolve(rootDir, "./src/index.html"),
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
                "dist-test",
                "dist-bin",
            ],
        },

        devtool: "source-map",
    };
    return config;
};
