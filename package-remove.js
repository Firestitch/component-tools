const fs = require('fs');
const env = require('./libs/env');
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';


if (fs.existsSync(env.packageDir())) {
  rmdirRecursive(env.packageDir());
  console.log(BLUE, 'Removing old package directory', RESET);
}

console.log(BLUE, 'Creating package directory', RESET);
fs.mkdirSync(env.packageDir());

function rmdirRecursive(path) {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        rmdirRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path, { recursive: true });
  }
};
