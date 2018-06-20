var nodeExternals = require('webpack-node-externals');
var WebpackPreBuildPlugin = require('pre-build-webpack');
var build = require('./bin/build');

module.exports = {
    target: 'node',
    entry: './src/lawtext.ts',
    output: {
        filename: './dist/lawtext.js',
    },
    externals: [nodeExternals()],
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [{
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                },
            },
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader",
            },
        ],
    },
    plugins: [
        new WebpackPreBuildPlugin(function (stats) {
            build.main();
        }),
    ],
    devtool: "source-map",
}