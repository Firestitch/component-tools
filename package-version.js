#!/usr/bin/env node

var fs = require('fs');
var prompts = require('prompts');
const env = require('./libs/env');
const { arg } = require('./helpers');

const version = require(env.packageJsonPath()).version;
const nextVersion = version.replace(/(\d+$)/, (value, part) => { 
  return Number(part) + 1 
});

(async () => {
  const promptVersion = async () => {
    return prompts([
      {
        type: 'select',
        name: 'version',
        message: 'Select a version',
        choices: [
          { title: `Next version ${nextVersion}`, value: nextVersion },
          { title: 'Current version', value: version },
          { title: 'Custom version', value: 'custom' }
        ],
        initial: 0
      },
      {
        type: (value) => {
          return value === 'custom' ? 'text' : null;
        },
        name: 'version',
        message: 'Please enter the version number?',
        initial: version,
      }
    ]);
  };

  let version = null;
  if(arg.exists('nextversion')) {
    version = await new Promise((resolve) => {
      const packageJson = require(env.packageJsonPath());    
      const packageJsonVersion = packageJson.version;
      version = packageJsonVersion.replace(/(\d+$)/, (value, part) => { 
        return Number(part) + 1 
      });        

      resolve(version);
    });

  } else {
    const response = await promptVersion();
    version = response.version;
  }
  
  if(!version) {
    process.exit(1);
  }
  
  const packageJson = require(env.packageJsonPath());
  const packagePackageJson = require(env.packagePackageJsonPath());
  packagePackageJson.version = version;  
  packageJson.version = version;  

  fs.writeFileSync(env.packageJsonPath(), JSON.stringify(packageJson,null,2).trim());  
  fs.writeFileSync(env.packagePackageJsonPath(), JSON.stringify(packagePackageJson,null,2).trim());  
})();