const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';

module.exports = {
  mode,
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
      banner: () =>
        `빌드 날짜: ${new Date().toLocaleString()} \n 제작자: sunmon`,
    }),
    ...(process.env.NODE_ENV === 'production'
      ? [new MiniCssExtractPlugin({ filename: `[name].css` })]
      : []),
    // FIXME: three, tween externals로 옮길때 사용
    // new CopyPlugin({
    //   patterns: [
    //     {
    //       from: './node_modules/three/build/three.module.js',
    //       to: './three.js',
    //     },
    //   ],
    // }),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    publicPath: '/',
    // host: 'cube.io' /* 아직 미정 */
    stats: 'errors-only',
    overlay: true,
    historyApiFallback: false,
    hot: true,
    port: 5000,
  },
  optimization: {
    minimizer:
      mode === 'production'
        ? [
            new TerserPlugin({
              terserOptions: {
                compress: {
                  drop_console: true, // console.log 제거
                },
              },
            }),
          ]
        : [],
  },
  externals: {
    // FIXME: three, tween 외부로 빼기
    // three: 'three',
    // tween: 'tween',
  },
};
