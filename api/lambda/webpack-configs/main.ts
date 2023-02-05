import path from "path";
import webpack from "webpack";
// import nodeExternals from "webpack-node-externals";
import WatchMessagePlugin from "./WatchMessagePlugin";
import TerserPlugin from "terser-webpack-plugin";

const rootDir = path.dirname(__dirname);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (_env: Record<string, string>, argv: Record<string, string>): webpack.Configuration => {
    const distDir = path.resolve(rootDir, "lib" + (argv.mode === "production" ? "" : "-dev"));
    const config: webpack.Configuration = {
        target: "node",
        entry: ["./src/main.ts"],
        output: {
            filename: "main.js",
            path: distDir,
            clean: true,
            library: "LawtextAPILambda",
            libraryTarget: "umd",
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
        },
        // externals: [
        //     nodeExternals({
        //         allowlist: ["lawtext-api-search"],
        //     }),
        // ],
        externalsPresets: {
            node: true,
        },

        optimization: {
            minimize: true,
            minimizer: [new TerserPlugin()],
        },

        module: {
            rules: [{ test: /\.ts$/, loader: "ts-loader" }],
        },

        plugins: [new WatchMessagePlugin()],

        watchOptions: {
            ignored: [
                "node_modules",
                "lib",
            ],
        },

        devtool: "source-map",
    };
    return config;
};
