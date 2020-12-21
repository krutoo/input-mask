const path = require('path');
const package = require('./package.json');

module.exports = () => [
  // CommonJS
  {
    entry: './src/react.js',
    output: {
      filename: path.basename(package.main),
      path: path.join(__dirname, path.dirname(package.main)),
      libraryTarget: 'commonjs',
      globalObject: 'this',
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
              ],
            },
          },
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: 'ts-loader',
        },
      ],
    },
    mode: 'production',
    resolve: { extensions: ['.ts', '.js'] },
    devtool: 'source-map',
    externals: Object.keys(package.peerDependencies || {}).map(name => ({ [name]: name })),
    optimization: { minimize: false },
  },
];
