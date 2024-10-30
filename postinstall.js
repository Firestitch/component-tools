#!/usr/bin/env node

var path = require("path");
var cpx = require("cpx2");
var fs = require('fs');
var childProcess = require('child_process');
const env = require('./libs/env');

try {

  require(env.packageJsonPath());
  var dir2 = path.join(env.projectDir(),'.vscode');

  try {
    childProcess.exec(`cd ${env.projectDir()} && git submodule deinit -f .vscode`);
    childProcess.exec(`cd ${env.projectDir()} && git rm -f .vscode`);
    childProcess.exec(`cd ${env.projectDir()} && git commit -m "Removed .vscode submodule"`);
    childProcess.exec(`cd ${env.projectDir()} && git push`);    
  } catch(e) {
  }

  try {
    fs.rmSync(dir2, { recursive: true, force: true });
  } catch(e) {
  }

  if (!fs.existsSync(dir2)) {
      fs.mkdirSync(dir2);
  }

  const dir1 = path.join(process.cwd(),'assets/.vscode') + '/*';
  cpx.copy(dir1, dir2);
} catch(e) {
}