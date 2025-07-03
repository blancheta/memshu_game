const path = require('path');

module.exports = {
    entry: './src/main.js', // Entry point
    output: {
        filename: 'bundle.js', // Output bundle file
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production', // or 'production'
    module: {
        rules: [
        ],
    },
};