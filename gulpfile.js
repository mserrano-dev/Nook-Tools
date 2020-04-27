require('dotenv').config() // load .env file into process.env
const { src, dest, series, parallel } = require('gulp');
const themeKit = require('@shopify/themekit'); // execute ThemeKit commands
const webpack = require('webpack-stream'); // gulp task runner with webpack bundler
const archiver = require('gulp-archiver'); // zip a backup for upload to Shopify theme
const fs = require('graceful-fs'); // the backup will exclude anything in the .gitignore
const browserSync = require('browser-sync').create(); // inject any asset changes
const argv = require('yargs').argv; // used by devops.js: (--mode=git|sync|dev|build)
const {
  project, // variable filenames, paths, etc
  themekit_config, // --password, --themeid, --store, --dir
  update_git_config, // takes info in .env and configures .git/config
  valid_env_variables // checks .env for valid variables
} = require('./project-settings');

// --- Gulp4 Tasks --- //
function do_webpack() {
  return src([project.scripts.entry, project.styles.entry])
    .pipe(webpack( require('./webpack.config.js') ))
    .pipe(dest(`src/assets`));
}

async function do_themekit_get(done) {
  await themeKit.command('get', themekit_config);
  done();
}

async function do_themekit_watch(done) {
  await themeKit.command('watch', Object.assign({}, themekit_config, {
    notify: project.ThemeKit_idle_file,
  }));
  done();
}

async function do_themekit_deploy(done) {
  await themeKit.command('deploy', Object.assign({}, themekit_config, {
    files: [
      `assets/${ project.scripts.filename }`,
      `assets/${ project.styles.filename }`,
      `assets/${ project.zip_filename }`,
    ]
  }));
  done();
}

function init_browserSync(done) {
  if(valid_env_variables("SHOPIFY_SHOP") === true) {
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
  }
  done();
}

function create_zip_backup() {
  let list_ignore = [`src/assets/${ project.zip_filename }`];
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
    .pipe(dest(`src/assets`))
}

// --- Main --- //
switch (argv.mode) {
  case 'git':
    exports.default = series(
      update_git_config,
    );
    break;
  case 'sync':
    exports.default = series(
      do_themekit_get,
    );
    break;
  case 'dev':
    exports.default = parallel(
      init_browserSync,
      do_webpack,
      do_themekit_watch,
    );
    break;
  case 'build':
    exports.default = series(
      do_webpack,
      create_zip_backup,
      do_themekit_deploy,
    );
    break;
}