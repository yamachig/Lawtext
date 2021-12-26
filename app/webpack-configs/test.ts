import HtmlWebPackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import path from "path";
import webpack from "webpack";
import nodeExternals from "webpack-node-externals";
import WatchMessagePlugin from "./WatchMessagePlugin";

const rootDir = path.dirname(__dirname);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (env: Record<string, string>, argv: Record<string, string>): webpack.Configuration => {
    const config: webpack.Configuration = {
        target: "node",
        entry: ["./test/setup.ts", "./test/components.tsx"],
        output: {
            filename: "bundle.js",
            path: path.resolve(rootDir, "dist-test"),
            clean: true,
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
            alias: {
                "@appsrc": path.resolve(rootDir, "./src"),
            },
            fallback: {
                "path": require.resolve("path-browserify"),
            },
        },
        externals: [
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            nodeExternals() as any,
            "react",
            "react-dom",
        ],
        node: false,

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
                template: path.resolve(rootDir, "./src/index.html"),
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
