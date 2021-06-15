const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/, // .css 확장자로 끝나는 모든 파일
        use: ['style-loader', 'css-loader'], // css-loader를 적용한다
      },
      {
        test: /\.png$/, // .png 확장자로 마치는 모든 파일
        loader: 'url-loader', // 파일 로더를 적용한다
        options: {
          publicPath: './dist/',
          name: '[name].[ext]?[hash]',
          limit: 5000, // 5kb 미만만 url-loader로 처리( 크면 fileloader)
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      templateParameters: {
        env: process.env.NODE_ENV === 'development' ? '(개발용)' : '',
      },
      minify:
        process.env.NODE_ENV === 'production'
          ? {
              collapseWhitespace: true, // 빈칸 제거
              removeComments: true, // 주석 제거
            }
          : false,
    }),
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
  ],
};
