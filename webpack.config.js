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
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.css']
  }
};