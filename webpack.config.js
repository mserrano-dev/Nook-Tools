const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const argv = require('yargs').argv;

const env = {
  production: (argv.env == 'production'),
  development: (argv.env == 'development'),
};

module.exports = {
  watch: env.development,
  devtool: (env.development ? 'inline-source-map' : ''),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    usedExports: false,
    minimize: env.production
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    alias: {
      vue: (env.production ? 'vue/dist/vue.min.js' : 'vue/dist/vue.js'),
    },
    plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })]
  },
};