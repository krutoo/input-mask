const path = require('path');
const package = require('./package.json');

const DIST_DIR = path.join(__dirname, 'dist');

const commons = {
  mode: 'production',
  resolve: { extensions: ['.ts', '.js'] },
  devtool: 'source-map',
  externals: Object.keys(package.peerDependencies || {}),
  optimization: {
    minimize: false,
  }
};

module.exports = () => [
  // CommonJS
  {
    entry: './src/react.js',
    output: {
      path: DIST_DIR,
      filename: 'index.js',
      libraryTarget: 'commonjs',
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
    ...commons,
  },

  // ES (module)
  {
    entry: './src/react.js',
    output: {
      path: DIST_DIR,
      filename: 'index.module.js',
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
                '@babel/preset-modules',
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
    ...commons,
  },
];
