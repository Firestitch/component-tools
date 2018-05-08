const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common');
const { srcRoot, dir, pkgName } = require('./helpers');
const { CheckerPlugin } = require('awesome-typescript-loader');

module.exports = function() {
  return webpackMerge(commonConfig(), {
    context: srcRoot,
    devtool: 'source-map',
    resolve: {
      extensions: ['.ts', '.js', '.json', '.css', '.scss', '.html'],
      modules: [
        'node_modules',
        dir('src'),
      ]
    },
    module: {
      exprContextCritical: false,
      rules: [
        {
          test: /\.ts$/,
          loaders: [
            'awesome-typescript-loader',
            'angular2-template-loader'
          ],
          exclude: [/\.(spec|e2e|d)\.ts$/]
        },
        {
          test: /\.css$/,
          include: [
            dir('src'),
            dir('playground/app'),
            dir('playground/assets')
          ],
          use: [
            { loader: 'to-string-loader', options: { sourceMap: true } },
            { loader: 'css-loader', options: { sourceMap: true } },
            { loader: 'postcss-loader', options: { sourceMap: true } },
            { loader: 'resolve-url-loader', options: { sourceMap: true } },
          ]
        },
        {
          test: /\.scss$/,
          include: [
            dir('src'),
            dir('playground/app'),
            dir('playground/assets')
          ],
          use: [
            { loader: 'to-string-loader', options: { sourceMap: true } },
            { loader: 'css-loader', options: { sourceMap: true } },
            { loader: 'postcss-loader', options: { sourceMap: true } },
            { loader: 'resolve-url-loader', options: { sourceMap: true } },
            { loader: 'sass-loader', options: { sourceMap: true } },
          ]
        }
      ]
    },
    entry: {
      'index': './index.ts'
    },
    output: {
      path: dir('package'),
      libraryTarget: 'umd',
      library: pkgName,
      umdNamedDefine: true
    },
    externals: [nodeExternals()],
    plugins: [
      new webpack.optimize.ModuleConcatenationPlugin(),
      new CheckerPlugin(),
    ]
  });

};
