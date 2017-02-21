
const path = require('path');

module.exports = {
  entry: [path.resolve(__dirname, 'examples/example1/src/index.js')],
  output: {
    path: path.join(__dirname, 'examples/example1/dist'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
    ],
  },
};
