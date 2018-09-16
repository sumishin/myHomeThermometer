const webpack = require('webpack');

const merge = require('webpack-merge');
const baseConfig = require('./webpack.config');
const envConfig = require('./.envelopment/develop.js');
const path = require('path');

const config = merge(baseConfig, {
  plugins: [
    new webpack.DefinePlugin({
      ENV: JSON.stringify(envConfig)
    })
  ],
  devServer: {
    contentBase: baseConfig.output.path,
    port: 45123,
    host: '0.0.0.0',
    // react-router を使うための設定
    historyApiFallback: {
      index: '/index.html'
    }
  },
  devtool: 'source-map',
  module: {
    rules: [
      //img and the other assets referenced
      { test: /\.(jpg|png|svg|gif|mp3|ogg|woff|woff2|ttf|otf|eot)$/, loader: 'url-loader' },
    ]
  }
});

// local環境での実行時はtypecheckルールを有効にするとビルドが遅いので無効化する専用のtslint設定を使用する
const tsLintLoader = config.module.rules.find(r => r.loader === 'tslint-loader');
tsLintLoader.options.typeCheck = false;

// tslint.jsonとtslint-exclude-type-checkをマージすることで要type-checkルールを無効化する
const fs = require('fs');
const tsLintConfig = JSON.parse(fs.readFileSync('./tslint.json', 'utf8').replace(/ \/\/.*$/gm, ' '));
const tsLintExcludeTypeCheckConfig = JSON.parse(fs.readFileSync('./tslint-exclude-type-check.json', 'utf8').replace(/ \/\/.*$/gm, ' '));
tsLintConfig.rules = Object.assign({}, tsLintConfig.rules, tsLintExcludeTypeCheckConfig.rules);
tsLintLoader.options.configuration = tsLintConfig;

module.exports = config;
