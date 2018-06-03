const nodeExternals = require("webpack-node-externals");

module.exports = {
    mode: "development",
    target: "node",
    externals: [nodeExternals()],
    entry: {
        dev: "./src/app/dev.ts"
    },
    resolve: {
        extensions: [".ts"]
    },
    module: {
        rules: [{ test: /\.ts$/, loader: "ts-loader", exclude: /node_modules/ }]
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].js"
    }
};
