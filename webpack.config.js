const argv = require('yargs').argv;
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const globImporter = require('node-sass-glob-importer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
//
const env = {
  production: (argv.env == 'production'),
  development: (argv.env == 'development'),
};
const project = require('./project-settings');

module.exports = {
  mode: (env.development ? 'development' : 'production'),
  watch: env.development,
  devtool: (env.development ? 'inline-source-map' : ''),
  output: {filename: project.scripts.filename},
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: env.development
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: env.development,
              ident: 'postcss',
              plugins: [
                autoprefixer(),
              ]
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: env.development,
              sassOptions: {
                importer: globImporter(),
              }
            }
          }
        ]
      }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: project.styles.filename }),
  ],
  optimization: {
    usedExports: false,
    minimize: env.production
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    alias: {
      vue: (env.production ? 'vue/dist/vue.min.js' : 'vue/dist/vue.js'),
    },
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })]
  },
};