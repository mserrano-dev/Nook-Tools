const shell = require('shelljs');
const argv = require('yargs').argv
//
const project = require('./gulpfile-vars');
const themekit_config = get_auth_flags();

switch (argv.mode) {
  case 'git':
    // setup git author in the .git/config file
    if (valid_env_variables("GIT_NAME", "GIT_USER", "GIT_EMAIL") === true) {
      shell.exec(series_cmd(
        `git config user.name "${ process.env.GIT_NAME }"`,
        `git config credential.username "${ process.env.GIT_USER }"`,
        `git config user.email "${ process.env.GIT_EMAIL }"`,
        `echo SUCCESS`
      ));
    } else {
      shell.exec('echo FAILED');
    }
    break;
  case 'sync':
    // pull what is deployed into the local environment
    if(themekit_config) {
      shell.exec(series_cmd(
        `theme get ${ themekit_config } --dir src`,
      ));
    }
    break;
  case 'dev':
    // start the dev watch process
    if(themekit_config) {
      shell.exec(parallel_cmd(
        `./node_modules/gulp/bin/gulp.js --env=development`,
        `theme watch ${ themekit_config } --dir src --notify=${ project.ThemeKit_idle_file }`,
      ));
    }
    break;
  case 'build':
    // build a minified version and zip up the repo
    if(themekit_config) {
      const project_files = [
        `assets/${ project.scripts.filename }`,
        `assets/${ project.styles.filename }`,
      ];
      shell.exec(series_cmd(
        `./node_modules/gulp/bin/gulp.js --env=production`,
        `theme deploy ${ project_files.join(' ') } ${ themekit_config } --dir src`,
      ));
    }
    break;
}

// -- Functions --
function series_cmd(...args) {
  return args.join('&&');
}

function parallel_cmd(...args) {
  return args.join('&');
}

function get_auth_flags() {
  let _return = false;

  // return the loaded auth params
  if(valid_env_variables("SHOPIFY_PASSWD", "SHOPIFY_THEMEID", "SHOPIFY_SHOP") === true) {
    const password = ` --password ${ process.env.SHOPIFY_PASSWD }`;
    const themeid = ` --themeid ${ process.env.SHOPIFY_THEMEID }`;
    const store = ` --store ${ process.env.SHOPIFY_SHOP }`;

    _return = password + themeid + store;
  }
  return _return;
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