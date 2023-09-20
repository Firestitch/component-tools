#!/usr/bin/env node

var fs = require('fs');
var prompts = require('prompts');
const env = require('./libs/env');
const { arg } = require('./helpers');

const version = require(env.packageJsonPath()).version;
const nextPatchVersion = version.replace(/(\d+)$/, (value, part) => { 
  return Number(part) + 1 
});
const nextMinorVersion = version.replace(/(\d+)\.(\d+)\.(\d+)$/, (value, major, minor) => { 
  return `${major}.${Number(minor) + 1}.0`;
});
const nextMajorVersion = version.replace(/(\d+)\.(\d+)\.(\d+)$/, (value, major) => { 
  return `${Number(major) + 1}.0.0`;
});

(async () => {
  const promptVersion = async () => {
    return prompts([
      {
        type: 'select',
        name: 'version',
        message: 'Select a version',
        choices: [
          { title: `Next patch version ${nextPatchVersion}`, value: nextPatchVersion },
          { title: `Next minor version ${nextMinorVersion}`, value: nextMinorVersion },
          { title: `Next major version ${nextMajorVersion}`, value: nextMajorVersion },
          { title: `Current version ${version}`, value: version },
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
    process.console.error('Version number not specified');
    process.exit(55);
  }
  
  const packageJson = require(env.packageJsonPath());
  const packagePackageJson = require(env.packagePackageJsonPath());
  packagePackageJson.version = version;  
  packageJson.version = version;  

  fs.writeFileSync(env.packageJsonPath(), JSON.stringify(packageJson,null,2).trim());  
  fs.writeFileSync(env.packagePackageJsonPath(), JSON.stringify(packagePackageJson,null,2).trim());  
})();
