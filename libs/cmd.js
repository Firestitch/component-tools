#!/usr/bin/env node

var spawn = require('child_process').spawn;
var console = require('./console');


module.exports = {
  exec: function(cmd, args, options) {
		args = args || [];
		console.log(`${cmd} ${args.join(' ')}`);
    var childProcess = spawn(cmd, args,  
			{
				...options,
				shell: true, 
				stdio: "inherit" 
			}
		);	

		childProcess.on('close', function (code) {
			if(code) {
				process.exit(code);
			}
		});

		return childProcess;
  },
}
