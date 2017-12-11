/**
 * 通用基础配置
 * @author tangsj
 */
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const pagesRoot = './src/pages';
const componentsRoot = './src/components';
const env = process.env.NODE_ENV;

const pageEntry = {}; // 页面入口
const pageHtml = [];  // 页面模板
const commonChunks = []; // 自定义组件

/**
 * 按规则生成entry 及 html plugin
 * 在 pages 目录的一个目录表示一个页面
 * 页面目录下必须包含一个 index.html(模板) 和 index.js(入口)
 * 其它比如图片，css及页面模块也放在该目录下引用即可
 */
!function generateEntryAndHtml() {
  const pages = fs.readdirSync(pagesRoot);
  pages.forEach(function (name, index) {
    const url = path.join(__dirname, pagesRoot, name);
    if (fs.statSync(url).isDirectory()) {
      pageEntry[name] = `${pagesRoot}/${name}`;

      const hwp = new HtmlWebpackPlugin({
        filename: `${pagesRoot.replace('./src/', '')}/${name}/index.html`,
        template: `${pagesRoot}/${name}/index.html`,
        chunks: ['vendor', 'common', name],
        inject: 'head',
        minify: {
          collapseWhitespace: true,
        },
      });
      pageHtml.push(hwp);
    } 
  });
}();

/**
 * 生自定义组件打包使用的数组
 * array
 */
!function generateCommonChunks(folder) {
  const comps = fs.readdirSync(folder);
  comps.forEach(function (name, index) {
    const url = path.join(folder, name);
    if (fs.statSync(url).isDirectory()) {
      generateCommonChunks(url);
    } else {
      const ext = path.extname(url).substring(1);
      if (ext.toLowerCase() === 'js') {
        commonChunks.push(path.join(__dirname, url));
      }
    }
  });
}(componentsRoot);

const config = {
  // 入口
  entry: Object.assign(pageEntry, {
    // 将所有第3方模块提取到一个chunk  - vendor
    'vendor': [ 
      'amfe-flexible',
      'lodash',
    ],
    // 将自己写的所有通用模块提取到一个chunk  - common
    'common': commonChunks,
  }),
  // 输出
  output: {
    sourceMapFilename: '[file].map',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
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
    modules: [path.join(__dirname, 'src'), 'node_modules'],
  },
  module: {
    // 不解析
    noParse(content) {
      return /lodash/.test(content);
    },
    // loaders
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg|mp[3,4])$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              outputPath: function (path) {
                return path.replace('src/pages', 'images');
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
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              'env',
              'stage-3', // https://babeljs.io/docs/plugins/preset-stage-3/ 主要应用：transform-async-generator-functions
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
      names: ['common', 'vendor'], 
    }),
  ].concat(pageHtml),
};

module.exports = config;