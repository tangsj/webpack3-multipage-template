/**
 * 开发环境配置
 * @author tangsj
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const DashboardPlugin = require('webpack-dashboard/plugin');
const baseConfig = require('./webpack.config');

const env = process.env.NODE_ENV;

let hostip = '0.0.0.0';
const ifaces = os.networkInterfaces();
for (var dev in ifaces) {
  ifaces[dev].forEach(function (details, alias) {
    if (details.family == 'IPv4' && details.addres != '127.0.0.1') {
      hostip = details.address;
    }
  });
}

const config = {
  // 控制是否生成，以及如何生成 source map。 http://www.css88.com/doc/webpack/configuration/devtool/
  devtool: 'eval',
  // 开发模式
  devServer: {
    host: hostip,
    // contentBase: './dist',
    hot: true,
    inline: true,
    historyApiFallback: true,
    open: true,
    openPage: 'pages/home/index.html',
    //  http-proxy-middleware
    proxy: {},
  },
  output: {
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js', //  非[entry]入口文件名，默认[id].js
  },
  module: {
    // loaders
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
    ],
  },
  // 插件
  plugins: [
    // 开发环境代码热替换
    new webpack.HotModuleReplacementPlugin(),
    // 控制台输出美化
    new DashboardPlugin(),
  ],
};

module.exports = merge(baseConfig, config);