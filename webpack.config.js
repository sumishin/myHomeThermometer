const webpack = require('webpack');
const path = require('path');

// react-routerへの対応、htmlのデプロイ時にルートパスが/appになった場合に対応する
const __distPath = './dist/';

Object.defineProperty(Date.prototype, 'toTimeOffsettedISOString', {
  value: function () {
    const zeroPad = (n, width) => {
      const s = n.toString();
      return s.length >= width ? s : new Array(width - s.length + 1).join('0') + s;
    }
    const yyyy = this.getFullYear().toString();
    const MM = zeroPad(this.getMonth() + 1, 2);
    const dd = zeroPad(this.getDate(), 2);
    const HH = zeroPad(this.getHours(), 2);
    const mm = zeroPad(this.getMinutes(), 2);
    const ss = zeroPad(this.getSeconds(), 2);
    const fff = zeroPad(this.getMilliseconds(), 3);
    // getTimezoneOffsetはUTCとの差を分単位の値で取得するが、符号がISO8601とは逆に取得されるので反転させる
    const offset = -(this.getTimezoneOffset());
    const sign = 0 <= offset ? '+' : '-';
    const zHH = zeroPad(Math.abs(offset) / 60, 2);
    const zmm = zeroPad(offset % 60, 2);

    return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}.${fff}${sign}${zHH}${zmm}`;
  }
});
const appVersion = require("./package.json").version;

const config = {
  mode: 'development',
  entry: {
    app: './src/index.tsx'
  },
  output: {
    filename: __distPath + 'bundle.js',
    path: path.resolve(__dirname, 'public')
  },
  plugins: [
    new webpack.DefinePlugin({
      BUILD_DATE_TIME: JSON.stringify((new Date()).toTimeOffsettedISOString()),
      VERSION: JSON.stringify(appVersion),
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.scss', '.css'],
    alias: {
      src: path.resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [
      //*.ts(x) and test/...-test/*.ts(x)
      { test: /\.tsx?$/, exclude: /(test|node_modules)/, loader: 'ts-loader' },
      //*.scss
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[path]___[name]__[local]___[hash:base64:5]'
            }
          },
          'sass-loader'
        ]
      },
      //TSLint
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "tslint-loader",
        enforce: "pre",
        options: {
          typeCheck: true,
        }
      }
    ]
  }
}

// コメントがあるとルールの読み込みに失敗するので読み込んだ上、コメントを削除したobjectをloaderに設定する
const tsLintConfig = JSON.parse(require('fs').readFileSync('./tslint.json', 'utf8').replace(/ \/\/.*$/gm, ' '));
config.module.rules.find(r => r.loader === 'tslint-loader').options.configuration = tsLintConfig;

module.exports = config;
