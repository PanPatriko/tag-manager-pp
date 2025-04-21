const path = require('path');

module.exports = {
    entry: './src/main/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './src/renderer/webpack'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            }
        ],
    },
    mode: 'development',
};