const path = require('path');

module.exports = {
  entry: './mermaid_renderer.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'mermaid_renderer.js',
    libraryTarget: 'umd'
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
    modules: ['node_modules']
  },
  externals: {
    // 将mermaid作为外部依赖，不打包到renderer中
    'mermaid': 'mermaid'
  },
  optimization: {
    splitChunks: false,
    runtimeChunk: false
  }
};