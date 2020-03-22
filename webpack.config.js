const path = require('path')
const webpack = require('webpack')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const config = require('dotenv').config({path: __dirname + '/.env'});

const APP_DIR = path.resolve(__dirname, 'src/')
const DIST_PATH = path.resolve(__dirname, 'dist')

module.exports = {
  entry: { app: path.join(APP_DIR, 'index.ts') },
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules|vendor/,
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsconfigPathsPlugin({ baseUrl: APP_DIR })],
  },
  externals: {},
  output: {
    path: DIST_PATH,
    publicPath: './',
  },
  devServer: {
    contentBase: path.resolve(APP_DIR, 'dist'),
    publicPath: '/',
    hot: true,
    port: 3000,
    watchContentBase: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: 'Bezirkskarte',
      template: path.resolve(__dirname, 'public/index.html'),
      inject: true,
    }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(config.parsed)
    }),
  ],
}
