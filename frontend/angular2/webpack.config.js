var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var appEnv = {
  environment: 'development',
  apiURL: 'mock/api/',
  mockAPI: true
}

module.exports = {

  entry: {
    'app': './src/main.ts',
    'polyfills': [
      'core-js/es6',
      'core-js/es7/reflect',
      'zone.js/dist/zone'
    ],
    style: [
      './src/index.scss'
    ]
  },
  output: {
    path: './dist',
    filename: '[name].[hash].js'
  },
  module: {
    loaders: [
      {test: /\.component.ts$/, loader: 'ts!angular2-template'},
      {test: /\.ts$/, exclude: /\.component.ts$/, loader: 'ts'},
      {test: /\.html$/, loader: 'html'},
      {
        test: /\.css$/,        
        loader: 'raw!style!css'
      },
      {
        test: /\.scss$/,
        loader: 'style!css!autoprefixer!sass'
      },
      { 
        test: /\.(jpe?g|png|gif|svg|eot|woff|ttf|svg|woff2)$/,
        loader: 'url-loader?name=[name].[ext]' 
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json', '.ts', '.html', '.css', '.scss']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      chunks: ['polyfills', 'style', 'app'],
    }),
    new webpack.DefinePlugin({
      app: JSON.stringify(appEnv)
    })
  ]
  
};
