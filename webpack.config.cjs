const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    content: './content.js',
    background: './background.js',
    sidepanel: './sidepanel.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.css'],
    alias: {
      'md2wechat': path.resolve(__dirname, '../md2wechat/src/assets/scripts/md2wechat.js'),
      'marked': path.resolve(__dirname, 'node_modules/marked/lib/marked.js')
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      marked: 'marked'
    })
  ]
};