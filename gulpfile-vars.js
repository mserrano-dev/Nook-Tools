module.exports = {
  "asset_folder": "src/assets",
  "scripts": {
    "filename": "_app-scripts.js",
    "source": [
      // vendor
      "node_modules/vue/dist/vue.min.js",
      // source
      "src/_dev/**/*.js"
    ],
    "to_watch": [
      "gulpfile-vars.js",
      "src/_dev/**/*.js"
    ],
  },
  "styles": {
    "filename": "_app-styles.css",
    "sass_entry": ["./src/_dev/main.scss"],
    "to_watch": [
      "./src/_dev/**/*.scss"
    ],
  },
  "ThemeKit_idle_file": "/var/tmp/theme_ready"
}