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

  let [flag, value] = arg.indexOf('=') > -1 ? arg.split('=') : arg;
  acc[flag] = value;

  return acc;
}, {});
