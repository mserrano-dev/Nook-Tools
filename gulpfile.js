const { watch, src, dest, series, parallel } = require('gulp');
const fs = require('graceful-fs');
const archiver = require('gulp-archiver');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const touch = require('gulp-touch-fd');
const sass = require('gulp-sass');
const sass_glob_importer = require('node-sass-glob-importer');
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();
const argv = require('yargs').argv;

// --- Setup --- //
const env = {
  production: (argv.env == 'production'),
  development: (argv.env == 'development'),
};
let project = null;
update_project_vars();

function update_project_vars() {
  delete require.cache[require.resolve('./gulpfile-vars')];
  project = require('./gulpfile-vars');
}

// --- Gulp4 Tasks --- //
function css() {
  update_project_vars();
  return src(project.styles.sass_entry)
    .pipe(gulpif(env.development, sourcemaps.init()))
      .pipe(sass({
        importer: sass_glob_importer()
      })).on('error', sass.logError)
      .pipe(cssnano())
      .pipe(rename(project.styles.filename))
    .pipe(gulpif(env.development, sourcemaps.write()))
    .pipe(autoprefixer())
    .pipe(dest(`${ project.source_folder }/assets`))
    .pipe(touch()) /* 
      Gulp4 does not update mtime so we do it manually with touch.
      ThemeKit will upload once file mtime is updated.

      https://github.com/gulpjs/gulp/issues/2193
      https://github.com/Shopify/themekit/issues/607
    */
}

function js() {
  update_project_vars();
  return src(project.scripts.source, { sourcemaps: env.development })
    .pipe(concat(project.scripts.filename))
    .pipe(gulpif(env.production, uglify()))
    .pipe(dest(`${ project.source_folder }/assets`, { sourcemaps: env.development }))
}

function init_browserSync() {
  browserSync.init({
    proxy:  `https://${ process.env.SHOPIFY_SHOP }`,
    files: project.ThemeKit_idle_file,
    snippetOptions: {
      rule: {
        match: /<\/body>/i,
        fn: (snippet, match) => {
          return snippet + match;
        }
      }
    },
    open: false,
    reloadOnRestart: true,
    notify: false,
    ghostMode: true,
  });
}

function create_zip_backup() {
  let list_ignore = [`${ project.source_folder }/assets/${ project.zip_filename }`];
  const gitignore = fs.readFileSync("./.gitignore", "utf8");
  // dont zip any files that this repo would ignore
  for (var filename of gitignore.split(/\r?\n/)) {
    if(filename) {
      list_ignore.push(`${ filename }`);
      list_ignore.push(`${ filename }/**/*`);
    }
  }
  // explicitly define which hidden files to include in the zip file
  let contents = [
    '**',
    '.env.default',
    '.gitignore',
  ];
  return src(contents, {ignore: list_ignore})
    .pipe(archiver(project.zip_filename))
    .pipe(dest(`${ project.source_folder }/assets`))
}

// --- Main --- //
if (env.development){
  exports.default = parallel(
    init_browserSync,
    parallel(css, js),
  );
} else if (env.production) {
  exports.default = series(
    parallel(css, js),
    create_zip_backup,
  );
}
exports.css = (env.production ? css : watch(project.styles.to_watch, css));
exports.js = (env.production ? js : watch(project.scripts.to_watch, js));