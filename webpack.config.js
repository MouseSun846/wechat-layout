const path = require('path');

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
      },
      {
        test: /FuriganaMD\.js$/,
        use: 'babel-loader'
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.css'],
    modules: ['node_modules'],
    alias: {
      'md2wechat': path.resolve(__dirname, '../md2wechat/src/assets/scripts/md2wechat.js')
    }
  }
};