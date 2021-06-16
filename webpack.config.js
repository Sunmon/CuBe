const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
        test: /\.css$/,
        use: [
          process.env.NODE_ENV === 'production'
            ? MiniCssExtractPlugin.loader // 프로덕션 환경
            : 'style-loader', // 개발 환경
          'css-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i, // 사진 확장자로 마치는 모든 파일
        loader: 'url-loader', // 파일 로더를 적용한다
        options: {
          name: 'assets/[name].[contenthash].[ext]',
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
    new webpack.BannerPlugin({
      banner: () => `빌드 날짜: ${new Date().toLocaleString()}`,
    }),
    ...(process.env.NODE_ENV === 'production'
      ? [new MiniCssExtractPlugin({ filename: `[name].css` })]
      : []),
  ],
};
