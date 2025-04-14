const rules = require('./webpack.rules');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  node: {
    __dirname: true,
  },
  module: {
      rules: [
          {
              test: /\.(js|jsx)$/,
              exclude: /node_modules/,
              use: {
                  loader: 'babel-loader',
                  options: {
                      presets: ['@babel/preset-react'],
                  },
              },
          },
          {
            test: /\.(ts|tsx)$/i,
            exclude: /node_modules/,
            loader: 'ts-loader',
          },
          {
              test: /\.css$/,
              use: ['style-loader', 'css-loader'],
          },
          {
              test: /\.(png|svg|jpg|jpeg|gif)$/i,
              type: 'asset/resource',
          },
          {
            test: /\.node$/,
            loader: 'node-loader',
          },
      ],
  },
  plugins: [
      new HtmlWebpackPlugin({
          template: './src/index.html',
      }),
  ],
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
    alias: {
        'node:assert': 'assert',
        'node:crypto': 'crypto-browserify',
        'node:os': 'os-browserify/browser',
    },
    fallback: {
        "sqlite3": false,
        "assert": require.resolve("assert"),
        "crypto": require.resolve("crypto-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "util": require.resolve("util/"),
        "events": require.resolve('events/'),
        "path": require.resolve("path-browserify"),
        "stream": require.resolve("stream-browserify"),
        "fs": require.resolve("browserify-fs"),
        "http": require.resolve("stream-http")
    }
  },
  output: {
    path: path.resolve(__dirname, '.webpack/renderer'),
    filename: 'renderer.js'
  }
};