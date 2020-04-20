module.exports = {
  "source_folder": "src",
  "scripts": {
    "filename": "_app-scripts.js",
    "entry": "src/_dev/main.ts"
  },
  "styles": {
    "filename": "_app-styles.css",
    "entry": "./src/_dev/main.scss",
    "to_watch": [
      "./src/_dev/**/*.scss"
    ],
  },
  "zip_filename": "_dev.zip",
  "ThemeKit_idle_file": "/var/tmp/theme_ready"
}