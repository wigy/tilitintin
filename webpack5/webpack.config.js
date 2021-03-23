const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: path.resolve(__dirname, './src/index.js'),
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
        resolve: {
          extensions: ['.js', '.jsx']
        },
      },
      {
        test: /\.html$/,
        use: ['html-loader'],
      },
      {
        test: /\.css$/i,
        exclude: /node_modules/,
        use: [ {
          loader: MiniCssExtractPlugin.loader,
        }, 'css-loader']
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].bundle.js'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html')
    }),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, './public/*.{ico,png,json}'), to: path.resolve(__dirname, './dist/[name][ext]') },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "styles.[contentHash].css",
    }),
  ],
  devServer: {
    contentBase: path.resolve(__dirname, './public'),
    hot: true,
  }
};
