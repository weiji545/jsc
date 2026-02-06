const path = require('path')
const webpack = require('webpack')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackObfuscator = require('webpack-obfuscator')

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production'
  const shouldObfuscate = env && env.obfuscate

  const config = {
    entry: './src/main.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].js',
      publicPath: './'
    },
    resolve: {
      extensions: ['.js', '.vue', '.json', '.png', '.jpg', '.gif', '.svg'],
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
        '@': path.resolve(__dirname, 'src')
      }
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            'vue-style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.scss$/,
          use: [
            'vue-style-loader',
            'css-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          loader: 'url-loader',
          options: {
            limit: 2048000, // 增大到 2MB，允许内联地球贴图
            name: 'img/[name].[hash:7].[ext]',
            esModule: false
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)$/,
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[hash:7].[ext]'
          }
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        inject: true
      }),
      // 定义全局变量，解决 echarts-gl 中 __DEV__ 未定义的问题
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(!isProduction)
      })
    ],
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: 8081,
      hot: true,
      open: true
    }
  }

  // 生产环境代码混淆
  if (isProduction && shouldObfuscate) {
    config.plugins.push(
      new WebpackObfuscator({
        rotateStringArray: true,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.75
      }, ['excluded-file-name.js'])
    )
  }

  return config
}

