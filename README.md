# webpack3多页面配置说明

此项目适用于webpack的多页面及单页面开发，项目地址[https://github.com/tangsj/webpack3-multipage-demo](https://github.com/tangsj/webpack3-multipage-demo)
, 本文主要介绍一下配置过程中的一些关键点

### 目录结构

```js
-project
  |-dist // 最后打包文件存放目录
  |-src  // 源码
  | |-components // 用于存放通用组件
  | |-pages // 页面存放目录，一个页面一个目录
  | | |-pageFolder // 页面名称
  | | | |-index.html // 页面模板文件
  | | | |-index.js // 页面入口文件
  | | | |-more.(css|img|js) // 其它类型文件
  |-postcss.config.js // postcss 配置文件
  |-webpack.config.js // 通用webpack配置信息
  |-webpack.dev.js // 开发环境配置信息
  |-webpack.prod.js // 生产环境配置信息
  |-package.json
```
### package.json scripts 启动命令说明

```json
"scripts": {
    "ds": "node_modules/.bin/webpack-dashboard -- cross-env NODE_ENV=development webpack-dev-server --config webpack.dev.js",
    "dev": "cross-env NODE_ENV=development webpack-dev-server --config webpack.dev.js",
    "build": "cross-env NODE_ENV=production node_modules/.bin/webpack --config webpack.prod.js"
}
```
我们看到 scripts 我们建立了3条命令，主要用到的是dev 和 build,  dev主要用于我们开发环境的构建 ，build主要用于我们生产环境的构建。  ds也是用于开发环境的构建，但是它使用的是 [webpack-dashboard](https://github.com/FormidableLabs/webpack-dashboard) 来启动的项目，这样有一个更好看的控制台输也界面.

[cross-env](https://github.com/kentcdodds/cross-env) 是一个用于解决unix平台和windows平台设置NODE_ENV方法不一致而使用的. 注：windows设置使用的 set 命令，而unix平台使用的是export命令。

### webpack.config.js 通用配置部分说明


**entry 说明**

由于项目主要考虑的是多页面应用场景，所以内部我们在pages目录中使用了多目录的形式来区分多页面，建议页面级的资源都放在自己的页面目录中，有webpack有一定了解的同学都知道webapck有多入口的功能，可以利用这个功能来实现多页面的js分别打包，关于entry,本项目的配置形式是这样的：

```js
// 入口
entry: Object.assign(pageEntry, {
  'vendor': [ // 将所有第3方模块提取到一个chunk  - vendor
    'lodash',
  ],
  'common': [ // 将自己写的所有通用模块提取到一个chunk  - common
    './src/components/comp'
  ],
}),
```
vendor 和 common 我在代码中已给出了注释，common有一点需要指出：目前我们使用的是手动的忘里面添加内容，意味着我们添加一个组件就需要在array中去添加，这样有点麻烦，可以参考pageEntry生成的形式来生成里面的内容。

pageEntry的生成我们借住于nodejs提供的文件系统操作能力, 具体请阅读 `generateEntryAndHtml` 方法。

入口创建好了，每一个页面级入口我们都需要给他一个对应的 `HtmlWebpackPlugin`, 所以在generateEntryAndHtml中我们对应的都会 `new HtmlWebpackPlugin`, 然后把对应全部放在 pageHtml 存储。 最好后在plugins 位置通过数组的concat方法将配置加进去。

关于HtmlWebpackPlugin具体使用请参看：[https://github.com/jantimon/html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)

**output 说明**

```js
output: {
  sourceMapFilename: '[file].map',
  path: path.resolve(__dirname, 'dist'),
  publicPath: '/',
},
```
sourceMapFilename: 配置打开生成的sourcemap 名称
path: 告诉webapck最后打包的文件放在什么位置
publicPath: 告诉webapck资源访问的起始路径，这里也可以配置cdn完整的域名。这个参数很有用，用代码的热更新有影响，目前还不知道为什么


**resolve 说明**

resolve 主要用于配置webapck 模块的解析规则

1. alias  主要用于快速访问配置

比如配置项为： `'@': path.resolve(__dirname, 'src')`，那们我们在访问src下面的模板的时候就可以这样写了`import module from '@/modulename'`.

2. extensions 主要用于配置文件后缀名的自动匹配规则

比如我们导入模块的时候会这样写 `import module from '@/modulename`. 注意我们是没有写文件的后缀名称的，那么webpack 后优先去匹配 modulename.js ，如果没有找到再去匹配 modulename.json. webpack本这一项目的默认值为：['.js', '.json']

3. modules 指定模块搜索目录，默认值为['node_modules']

比如引入模块 `import module from mname`;  注意这里 mname我们是直接指定的一个名称，那么webpack就会先去node_modules中去找，假如我们添加`modules: [path.join(__dirname, 'src'), 'node_modules'],` 这个配置，那么webpack就会先去 src 中匹配 `mname/index.js`.

**module 说明**

1. noParse 配置模块不通过webapck解析直接打包
2. rules 指定各种文件类型的loaders

exclude: 参数很有用

如webpack.config.js中的配置：

- 图片类型 使用url-loader

  limit 可以指定一个数值（bytes）,对于文件大小小于这个值的文件。webpack会将其转换成base64格式直接内联到js或者css文件中，以前少http请求次数。
  name 指定了大于limit限制的文件的输入位置。path就是在指定输出的路径，默认是文件相对于src的路径，这里我们使用outputPath参数目录进行进一步的处理，让所有的图片最好后放到dist/images下。

- web字体类型 使用file-loader

  file-loader和url-loader功能基本一样，它没有limit功能。

- js类型 使用babel-loader

  最新的babel使用 `presets:['env']` 就行了.  我们这里加入了 stage-3 主要为了解析async方法。

**plugins 说明**

CommonsChunkPlugin 用于提取公用的trunk.

```js
// 提取公用文件
new webpack.optimize.CommonsChunkPlugin({
  // 这里的顺序和html里面生成的script 标签顺序有关系
  // 这样生成的script 顺序是  vendor -> common
  names: ['common', 'vendor'], 
}),
```

### webpack.dev.js 开发配置部分说明

devtool: 控制是否生成，以及如何生成 source map。 [http://www.css88.com/doc/webpack/configuration/devtool/](http://www.css88.com/doc/webpack/configuration/devtool/)
开发环境我们使用eval: 这样构建速度最快
生产环境我们使用nosources-source-map： 这样在线上我们可以定位错误的文件行号，但是不会暴露源代码。

开环境的的重点在代码热更新，这里主要通过devServer参数进行配置

```js
  devServer: {
    host: '0.0.0.0', // 这里指定服务器地址，它默认是localhost，指定0.0.0.0是为了外部可以通过ip访问这个服务器
    hot: true, // 开启热更新
    inline: true, // 在 dev-server 的两种不同模式之间切换。默认情况下，应用程序启用内联模式(inline mode)。这意味着一段处理实时重载的脚本被插入到你的包(bundle)中，并且构建消息将会出现在浏览器控制台。 当使用模块热替换时，建议使用内联模式(inline mode)。
    historyApiFallback: true, // html5 路由模式
    open: true, // 服务开启时是否打开浏览器
    openPage: 'pages/about/index.html', // 打开的页面地址
    //  http-proxy-middleware
    proxy: {}, // 接口对接开始的时候这里很有用
  },
```
关于hot有2个点需要注意：
  1. plugins中添加
  ```js
  // 开发环境代码热替换
  new webpack.HotModuleReplacementPlugin(),
  ```
  2. 入口代码中添加
  ```js
  if (module.hot) { 
    module.hot.accept();
  }
  ```

### webpack.prod.js 生产环境配置部分说明

生产环境的css我们使用 ExtractTextPlugin 将css提取到一个文章的css文件中，你可能注意到为什么开发环境中我们没有使用这个插件，那是因为使用这个插件后代码的热更新会失效，so....

生成环境plugins:

DefinePlugin: 定义node环境变量

HashedModuleIdsPlugin: 生产环境使用的（模块标识符）[http://www.css88.com/doc/webpack/guides/caching/]（http://www.css88.com/doc/webpack/guides/caching/）

CleanWebpackPlugin: 清理dist目录

IgnorePlugin: 配置忽略的内容

UglifyJsPlugin: js的丑化压缩插件

BannerPlugin: 在文件最前面添加bannber


### postcss.config.js 配置说明

这里面就主要配置一些postcss使用到的插件，具体看一眼文件就应该明白了


### 后期可能会加入的内容

1. css 公用文件单独打包
2. ssh-webpack-plugin 用于代码发布到线上服务器
3. rem 配置
