const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

/**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process. 
*/

module.exports = {  
  entry: './src/main.js',
  module: {
    rules: require('./webpack.rules'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/Asset/LearningModulesVoiceovers'),
          to: path.resolve(__dirname, '.webpack/renderer/Asset/LearningModulesVoiceovers'),
        },
        {
          from: path.resolve(__dirname, 'src/Asset/DB/schema.sql'),
          to: path.resolve(__dirname, '.webpack/Asset/DB/schema.sql'),
        },
      ],
    }),
  ],
  externals: [
    nodeExternals(),
  ],
  externalsPresets: {
    node: true,
  },
};
