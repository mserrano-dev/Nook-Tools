require('dotenv').config() // load .env file into process.env

function init_env_config() {
  // syntactic sugar
  const argv = require('yargs').argv;
  return {
    production: (argv.mode == 'build'),
    development: (argv.mode == 'dev'),
  };
}

function init_themekit_config() {
  // setup ThemeKit auth flags
  let _return = {};
  if(valid_env_variables("SHOPIFY_PASSWD", "SHOPIFY_SHOP", "SHOPIFY_PREVIEW_THEMEID") === true) {
    _return = {
      password: process.env.SHOPIFY_PASSWD,
      store: process.env.SHOPIFY_SHOP,
      themeid: process.env.SHOPIFY_PREVIEW_THEMEID,
      dir: 'src',
    };
  }
  return _return;
}

function update_git_config(done) {
  // update .git/config
  const simple_git = require("simple-git");
  if(valid_env_variables("GIT_NAME", "GIT_USER", "GIT_EMAIL") === true) {
    simple_git()
      .addConfig('user.name', process.env.GIT_NAME)
      .addConfig('credential.username', process.env.GIT_USER)
      .addConfig('user.email', process.env.GIT_EMAIL)
  }
  done();
}

function valid_env_variables(...keys) {
  // validate the .env file, reporting any error
  let _return = true;
  for(var i in keys) {
    var is_valid = valid_env_variable(keys[i]);
    _return = _return && is_valid;
  }
  return _return;
}

function valid_env_variable(key) {
  let val = process.env[key];
  let _return = true;
  
  if(typeof val === 'undefined') {
    _return = false; // empty value
    console.error(`ERROR: missing "${ key }" in the .env file`)
  } else if((val.indexOf('"') !== -1) || (val.indexOf("'") !== -1)) {
    _return = false; // malformatted
    console.error(`ERROR: malformatted "${ key }" in the .env file`)
  }
  return _return;
}

module.exports = {
  project: {
    "scripts": {
      "filename": "_app-scripts.min.js",
      "entry": "src/_dev/main.ts"
    },
    "styles": {
      "filename": "_app-styles.min.css",
      "entry": "src/_dev/main.scss"
    },
    "zip_filename": "_dev.zip",
    "ThemeKit_idle_file": "/var/tmp/theme_ready"
  },
  update_git_config: update_git_config,
  themekit_config: init_themekit_config(),
  env: init_env_config(),
  valid_env_variables: valid_env_variables,
  valid_env_variable: valid_env_variable,
}