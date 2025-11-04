const rules = require('./webpack.rules');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  node: {
    __dirname: true,
  },

  devServer: {
    static: path.resolve(__dirname, 'public'), // serve /public during dev
    devMiddleware: { writeToDisk: true },
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
            test: /\.(mp3|wav)$/i, // Add a rule for audio files
            type: 'asset/resource', // This handles audio files
            generator: {
              filename: 'assets/audio/[name][ext][query]' 
            },
          },
      ],
  },
  plugins: [
      new HtmlWebpackPlugin({ template: './src/index.html' }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'public'),
            to: path.resolve(__dirname, '.webpack/renderer'),
          },
        ],
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
        "tls": false,
        "better-sqlite3": false,
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
    filename: 'renderer.js',
    publicPath: '/',
  }
};