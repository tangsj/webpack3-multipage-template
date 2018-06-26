/**
 * 生产环境配置
 * @author tangsj
 */
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const baseConfig = require('./webpack.config');

const env = process.env.NODE_ENV;

const config = {
  // 控制是否生成，以及如何生成 source map。 http://www.css88.com/doc/webpack/configuration/devtool/
  devtool: 'nosources-source-map',
  // 输出 生成环境 添加 chunkhash
  output: {
    filename: 'js/[name].[chunkhash:8].js',
    chunkFilename: 'js/[name].[chunkhash:8].js', //  非[entry]入口文件名，默认[id].js
  },
  module: {
    // loaders
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it use publicPath in webpackOptions.output
              publicPath: '../',
            }
          },
          {
            loader: 'css-loader',
            options: {
              minimize: true,
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
          },
        ],
      },
    ],
  },
  // 插件
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
      },
    }),
    // 生产环境使用的（模块标识符）（http://www.css88.com/doc/webpack/guides/caching/）
    new webpack.HashedModuleIdsPlugin(),
    // 清理dist目录
    new CleanWebpackPlugin(['dist']),
    // 提取css
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: '[id].css',
    }),
    // 忽略 moment 的本地化内容 ( 说明参看 http://www.css88.com/doc/webpack/plugins/ignore-plugin/ )
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // 在文件最前面添加bannber
    new webpack.BannerPlugin('author: CodeCook[t_fate@163.com]'),
    // 静态 gzip | http 服务器需要开启  gzip_static 功能
    // nginx 配置参看 http://www.tangsj.com/post/7
    new CompressionWebpackPlugin({
      asset: '[path].gz',
      algorithm: 'gzip',
      test: /\.(js|css)$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
  ],
};

// 执行 npm run build:report
if (process.env.REPORT) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  // 打包体积分析
  config.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = merge(baseConfig, config);
