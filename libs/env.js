#!/usr/bin/env node

var path = require('path');


module.exports = {
	process: process,
  projectDir: path.join(process.cwd(),'..'),
  packageJson: function() {
    return require(path.join(this.projectDir, 'package.json'));
  },
  packageJsonVersion: function() {
    return this.packageJson().version;
  }
}
