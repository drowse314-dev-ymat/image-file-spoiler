const nodeExternals = require("webpack-node-externals");

module.exports = {
    mode: "development",
    target: "node",
    externals: [nodeExternals()],
    entry: {
        dev: "./src/app/dev.ts",
        "image-file-spoiler": "./src/app/image-file-spoiler.ts",

        "test/publish-image-file-spoiler-message":
            "./src/test/publish-image-file-spoiler-message"
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
