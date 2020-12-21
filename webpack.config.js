const path = require('path');
const package = require('./package.json');

module.exports = () => [
  {
    entry: './src/react.js',
    output: {
      filename: path.basename(package.main),
      path: path.join(__dirname, path.dirname(package.main)),
      library: package.name,
      libraryTarget: 'umd',
      umdNamedDefine: true
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
    externals: {
      react: {
          commonjs: 'react',
          commonjs2: 'react',
          amd: 'React',
          root: 'React',
      },
      'react-dom': {
          commonjs: 'react-dom',
          commonjs2: 'react-dom',
          amd: 'ReactDOM',
          root: 'ReactDOM',
      },
    },
    optimization: { minimize: false },
  },
];
