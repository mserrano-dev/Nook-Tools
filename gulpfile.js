const { src, dest, parallel } = require('gulp');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const project = require('./gulpfile-vars.json');

function css() {
  return src(project.styles.source)
    .pipe(sass().on('error', sass.logError))
    // .pipe(minifyCSS())
    .pipe(rename(project.styles.filename))
    .pipe(dest(project.asset_folder))
}

function js() {
  return src(project.scripts.source, { sourcemaps: true })
    .pipe(concat(project.scripts.filename))
    .pipe(dest(project.asset_folder, { sourcemaps: true }))
}

exports.js = js;
exports.css = css;
exports.default = parallel(css, js);