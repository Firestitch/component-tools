#!/usr/bin/env node

var cmd = require('../libs/cmd');

cmd.exec(`node package-remove.js`);
cmd.exec(`node package-auto.js --includeModules=true`);