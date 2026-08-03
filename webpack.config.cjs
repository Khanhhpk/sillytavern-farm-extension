const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname),
    library: {
      type: 'module'
    },
    chunkFormat: 'module'
  },
  experiments: {
    outputModule: true
  },
  externalsType: 'module',
  
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  optimization: {
    minimize: false,
  },
};
