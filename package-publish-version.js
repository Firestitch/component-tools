#!/usr/bin/env node

var cmd = require('./libs/cmd');
var env = require('./libs/env');

const version = env.packageJsonVersion();

cmd.exec(`cd ${env.projectDir()} && git tag v${version} && git push origin v${version}`);