const webpack = require('webpack');

const merge = require('webpack-merge');
const baseConfig = require('./webpack.config');
const envConfig = require('./.envelopment/production');

const config = merge(baseConfig, {
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      ENV: JSON.stringify(envConfig)
    })
  ],
  module: {
    rules: [
      //img and the other assets referenced
      { test: /\.(jpg|png|svg|gif|mp3|ogg|woff|woff2|ttf|otf|eot)$/, loader: 'file-loader?path=/asset/bundle&name=/asset/bundle/[name]_[sha512:hash:base64:5].[ext]' },
    ]
  }
});

module.exports = config;
