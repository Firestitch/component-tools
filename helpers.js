const path = require('path');
const ROOT = path.resolve(__dirname, '../');
const METADATA = {
  AOT: process.env.AOT || false,
  isProd: process.env.ENV === 'production' || false,
  tsConfigPath: process.env.TS_CONFIG || 'tsconfig.json'
};

exports.srcRoot = path.join(ROOT, 'src');
exports.nodeModulesRoot = path.join(ROOT,'node_modules');
exports.METADATA = METADATA;
exports.dir = function(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [ROOT].concat(args));
};

exports.args = process.argv.slice(2).reduce((acc, arg) => {

  if (arg.indexOf('--') === 0) {
    arg = arg.slice(2);
  }

  // A BARE FLAG IS `true`, NOT A DESTRUCTURED STRING. `let [f, v] = 'patch'`
  // destructures the STRING BY CHARACTER — it yielded { p: 'a' }, so `--patch`
  // never landed under its own name and any caller testing for it silently saw
  // nothing. Only `--flag=value` ever worked.
  const separator = arg.indexOf('=');
  const [flag, value] = separator > -1
    ? [arg.slice(0, separator), arg.slice(separator + 1)]
    : [arg, true];

  acc[flag] = value;

  return acc;
}, {});

exports.arg = {
  exists: (name) => {
    return `npm_config_${name}` in process.env;
  },
  get: (name) => {
    return process.env[`npm_config_${name}`];
  }
}
