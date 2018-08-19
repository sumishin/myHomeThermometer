const webpack = require('webpack');

const merge = require('webpack-merge');
const baseConfig = require('./webpack.config');
const envConfig = require('./.envelopment/develop');
const path = require('path');

const config = merge(baseConfig, {
  plugins: [
    new webpack.DefinePlugin({
      ENV: JSON.stringify(envConfig)
    })
  ],
  output: {
    sourceMapFilename: path.dirname(baseConfig.output.filename) + '/bundle.map'
  },
  devtool: 'source-map',
  module: {
    rules: [
      //img and the other assets referenced in *.scss and *.css
      { test: /\.(jpg|png|svg|gif|mp3|ogg|woff|woff2|ttf|otf|eot)$/, loader: 'file-loader?path=/asset/bundle&name=/asset/bundle/[name]_[sha512:hash:base64:5].[ext]' },
    ]
  }
});

module.exports = config;
