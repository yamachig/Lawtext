import HtmlWebPackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import path from "path";
import fs from "fs";
import webpack from "webpack";
import webpack_dev_server from "webpack-dev-server";
import WatchMessagePlugin from "./WatchMessagePlugin";

let rootDir = path.dirname(__dirname);
while (!fs.existsSync(path.join(rootDir, "package.json"))) {
    const newRootDir = path.dirname(rootDir);
    if (newRootDir === rootDir) break;
    rootDir = newRootDir;
}

export default (env: Record<string, string>, argv: Record<string, string>): webpack.Configuration & { devServer: webpack_dev_server.Configuration } => {
    const distDir = path.resolve(rootDir, "dist-" + (argv.mode === "production" ? "prod" : "dev"), "client");
    const config: webpack.Configuration & { devServer: webpack_dev_server.Configuration } = {
        mode: argv.mode === "production" ? "production" : argv.mode === "development" ? "development" : "none",
        entry: [path.resolve(rootDir, "./src/client/index.tsx")],
        output: {
            filename: "bundle.js",
            path: env.DEV_SERVER ? "/" : distDir,
            clean: argv.mode === "production",
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
            alias: {
                // "@coveragesrc": path.resolve(rootDir, "./src"),
                // "@coresrc": path.resolve(rootDir, "../core/src"),
                "node-fetch": false,
            },
            fallback: {
                "path": require.resolve("path-browserify"),
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
            port: 8082,
        },

        optimization: {
            minimizer: [new CssMinimizerPlugin()],
        },

        module: {
            rules: [
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
            new WatchMessagePlugin(),
            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[id].css",
            }),
            new HtmlWebPackPlugin({
                template: path.resolve(rootDir, "./src/client/index.html"),
                filename: "index.html",
            }),
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
