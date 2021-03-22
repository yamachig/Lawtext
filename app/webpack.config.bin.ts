import CircularDependencyPlugin from "circular-dependency-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import path from "path";
import webpack from "webpack";
import nodeExternals from "webpack-node-externals";

class WatchMessagePlugin {
    public apply(compiler: webpack.Compiler) {
        compiler.hooks.watchRun.tap("WatchMessagePlugin", () => {
            console.log("\x1b[36m" + "Begin compile at " + new Date() + " \x1b[39m");
        });
        compiler.hooks.done.tap("WatchMessagePlugin", () => {
            setTimeout(() => {
                console.log("\x1b[36m" + "Done compile at " + new Date() + " \x1b[39m");
            }, 30);
        });
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (env: Record<string, string>, argv: Record<string, string>): webpack.Configuration => {
    const config: webpack.Configuration = {
        target: "node",
        entry: ["./bin/index.ts"],
        output: {
            filename: "index.js",
            path: path.resolve(__dirname, "dist-bin"),
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
            alias: {
                "@appsrc": path.resolve(__dirname, "./src"),
                "@coresrc": path.resolve(__dirname, "../core/src"),
            },
            fallback: {
                "path": require.resolve("path-browserify"),
            },
        },
        externals: [nodeExternals()],
        node: {
            __dirname: false,
        },

        optimization: {
            minimizer: [
                new CssMinimizerPlugin(),
            // new TerserPlugin(),
            ],
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
            // new HtmlWebPackPlugin({
            //     template: "./src/index.html",
            //     filename: "index.html",
            // }),
            new CircularDependencyPlugin({
                exclude: /node_modules/,
                failOnError: true,
                cwd: process.cwd(),
            }) as webpack.WebpackPluginInstance,
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
