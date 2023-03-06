#!/usr/bin/env node

var path = require('path');


module.exports = {
	process: process,
  projectDir: function() {
    return path.join(process.cwd(),'../../../');
  },
  packageDir: function() {
    return path.join(this.projectDir(),'package');
  },
  srcDir: function() {
    return path.join(this.projectDir(),'src');
  },
  packageJsonPath: function() {
    return path.join(this.projectDir(),'package.json');
  },
  packagePackageJsonPath: function() {
    return path.join(this.projectDir(),'package/package.json');
  },
  packageJson: function() {
    return require(path.join(this.projectDir(), 'package.json'));
  },
  packageJsonVersion: function() {
    return this.packageJson().version;
  }
}
