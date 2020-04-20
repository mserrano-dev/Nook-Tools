const { src, dest, series, parallel } = require('gulp');
const webpack = require('webpack-stream');
const fs = require('graceful-fs');
const archiver = require('gulp-archiver');
const browserSync = require('browser-sync').create();
const argv = require('yargs').argv;
const project = require('./project-settings');

// --- Gulp4 Tasks --- //
function do_webpack() {
  return src([project.scripts.entry, project.styles.entry])
    .pipe(webpack( require('./webpack.config.js') ))
    .pipe(dest(`${ project.source_folder }/assets`));
}

function init_browserSync(done) {
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
    notify: false,
    ghostMode: true,
  });
  done();
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
if (argv.env == 'development'){
  exports.default = parallel(
    init_browserSync,
    do_webpack,
  );
} else if (argv.env == 'production') {
  exports.default = series(
    do_webpack,
    create_zip_backup,
  );
}
exports.do_webpack = do_webpack;