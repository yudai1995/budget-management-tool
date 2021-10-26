const path = require('path');
const Fiber = require('fibers');

module.exports = {
    entry: './src/index.tsx',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.scss$ \.ts$/,
                //test: /\.ts$/, //正規表現 .tsをで終わるファイルを指定する
                exclude: /node_module/, //除外ファイル
                use: [
                    { loader: 'ts-loader' },
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: require('sass'),
                            fiber: Fiber,
                        },
                    },
                ],
            },
        ],
    },
    // importしたファイルの拡張子の設定（デフォルトでは.js）
    resolve: {
        extensions: ['.ts', '.js'], //importされたらこの拡張子のファイルを探し、一つのファイルにバンドルする
    },
};
