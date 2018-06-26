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
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {   // 抽离第三方插件
          test: /node_modules/,   // 指定是node_modules下的第三方包
          chunks: 'initial',
          name: 'vendor',  // 打包后的文件名，任意命名
          // 设置优先级，防止和自定义的公共代码提取时被覆盖，不进行打包
          priority: 10
        },
      },
    },
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
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body',
      minify: {
        collapseWhitespace: true,
      },
    }),
  ],
};

module.exports = config;