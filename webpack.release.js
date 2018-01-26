const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common');
const { dir, pkgName } = require('./helpers');
const { CheckerPlugin } = require('awesome-typescript-loader');

module.exports = function() {
  return webpackMerge(commonConfig(), {
    devtool: 'source-map',
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
        }
      ]
    },
    entry: {
      'index': './index.ts'
    },
    output: {
      path: dir('release'),
      libraryTarget: 'umd',
      library: pkgName,
      umdNamedDefine: true
    },
    externals: [/^\@angular\//, /^rxjs\//, /^core-js\//, /^zone.js\//],
    plugins: [
      new webpack.optimize.ModuleConcatenationPlugin(),
      new CheckerPlugin(),
    ]
  });

};
