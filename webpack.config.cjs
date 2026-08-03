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
  externals: {
    '../../extensions.js': '../../extensions.js',
    '../../script.js': '../../script.js',
    '../../endpoints.js': '../../endpoints.js'
  },
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
