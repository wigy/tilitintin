const paths = require('./paths')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { DefinePlugin } = require('webpack')

module.exports = {
  // Where webpack looks to start building the bundle
  entry: [paths.src + '/index.jsx'],

  target: 'web',

  // Where webpack outputs the assets and bundles
  output: {
    path: paths.build,
    filename: '[name].[contenthash].js',
    publicPath: '/',
  },

  // Customize the webpack build process
  plugins: [

    // Copies files from target to destination folder
    new CopyWebpackPlugin({
      patterns: [
        { from: paths.public + '/*.{ico,png,json}', to: paths.build + '/[name][ext]' },
      ],
    }),

    // Generates an HTML file from a template
    // Generates deprecation warning: https://github.com/jantimon/html-webpack-plugin/issues/1501
    new HtmlWebpackPlugin({
      favicon: paths.public + '/favicon.ico',
      template: paths.public + '/index.html', // template file
      filename: 'index.html', // output file
    }),

    new DefinePlugin({
      API_URL: JSON.stringify(process.env.API_URL || 'http://localhost:3101')
    })
  ],

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  // Determine how modules within the project are treated
  module: {

    rules: [
      // JavaScript: Use Babel to transpile JavaScript files
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },

      // Styles: Inject CSS into the head with source maps
      {
        test: /\.(scss|css)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { sourceMap: true, importLoaders: 1 },
          },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },

      // Images: Copy image files to build folder
      { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: 'asset/resource' },

      // Fonts and SVGs: Inline files
      { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: 'asset/inline' },
    ],
  },

  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
        plugin: {
          test: /[\\/]src[\\/]Plugins/,
          name: 'plugin',
          chunks: 'all',
        },
        components: {
          test: /[\\/]src[\\/]Components/,
          name: 'components',
          chunks: 'all',
        },
        models: {
          test: /[\\/]src[\\/]Models/,
          name: 'models',
          chunks: 'all',
        },
        stores: {
          test: /[\\/]src[\\/]Stores/,
          name: 'stores',
          chunks: 'all',
        },
      },
    },
  }
}
