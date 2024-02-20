#!/usr/bin/env node

var childProcess = require('child_process');
var console = require('./console');


module.exports = {
  exec: function(cmd, args, options) {
		return new Promise((resolve, reject) => {

			args = args || [];
			let stdout = '';

			console.log(`${cmd} ${args.join(' ')}`);
			var process = childProcess.spawn(cmd, args,  
				{
					...options,
					shell: true, 
				}
			);	
	
			process.stdout.setEncoding('utf8');
			process.stdout.on('data', function(data) {
				stdout += data.toString();
			});

			process.stderr.setEncoding('utf8');
			process.stderr.on('data', function(data) {
				console.error(data.toString());
			});
			
			process.on('close', function (code) {
				if(code) {
					reject(code);
					process.exit(code);
				} else {
					resolve(stdout);
				}
			});
		});
  },
}
