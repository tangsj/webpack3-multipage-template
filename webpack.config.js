/**
 * 通用基础配置
 * @author tangsj
 */
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const env = process.env.NODE_ENV;

const config = {
  // 入口
  entry: {
    'main': './src/js/index.js',
    // 将所有第3方模块提取到一个chunk  - vendor
    'vendor': [
      'amfe-flexible',
      'lodash',
    ],
  },
  // 输出
  output: {
    sourceMapFilename: '[file].map',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
  },
  resolve: {
    // 快捷访问
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@c': path.resolve(__dirname, 'src', 'components'),
    },
    // 自动匹配文件后缀顺序
    extensions: ['.js', '.json', '.css'],
    // 模块搜索目录
    modules: [
      path.join(__dirname, 'src'),
      path.join(__dirname, 'node_modules'),
    ],
  },
  module: {
    // 不解析
    noParse(content) {
      return /lodash/.test(content);
    },
    // loaders
    rules: [
      {
        test: /\.(html)$/,
        use: {
          loader: 'html-loader',
          options: {
            attrs: [':data-src', 'img:src', 'audio:src', 'video:src', 'video:poster', 'source:src'],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg|mp[3,4])$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              outputPath: function (path) {
                return path.replace('src/', '');
              },
              name: '[path][name].[hash:8].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'font/[name].[hash:8].[ext]'
            }
          }
        ],
      },
      {
        test: /\.js$/i,
        include: path.resolve(__dirname, 'src'),
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              'env',
            ],
            plugins: [
              'transform-runtime'
            ],
            compact: 'auto', // 不要包含多余的空格符和换行符 设置为 "auto" 时，当输入大小 > 500KB 时，compact会被设置为 true
          },
        },
      },
    ],
  },
  // 插件
  plugins: [
    // 提取公用文件
    new webpack.optimize.CommonsChunkPlugin({
      // 这里的顺序和html里面生成的script 标签顺序有关系
      // 这样生成的script 顺序是  vendor -> common
      names: ['vendor'], 
    }),

    new HtmlWebpackPlugin({
      // filename: 'index.html',
      template: './src/index.html',
      chunks: ['vendor', 'main'],
      inject: 'body',
      minify: {
        collapseWhitespace: true,
      },
    }),
  ],
};

module.exports = config;