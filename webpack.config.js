const path = require('path');

module.exports = {
    entry: './src/renderer/js/rendererEntry.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './src/renderer/webpack'),
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            }
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    mode: 'development',
};